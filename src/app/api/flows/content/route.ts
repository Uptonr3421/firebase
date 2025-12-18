/**
 * Content Drafter API Route
 * Triggers the content drafter flow
 */

import { NextRequest, NextResponse } from "next/server";
import { contentDrafterFlow } from "@/ai/flows";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Run the flow
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
