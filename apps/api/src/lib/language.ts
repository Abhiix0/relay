const BY_EXT: Record<string, string> = {
  rs: "rust",
  ts: "typescript",
  tsx: "typescript",
  mts: "typescript",
  cts: "typescript",
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  py: "python",
  go: "go",
  md: "markdown",
  mdx: "markdown",
  json: "json",
  toml: "toml",
  yaml: "yaml",
  yml: "yaml",
  css: "css",
  html: "html",
  htm: "html",
  sh: "shell",
  bash: "shell",
  zsh: "shell",
};

const BY_NAME: Record<string, string> = {
  dockerfile: "shell",
  makefile: "shell",
};

export function detectLanguage(path: string): string | null {
  const name = (path.split("/").pop() ?? "").toLowerCase();
  if (BY_NAME[name]) return BY_NAME[name];
  const dot = name.lastIndexOf(".");
  if (dot < 0) return null;
  return BY_EXT[name.slice(dot + 1)] ?? null;
}
