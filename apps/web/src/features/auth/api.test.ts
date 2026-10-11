import { describe, expect, it } from "vitest";
import { signInWithEmail } from "./api";

describe("signInWithEmail", () => {
  it("rejects with the unavailable message", async () => {
    await expect(
      signInWithEmail({ email: "a@b.co", password: "secret1" })
    ).rejects.toThrow("Email sign-in is not available. Continue with GitHub.");
  });
});
