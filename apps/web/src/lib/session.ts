/**
 * Session interface — published on day 1 of K2 so T can build SignInCard
 * against it without waiting for the full auth implementation.
 *
 * Import from here everywhere (T, K, etc.); do NOT import the context directly.
 */

import type { User } from "@/lib/api/types";

export type SessionStatus = "loading" | "authenticated" | "anonymous";

export interface Session {
  /** Resolved user. Non-null only when status === "authenticated". */
  user: User | null;
  status: SessionStatus;
  /**
   * Sign in with email + password.
   * Resolves on success; throws on credential failure.
   */
  signIn(email: string, password: string): Promise<void>;
  /**
   * Sign in with GitHub OAuth.
   * Resolves on success; throws on failure.
   */
  signInWithGithub(): Promise<void>;
  /**
   * Clears the session and redirects to /sign-in.
   */
  signOut(): Promise<void>;
}

/**
 * Typed helper — thrown by signIn/signInWithGithub on auth failures.
 * Lets callers distinguish credential errors from network errors.
 */
export class AuthError extends Error {
  readonly code: string;
  constructor(message: string, code = "AUTH_ERROR") {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}
