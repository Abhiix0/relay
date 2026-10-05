import { z } from "zod";
import { log } from "@/lib/log";

/* ── Error type ─────────────────────────────────────────────── */

export class ApiError extends Error {
  /** HTTP status code */
  readonly status: number;
  /** Machine-readable error code from the server (defaults to "UNKNOWN") */
  readonly code: string;
  /** Correlation ID sent in X-Request-Id */
  readonly requestId: string;
  /**
   * Whether a retry is worth attempting.
   * True for 429 / 5xx, false for 4xx (except 429).
   */
  readonly retryable: boolean;

  constructor(opts: {
    message: string;
    status: number;
    code?: string;
    requestId: string;
  }) {
    super(opts.message);
    this.name = "ApiError";
    this.status = opts.status;
    this.code = opts.code ?? "UNKNOWN";
    this.requestId = opts.requestId;
    this.retryable = opts.status === 429 || opts.status >= 500;
  }
}

/* ── Request ID factory ─────────────────────────────────────── */

let nextId = 1;
function makeRequestId(): string {
  return `req_${Date.now()}_${nextId++}`;
}

/* ── Fetch core ─────────────────────────────────────────────── */

const BASE_URL = "/api/v1";

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  schema?: z.ZodType<T>
): Promise<T> {
  const requestId = makeRequestId();
  const url = `${BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Request-Id": requestId,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response
      .json()
      .catch(() => ({ message: response.statusText })) as {
        message?: string;
        code?: string;
      };
    throw new ApiError({
      message: body.message ?? "Request failed",
      status: response.status,
      code: body.code,
      requestId,
    });
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const json = (await response.json()) as unknown;

  if (!schema) {
    return json as T;
  }

  const result = schema.safeParse(json);
  if (result.success) {
    return result.data;
  }

  // Schema mismatch — loud in dev, once-only warning in prod
  const issuesSummary = result.error.issues
    .slice(0, 3)
    .map((i) => `${i.path.join(".")}: ${i.message}`)
    .join("; ");
  const msg = `Schema mismatch on ${path} — ${issuesSummary}`;

  if (import.meta.env.DEV) {
    throw new ApiError({
      message: msg,
      status: 0,
      code: "SCHEMA_MISMATCH",
      requestId,
    });
  }

  log.error(msg, result.error.issues);
  // Prod: fall through with the raw data rather than breaking the UI
  return json as T;
}

/* ── Public API surface ─────────────────────────────────────── */

export const api = {
  get: <T>(path: string, schema?: z.ZodType<T>) =>
    apiFetch<T>(path, {}, schema),

  post: <T>(path: string, body?: unknown, schema?: z.ZodType<T>) =>
    apiFetch<T>(
      path,
      { method: "POST", body: body !== undefined ? JSON.stringify(body) : undefined },
      schema
    ),

  put: <T>(path: string, body?: unknown, schema?: z.ZodType<T>) =>
    apiFetch<T>(
      path,
      { method: "PUT", body: body !== undefined ? JSON.stringify(body) : undefined },
      schema
    ),

  patch: <T>(path: string, body?: unknown, schema?: z.ZodType<T>) =>
    apiFetch<T>(
      path,
      { method: "PATCH", body: body !== undefined ? JSON.stringify(body) : undefined },
      schema
    ),

  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
} as const;
