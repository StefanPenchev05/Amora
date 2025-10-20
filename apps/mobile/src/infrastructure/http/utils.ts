/**
 * Safely parses a Response object's JSON content with type safety
 * 
 * @template T - The expected type of the parsed JSON data
 * @param res - The Response object from a fetch request
 * @returns Promise<T> - The parsed JSON data typed as T, or empty object if no content
 * 
 * @throws {Error} - Throws "Invalid JSON response" if the response text is not valid JSON
 * 
 * @example
 * ```typescript
 * interface User { id: number; name: string; }
 * const response = await fetch('/api/user');
 * const user = await parseJSON<User>(response);
 * ```
 */
export async function parseJSON<T>(res: Response): Promise<T> {
  // Convert response to text first to handle empty responses gracefully
  const text = await res.text();
  
  try {
    // If text exists, parse it as JSON; otherwise return empty object
    // This prevents errors when the API returns empty responses (204 No Content)
    return text ? (JSON.parse(text) as T) : ({} as T);
  } catch {
    // Catch any JSON parsing errors and throw a more descriptive error
    throw new Error("Invalid JSON response");
  }
}

/**
 * Creates an AbortSignal with automatic timeout functionality
 * 
 * This utility combines an existing AbortSignal with a timeout mechanism.
 * It's useful for HTTP requests that need to be cancelled either manually
 * or after a specified timeout period.
 * 
 * @param signal - Optional existing AbortSignal to chain with timeout
 * @param timeoutMs - Optional timeout duration in milliseconds
 * @returns AbortSignal | undefined - New AbortSignal that triggers on timeout or original signal abort
 * 
 * @example
 * ```typescript
 * // Create a 5-second timeout
 * const timeoutSignal = withTimeout(undefined, 5000);
 * 
 * // Chain with existing signal
 * const controller = new AbortController();
 * const combinedSignal = withTimeout(controller.signal, 3000);
 * 
 * // Use in fetch request
 * fetch('/api/data', { signal: combinedSignal });
 * ```
 */
export function withTimeout(
  signal: AbortSignal | undefined,
  timeoutMs?: number
): AbortSignal | undefined {
  // If no timeout is specified, return the original signal unchanged
  if (!timeoutMs) return signal;
  
  // Create a new AbortController for timeout management
  const controller = new AbortController();
  
  // Set up automatic timeout - abort after specified milliseconds
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  
  // If the original signal aborts, clean up our timeout to prevent memory leaks
  signal?.addEventListener("abort", () => clearTimeout(timeout));
  
  // Return the new controller's signal which will abort on timeout
  return controller.signal;
}
