import { z } from "zod";

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters"),
});

export type SignInInput = z.infer<typeof signInSchema>;

export async function signInWithEmail(_data: SignInInput): Promise<never> {
  throw new Error("Email sign-in is not available. Continue with GitHub.");
}

export async function signInWithGithub(): Promise<void> {
  window.location.assign("/api/v1/auth/github");
}
