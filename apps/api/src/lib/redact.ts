const PATTERNS: RegExp[] = [
  /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?(?:-----END [A-Z ]*PRIVATE KEY-----|$)/g,
  /AKIA[0-9A-Z]{16}/g,
  /(?:gh[pos]_|github_pat_)[A-Za-z0-9_]{20,}/g,
  /gsk_[A-Za-z0-9]{20,}/g,
  /sk-[A-Za-z0-9_-]{20,}/g,
  /xox[baprs]-[A-Za-z0-9-]{10,}/g,
  /(api[_-]?key|secret|token|password)\s*[:=]\s*["']?[^\s"']{12,}/gi,
];

/** Best-effort scrub of well-known credential shapes before text is stored or indexed. */
export function redactSecrets(text: string): string {
  return PATTERNS.reduce((t, re) => t.replace(re, "[REDACTED]"), text);
}
