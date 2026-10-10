const MODEL = "Xenova/all-MiniLM-L6-v2";

/** Turns text into unit-length vectors, so cosine similarity is a dot product. */
export interface Embedder {
  embed(texts: string[]): Promise<number[][]>;
}

type Extractor = (texts: string[], o: { pooling: "mean"; normalize: boolean }) => Promise<{ tolist(): number[][] }>;

/** Loads the model on first use (downloaded once, then cached on disk); a failed load is retried on the next call. */
export function createLocalEmbedder(): Embedder {
  let extractor: Promise<Extractor> | undefined;
  return {
    async embed(texts) {
      extractor ??= import("@huggingface/transformers")
        .then((m) => m.pipeline("feature-extraction", MODEL) as unknown as Promise<Extractor>)
        .catch((err: unknown) => {
          extractor = undefined;
          throw err;
        });
      return (await (await extractor)(texts, { pooling: "mean", normalize: true })).tolist();
    },
  };
}

export const cosine = (a: number[], b: number[]): number => {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += (a[i] ?? 0) * (b[i] ?? 0);
  return dot;
};
