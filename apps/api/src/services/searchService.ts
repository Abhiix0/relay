import { ObjectId, type Db } from "mongodb";
import { getCollections, type ArtifactDoc, type ChunkDoc, type ProjectDoc } from "../db/collections";
import { notFound } from "../lib/errors";
import { isObjectIdHex } from "../lib/ids";

const LIMIT = 50;
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
      {
        $match: {
          projectId: p._id,
          gen: { $in: [p.syncGeneration, null] },
          ...typeFilter(type),
          ...(language ? { language } : {}),
          text: { $regex: escaped, $options: "i" },
        },
      },
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
  const hits: SearchHit[] = r.items.flatMap(({ chunk, artifact }): SearchHit[] => {
    const lines = chunk.text.split("\n");
    const found = lines.findIndex((l) => re.test(l));
    const i = Math.max(found, 0);
    const shared = {
      projectId: p._id.toHexString(),
      snippet: lines.slice(Math.max(i - 1, 0), i + 2).join("\n").slice(0, 300),
      matchedText: re.exec(lines[i] ?? "")?.[0] ?? "",
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
    const a = artifact[0];
    if (!a) return [];
    return [{
      ...shared,
      id: `${shared.projectId}:${a.key}`,
      type: chunk.type,
      filePath: a.title,
      fileName: a.title,
      lineNumber: null,
      url: a.url,
    }];
  });
  return { hits, total: r.total[0]?.n ?? 0 };
}

export async function searchFiles(
  db: Db,
  ownerId: ObjectId,
  projectId: string | null,
  q: string,
  language: string | null,
  type?: SearchType,
  since?: Date,
) {
  if (projectId && !isObjectIdHex(projectId)) throw notFound("Project not found");
  const projects = await getCollections(db)
    .projects.find(projectId ? { _id: new ObjectId(projectId), ownerId } : { ownerId })
    .toArray();
  if (projectId && projects.length === 0) throw notFound("Project not found");
  const per = await Promise.all(projects.map((p) => searchProject(db, p, q, language, type, since)));
  const hits = per
    .flatMap((x) => x.hits)
    .sort((a, b) => a.filePath.localeCompare(b.filePath) || a.projectId.localeCompare(b.projectId))
    .slice(0, LIMIT);
  return { hits, totalCount: per.reduce((n, x) => n + x.total, 0) };
}
