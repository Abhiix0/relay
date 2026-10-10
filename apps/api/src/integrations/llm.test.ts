import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

const create = vi.fn();
vi.mock("groq-sdk", () => ({ default: class { chat = { completions: { create } }; } }));
vi.mock("../config", () => ({ loadConfig: () => ({ GROQ_API_KEY: "k", LLM_MODEL: "openai/gpt-oss-120b" }) }));

import { createGroqClient } from "./llm";

const schema = z.object({ ok: z.boolean() });
const reply = (content: string, finish = "stop") => ({ choices: [{ message: { content }, finish_reason: finish }] });
const call = () => createGroqClient().generateJson({ system: "s", user: "u", schema, maxTokens: 100, timeoutMs: 1000 });

describe("groq client", () => {
  beforeEach(() => create.mockReset());

  it("sends max_completion_tokens = 3x and low reasoning effort for gpt-oss", async () => {
    create.mockResolvedValue(reply('{"ok":true}'));
    await expect(call()).resolves.toEqual({ ok: true });
    expect(create.mock.calls[0]?.[0]).toMatchObject({ max_completion_tokens: 300, reasoning_effort: "low" });
  });

  it.each([
    ["length cutoff", reply('{"ok":', "length")],
    ["invalid JSON", reply("nope")],
    ["schema failure", reply('{"ok":"x"}')],
  ])("retries once with a JSON nudge after %s", async (_n, bad) => {
    create.mockResolvedValueOnce(bad).mockResolvedValueOnce(reply('{"ok":true}'));
    await expect(call()).resolves.toEqual({ ok: true });
    expect(create.mock.calls[1]?.[0].messages[1].content).toContain("Return only valid JSON");
  });

  it("gives up with 502 after the retry", async () => {
    create.mockResolvedValue(reply("nope"));
    await expect(call()).rejects.toMatchObject({ status: 502 });
    expect(create).toHaveBeenCalledTimes(2);
  });
});
