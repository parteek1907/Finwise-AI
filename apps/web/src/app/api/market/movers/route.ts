import { NextResponse } from 'next/server';
import { yahooProvider } from '@/lib/yahoo-provider';

// Default movers list — curated symbols to track for gainers/losers/active
const MOVERS_SYMBOLS = [
  'AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN',
  'META', 'GOOGL', 'NFLX', 'AMD', 'INTC',
  'VOO', 'QQQ',
  'BTC-USD', 'ETH-USD', 'SOL-USD',
  'RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'ICICIBANK.NS', 'HDFCBANK.NS',
];

export async function GET() {
  try {
    const quotes = await yahooProvider.getBatchQuotes(MOVERS_SYMBOLS);

    const movers = quotes.map(q => ({
      symbol: q.symbol,
      name: q.name,
      price: q.price,
      changePercent: q.changePercent,
      isUp: q.changePercent >= 0,
      volume: q.volume,
      currency: q.currency,
      exchange: q.exchange,
    }));

    // Sort into categories
    const gainers = [...movers]
      .filter(m => m.changePercent > 0)
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 10);

    const losers = [...movers]
      .filter(m => m.changePercent < 0)
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 10);

    const active = [...movers]
      .sort((a, b) => (b.volume || 0) - (a.volume || 0))
      .slice(0, 10);

    return NextResponse.json({ gainers, losers, active, all: movers });

  } catch (error: any) {
    console.error('Error fetching movers:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch movers' }, { status: 500 });
  }
}
