// ============================================================================
// api-client.ts — Typed fetch wrapper for REST API calls
// ============================================================================
// Centralizes:
//   - Base URL (NEXT_PUBLIC_API_URL)
//   - Cookies (`credentials: "include"` — cross-origin auth)
//   - Origin header (Better Auth CSRF check)
//   - Response envelope unwrapping ({ success, data } → data)
//   - Error normalization (server error code/message → thrown Error)
//
// Industry pattern: ALL queries/mutations go through this — never raw fetch.
// Sentry / Datadog can intercept at this level for centralized monitoring.
// ============================================================================

import { env } from "./env";

interface ApiSuccess<T> {
  success: true;
  data: T;
}

interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    issues?: Array<{ path: string; message: string }>;
  };
}

type ApiResponse<T> = ApiSuccess<T> | ApiError;

export class ApiClientError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number,
    public issues?: Array<{ path: string; message: string }>,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  /** Query params object — auto-serialized to URLSearchParams */
  params?: Record<string, string | number | boolean | undefined | null>;
  /** JSON body — auto-stringified + Content-Type header */
  json?: unknown;
  /**
   * Server-side only: forward request cookies to backend (server components
   * don't auto-send browser cookies). Pass `cookies().toString()` from Next.
   * Browser ignores this — `credentials: "include"` handles cookies there.
   */
  cookie?: string;
}

/**
 * Build URL with query params.
 * Drops `undefined`/`null` values so optional filters don't pollute the URL.
 */
function buildUrl(path: string, params?: ApiRequestOptions["params"]): string {
  const url = new URL(
    path.startsWith("http") ? path : `${env.NEXT_PUBLIC_API_URL}${path}`,
  );
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null || value === "") continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * Core API caller — used by all hooks and server-side fetchers.
 *
 * @throws {ApiClientError} on non-2xx OR `{ success: false }` envelope
 */
export async function api<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { params, json, headers, cookie, ...rest } = options;

  const init: RequestInit = {
    ...rest,
    credentials: "include", // cross-origin cookies (Better Auth session)
    headers: {
      // Better Auth CSRF check — must match trustedOrigins
      Origin: env.NEXT_PUBLIC_APP_URL,
      Accept: "application/json",
      ...(json !== undefined && { "Content-Type": "application/json" }),
      ...(cookie && { Cookie: cookie }),
      ...headers,
    },
    ...(json !== undefined && { body: JSON.stringify(json) }),
  };

  const url = buildUrl(path, params);
  const res = await fetch(url, init);

  // 204 No Content (delete) — no body to parse
  if (res.status === 204) return undefined as T;

  let payload: ApiResponse<T>;
  try {
    payload = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError(
      `Invalid JSON from ${res.url}`,
      "INVALID_JSON",
      res.status,
    );
  }

  if (!res.ok || payload.success === false) {
    const error = payload.success === false ? payload.error : null;
    throw new ApiClientError(
      error?.message ?? `Request failed with ${res.status}`,
      error?.code ?? "UNKNOWN_ERROR",
      res.status,
      error?.issues,
    );
  }

  return payload.data;
}
