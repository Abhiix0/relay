import type { Db } from "mongodb";
import { getCollections, type ChunkDoc, type ProjectDoc } from "../db/collections";
import { cosine, type Embedder } from "../lib/embedder";

const CHUNK_CHARS = 1200;
const TOTAL_CHARS = 9000;
const PER_SOURCE = 2;
const MIN_COSINE = 0.25;
const MANIFESTS = ["package.json", "Cargo.toml", "pyproject.toml", "go.mod"];
/** History carries intent that code alone cannot; commits are the noisiest. */
const TYPE_WEIGHT: Record<string, number> = { decision: 1.15, pr: 1.05, issue: 1.05, commit: 0.95 };
const DAY = 86_400_000;

/** Dedupes by location and caps count, total size and (optionally) chunks per file or artifact. */
export function fit(hits: ChunkDoc[], k = 8, perSource = Infinity): ChunkDoc[] {
  const seen = new Set<string>();
  const perKey = new Map<string, number>();
  const out: ChunkDoc[] = [];
  let total = 0;
  for (const c of hits) {
    const key = `${c.path ?? c._id.toHexString()}:${c.startLine}`;
    const source = c.artifactId?.toHexString() ?? c.path ?? c._id.toHexString();
    if (seen.has(key) || out.length >= k + 3 || (perKey.get(source) ?? 0) >= perSource) continue;
    seen.add(key);
    const text = c.text.slice(0, CHUNK_CHARS);
    if (total + text.length > TOTAL_CHARS) break;
    total += text.length;
    perKey.set(source, (perKey.get(source) ?? 0) + 1);
    out.push({ ...c, text });
  }
  return out;
}

export interface RetrieveOptions {
  k?: number;
  /** restrict to these artifact types */
  types?: string[];
  /** adds a cosine pass over embedded chunks; without it (or if it fails) retrieval is lexical only */
  embedder?: Embedder;
  /** receives a line for every degradation, for the run trace */
  notes?: string[];
}

/**
 * Hybrid retrieval over one project's current generation: $text matches plus cosine neighbours,
 * reranked by relevance, source type, recency and how directly the query names the path or title.
 */
export async function retrieve(
  db: Db,
  project: ProjectDoc,
  query: string,
  { k = 8, types, embedder, notes }: RetrieveOptions = {},
): Promise<ChunkDoc[]> {
  const { chunks, artifacts } = getCollections(db);
  const scope = { projectId: project._id, gen: { $in: [project.syncGeneration, null] }, ...(types && { type: { $in: types } }) };

  type Scored = ChunkDoc & { score: number };
  const lexical = (await chunks
    .find({ ...scope, $text: { $search: query } }, { projection: { score: { $meta: "textScore" } } })
    .sort({ score: { $meta: "textScore" } })
    .limit(k * 2)
    .toArray()) as Scored[];
  const maxText = Math.max(...lexical.map((c) => c.score), 0);
  const candidates = new Map<string, { chunk: ChunkDoc; lex: number; cos: number }>();
  for (const c of lexical) {
    candidates.set(c._id.toHexString(), { chunk: c, lex: maxText > 0 ? c.score / maxText : 0, cos: 0 });
  }

  if (embedder) {
    try {
      const [qv] = await embedder.embed([query]);
      // shortcut: brute-force cosine in process, fine to ~20k chunks per project; move to a vector index beyond that
      const vectors = await chunks
        .find({ ...scope, embedding: { $exists: true } }, { projection: { embedding: 1 } })
        .toArray();
      const top = vectors
        .map((v) => ({ id: v._id, cos: qv && v.embedding ? cosine(qv, v.embedding) : 0 }))
        .filter((v) => v.cos >= MIN_COSINE)
        .sort((a, b) => b.cos - a.cos)
        .slice(0, k * 2);
      const docs = new Map(
        (await chunks.find({ _id: { $in: top.map((t) => t.id) } }).toArray()).map((d) => [d._id.toHexString(), d]),
      );
      for (const t of top) {
        const id = t.id.toHexString();
        const doc = docs.get(id);
        const hit = candidates.get(id);
        if (hit) hit.cos = t.cos;
        else if (doc) candidates.set(id, { chunk: doc, lex: 0, cos: t.cos });
      }
    } catch {
      notes?.push("embedder unavailable: used lexical search only");
    }
  }

  if (candidates.size < 3 && !types) {
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
    for (const c of [...readme, ...(manifest ? [manifest] : [])]) {
      if (!candidates.has(c._id.toHexString())) candidates.set(c._id.toHexString(), { chunk: c, lex: 0.05, cos: 0 });
    }
  }

  const artifactIds = [...candidates.values()].flatMap((h) => (h.chunk.artifactId ? [h.chunk.artifactId] : []));
  const updated = new Map(
    (await artifacts.find({ _id: { $in: artifactIds } }, { projection: { updatedAt: 1 } }).toArray()).map((a) => [
      a._id.toHexString(),
      a.updatedAt.getTime(),
    ]),
  );
  const tokens = query.toLowerCase().match(/[a-z0-9_]{3,}/g) ?? [];
  const now = Date.now();
  const ranked = [...candidates.values()]
    .map(({ chunk, lex, cos }) => {
      const relevance = Math.max(lex, cos) + 0.25 * Math.min(lex, cos);
      const at = chunk.artifactId ? updated.get(chunk.artifactId.toHexString()) : undefined;
      const recency = at ? 1 + 0.15 * 0.5 ** (Math.max(now - at, 0) / (180 * DAY)) : 1;
      const where = `${chunk.path ?? ""} ${chunk.title}`.toLowerCase();
      const direct = tokens.some((t) => where.includes(t)) ? 1.15 : 1;
      return { chunk, score: relevance * (TYPE_WEIGHT[chunk.type] ?? 1) * recency * direct };
    })
    .sort((a, b) => b.score - a.score)
    .map((r) => r.chunk);

  return fit(ranked, k, PER_SOURCE);
}
