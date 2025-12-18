import { NextRequest, NextResponse } from 'next/server';
import { opportunityScannerFlow } from '@/ai/flows/opportunity-scanner';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    
    // Provide default input if not specified
    const input = {
      sources: body.sources || ['nglcc', 'news'],
      industry: body.industry || 'consulting',
      minRelevanceScore: body.minRelevanceScore || 0.7,
    };
    
    // Run the Genkit flow with the provided input
    const result = await opportunityScannerFlow(input);
    
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('API_ERROR', {
      endpoint: '/api/flows/opportunity-scanner',
      details: error instanceof Error ? error.message : String(error),
    });
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to scan opportunities',
      },
      { status: 500 }
    );
  }
}
