import { Env } from "@/config/env";
import { HttpHeaders, HttpRequestOptions, HttpResponse } from "./types";
import { SecureStorageRepository } from "../repositories/SecureStorageRepository";
import { parseJSON, withTimeout } from "./utils";
import { getFreshAccessToken } from "@/src/services/api/refresh";

const secureStorage = new SecureStorageRepository();

let onAuthFailure: (() => void) | null = null;
export function setOnAuthFailure(handler: () => void) {
  onAuthFailure = handler;
}

/**
 * Attaches Bearer token authentication header to requests
 *
 * Retrieves the stored access token from secure storage and adds it
 * to the Authorization header when auth is enabled.
 *
 * @param headers - Existing headers object to modify
 * @param auth - Whether to attach authentication token
 * @returns Promise<HttpHeaders> - Headers with auth token attached (if auth=true)
 *
 * @throws {Error} - When auth=true but headers object is undefined
 *
 * @example
 * ```typescript
 * const headers = await attachAuthHeader({ "Content-Type": "application/json" }, true);
 * // Result: { "Content-Type": "application/json", "Authorization": "Bearer <token>" }
 * ```
 */
async function attachAuthHeader(headers: HttpHeaders = {}, auth?: boolean) {
  // Skip auth processing if not requested
  if (!auth) return { ...headers };
  const token = await secureStorage.getItem<string>("access_token");
  return token
    ? { ...headers, Authorization: `Bearer ${token}` }
    : { ...headers };
}

/**
 * Core HTTP client function for making API requests
 *
 * A type-safe, feature-rich HTTP client that handles authentication,
 * timeouts, error responses, and JSON serialization automatically.
 *
 * @template TResponse - Expected response data type
 * @template TBody - Request body data type (defaults to unknown)
 *
 * @param path - API endpoint path (relative) or full URL (absolute)
 * @param httpOptions - Request configuration options
 * @returns Promise<HttpResponse<TResponse>> - Standardized response wrapper
 *
 * Features:
 * - Automatic JSON Content-Type headers
 * - Bearer token authentication when auth=true
 * - Request timeout handling
 * - Consistent error response format
 * - Type-safe request/response handling
 *
 * @example
 * ```typescript
 * import { httpFetch } from "@infrastructure/http/client";
 *
 * // Simple GET request
 * const res = await httpFetch<{ message: string }>("/ping");
 * if (res.ok) console.log(res.data);
 * else console.error(res.error);
 *
 * // Authenticated GET request
 * const profile = await httpFetch<User>("/profile", { auth: true });
 *
 * // POST request with body and authentication
 * await httpFetch("/posts", {
 *   method: "POST",
 *   body: { content: "Hello" },
 *   auth: true,
 * });
 *
 * // Request with custom headers and timeout
 * const data = await httpFetch<ApiResponse>("/data", {
 *   method: "GET",
 *   headers: { "X-Custom-Header": "value" },
 *   timeoutMs: 5000,
 *   auth: true
 * });
 * ```
 */
export async function httpFetch<TResponse, TBody = unknown>(
  path: string,
  httpOptions: HttpRequestOptions
): Promise<HttpResponse<TResponse>> {
  const {
    method = "GET",
    headers,
    body,
    auth,
    timeoutMs,
    signal,
    _retry,
  } = httpOptions;

  const url = path.startsWith("http") ? path : `${Env.API_URL}${path}`;
  const finalHeaders: HttpHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(await attachAuthHeader(headers, auth)),
  };

  try {
    const res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: withTimeout(signal, timeoutMs),
    });

    if (res.status !== 401) {
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        return {
          ok: false,
          status: res.status,
          error: errText || res.statusText,
        };
      }
      const data = await parseJSON<TResponse>(res);
      return { ok: true, status: res.status, data };
    }

    // 401 handling
    if (!auth || _retry) {
      if (auth && onAuthFailure) onAuthFailure();
      return { ok: false, status: 401, error: "Unauthorized" };
    }

    const newAccess = await getFreshAccessToken();
    if (!newAccess) {
      if (auth && onAuthFailure) onAuthFailure();
      return { ok: false, status: 401, error: "Unauthorized" };
    }

    // Retry once with fresh token (override Authorization explicitly)
    const retryHeaders: HttpHeaders = {
      ...(headers),
      Authorization: `Bearer ${newAccess}`,
    };
    return httpFetch<TResponse>(path, {
      ...httpOptions,
      headers: retryHeaders,
      _retry: true,
    });
  } catch (err: any) {
    if (err?.name === "AbortError")
      return { ok: false, status: 0, error: "Request timed out" };
    return { ok: false, status: 0, error: err?.message ?? "Network error" };
  }
}
