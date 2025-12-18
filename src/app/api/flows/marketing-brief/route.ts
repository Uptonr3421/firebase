import { NextRequest, NextResponse } from 'next/server';
import { marketingBriefFlow } from '@/ai/flows/marketing-brief';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Run the Genkit flow with the provided input
    const result = await marketingBriefFlow(body);
    
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('API_ERROR', {
      endpoint: '/api/flows/marketing-brief',
      details: error instanceof Error ? error.message : String(error),
    });
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate marketing brief',
      },
      { status: 500 }
    );
  }
}
