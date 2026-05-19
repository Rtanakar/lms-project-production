// ============================================================================
// api.ts — Typed fetch wrapper for backend REST calls (non-auth)
// ============================================================================
// Auth flows authClient se hote hain. Baaki sab (courses, lessons, profile
// updates, enrollment, etc.) iss wrapper se. Benefits:
//   - credentials: "include" hardcoded (cookie auto-send)
//   - Base URL env-driven
//   - JSON parsing + error normalization
//   - Type-safe via generics
//   - Backend error format ko frontend-friendly Error me convert
// ============================================================================

import { env } from "./env";

interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Skip JSON parsing — useful for 204 No Content responses */
  raw?: boolean;
}

interface BackendError {
  success: false;
  error: {
    code: string;
    message: string;
    issues?: { path: string; message: string }[];
  };
}

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly issues?: { path: string; message: string }[];

  constructor(
    message: string,
    status: number,
    code: string,
    issues?: { path: string; message: string }[],
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.issues = issues;
  }
}

export async function api<T = unknown>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { body, raw, headers, ...rest } = options;

  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...rest,
    credentials: "include", // SESSION COOKIE ke liye must
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 204 No Content / raw mode
  if (raw || res.status === 204) {
    return undefined as T;
  }

  const data = (await res.json()) as T | BackendError;

  if (!res.ok) {
    const err = data as BackendError;
    throw new ApiError(
      err.error?.message ?? "Request failed",
      res.status,
      err.error?.code ?? "UNKNOWN_ERROR",
      err.error?.issues,
    );
  }

  return data as T;
}

// Convenience method helpers (RESTful)
export const apiGet = <T>(path: string, opts?: ApiOptions) =>
  api<T>(path, { ...opts, method: "GET" });

export const apiPost = <T>(path: string, body?: unknown, opts?: ApiOptions) =>
  api<T>(path, { ...opts, method: "POST", body });

export const apiPut = <T>(path: string, body?: unknown, opts?: ApiOptions) =>
  api<T>(path, { ...opts, method: "PUT", body });

export const apiPatch = <T>(path: string, body?: unknown, opts?: ApiOptions) =>
  api<T>(path, { ...opts, method: "PATCH", body });

export const apiDelete = <T>(path: string, opts?: ApiOptions) =>
  api<T>(path, { ...opts, method: "DELETE" });
