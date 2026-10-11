export const CHUNK_LINES = 60;

export interface TextChunk {
  /** 1-based line number of the first line in the chunk */
  startLine: number;
  text: string;
}

export const MAX_CHUNK_CHARS = 6000;

export function chunk(text: string): TextChunk[] {
  if (text.length === 0) return [];
  const out: TextChunk[] = [];
  let buf: string[] = [];
  let len = 0;
  let start = 1;
  const flush = () => {
    if (buf.length) out.push({ startLine: start, text: buf.join("\n") });
    buf = [];
    len = 0;
  };
  text.split(/\r?\n/).forEach((line, i) => {
    // an overlong line is sliced; every slice keeps that line's number
    for (let o = 0; o === 0 || o < line.length; o += MAX_CHUNK_CHARS) {
      const part = line.slice(o, o + MAX_CHUNK_CHARS);
      if (buf.length >= CHUNK_LINES || (buf.length && len + part.length + 1 > MAX_CHUNK_CHARS)) flush();
      if (!buf.length) start = i + 1;
      buf.push(part);
      len += part.length + 1;
    }
  });
  flush();
  return out;
}
