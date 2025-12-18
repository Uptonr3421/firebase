/**
 * Marketing Brief API Route
 * Triggers the marketing brief flow
 */

import { NextRequest, NextResponse } from "next/server";
import { marketingBriefFlow } from "@/ai/flows";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Run the flow
    const result = await marketingBriefFlow(body);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("API_ERROR", {
      route: "/api/flows/brief",
      details: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        error: "Failed to generate marketing brief",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
