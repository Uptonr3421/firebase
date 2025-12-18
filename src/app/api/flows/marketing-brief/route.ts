import { NextRequest, NextResponse } from 'next/server';
import { marketingBriefFlow } from '@/ai/flows/marketing-brief';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    
    // Provide default input if not specified
    const input = {
      dateRange: body.dateRange || 'last7days',
      properties: body.properties || ['bespoke-ethos', 'gmfg'],
    };
    
    // Run the Genkit flow with the provided input
    const result = await marketingBriefFlow(input);
    
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
