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
  PUBLIC_APP_URL: z.string().url().default("http://localhost:5173"),
  ANTHROPIC_API_KEY: secret("test-anthropic-key"),
  LLM_MODEL: z.string().default("claude-sonnet-5-5"),
});

export type Config = z.infer<typeof schema>;

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const parsed = schema.safeParse(env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  return parsed.data;
}
