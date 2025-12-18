import { NextRequest, NextResponse } from 'next/server';
import { opportunityScannerFlow } from '@/ai/flows/opportunity-scanner';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Run the Genkit flow with the provided input
    const result = await opportunityScannerFlow(body);
    
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
