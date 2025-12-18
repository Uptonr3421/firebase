/**
 * Content Drafter API Route
 * Triggers the content drafter flow
 */

import { NextRequest, NextResponse } from "next/server";
import { contentDrafterFlow } from "@/ai/flows";

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
    const result = await contentDrafterFlow(body);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("API_ERROR", {
      route: "/api/flows/content",
      details: error instanceof Error ? error.message : String(error),
    });

    return NextResponse.json(
      {
        error: "Failed to generate content",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
