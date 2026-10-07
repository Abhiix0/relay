import { z } from "zod";

const isTest = process.env.NODE_ENV === "test";
const secret = (dummy: string) => (isTest ? z.string().min(1).default(dummy) : z.string().min(1));

const schema = z.object({
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
  GROQ_API_KEY: secret("test-groq-key"),
  LLM_MODEL: z.string().default("llama-3.3-70b-versatile"),
});

export type Config = z.infer<typeof schema>;

let cached: Config | undefined;

/** Test hook: forget the memoized config. */
export function resetConfig(): void {
  cached = undefined;
}

/** Memoized for the process env; an explicit env is parsed fresh and not cached. */
export function loadConfig(env?: NodeJS.ProcessEnv): Config {
  if (!env && cached) return cached;
  const parsed = schema.safeParse(env ?? process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  if (!env) cached = parsed.data;
  return parsed.data;
}
