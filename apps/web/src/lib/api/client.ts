export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public requestId: string
  ) {
    super(message);
    this.name = "ApiError";
  }

  get isUnauthorized(): boolean {
    return this.status === 401 || this.status === 403;
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isNetworkOrUnavailable(): boolean {
    return (
      this.status === 0 ||
      this.status === 502 ||
      this.status === 503 ||
      this.status === 504
    );
  }
}

let nextRequestId = 1;

function makeRequestId(): string {
  return `req_${Date.now()}_${nextRequestId++}`;
}

/**
 * Resolves the API base URL.
 * Defaults to same-origin "/api/v1".
 * Can be configured via VITE_API_BASE_URL (e.g. "https://api.relay.example.com").
 */
function getApiBaseUrl(): string {
  const envBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (!envBase) {
    return "/api/v1";
  }
  const cleanBase = envBase.replace(/\/+$/, "");
  return cleanBase.endsWith("/api/v1") ? cleanBase : `${cleanBase}/api/v1`;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const requestId = makeRequestId();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${normalizedPath}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-Request-Id": requestId,
        ...options.headers,
      },
    });
  } catch (networkError) {
    const errorDetails = networkError instanceof Error ? networkError.message : "Network failure";
    throw new ApiError(
      `Cannot connect to API server at ${url}: ${errorDetails}. Ensure the backend service is running and accessible.`,
      0,
      requestId
    );
  }

  const contentType = response.headers?.get ? response.headers.get("content-type") || "" : "";
  const isExplicitNonJson = Boolean(
    contentType &&
      !contentType.includes("application/json") &&
      !contentType.includes("+json")
  );

  if (!response.ok) {
    let errorMessage = response.statusText || "Request failed";
    if (!isExplicitNonJson && typeof response.json === "function") {
      try {
        const body = (await response.json()) as { message?: string; error?: string };
        errorMessage = body?.message || body?.error || errorMessage;
      } catch {
        // Fall back to status text if JSON extraction fails
      }
    } else {
      // Non-JSON error response, possibly HTML from reverse proxy or SPA fallback
      errorMessage = `Server returned HTTP ${response.status} (${response.statusText || "Error"}) with non-JSON response.`;
    }

    if (response.status === 401 || response.status === 403) {
      errorMessage = `${errorMessage} (Authentication or authorization required)`;
    }

    throw new ApiError(errorMessage, response.status, requestId);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  // Reject non-JSON responses on 200 OK (e.g. index.html served by SPA fallback)
  if (isExplicitNonJson) {
    throw new ApiError(
      `API endpoint returned non-JSON content (${contentType || "unknown"}). A backend API server may not be running at this URL.`,
      response.status,
      requestId
    );
  }

  try {
    return (await response.json()) as T;
  } catch (parseError) {
    const parseMsg = parseError instanceof Error ? parseError.message : "Invalid JSON";
    throw new ApiError(
      `Failed to parse server response as JSON: ${parseMsg}`,
      response.status,
      requestId
    );
  }
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
