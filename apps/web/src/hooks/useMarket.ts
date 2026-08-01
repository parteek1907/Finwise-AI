/**
 * Market Hooks — React hooks that consume the centralized Market Store.
 *
 * All hooks read from useMarketStore (single source of truth).
 * No direct API calls — everything goes through the store.
 */

import { useState, useEffect, useMemo } from 'react';
import { Quote, MarketMover, Candle, MarketStatusDetails } from '../types/market';
import { Timeframe } from '../constants/symbols';
import { useMarketStore } from '../store/useMarketStore';
import { searchSymbols } from '../services/market';

// ─── useMarketQuote ─────────────────────────────────────────────────────
// Subscribe to a single symbol's live quote from the store.

export const useMarketQuote = (symbol: string) => {
  const subscribe = useMarketStore(s => s.subscribe);
  const unsubscribe = useMarketStore(s => s.unsubscribe);
  const quote = useMarketStore(s => s.quotes[symbol] || null);
  const error = useMarketStore(s => s.error);

  const [loading, setLoading] = useState(!quote);

  useEffect(() => {
    if (!symbol) return;
    subscribe(symbol);
    return () => { unsubscribe(symbol); };
  }, [symbol, subscribe, unsubscribe]);

  useEffect(() => {
    if (quote) setLoading(false);
  }, [quote]);

  return { quote, loading, error };
};

// ─── useMarketMovers ────────────────────────────────────────────────────
// Fetches and returns market movers from the store.

export const useMarketMovers = () => {
  const movers = useMarketStore(s => s.movers);
  const fetchMovers = useMarketStore(s => s.fetchMovers);
  const subscribe = useMarketStore(s => s.subscribe);
  const unsubscribe = useMarketStore(s => s.unsubscribe);
  const quotes = useMarketStore(s => s.quotes);
  const error = useMarketStore(s => s.error);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      await fetchMovers();
      if (mounted) setLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, [fetchMovers]);

  // Subscribe to all mover symbols for live price updates
  useEffect(() => {
    const symbols = movers.all.map(m => m.symbol);
    symbols.forEach(s => subscribe(s));
    return () => { symbols.forEach(s => unsubscribe(s)); };
  }, [movers.all, subscribe, unsubscribe]);

  // Merge live quotes into movers for real-time display
  const liveMovers = useMemo(() => {
    return movers.all.map(mover => {
      const quote = quotes[mover.symbol];
      if (!quote) return mover;
      return {
        ...mover,
        price: quote.price,
        changePercent: quote.changePercent,
        isUp: quote.changePercent >= 0,
      };
    });
  }, [movers.all, quotes]);

  return { movers: liveMovers, loading, error };
};

// ─── useChartData ───────────────────────────────────────────────────────
// Fetches candle data from the store cache.

export const useChartData = (symbol: string, timeframe: Timeframe) => {
  const fetchCandles = useMarketStore(s => s.fetchCandles);
  const [data, setData] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!symbol || !timeframe) return;
      try {
        setLoading(true);
        setError(null);
        const candles = await fetchCandles(symbol, timeframe);
        if (mounted) setData(candles);
      } catch (err: any) {
        if (mounted) setError(err.message || 'Failed to fetch chart data');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [symbol, timeframe, fetchCandles]);

  return { data, loading, error };
};

// ─── useSymbolSearch ────────────────────────────────────────────────────
// Searches for symbols with debouncing.

export const useSymbolSearch = (query: string) => {
  const [results, setResults] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      try {
        setLoading(true);
        const data = await searchSymbols(query);
        if (mounted) setResults(data);
      } catch (err) {
        if (mounted) setResults([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const debounceId = setTimeout(fetchResults, 300);
    return () => {
      mounted = false;
      clearTimeout(debounceId);
    };
  }, [query]);

  return { results, loading };
};

// ─── useMarketStatus ────────────────────────────────────────────────────
// Returns market status for a given exchange symbol.

export const useMarketStatus = (symbol: string = 'AAPL') => {
  const fetchStatus = useMarketStore(s => s.fetchStatus);
  const status = useMarketStore(s => s.marketStatus[symbol] || null);

  useEffect(() => {
    fetchStatus(symbol);
  }, [symbol, fetchStatus]);

  return status;
};
