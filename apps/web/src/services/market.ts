/**
 * Centralized Market Service
 * 
 * This is the ONLY module that communicates with /api/market/* endpoints.
 * No component should call Yahoo Finance directly or use mock data.
 * 
 * Architecture:
 *   UI → Market Store → Market Service → Next.js API Routes → Yahoo Finance Provider
 */

import { Quote, MarketMover, Candle, MarketStatus, MarketStatusDetails, Asset } from '../types/market';
import { Timeframe } from '../constants/symbols';

// ─── In-flight request deduplication ─────────────────────────────────────
// If the same symbol is being fetched, return the same Promise instead of duplicating.

const inflightQuotes = new Map<string, Promise<Quote>>();
const inflightCandles = new Map<string, Promise<Candle[]>>();

// ─── Quote Fetching ──────────────────────────────────────────────────────

export const fetchQuote = async (symbol: string): Promise<Quote> => {
  // Normalize crypto symbols for Yahoo
  let fetchSymbol = symbol;
  if (symbol === 'BTC') fetchSymbol = 'BTC-USD';
  if (symbol === 'ETH') fetchSymbol = 'ETH-USD';
  if (symbol === 'SOL') fetchSymbol = 'SOL-USD';

  // Dedup: return in-flight promise if one exists
  const key = fetchSymbol;
  if (inflightQuotes.has(key)) {
    return inflightQuotes.get(key)!;
  }

  const promise = (async () => {
    try {
      const response = await fetch(`/api/market/quote/${fetchSymbol}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch quote for ${symbol}: ${response.status}`);
      }
      const data = await response.json();
      return {
        symbol: data.symbol,
        name: data.name,
        price: data.price,
        change: data.change || 0,
        changePercent: data.changePercent || 0,
        volume: data.volume || 0,
        marketCap: data.marketCap || 0,
        exchange: data.exchange || 'MARKET',
        currency: data.currency || 'USD',
        high: data.high,
        low: data.low,
        open: data.open,
        previousClose: data.previousClose,
        marketState: data.marketState,
        marketStatusMessage: data.marketStatusMessage,
        isMarketOpen: data.isMarketOpen,
      } as Quote;
    } finally {
      inflightQuotes.delete(key);
    }
  })();

  inflightQuotes.set(key, promise);
  return promise;
};

// Backward-compatible aliases
export const getQuote = fetchQuote;
export const getMarketQuote = fetchQuote;

// ─── Batch Quote Fetching ────────────────────────────────────────────────

export const fetchBatchQuotes = async (symbols: string[]): Promise<Quote[]> => {
  // Normalize crypto symbols
  const normalizedSymbols = symbols.map(s => {
    if (s === 'BTC') return 'BTC-USD';
    if (s === 'ETH') return 'ETH-USD';
    if (s === 'SOL') return 'SOL-USD';
    return s;
  });

  try {
    const response = await fetch('/api/market/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbols: normalizedSymbols }),
    });

    if (!response.ok) {
      throw new Error(`Batch quote fetch failed: ${response.status}`);
    }

    const data = await response.json();
    return (data as any[]).map(q => ({
      symbol: q.symbol,
      name: q.name,
      price: q.price,
      change: q.change || 0,
      changePercent: q.changePercent || 0,
      volume: q.volume || 0,
      marketCap: q.marketCap || 0,
      exchange: q.exchange || 'MARKET',
      currency: q.currency || 'USD',
      high: q.high,
      low: q.low,
      open: q.open,
      previousClose: q.previousClose,
      marketState: q.marketState,
      marketStatusMessage: q.marketStatusMessage,
      isMarketOpen: q.isMarketOpen,
    } as Quote));

  } catch (error) {
    console.error('Batch quote fetch failed:', error);
    // Fallback: fetch individually
    const results = await Promise.allSettled(symbols.map(s => fetchQuote(s)));
    return results
      .filter((r): r is PromiseFulfilledResult<Quote> => r.status === 'fulfilled')
      .map(r => r.value);
  }
};

// ─── Candle / Chart Data ─────────────────────────────────────────────────

