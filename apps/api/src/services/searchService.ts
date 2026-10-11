import { ObjectId, type Db } from "mongodb";
import { getCollections, type ArtifactDoc, type ChunkDoc, type ProjectDoc } from "../db/collections";
import { cosine, type Embedder } from "../lib/embedder";
import { notFound } from "../lib/errors";
import { isObjectIdHex } from "../lib/ids";

const LIMIT = 50;
const MIN_COSINE = 0.25;
const README_PATH = /(^|\/)readme(\.[^/]*)?$/i;

export type SearchType = "all" | "file" | "readme" | "issue" | "pr" | "commit" | "decision";

export interface SearchHit {
  id: string;
  projectId: string;
  type: string;
  filePath: string;
  fileName: string;
  lineNumber: number | null;
  snippet: string;
  matchedText: string;
  language: string | null;
  url: string | null;
}

/** No `type` keeps the original behavior (file chunks only); `all` and artifact types opt in. */
function typeFilter(type: SearchType | undefined) {
  if (!type) return { path: { $ne: null } };
  if (type === "all") return {};
  if (type === "readme") return { type: "file", path: { $regex: README_PATH } };
  return { type };
}

type Row = { _id: unknown; chunk: ChunkDoc; artifact: ArtifactDoc[] };

/** `re` marks the matching line for keyword hits; semantic hits show the chunk's opening lines. */
function toHit(p: ProjectDoc, chunk: ChunkDoc, artifact: ArtifactDoc | undefined, re: RegExp | null): SearchHit[] {
  const lines = chunk.text.split("\n");
  const i = Math.max(re ? lines.findIndex((l) => re.test(l)) : 0, 0);
  const shared = {
    projectId: p._id.toHexString(),
    snippet: lines.slice(Math.max(i - 1, 0), i + 2).join("\n").slice(0, 300),
    matchedText: (re && re.exec(lines[i] ?? "")?.[0]) || "",
    language: chunk.language,
  };
  if (chunk.path) {
    const fileName = chunk.path.split("/").pop() as string;
    return [{
      ...shared,
      id: `${shared.projectId}:${chunk.path}`,
      type: README_PATH.test(fileName) ? "readme" : "file",
      filePath: chunk.path,
      fileName,
      lineNumber: chunk.startLine + i,
      url: chunk.url,
    }];
  }
  if (!artifact) return [];
  return [{
    ...shared,
    id: `${shared.projectId}:${artifact.key}`,
    type: chunk.type,
    filePath: artifact.title,
    fileName: artifact.title,
    lineNumber: null,
    url: artifact.url,
  }];
}

const scopeOf = (p: ProjectDoc, language: string | null, type: SearchType | undefined) => ({
  projectId: p._id,
  gen: { $in: [p.syncGeneration, null] },
  ...typeFilter(type),
  ...(language ? { language } : {}),
});

async function searchProject(
  db: Db,
  p: ProjectDoc,
  q: string,
  language: string | null,
  type: SearchType | undefined,
  since: Date | undefined,
) {
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // $facet always yields exactly one document
  const [r] = (await getCollections(db)
    .chunks.aggregate<{ total: { n: number }[]; items: Row[] }>([
      { $match: { ...scopeOf(p, language, type), text: { $regex: escaped, $options: "i" } } },
      { $sort: { path: 1, startLine: 1 } },
      { $group: { _id: { $ifNull: ["$path", "$artifactId"] }, chunk: { $first: "$$ROOT" } } },
      { $lookup: { from: "artifacts", localField: "chunk.artifactId", foreignField: "_id", as: "artifact" } },
      // only artifacts carry timestamps; file chunks drop out of recency filters
      ...(since ? [{ $match: { "artifact.updatedAt": { $gte: since } } }] : []),
      { $sort: { _id: 1 } },
      { $facet: { total: [{ $count: "n" }], items: [{ $limit: LIMIT }] } },
    ])
    .toArray()) as [{ total: { n: number }[]; items: Row[] }];
  const re = new RegExp(escaped, "i");
  return {
    hits: r.items.flatMap(({ chunk, artifact }) => toHit(p, chunk, artifact[0], re)),
    total: r.total[0]?.n ?? 0,
  };
}

/** Nearest embedded chunks to the query vector, best chunk per file or artifact. */
async function semanticProject(
  db: Db,
  p: ProjectDoc,
  qv: number[],
  language: string | null,
  type: SearchType | undefined,
  since: Date | undefined,
) {
  const { chunks, artifacts } = getCollections(db);
  const recent = since
    ? await artifacts.find({ projectId: p._id, gen: { $in: [p.syncGeneration, null] }, updatedAt: { $gte: since } }, { projection: { _id: 1 } }).toArray()
    : null;
  const vectors = await chunks
    .find(
      { ...scopeOf(p, language, type), embedding: { $exists: true }, ...(recent && { artifactId: { $in: recent.map((a) => a._id) } }) },
      { projection: { embedding: 1, path: 1, artifactId: 1 } },
    )
    .toArray();
  const best = new Map<string, { id: ChunkDoc["_id"]; cos: number }>();
  for (const v of vectors) {
    const cos = v.embedding ? cosine(qv, v.embedding) : 0;
    const source = v.path ?? v.artifactId?.toHexString() ?? v._id.toHexString();
    if (cos >= MIN_COSINE && cos > (best.get(source)?.cos ?? 0)) best.set(source, { id: v._id, cos });
  }
  const top = [...best.values()].sort((a, b) => b.cos - a.cos).slice(0, LIMIT);
  const docs = new Map((await chunks.find({ _id: { $in: top.map((t) => t.id) } }).toArray()).map((d) => [d._id.toHexString(), d]));
  const arts = new Map(
    (await artifacts.find({ _id: { $in: [...docs.values()].flatMap((d) => (d.artifactId ? [d.artifactId] : [])) } }).toArray()).map((a) => [a._id.toHexString(), a]),
  );
  return {
    hits: top.flatMap((t) => {
      const d = docs.get(t.id.toHexString());
      return d ? toHit(p, d, d.artifactId ? arts.get(d.artifactId.toHexString()) : undefined, null) : [];
    }),
    total: best.size,
  };
}

export async function searchFiles(
  db: Db,
  ownerId: ObjectId,
  projectId: string | null,
  q: string,
  language: string | null,
  type?: SearchType,
  since?: Date,
  semantic?: Embedder,
) {
  if (projectId && !isObjectIdHex(projectId)) throw notFound("Project not found");
  const projects = await getCollections(db)
    .projects.find(projectId ? { _id: new ObjectId(projectId), ownerId } : { ownerId })
    .toArray();
  if (projectId && projects.length === 0) throw notFound("Project not found");

  let qv: number[] | undefined;
  if (semantic) {
    try {
      qv = (await semantic.embed([q]))[0];
    } catch {
      qv = undefined; // embedder down: answer with keyword search and say so via `mode`
    }
  }
  const per = await Promise.all(
    projects.map((p) => (qv ? semanticProject(db, p, qv, language, type, since) : searchProject(db, p, q, language, type, since))),
  );
  const hits = per.flatMap((x) => x.hits);
  if (!qv) hits.sort((a, b) => a.filePath.localeCompare(b.filePath) || a.projectId.localeCompare(b.projectId));
  return { hits: hits.slice(0, LIMIT), totalCount: per.reduce((n, x) => n + x.total, 0), mode: qv ? "semantic" : "keyword" };
}
