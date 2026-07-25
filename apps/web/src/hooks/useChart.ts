import { useState, useEffect, useCallback } from 'react';
import { Asset, Candle, Quote, MarketStatus } from '../types/market';
import { getCandles, getQuote, getMarketStatus, getWatchlist } from '../services/market';
import { Timeframe } from '../constants/symbols';

export const useChart = (asset: string = 'AAPL', timeframe: Timeframe = '1D') => {
  
  const [candles, setCandles] = useState<Candle[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null);
  const [watchlist, setWatchlist] = useState<Asset[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchChartData = useCallback(async () => {
    if (!asset) return;
    setLoading(true);
    setError(null);
    try {
      const [candleData, quoteData, statusData] = await Promise.all([
        getCandles(asset, timeframe),
        getQuote(asset),
        getMarketStatus()
      ]);
      setCandles(candleData);
      setQuote(quoteData);
      setMarketStatus(statusData);
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
    fetchChartData();
  }, [fetchChartData]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  return {
    asset,
    timeframe,
    candles,
    quote,
    marketStatus,
    watchlist,
    loading,
    error,
    refresh: fetchChartData
  };
};
