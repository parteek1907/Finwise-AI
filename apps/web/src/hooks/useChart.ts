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

  const [realTimeTick, setRealTimeTick] = useState<{price: number, time: number, volume: number} | null>(null);

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

  // WebSocket Connection for Real-Time ticks
  useEffect(() => {
    if (!asset) return;

    // Use ws:// for http, or wss:// for https
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Actually the backend is at 8000
    const ws = new WebSocket(`ws://localhost:8000/api/market/ws/${asset}`);
    let mockInterval: NodeJS.Timeout;

    const startMockTicks = () => {
      if (mockInterval) clearInterval(mockInterval);
      mockInterval = setInterval(() => {
        setQuote(prev => {
          if (!prev) return prev;
          
          // Random price fluctuation +/- 0.1%
          const change = prev.price * (Math.random() * 0.002 - 0.001);
          const newPrice = Number((prev.price + change).toFixed(2));
          
          setRealTimeTick({
            price: newPrice,
            time: Math.floor(Date.now() / 1000),
            volume: 100 // dummy volume increment
          });
          
          const prevClose = prev.price - prev.change;
          
          return {
            ...prev, 
            price: newPrice,
            change: newPrice - prevClose,
            changePercent: ((newPrice - prevClose) / prevClose) * 100
          };
        });
      }, 1000); // every 1 second
    };

    ws.onerror = () => {
      // WS failed (e.g., backend not running), fallback to mock ticks
      startMockTicks();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.price) {
          setRealTimeTick(data);
          // Also update the quote state so the UI badge updates
          setQuote(prev => prev ? { 
            ...prev, 
            price: data.price,
            change: data.price - prev.previousClose,
            changePercent: ((data.price - prev.previousClose) / prev.previousClose) * 100
          } : null);
        }
      } catch (err) {
        console.error('WS parse error', err);
      }
    };

    return () => {
      ws.close();
      if (mockInterval) clearInterval(mockInterval);
    };
  }, [asset]);

  return {
    asset,
    timeframe,
    candles,
    quote,
    marketStatus,
    watchlist,
    loading,
    error,
    realTimeTick,
    refresh: fetchChartData
  };
};
