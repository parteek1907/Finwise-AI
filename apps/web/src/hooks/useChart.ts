/**
 * useChart hook — Provides chart data, quote, and watchlist from Market Store.
 *
 * All data flows through the centralized Market Store.
 * No direct service calls for quotes.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Asset, Candle, Quote } from '../types/market';
import { getWatchlist } from '../services/market';
import { Timeframe } from '../constants/symbols';
import { useMarketStore } from '../store/useMarketStore';

export const useChart = (asset: string = 'AAPL', timeframe: Timeframe = '1D') => {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [watchlist, setWatchlist] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const {
    quotes,
    subscribe,
    unsubscribe,
    initialize,
    fetchCandles,
  } = useMarketStore();

  const quote = quotes[asset] || null;

  // Derive a real-time tick from the live quote so the chart candle updates too
  const realTimeTick = useMemo(() => {
    if (!quote || !quote.price) return null;
    return {
      price: quote.price,
      time: Date.now(),
      volume: quote.volume || 0,
    };
    // Only recompute when price actually changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quote?.price]);

  const fetchChartData = useCallback(async () => {
    if (!asset) return;
    setLoading(true);
    setError(null);
    try {
      const candleData = await fetchCandles(asset, timeframe);
      setCandles(candleData);
    } catch (err: any) {
      setError(err.message || 'Failed to load chart data');
    } finally {
      setLoading(false);
    }
  }, [asset, timeframe, fetchCandles]);

  const fetchWatchlistData = useCallback(async () => {
    try {
      const data = await getWatchlist();
      setWatchlist(data);
    } catch (err) {
      console.error('Failed to load watchlist', err);
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  useEffect(() => {
    fetchWatchlistData();
  }, [fetchWatchlistData]);

  // Subscribe to central market store for live updates
  useEffect(() => {
    if (!asset) return;
    subscribe(asset);
    return () => {
      unsubscribe(asset);
    };
  }, [asset, subscribe, unsubscribe]);

  return {
    asset,
    timeframe,
    candles,
    quote,
    watchlist,
    loading,
    error,
    realTimeTick,
    refresh: fetchChartData
  };
};
