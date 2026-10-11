import Groq from "groq-sdk";
import type { ZodType } from "zod";
import { loadConfig } from "../config";
import { AppError } from "../lib/errors";

export interface LlmClient {
  generateJson<T>(o: {
    system: string;
    user: string;
    schema: ZodType<T>;
    maxTokens: number;
    timeoutMs: number;
  }): Promise<T>;
}

const failed = () => new AppError(502, "llm_failed", "Answer generation failed");

function mapError(err: unknown): AppError {
  if (err instanceof AppError) return err;
  const status = (err as { status?: number } | null)?.status;
  if (status === 429)
    return new AppError(429, "llm_rate_limited", "The AI service is busy. Try again shortly.");
  if (status === 401 || status === 403) return notConfigured();
  return failed();
}

const notConfigured = () =>
  new AppError(503, "llm_not_configured", "AI is not configured on this server");

export function createGroqClient(): LlmClient {
  return {
    async generateJson({ system, user, schema, maxTokens, timeoutMs }) {
      const { GROQ_API_KEY, LLM_MODEL } = loadConfig();
      if (!GROQ_API_KEY) throw notConfigured();
      const groq = new Groq({ apiKey: GROQ_API_KEY, timeout: timeoutMs, maxRetries: 0 });
      for (let attempt = 0; attempt < 2; attempt++) {
        let content: string | null | undefined;
        let finish: string | null | undefined;
        try {
          const r = await groq.chat.completions.create({
            model: LLM_MODEL,
            temperature: 0.2,
            // reasoning models spend completion tokens on thinking before the JSON
            max_completion_tokens: maxTokens * 3,
            ...(LLM_MODEL.startsWith("openai/gpt-oss") ? { reasoning_effort: "low" as const } : {}),
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: system },
              {
                role: "user",
                content: attempt ? `${user}\n\nReturn only valid JSON that matches the requested shape.` : user,
              },
            ],
          });
          content = r.choices[0]?.message?.content;
          finish = r.choices[0]?.finish_reason;
        } catch (err) {
          throw mapError(err);
        }
        if (finish === "length") continue;
        try {
          const parsed = schema.safeParse(JSON.parse(content ?? ""));
          if (parsed.success) return parsed.data;
        } catch {
          // invalid JSON: fall through to the single retry
        }
      }
      throw failed();
    },
  };
}
