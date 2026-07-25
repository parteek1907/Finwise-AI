import { Quote, MarketMover, Candle, MarketStatus, Asset } from '../types/market';
import { MOCK_QUOTES, MOCK_MOVERS, generateMockCandles } from '../mocks/market';
import { MOCK_CANDLES } from '../mocks/candles';
import { Timeframe } from '../constants/symbols';

// Simulated network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getQuote = async (symbol: string): Promise<Quote> => {
  try {
    const response = await fetch(`http://localhost:8000/api/market/quote/${symbol}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn("Backend not available for quote, falling back to mock.");
  }
  
  // Fallback to mock if backend fails (e.g., missing API key)
  await delay(400); 
  const quote = MOCK_QUOTES[symbol.toUpperCase()];
  if (!quote) throw new Error(`Symbol ${symbol} not found`);
  return quote;
};

// Kept for backward compatibility
export const getMarketQuote = getQuote;

export const getMarketMovers = async (): Promise<MarketMover[]> => {
  try {
    const response = await fetch('http://localhost:8000/api/market/movers');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn("Backend not available for movers, falling back to mock.");
  }

  await delay(600);
  return MOCK_MOVERS;
};

export const getCandles = async (symbol: string, timeframe: Timeframe): Promise<Candle[]> => {
  try {
    const response = await fetch(`http://localhost:8000/api/market/candles/${symbol}?timeframe=${timeframe}`);
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) return data;
    }
  } catch (error) {
    console.warn("Backend not available for candles, falling back to mock.");
  }

  await delay(500);
  const upperSym = symbol.toUpperCase();
  const allCandles = MOCK_CANDLES[upperSym];
  
  if (!allCandles) {
    // fallback if no exact mock is prepared
    const quote = MOCK_QUOTES[upperSym];
    if (!quote) throw new Error(`Symbol ${symbol} not found`);
    return generateMockCandles(quote.price, 365);
  }

  // Filter based on timeframe from the end of the array
  let pointsToReturn = allCandles.length;
  switch (timeframe) {
    case '1D': pointsToReturn = 1; break; // In a real app 1D would have intraday minute data. For daily candles we just return a few? Actually the user prompt said "1D 5D 1M 3M 6M 1Y ALL". Let's assume daily candles for all of them, just returning different lengths.
    case '5D': pointsToReturn = 5; break;
    case '1M': pointsToReturn = 30; break;
    case '3M': pointsToReturn = 90; break;
    case '6M': pointsToReturn = 180; break;
    case '1Y': pointsToReturn = 365; break;
    case 'ALL': pointsToReturn = 1800; break;
  }
  
  return allCandles.slice(Math.max(allCandles.length - pointsToReturn, 0));
};

// Kept for backward compatibility
export const getChartData = getCandles;

export const searchSymbols = async (query: string): Promise<Quote[]> => {
  await delay(300);
  const upperQuery = query.toUpperCase();
  return Object.values(MOCK_QUOTES).filter(q => 
    q.symbol.includes(upperQuery) || q.name.toUpperCase().includes(upperQuery)
  );
};

export const getMarketStatus = async (): Promise<MarketStatus> => {
  await delay(200);
  // Mock logic: market is open if it's a weekday between 9:30 AM and 4:00 PM EST
  // For simplicity, we just return true.
  return {
    isOpen: true,
    nextCloseTime: new Date(new Date().setHours(16, 0, 0, 0)).toISOString()
  };
};

export const getWatchlist = async (): Promise<Asset[]> => {
  await delay(300);
  return [
    { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', type: 'Stock' },
    { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', type: 'Stock' },
    { symbol: 'BTC', name: 'Bitcoin', exchange: 'CRYPTO', type: 'Crypto' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', exchange: 'NASDAQ', type: 'Stock' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', type: 'Stock' },
    { symbol: 'GOLD', name: 'Gold', exchange: 'COMEX', type: 'ETF' },
  ];
};
