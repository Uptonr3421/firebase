/**
 * Marketing Brief API Route
 * Triggers the marketing brief flow
 */

import { NextRequest, NextResponse } from "next/server";
import { marketingBriefFlow } from "@/ai/flows";

export async function POST(request: NextRequest) {
  try {
    // Parse and validate JSON body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          error: "Invalid JSON in request body",
          message: parseError instanceof Error ? parseError.message : String(parseError),
        },
        { status: 400 }
      );
    }

    // Run the flow (Genkit validates input schema automatically)
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
