import { Quote, MarketMover, Candle, MarketStatus, Asset } from '../types/market';
import { MOCK_QUOTES, MOCK_MOVERS, generateMockCandles } from '../mocks/market';
import { MOCK_CANDLES } from '../mocks/candles';
import { Timeframe } from '../constants/symbols';

// Simulated network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getQuote = async (symbol: string): Promise<Quote> => {
  let fetchSymbol = symbol;
  if (symbol === 'BTC') fetchSymbol = 'BTC-USD';
  if (symbol === 'ETH') fetchSymbol = 'ETH-USD';
  if (symbol === 'SOL') fetchSymbol = 'SOL-USD';
  
  try {
    const response = await fetch(`/api/market/quote/${fetchSymbol}`);
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
    // Dynamically fetch live data for our default movers list instead of a static mock
    const symbols = MOCK_MOVERS.map(m => m.symbol);
    const quotes = await Promise.all(symbols.map(sym => getQuote(sym)));
    
    // Convert Quotes to MarketMovers and sort by absolute change percentage
    const liveMovers: MarketMover[] = quotes.map(q => ({
      symbol: q.symbol,
      name: q.name,
      price: q.price,
      changePercent: q.changePercent,
      isUp: q.change >= 0
    }));

    return liveMovers.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
  } catch (error) {
    console.warn("Failed to fetch live movers, falling back to mock.", error);
    await delay(600);
    return MOCK_MOVERS;
  }
};

export const getCandles = async (symbol: string, timeframe: Timeframe): Promise<Candle[]> => {
  let fetchSymbol = symbol;
  if (symbol === 'BTC') fetchSymbol = 'BTC-USD';
  if (symbol === 'ETH') fetchSymbol = 'ETH-USD';
  if (symbol === 'SOL') fetchSymbol = 'SOL-USD';
  
  try {
    // Yahoo Finance supports ETFs and Crypto for free, so we use Next.js proxy
    const response = await fetch(`/api/market/candles/${fetchSymbol}?timeframe=${timeframe}`);
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
    case '1D': pointsToReturn = 1; break; 
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
  const upperQuery = query.toUpperCase();
  const matches = Object.values(MOCK_QUOTES).filter(q => 
    q.symbol.includes(upperQuery) || q.name.toUpperCase().includes(upperQuery)
  );

  // Fetch live prices for search results in parallel
  const liveResults = await Promise.all(
    matches.map(async (mockQuote) => {
      try {
        const liveQuote = await getQuote(mockQuote.symbol);
        return { ...mockQuote, ...liveQuote }; // Merge to preserve any mock fields like aiInsight
      } catch {
        return mockQuote;
      }
    })
  );

  return liveResults;
};

export const getMarketStatus = async (): Promise<MarketStatus> => {
  await delay(200);
  
  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  
  // Market is closed on Saturday (6) and Sunday (0)
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // EST is UTC-5 (or UTC-4 during daylight savings, simplifying for mock logic)
  // Let's assume market is open 13:30 to 20:00 UTC (9:30 AM to 4:00 PM EST roughly)
  const isMarketHours = (utcHours > 13 || (utcHours === 13 && utcMinutes >= 30)) && utcHours < 20;

  const isOpen = !isWeekend && isMarketHours;
  
  const nextCloseTime = new Date();
  if (isOpen) {
    nextCloseTime.setUTCHours(20, 0, 0, 0);
  } else {
    // If closed, next close time would be next weekday at 20:00 UTC
    let daysToAdd = 1;
    if (dayOfWeek === 5) daysToAdd = 3;
    if (dayOfWeek === 6) daysToAdd = 2;
    nextCloseTime.setDate(now.getDate() + daysToAdd);
    nextCloseTime.setUTCHours(20, 0, 0, 0);
  }

  return {
    isOpen,
    nextCloseTime: nextCloseTime.toISOString()
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
