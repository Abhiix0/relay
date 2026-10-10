import { ObjectId, type Db } from "mongodb";
import { getCollections, type ChunkDoc, type ProjectDoc } from "../db/collections";
import { notFound } from "../lib/errors";
import { isObjectIdHex } from "../lib/ids";

const LIMIT = 50;

export interface SearchHit {
  projectId: string;
  path: string;
  lineNumber: number;
  snippet: string;
  matchedText: string;
  language: string | null;
}

async function searchProject(db: Db, p: ProjectDoc, q: string, language: string | null) {
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  // $facet always yields exactly one document
  const [r] = (await getCollections(db)
    .chunks.aggregate<{ total: { n: number }[]; items: { chunk: ChunkDoc }[] }>([
      {
        $match: {
          projectId: p._id,
          gen: p.syncGeneration,
          path: { $ne: null },
          ...(language ? { language } : {}),
          text: { $regex: escaped, $options: "i" },
        },
      },
      { $sort: { path: 1, startLine: 1 } },
      { $group: { _id: "$path", chunk: { $first: "$$ROOT" } } },
      { $sort: { _id: 1 } },
      { $facet: { total: [{ $count: "n" }], items: [{ $limit: LIMIT }] } },
    ])
    .toArray()) as [{ total: { n: number }[]; items: { chunk: ChunkDoc }[] }];
  const re = new RegExp(escaped, "i");
  const hits: SearchHit[] = r.items.map(({ chunk }) => {
    const lines = chunk.text.split("\n");
    const found = lines.findIndex((l) => re.test(l));
    const i = Math.max(found, 0);
    return {
      projectId: p._id.toHexString(),
      path: chunk.path as string,
      lineNumber: chunk.startLine + i,
      snippet: lines.slice(Math.max(i - 1, 0), i + 2).join("\n").slice(0, 300),
      matchedText: re.exec(lines[i] ?? "")?.[0] ?? "",
      language: chunk.language,
    };
  });
  return { hits, total: r.total[0]?.n ?? 0 };
}

export async function searchFiles(
  db: Db,
  ownerId: ObjectId,
  projectId: string | null,
  q: string,
  language: string | null,
) {
  if (projectId && !isObjectIdHex(projectId)) throw notFound("Project not found");
  const projects = await getCollections(db)
    .projects.find(projectId ? { _id: new ObjectId(projectId), ownerId } : { ownerId })
    .toArray();
  if (projectId && projects.length === 0) throw notFound("Project not found");
  const per = await Promise.all(projects.map((p) => searchProject(db, p, q, language)));
  const hits = per
    .flatMap((x) => x.hits)
    .sort((a, b) => a.path.localeCompare(b.path) || a.projectId.localeCompare(b.projectId))
    .slice(0, LIMIT);
  return { hits, totalCount: per.reduce((n, x) => n + x.total, 0) };
}
