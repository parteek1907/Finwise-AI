import { useState, useEffect, useCallback } from 'react';
import { Asset, Candle, Quote, MarketStatus } from '../types/market';
import { getCandles, getWatchlist } from '../services/market';
import { Timeframe } from '../constants/symbols';
import { useMarketStore } from '../store/useMarketStore';

export const useChart = (asset: string = 'AAPL', timeframe: Timeframe = '1D') => {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [watchlist, setWatchlist] = useState<Asset[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { 
    quotes, 
    liveTicks, 
    subscribe, 
    unsubscribe,
    initialize 
  } = useMarketStore();

  const quote = quotes[asset] || null;
  const realTimeTick = liveTicks[asset] || null;

  const fetchChartData = useCallback(async () => {
    if (!asset) return;
    setLoading(true);
    setError(null);
    try {
      const candleData = await getCandles(asset, timeframe);
      setCandles(candleData);
    } catch (err: any) {
      setError(err.message || 'Failed to load chart data');
    } finally {
      setLoading(false);
    }
  }, [asset, timeframe]);

  const fetchWatchlist = useCallback(async () => {
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
    fetchWatchlist();
  }, [fetchWatchlist]);

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
