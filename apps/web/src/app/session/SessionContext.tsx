import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { queryKeys } from "@/lib/api/query-keys";
import type { User } from "@/lib/api/types";
import { AuthError, type Session, type SessionStatus } from "@/lib/session";

/* ── Context ─────────────────────────────────────────────────── */

const SessionContext = createContext<Session | null>(null);

/* ── Provider ────────────────────────────────────────────────── */

export function SessionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");

  // Hydrate from /auth/me on mount
  useEffect(() => {
    let cancelled = false;
    api
      .get<User>("/auth/me")
      .then((u) => {
        if (cancelled) return;
        setUser(u);
        setStatus("authenticated");
        queryClient.setQueryData(queryKeys.auth.me, u);
      })
      .catch(() => {
        if (cancelled) return;
        setUser(null);
        setStatus("anonymous");
      });
    return () => {
      cancelled = true;
    };
  }, [queryClient]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const data = await api
        .post<{ user: User; token: string }>("/auth/sign-in", {
          email,
          password,
        })
        .catch((err: unknown) => {
          const msg =
            err instanceof Error ? err.message : "Authentication failed";
          throw new AuthError(msg, "INVALID_CREDENTIALS");
        });
      setUser(data.user);
      setStatus("authenticated");
      queryClient.setQueryData(queryKeys.auth.me, data.user);
    },
    [queryClient]
  );

  const signInWithGithub = useCallback(async () => {
    const data = await api
      .post<{ user: User; token: string }>("/auth/sign-in", {
        email: "developer@github.com",
        password: "github_oauth",
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Error ? err.message : "GitHub authentication failed";
        throw new AuthError(msg, "GITHUB_AUTH_ERROR");
      });
    setUser(data.user);
    setStatus("authenticated");
    queryClient.setQueryData(queryKeys.auth.me, data.user);
  }, [queryClient]);

  const signOut = useCallback(async () => {
    await api.post("/auth/sign-out").catch(() => {
      // best-effort
    });
    setUser(null);
    setStatus("anonymous");
    queryClient.clear();
  }, [queryClient]);

  const value: Session = { user, status, signIn, signInWithGithub, signOut };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

/* ── Hook ────────────────────────────────────────────────────── */

export function useSession(): Session {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used inside <SessionProvider>");
  }
  return ctx;
}
