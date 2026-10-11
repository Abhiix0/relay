import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const isTest = process.env.NODE_ENV === "test";
const secret = (dummy: string) => (isTest ? z.string().min(1).default(dummy) : z.string().min(1));

const schema = z
  .object({
    PORT: z.coerce.number().int().default(4000),
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    MONGODB_URI: secret("mongodb://localhost:27017/relay-test"),
    GITHUB_CLIENT_ID: secret("test-client-id"),
    GITHUB_CLIENT_SECRET: secret("test-client-secret"),
    GITHUB_SCOPE: z.string().default("read:user user:email public_repo"),
    TOKEN_ENCRYPTION_KEY: secret(Buffer.alloc(32, 1).toString("base64")).refine(
      (v) => Buffer.from(v, "base64").length === 32,
      "must be 32 bytes, base64-encoded",
    ),
    PUBLIC_APP_URL: z.string().url().default("http://localhost:5200"),
    GITHUB_CALLBACK_URL: z.string().url().optional(),
    GROQ_API_KEY: z.string().optional(),
    GITHUB_WEBHOOK_SECRET: z.string().min(1).optional(),
    MAX_PROJECTS_PER_USER: z.coerce.number().int().min(1).default(10),
    TRUST_PROXY: z.coerce.number().int().min(0).default(1),
    LLM_MODEL: z.string().default("openai/gpt-oss-120b"),
  })
  .transform((c) => ({
    ...c,
    GITHUB_CALLBACK_URL: c.GITHUB_CALLBACK_URL ?? `${c.PUBLIC_APP_URL}/api/v1/auth/github/callback`,
  }));

export type Config = z.infer<typeof schema>;

let cached: Config | undefined;

/** Test hook: forget the memoized config. */
export function resetConfig(): void {
  cached = undefined;
}

function tryLoadEnv(): void {
  // Tests must use the deterministic schema defaults rather than a developer's
  // local .env (which may contain real service credentials).
  if (isTest) return;
  if (typeof process.loadEnvFile !== "function") return;
  const candidates = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "apps/api/.env"),
    path.resolve(import.meta.dirname ?? "", "../.env"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      try {
        process.loadEnvFile(candidate);
        break;
      } catch {
        // Continue to next candidate
      }
    }
  }
}

/** Memoized for the process env; an explicit env is parsed fresh and not cached. */
export function loadConfig(env?: NodeJS.ProcessEnv): Config {
  if (!env && cached) return cached;
  if (!env && !process.env.MONGODB_URI) {
    tryLoadEnv();
  }
  const parsed = schema.safeParse(env ?? process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  if (!env) cached = parsed.data;
  return parsed.data;
}
