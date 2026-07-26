import { useState, useEffect } from 'react';
import { Quote, MarketMover, Candle } from '../types/market';
import { getMarketQuote, getMarketMovers, getChartData, searchSymbols } from '../services/market';
import { Timeframe } from '../constants/symbols';
import { useMarketStore } from '../store/useMarketStore';

export const useMarketQuote = (symbol: string) => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchQuote = async (isBackground = false) => {
      try {
        if (!isBackground) setLoading(true);
        setError(null);
        const data = await getMarketQuote(symbol);
        if (mounted) setQuote(data);
      } catch (err: any) {
        if (mounted && !isBackground) setError(err.message || 'Failed to fetch quote');
      } finally {
        if (mounted && !isBackground) setLoading(false);
      }
    };
    
    if (symbol) {
      fetchQuote();
      // Poll every 10 seconds for real-time updates
      const interval = setInterval(() => fetchQuote(true), 10000);
      return () => {
        mounted = false;
        clearInterval(interval);
      };
    }
    return () => { mounted = false; };
  }, [symbol]);

  return { quote, loading, error };
};

export const useMarketMovers = () => {
  const [baseMovers, setBaseMovers] = useState<MarketMover[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { quotes, subscribe, unsubscribe } = useMarketStore();

  useEffect(() => {
    let mounted = true;
    const fetchMovers = async () => {
      try {
        setLoading(true);
        const data = await getMarketMovers();
        if (mounted) {
          setBaseMovers(data);
          // Subscribe to all movers for live updates
          data.forEach(mover => subscribe(mover.symbol));
        }
      } catch (err: any) {
        if (mounted) setError(err.message || 'Failed to fetch movers');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    fetchMovers();

    return () => { 
      mounted = false; 
      baseMovers.forEach(mover => unsubscribe(mover.symbol));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Dynamically compute movers with live quotes
  const movers = baseMovers.map(mover => {
    const quote = quotes[mover.symbol];
    if (!quote) return mover;
    
    return {
      ...mover,
      price: quote.price,
      changePercent: quote.changePercent,
      isUp: quote.changePercent >= 0
    };
  });

  return { movers, loading, error };
};

export const useChartData = (symbol: string, timeframe: Timeframe) => {
  const [data, setData] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const chartData = await getChartData(symbol, timeframe);
        if (mounted) setData(chartData);
      } catch (err: any) {
        if (mounted) setError(err.message || 'Failed to fetch chart data');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    if (symbol && timeframe) fetchData();
    return () => { mounted = false; };
  }, [symbol, timeframe]);

  return { data, loading, error };
};

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
