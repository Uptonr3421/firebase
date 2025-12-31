/**
 * Self-Healing API Route
 * Triggers the self-healing flow
 */

import { NextRequest } from "next/server";
import { selfHealingFlow } from "@/ai/flows";
import { apiSuccess, apiError } from "@/lib/api-response";
import { checkRateLimit } from "@/lib/rate-limit";
import { withRetry } from "@/lib/retry";

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get("x-forwarded-for") || 
                request.headers.get("x-real-ip") || 
                "unknown";

    // Check rate limit
    const { allowed, remaining, resetAt } = checkRateLimit(ip);
    if (!allowed) {
      const retryAfter = resetAt ? Math.ceil((resetAt - Date.now()) / 1000) : 60;
      return apiError(
        `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        429
      );
    }

    // Parse and validate JSON body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return apiError(
        "Invalid JSON in request body",
        400
      );
    }

    // Run the flow with retry logic (Genkit validates input schema automatically)
    const result = await withRetry(
      async () => await selfHealingFlow(body),
      { maxRetries: 3, baseDelay: 1000 }
    );

    return apiSuccess(result);
  } catch (error) {
    console.error("API_ERROR", {
      route: "/api/flows/health",
      details: error instanceof Error ? error.message : String(error),
    });

    return apiError(
      error instanceof Error ? error.message : "Failed to run health check",
      500
    );
  }
}
