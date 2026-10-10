/** Map with a per-entry expiry and a size cap: expired entries are swept first, then the oldest are dropped. */
export function createTtlCache<V>(ttlMs: number, max: number) {
  const entries = new Map<string, { at: number; value: V }>();
  return {
    get(key: string): V | undefined {
      const e = entries.get(key);
      return e && Date.now() - e.at <= ttlMs ? e.value : undefined;
    },
    set(key: string, value: V): void {
      entries.delete(key); // re-inserting moves the key to the newest position
      if (entries.size >= max) {
        for (const [k, e] of entries) if (Date.now() - e.at > ttlMs) entries.delete(k);
        while (entries.size >= max) entries.delete(entries.keys().next().value as string);
      }
      entries.set(key, { at: Date.now(), value });
    },
    get size(): number {
      return entries.size;
    },
  };
}
