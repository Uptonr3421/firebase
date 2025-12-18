/**
 * Competitor Watch API Route
 * Triggers the competitor watch flow
 */

import { NextRequest, NextResponse } from "next/server";
import { competitorWatchFlow } from "@/ai/flows";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Run the flow
    const result = await competitorWatchFlow(body);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("API_ERROR", {
      route: "/api/flows/competitors",
      details: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        error: "Failed to run competitor watch",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
