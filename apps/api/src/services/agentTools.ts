import type { Db, Filter } from "mongodb";
import { getCollections, type ArtifactDoc, type ChunkDoc, type ProjectDoc } from "../db/collections";
import type { Embedder } from "../lib/embedder";
import { retrieve } from "./retrievalService";

/** Read-only retrieval over one project's current generation. The agent has no other capabilities. */
export const MAX_TOOL_CALLS = 4;

export type Intent = "explain-file" | "explain-flow" | "decision-why" | "recent-change" | "general";

export type ToolName =
  | "search_project"
  | "get_file_context"
  | "get_issue"
  | "get_pull_request"
  | "get_commit"
  | "get_recent_activity"
  | "get_project_summary"
  | "get_decisions";

export interface ToolCall {
  tool: ToolName;
  arg: string;
  /** artifact types to prefer in search_project */
  types?: string[];
}

const FILE_RX = /(?:[\w.-]+\/)+[\w.-]+|\b[\w-]+\.(?:ts|tsx|js|jsx|py|rs|go|java|rb|php|cs|c|cpp|h|md|json|toml|ya?ml)\b/i;
const HISTORY = ["decision", "pr", "issue", "commit"];
const RECENT = ["commit", "pr", "issue"];

export function classify(question: string): Intent {
  if (FILE_RX.test(question)) return "explain-file";
  if (/\b(why|decid\w*|decision|rationale|reason)\b/i.test(question)) return "decision-why";
  if (/\b(recent\w*|latest|lately|changed|changes|last (?:week|month|release)|what's new)\b/i.test(question)) {
    return "recent-change";
  }
  if (/\b(how (?:does|do|is)|flow|works?|pipeline|lifecycle|architecture)\b/i.test(question)) return "explain-flow";
  return "general";
}

/** Deterministic plan: explicit references first, then the intent tool, then search. Never more than MAX_TOOL_CALLS. */
export function plan(question: string): { intent: Intent; calls: ToolCall[] } {
  const intent = classify(question);
  const calls: ToolCall[] = [];
  const num = /(?:^|\s)#(\d{1,7})\b/.exec(question)?.[1];
  if (num) calls.push({ tool: "get_issue", arg: num }, { tool: "get_pull_request", arg: num });
  const sha = /\b(?=[0-9a-f]*\d)(?=[0-9a-f]*[a-f])[0-9a-f]{7,40}\b/i.exec(question)?.[0];
  if (sha) calls.push({ tool: "get_commit", arg: sha.toLowerCase() });
  if (intent === "explain-file") {
    const path = FILE_RX.exec(question)?.[0];
    if (path) calls.push({ tool: "get_file_context", arg: path });
  }
  if (/\b(overview|summary|summari[sz]e|what is (?:this|the) (?:project|repo\w*)|about this)\b/i.test(question)) {
    calls.push({ tool: "get_project_summary", arg: "" });
  }
  if (intent === "decision-why") calls.push({ tool: "get_decisions", arg: "" });
  if (intent === "recent-change") calls.push({ tool: "get_recent_activity", arg: "" });

  const search: ToolCall[] = [{ tool: "search_project", arg: question }];
  if (intent === "decision-why" || intent === "recent-change") {
    // history first, then the unfiltered search as a safety net
    search.unshift({ tool: "search_project", arg: question, types: intent === "recent-change" ? RECENT : HISTORY });
  }
  return { intent, calls: [...calls.slice(0, MAX_TOOL_CALLS - search.length), ...search] };
}

const scope = (p: ProjectDoc) => ({ projectId: p._id, gen: { $in: [p.syncGeneration, null] } });

/** First chunk of each of the newest matching artifacts. */
async function artifactChunks(
  db: Db,
  p: ProjectDoc,
  filter: Filter<ArtifactDoc>,
  limit: number,
): Promise<ChunkDoc[]> {
  const c = getCollections(db);
  const arts = await c.artifacts
    .find({ ...scope(p), ...filter })
    .sort({ updatedAt: -1, _id: -1 })
    .limit(limit)
    .project<{ _id: ArtifactDoc["_id"] }>({ _id: 1 })
    .toArray();
  if (arts.length === 0) return [];
  const rows = await c.chunks
    .find({ ...scope(p), artifactId: { $in: arts.map((a) => a._id) } })
    .sort({ startLine: 1 })
    .toArray();
  const first = new Map<string, ChunkDoc>();
  for (const r of rows) if (r.artifactId && !first.has(r.artifactId.toHexString())) first.set(r.artifactId.toHexString(), r);
  return arts.flatMap((a) => first.get(a._id.toHexString()) ?? []);
}

export interface ToolContext {
  embedder?: Embedder | undefined;
  notes: string[];
}

export async function runTool(db: Db, p: ProjectDoc, call: ToolCall, ctx: ToolContext): Promise<ChunkDoc[]> {
  switch (call.tool) {
    case "search_project":
      return retrieve(db, p, call.arg, { types: call.types, embedder: ctx.embedder, notes: ctx.notes });
    case "get_file_context":
      return getCollections(db)
        .chunks.find({ ...scope(p), type: "file", path: call.arg })
        .sort({ startLine: 1 })
        .limit(4)
        .toArray();
    case "get_issue":
      return artifactChunks(db, p, { externalId: `issue:${call.arg}` }, 1);
    case "get_pull_request":
      return artifactChunks(db, p, { externalId: `pr:${call.arg}` }, 1);
    case "get_commit":
      return artifactChunks(db, p, { externalId: { $regex: `^commit:${call.arg}` } }, 1);
    case "get_recent_activity":
      return artifactChunks(db, p, { type: { $in: RECENT } }, 5);
    case "get_decisions":
      return artifactChunks(db, p, { type: "decision" }, 5);
    case "get_project_summary":
      return getCollections(db)
        .chunks.find({ ...scope(p), type: "file", path: { $regex: /^readme(\.[a-z]+)?$/i } })
        .sort({ path: 1, startLine: 1 })
        .limit(2)
        .toArray();
  }
}
