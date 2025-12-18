import { NextRequest, NextResponse } from 'next/server';
import { contentDrafterFlow } from '@/ai/flows/content-drafter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Run the Genkit flow with the provided input
    const result = await contentDrafterFlow(body);
    
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('API_ERROR', {
      endpoint: '/api/flows/content-drafter',
      details: error instanceof Error ? error.message : String(error),
    });
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to draft content',
      },
      { status: 500 }
    );
  }
}
