import { NextResponse } from 'next/server';
import { yahooProvider } from '@/lib/yahoo-provider';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> | { symbol: string } }
) {
  try {
    let resolvedParams = params;
    if (params instanceof Promise) {
      resolvedParams = await params;
    }
    const symbol = (resolvedParams as { symbol: string }).symbol;

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    const quote = await yahooProvider.getQuote(symbol);
    const status = yahooProvider.getMarketStatus(quote);

    return NextResponse.json({
      symbol: quote.symbol,
      name: quote.name,
      exchange: quote.exchange,
      currency: quote.currency,
      price: quote.price,
      change: quote.change,
      changePercent: quote.changePercent,
      high: quote.high,
      low: quote.low,
      open: quote.open,
      previousClose: quote.previousClose,
      volume: quote.volume,
      marketCap: quote.marketCap,
      marketState: status.phase,
      marketStatusMessage: status.displayMessage,
      isMarketOpen: status.isOpen,
    });
  } catch (error: any) {
    console.error('Error fetching quote:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch quote' }, { status: 500 });
  }
}
