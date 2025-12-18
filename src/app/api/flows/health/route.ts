/**
 * Self-Healing API Route
 * Triggers the self-healing flow
 */

import { NextRequest, NextResponse } from "next/server";
import { selfHealingFlow } from "@/ai/flows";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Run the flow
    const result = await selfHealingFlow(body);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("API_ERROR", {
      route: "/api/flows/health",
      details: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        error: "Failed to run health check",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
