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

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '1M';

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    const candles = await yahooProvider.getCandles(symbol, timeframe);
    return NextResponse.json(candles);

  } catch (error: any) {
    console.error('Error fetching candles:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch candles' }, { status: 500 });
  }
}
