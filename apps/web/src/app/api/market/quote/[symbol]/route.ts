import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ symbol: string }> | { symbol: string } }
) {
  try {
    let resolvedParams = params;
    // Handle both Next.js 14 and 15 param resolution
    if (params instanceof Promise) {
      resolvedParams = await params;
    }
    const symbol = (resolvedParams as { symbol: string }).symbol;

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    const quote = await yahooFinance.quote(symbol);

    if (!quote) {
      return NextResponse.json({ error: 'Symbol not found' }, { status: 404 });
    }

    const price = quote.regularMarketPrice || 0;
    const previousClose = quote.regularMarketPreviousClose || price;
    const change = quote.regularMarketChange || (price - previousClose);
    const changePercent = quote.regularMarketChangePercent || (change / previousClose) * 100;

    return NextResponse.json({
      symbol: quote.symbol,
      name: quote.shortName || quote.longName || symbol,
      price,
      change,
      changePercent,
      high: quote.regularMarketDayHigh || price,
      low: quote.regularMarketDayLow || price,
      open: quote.regularMarketOpen || price,
      previousClose,
    });
  } catch (error: any) {
    console.error('Error fetching quote from Yahoo Finance:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch quote' }, { status: 500 });
  }
}
