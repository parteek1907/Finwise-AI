import { NextResponse } from 'next/server';
import { yahooProvider } from '@/lib/yahoo-provider';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'AAPL';

    // Fetch a quote for the symbol to derive market status from Yahoo's marketState
    const quote = await yahooProvider.getQuote(symbol);
    const status = yahooProvider.getMarketStatus(quote);

    return NextResponse.json(status);

  } catch (error: any) {
    console.error('Error fetching market status:', error);
    // Return a safe fallback
    return NextResponse.json({
      isOpen: false,
      phase: 'Market Closed',
      displayMessage: 'Unable to determine market status',
    });
  }
}
