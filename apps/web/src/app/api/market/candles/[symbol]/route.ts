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
    
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '1M';

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    let interval: "1m" | "2m" | "5m" | "15m" | "30m" | "60m" | "90m" | "1h" | "1d" | "5d" | "1wk" | "1mo" | "3mo" = '1d';
    const now = new Date();
    let period1 = new Date();

    switch (timeframe) {
      case '1D':
        interval = '5m';
        period1.setDate(now.getDate() - 1);
        break;
      case '5D':
        interval = '15m';
        period1.setDate(now.getDate() - 5);
        break;
      case '1M':
        interval = '1d';
        period1.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        interval = '1d';
        period1.setMonth(now.getMonth() - 3);
        break;
      case '6M':
        interval = '1d';
        period1.setMonth(now.getMonth() - 6);
        break;
      case '1Y':
        interval = '1d';
        period1.setFullYear(now.getFullYear() - 1);
        break;
      case 'ALL':
        interval = '1mo';
        period1.setFullYear(now.getFullYear() - 5);
        break;
    }

    const queryOptions = { period1, interval };
    const chart = await yahooFinance.chart(symbol, queryOptions);
    
    if (!chart || !chart.quotes || chart.quotes.length === 0) {
      return NextResponse.json([]);
    }

    const currency = chart.meta.currency || 'USD';
    
    // Process promises concurrently for each candle
    const candlesPromises = chart.quotes
      .filter((q: any) => q.open !== null && q.close !== null)
      .map(async (q: any) => ({
        time: (interval === '1d' || interval === '1mo') 
          ? q.date.toISOString().split('T')[0] // 'YYYY-MM-DD'
          : Math.floor(q.date.getTime() / 1000), // Unix timestamp for intraday
        open: await normalizeToUSD(q.open, currency),
        high: await normalizeToUSD(q.high, currency),
        low: await normalizeToUSD(q.low, currency),
        close: await normalizeToUSD(q.close, currency),
        volume: q.volume || 0
      }));

    const candles = await Promise.all(candlesPromises);

    return NextResponse.json(candles);
  } catch (error: any) {
    console.error('Error fetching candles from Yahoo Finance:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch candles' }, { status: 500 });
  }
}