export const fetchCandles = async (symbol: string, timeframe: Timeframe): Promise<Candle[]> => {
  let fetchSymbol = symbol;
  if (symbol === 'BTC') fetchSymbol = 'BTC-USD';
  if (symbol === 'ETH') fetchSymbol = 'ETH-USD';
  if (symbol === 'SOL') fetchSymbol = 'SOL-USD';

  const key = `${fetchSymbol}:${timeframe}`;
  if (inflightCandles.has(key)) {
    return inflightCandles.get(key)!;
  }

  const promise = (async () => {
    try {
      const response = await fetch(`/api/market/candles/${fetchSymbol}?timeframe=${timeframe}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch candles for ${symbol}: ${response.status}`);
      }
      const data = await response.json();
      if (!data || !Array.isArray(data)) return [];
      return data as Candle[];
    } finally {
      inflightCandles.delete(key);
    }
  })();

  inflightCandles.set(key, promise);
  return promise;
};

// Backward-compatible aliases
export const getCandles = fetchCandles;
export const getChartData = fetchCandles;

// ─── Market Movers ───────────────────────────────────────────────────────

export interface MoversResponse {
  gainers: MarketMover[];
  losers: MarketMover[];
  active: MarketMover[];
  all: MarketMover[];
}

export const fetchMarketMovers = async (): Promise<MoversResponse> => {
  try {
    const response = await fetch('/api/market/movers');
    if (!response.ok) {
      throw new Error(`Failed to fetch movers: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch market movers:', error);
    return { gainers: [], losers: [], active: [], all: [] };
  }
};

// Legacy compat: returns flat list sorted by absolute change
export const getMarketMovers = async (): Promise<MarketMover[]> => {
  const data = await fetchMarketMovers();
  return data.all.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
};

// ─── Market Status ───────────────────────────────────────────────────────

export const fetchMarketStatus = async (symbol: string = 'AAPL'): Promise<MarketStatusDetails> => {
  try {
    const response = await fetch(`/api/market/status?symbol=${symbol}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch market status:', error);
    return {
      isOpen: false,
      phase: 'Market Closed',
      displayMessage: 'Unable to determine market status',
    };
  }
};

// Legacy compat
export const getMarketStatus = async (): Promise<MarketStatus> => {
  const status = await fetchMarketStatus();
  return {
    isOpen: status.isOpen,
    nextOpenTime: status.nextOpenTime,
  };
};

// ─── Exchange Rates ──────────────────────────────────────────────────────

export const fetchExchangeRates = async (): Promise<Record<string, number>> => {
  try {
    const response = await fetch('/api/market/exchange-rates');
    if (!response.ok) throw new Error(`Failed: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
    return { USD: 1, INR: 96.56, EUR: 0.88, GBP: 0.75 };
  }
};

// ─── Symbol Search ───────────────────────────────────────────────────────

export const searchSymbols = async (query: string): Promise<Quote[]> => {
  if (!query.trim()) return [];

  try {
    // Use batch quotes for known symbols, otherwise return basic info
    const symbols = await fetchSearchResults(query);
    if (symbols.length === 0) return [];

    // Fetch live quotes for search results
    const quotes = await fetchBatchQuotes(symbols.map(s => s.symbol));
    return quotes;
  } catch (error) {
    console.error('Symbol search failed:', error);
    return [];
  }
};

// Internal: calls the search API
const fetchSearchResults = async (query: string): Promise<Array<{ symbol: string; name: string }>> => {
  try {
    // Use Yahoo search via a simple quote attempt for now
    // The batch endpoint handles the resolution
    const upperQuery = query.toUpperCase();

    // Try known symbol patterns first
    const knownSymbols = [
      'AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 'META', 'GOOGL', 'NFLX', 'AMD', 'INTC',
      'VOO', 'QQQ', 'BTC-USD', 'ETH-USD', 'SOL-USD',
      'RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'ICICIBANK.NS', 'HDFCBANK.NS',
      'GOLD', 'SILVER', 'GC=F',
    ];

    const matches = knownSymbols.filter(s =>
      s.toUpperCase().includes(upperQuery) ||
      s.replace('.NS', '').toUpperCase().includes(upperQuery) ||
      s.replace('-USD', '').toUpperCase().includes(upperQuery)
    );

    return matches.map(s => ({ symbol: s, name: s }));
  } catch {
    return [];
  }
};

// ─── Watchlist ────────────────────────────────────────────────────────────

export const getWatchlist = async (): Promise<Asset[]> => {
  return [
    { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ', type: 'Stock' },
    { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ', type: 'Stock' },
    { symbol: 'BTC-USD', name: 'Bitcoin', exchange: 'CRYPTO', type: 'Crypto' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', exchange: 'NASDAQ', type: 'Stock' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ', type: 'Stock' },
    { symbol: 'GC=F', name: 'Gold Futures', exchange: 'COMEX', type: 'ETF' },
  ];
};
