/**
 * Supported HTTP methods for API requests
 * 
 * Defines the standard HTTP verbs used throughout the application:
 * - GET: Retrieve data from the server
 * - POST: Create new resources
 * - PUT: Update entire resources (replace)
 * - PATCH: Partial updates to resources
 * - DELETE: Remove resources
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

/**
 * HTTP headers as key-value string pairs
 * 
 * Common headers include:
 * - "Content-Type": "application/json"
 * - "Authorization": "Bearer <token>"
 * - "Accept": "application/json"
 * - Custom headers for API requirements
 */
export type HttpHeaders = Record<string, string>;

/**
 * Configuration options for HTTP requests
 * 
 * @template TBody - The type of the request body data
 * 
 * @property method - HTTP method to use (defaults to GET if not specified)
 * @property body - Request payload data (automatically serialized to JSON)
 * @property headers - Custom HTTP headers to include in the request
 * @property auth - Whether to automatically attach authentication token (default: false)
 * @property timeoutMs - Request timeout in milliseconds (no timeout if not specified)
 * @property signal - AbortSignal for manual request cancellation
 * 
 * @example
 * ```typescript
 * // Simple GET request
 * const getOptions: HttpRequestOptions = { method: "GET" };
 * 
 * // POST with body and auth
 * const postOptions: HttpRequestOptions<User> = {
 *   method: "POST",
 *   body: { name: "John", email: "john@example.com" },
 *   auth: true,
 *   timeoutMs: 5000
 * };
 * ```
 */
export type HttpRequestOptions<TBody = unknown> = {
    method?: HttpMethod;
    body?: TBody;
    headers?: HttpHeaders;
    auth?: boolean;         // attach token automatically
    timeoutMs?: number;
    signal?: AbortSignal;
}

/**
 * Standardized HTTP response wrapper
 * 
 * Provides consistent response format across all API calls with proper error handling
 * 
 * @template T - The expected type of the response data
 * 
 * @property ok - Indicates if the request was successful (status 200-299)
 * @property status - HTTP status code (200, 404, 500, etc.)
 * @property data - Response payload when successful (undefined on error)
 * @property error - Error message when request fails (undefined on success)
 * 
 * @example
 * ```typescript
 * // Successful response
 * const successResponse: HttpResponse<User> = {
 *   ok: true,
 *   status: 200,
 *   data: { id: 1, name: "John" },
 *   error: undefined
 * };
 * 
 * // Error response
 * const errorResponse: HttpResponse<never> = {
 *   ok: false,
 *   status: 404,
 *   data: undefined,
 *   error: "User not found"
 * };
 * 
 * // Usage with type guards
 * if (response.ok) {
 *   console.log(response.data.name); // TypeScript knows data exists
 * } else {
 *   console.error(response.error); // Handle error case
 * }
 * ```
 */
export type HttpResponse<T> = {
    ok: boolean;
    status: number;
    data?: T;
    error?: string;
}