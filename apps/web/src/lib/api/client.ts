export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public requestId: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

let nextRequestId = 1;

function makeRequestId(): string {
  return `req_${Date.now()}_${nextRequestId++}`;
}

const BASE_URL = "/api/v1";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
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
    if (
      response.status === 401 &&
      window.location.pathname !== "/" &&
      window.location.pathname !== "/sign-in"
    ) {
      window.location.assign("/sign-in");
    }
    const body = await response.json().catch(() => ({ message: response.statusText }));
    throw new ApiError(
      (body as { message?: string }).message ?? "Request failed",
      response.status,
      requestId
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }),
} as const;
