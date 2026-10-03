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

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}

/**
 * Local auth stub that resolves after 600ms.
 */
export async function signInWithEmail(data: SignInInput): Promise<AuthResponse> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  // If password is "fail", trigger an error state for testing
  if (data.password === "error123") {
    throw new Error("Invalid email or password");
  }

  return {
    user: {
      id: "usr_mock_1",
      email: data.email,
      name: data.email.split("@")[0] || "User",
    },
    token: "mock_jwt_token",
  };
}

/**
 * Local GitHub OAuth stub that resolves after 600ms.
 */
export async function signInWithGithub(): Promise<AuthResponse> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    user: {
      id: "usr_mock_github",
      email: "developer@github.com",
      name: "GitHub Developer",
    },
    token: "mock_github_jwt_token",
  };
}
