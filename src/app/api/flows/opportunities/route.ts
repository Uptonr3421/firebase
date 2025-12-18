/**
 * Opportunity Scanner API Route
 * Triggers the opportunity scanner flow
 */

import { NextRequest, NextResponse } from "next/server";
import { opportunityScannerFlow } from "@/ai/flows";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Run the flow
    const result = await opportunityScannerFlow(body);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("API_ERROR", {
      route: "/api/flows/opportunities",
      details: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        error: "Failed to scan opportunities",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
