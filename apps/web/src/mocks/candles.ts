import { Candle } from '../types/market';
import { MOCK_QUOTES, generateMockCandles } from './market';

// We generate 5 years of daily candles (approx 1800 days) for the specified assets.
// In a real app, this would be an API call `GET /api/market/candles?symbol=AAPL&timeframe=1D`

const generateLongHistory = (symbol: string, days: number = 1800): Candle[] => {
  const quote = MOCK_QUOTES[symbol];
  if (!quote) return [];
  
  return generateMockCandles(quote.price, days);
};

export const MOCK_CANDLES: Record<string, Candle[]> = {
  AAPL: generateLongHistory('AAPL'),
  TSLA: generateLongHistory('TSLA'),
  MSFT: generateLongHistory('MSFT'),
  NVDA: generateLongHistory('NVDA'),
  GOOGL: generateLongHistory('GOOGL'),
  AMZN: generateLongHistory('AMZN'),
  BTC: generateLongHistory('BTC'),
  ETH: generateLongHistory('ETH'),
  NIFTY: generateLongHistory('NIFTY'),
  SENSEX: generateLongHistory('SENSEX'),
};
