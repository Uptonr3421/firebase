import { NextRequest, NextResponse } from 'next/server';
import { competitorWatchFlow } from '@/ai/flows/competitor-watch';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    
    // Provide default input if not specified
    const input = {
      competitors: body.competitors || [],
      checkType: body.checkType || 'quick',
    };
    
    // Run the Genkit flow with the provided input
    const result = await competitorWatchFlow(input);
    
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('API_ERROR', {
      endpoint: '/api/flows/competitor-watch',
      details: error instanceof Error ? error.message : String(error),
    });
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to scan competitors',
      },
      { status: 500 }
    );
  }
}
