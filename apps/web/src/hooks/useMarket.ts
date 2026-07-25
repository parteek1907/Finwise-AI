import { useState, useEffect } from 'react';
import { Quote, MarketMover, Candle } from '../types/market';
import { getMarketQuote, getMarketMovers, getChartData, searchSymbols } from '../services/market';
import { Timeframe } from '../constants/symbols';

export const useMarketQuote = (symbol: string) => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchQuote = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getMarketQuote(symbol);
        if (mounted) setQuote(data);
      } catch (err: any) {
        if (mounted) setError(err.message || 'Failed to fetch quote');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    if (symbol) fetchQuote();
    return () => { mounted = false; };
  }, [symbol]);

  return { quote, loading, error };
};

export const useMarketMovers = () => {
  const [movers, setMovers] = useState<MarketMover[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchMovers = async () => {
      try {
        setLoading(true);
        const data = await getMarketMovers();
        if (mounted) setMovers(data);
      } catch (err: any) {
        if (mounted) setError(err.message || 'Failed to fetch movers');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    fetchMovers();
    return () => { mounted = false; };
  }, []);

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
