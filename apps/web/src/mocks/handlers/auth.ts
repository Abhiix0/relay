import { http, HttpResponse } from "msw";
import { mockUser } from "../data/user";
import type { User } from "@/lib/api/types";

/* ── In-memory session store ────────────────────────────────── */

interface Session {
  user: User;
  token: string;
}

let currentSession: Session | null = null;

export const authHandlers = [
  // GET /auth/me — returns 401 when no session
  http.get("/api/v1/auth/me", ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    const cookieHeader = request.headers.get("Cookie") ?? "";
    const hasToken =
      (authHeader?.startsWith("Bearer ") && authHeader.length > 7) ||
      cookieHeader.includes("relay_session=");

    if (!hasToken && !currentSession) {
      return HttpResponse.json(
        { message: "Unauthorized", code: "UNAUTHENTICATED" },
        { status: 401 }
      );
    }

    return HttpResponse.json(currentSession?.user ?? mockUser);
  }),

  // POST /auth/sign-in
  http.post("/api/v1/auth/sign-in", async ({ request }) => {
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (!body.email || !body.password) {
      return HttpResponse.json(
        { message: "Email and password are required", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    // Simulate credential failure for test trigger
    if (body.password === "error123") {
      return HttpResponse.json(
        { message: "Invalid email or password", code: "INVALID_CREDENTIALS" },
        { status: 401 }
      );
    }

    const token = `mock_jwt_${Date.now()}`;
    currentSession = {
      user: {
        ...mockUser,
        email: body.email,
        name: body.email.split("@")[0] ?? "User",
      },
      token,
    };

    return HttpResponse.json(
      { user: currentSession.user, token },
      { status: 200 }
    );
  }),

  // POST /auth/sign-out
  http.post("/api/v1/auth/sign-out", () => {
    currentSession = null;
    return new HttpResponse(null, { status: 204 });
  }),
];
