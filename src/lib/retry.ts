/**
 * Retry Utility with Exponential Backoff
 * Handles transient failures in Genkit/Vertex AI calls
 */

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
}

/**
 * Execute a function with exponential backoff retry logic
 * 
 * @param fn - The async function to execute
 * @param options - Retry configuration options
 * @returns The result of the function
 * @throws The last error if all retries are exhausted
 * 
 * @example
 * ```typescript
 * const result = await withRetry(
 *   async () => await someApiCall(),
 *   { maxRetries: 3, baseDelay: 1000 }
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
  } = options;

  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If this was the last attempt, throw the error
      if (attempt === maxRetries - 1) {
        throw lastError;
      }

      // Calculate delay with exponential backoff: baseDelay * 2^attempt
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);

      console.warn('RETRY_ATTEMPT', {
        attempt: attempt + 1,
        maxRetries,
        nextDelayMs: delay,
        error: lastError.message,
      });

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // This should never be reached, but TypeScript requires it
  throw new Error('Max retries exceeded');
}
