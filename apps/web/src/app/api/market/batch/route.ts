import { NextResponse } from 'next/server';
import { yahooProvider } from '@/lib/yahoo-provider';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const symbols: string[] = body.symbols;

    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return NextResponse.json({ error: 'symbols array is required' }, { status: 400 });
    }

    // Limit to prevent abuse
    if (symbols.length > 50) {
      return NextResponse.json({ error: 'Maximum 50 symbols per batch request' }, { status: 400 });
    }

    const quotes = await yahooProvider.getBatchQuotes(symbols);

    const result = quotes.map(q => {
      const status = yahooProvider.getMarketStatus(q);
      return {
        symbol: q.symbol,
        name: q.name,
        exchange: q.exchange,
        currency: q.currency,
        price: q.price,
        change: q.change,
        changePercent: q.changePercent,
        high: q.high,
        low: q.low,
        open: q.open,
        previousClose: q.previousClose,
        volume: q.volume,
        marketCap: q.marketCap,
        marketState: status.phase,
        marketStatusMessage: status.displayMessage,
        isMarketOpen: status.isOpen,
      };
    });

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Error in batch quote fetch:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch batch quotes' }, { status: 500 });
  }
}
