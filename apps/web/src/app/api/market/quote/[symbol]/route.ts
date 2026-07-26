import { NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';
import { normalizeToUSD } from '@/lib/currencyConverter';

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

    const rawPrice = quote.regularMarketPrice || 0;
    const rawPreviousClose = quote.regularMarketPreviousClose || rawPrice;
    const rawChange = quote.regularMarketChange || (rawPrice - rawPreviousClose);
    const rawHigh = quote.regularMarketDayHigh || rawPrice;
    const rawLow = quote.regularMarketDayLow || rawPrice;
    const rawOpen = quote.regularMarketOpen || rawPrice;

    // Normalize all prices to USD so the frontend formatting logic multiplier works correctly
    const currency = quote.currency || 'USD';
    const price = await normalizeToUSD(rawPrice, currency);
    const previousClose = await normalizeToUSD(rawPreviousClose, currency);
    const change = await normalizeToUSD(rawChange, currency);
    const high = await normalizeToUSD(rawHigh, currency);
    const low = await normalizeToUSD(rawLow, currency);
    const open = await normalizeToUSD(rawOpen, currency);

    const changePercent = quote.regularMarketChangePercent || (rawChange / rawPreviousClose) * 100;

    return NextResponse.json({
      symbol: quote.symbol,
      name: quote.shortName || quote.longName || symbol,
      exchange: quote.exchange || quote.fullExchangeName || 'MARKET',
      currency: currency,
      price,
      change,
      changePercent,
      high,
      low,
      open,
      previousClose,
    });
  } catch (error: any) {
    console.error('Error fetching quote from Yahoo Finance:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch quote' }, { status: 500 });
  }
}
