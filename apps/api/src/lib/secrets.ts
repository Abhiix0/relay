const EXCLUDED_DIRS = new Set(["node_modules", "dist", "build", "vendor", ".git"]);

const LOCKFILES = new Set([
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
  "bun.lockb",
  "cargo.lock",
  "poetry.lock",
  "composer.lock",
  "gemfile.lock",
  "go.sum",
]);

/** Paths that must never be stored at all (secrets, vendor and build dirs). */
export function isExcludedPath(path: string): boolean {
  const parts = path.split("/").filter(Boolean);
  if (parts.slice(0, -1).some((p) => EXCLUDED_DIRS.has(p))) return true;
  const name = (parts[parts.length - 1] ?? "").toLowerCase();
  return (
    name === ".env" ||
    name.startsWith(".env.") ||
    name.endsWith(".pem") ||
    name.endsWith(".key") ||
    name.endsWith(".p12") ||
    name.startsWith("id_rsa") ||
    name.includes("secret")
  );
}

/** Lockfiles are listed in the tree but never chunked. */
export function isLockfile(path: string): boolean {
  return LOCKFILES.has((path.split("/").pop() ?? "").toLowerCase());
}
