import type { Db } from "mongodb";
import { getCollections, type ChunkDoc, type ProjectDoc } from "../db/collections";

const CHUNK_CHARS = 1200;
const TOTAL_CHARS = 9000;
const MANIFESTS = ["package.json", "Cargo.toml", "pyproject.toml", "go.mod"];

/** Dedupes by location and caps count and total size. */
export function fit(hits: ChunkDoc[], k = 8): ChunkDoc[] {
  const seen = new Set<string>();
  const out: ChunkDoc[] = [];
  let total = 0;
  for (const c of hits) {
    const key = `${c.path ?? c._id.toHexString()}:${c.startLine}`;
    if (seen.has(key) || out.length >= k + 3) continue;
    seen.add(key);
    const text = c.text.slice(0, CHUNK_CHARS);
    if (total + text.length > TOTAL_CHARS) break;
    total += text.length;
    out.push({ ...c, text });
  }
  return out;
}

/** Top text-search chunks for the current generation (optionally one artifact type set), topped up with README/manifest when thin. */
export async function retrieve(
  db: Db,
  project: ProjectDoc,
  query: string,
  k = 8,
  types?: string[],
): Promise<ChunkDoc[]> {
  const { chunks } = getCollections(db);
  const scope = { projectId: project._id, gen: { $in: [project.syncGeneration, null] } };

  const hits = await chunks
    .find(
      { ...scope, ...(types && { type: { $in: types } }), $text: { $search: query } },
      { projection: { score: { $meta: "textScore" } } },
    )
    .sort({ score: { $meta: "textScore" } })
    .limit(k * 2)
    .toArray();

  if (hits.length < 3 && !types) {
    const baseline = await chunks
      .find({
        ...scope,
        type: "file",
        path: { $regex: /^(readme(\.[a-z]+)?|package\.json|Cargo\.toml|pyproject\.toml|go\.mod)$/i },
      })
      .sort({ path: 1, startLine: 1 })
      .toArray();
    const readme = baseline.filter((c) => !MANIFESTS.includes(c.path ?? "")).slice(0, 2);
    const manifest = MANIFESTS.map((m) => baseline.find((c) => c.path === m)).find(Boolean);
    hits.push(...readme, ...(manifest ? [manifest] : []));
  }

  return fit(hits, k);
}
