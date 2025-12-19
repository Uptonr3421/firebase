/**
 * Semantic Search API Route
 * Exposes vector search capabilities
 */

import { NextRequest, NextResponse } from 'next/server';

const CLOUD_FUNCTION_URL = 'https://us-central1-bespokeethos-analytics-475007.cloudfunctions.net';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, limit = 5, minScore = 0.7 } = body;

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Call Cloud Function
    const response = await fetch(`${CLOUD_FUNCTION_URL}/semanticSearch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: { query, limit, minScore },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('SEMANTIC_SEARCH_ERROR', { status: response.status, error });
      return NextResponse.json(
        { error: 'Search failed', details: error },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('SEARCH_API_ERROR', {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json(
    {
      message: 'Semantic Search API',
      usage: 'POST with { query: string, limit?: number, minScore?: number }',
    },
    { status: 200 }
  );
}
