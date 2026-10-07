export const CHUNK_LINES = 60;

export interface TextChunk {
  /** 1-based line number of the first line in the chunk */
  startLine: number;
  text: string;
}

export function chunk(text: string): TextChunk[] {
  if (text.length === 0) return [];
  const lines = text.split(/\r?\n/);
  const out: TextChunk[] = [];
  for (let i = 0; i < lines.length; i += CHUNK_LINES) {
    out.push({ startLine: i + 1, text: lines.slice(i, i + CHUNK_LINES).join("\n") });
  }
  return out;
}
