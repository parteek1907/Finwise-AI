/**
 * Market Store — Single Source of Truth for ALL market data.
 *
 * Architecture:
 *   UI Components → hooks → useMarketStore → services/market.ts → /api/market/* → Yahoo Finance
 *
 * Features:
 * - Reference-counted subscriptions (5 components needing AAPL = 1 poll)
 * - Adaptive polling: 15s when market open, 10min when closed
 * - Batch quote fetching to minimize API calls
 * - Error resilience: keeps last successful prices, shows error banner
 * - Candle caching by symbol+timeframe
 */

import { create } from 'zustand';
import { Quote, MarketMover, Candle, MarketStatusDetails, MarketPhase } from '../types/market';
import { Timeframe } from '../constants/symbols';
import { useSettingsStore } from './useSettingsStore';
import { CurrencyService } from '../services/currency';
import {
  fetchQuote,
  fetchBatchQuotes,
  fetchCandles as fetchCandlesService,
  fetchMarketMovers,
  fetchMarketStatus,
  fetchExchangeRates,
  MoversResponse,
} from '../services/market';

// ─── Types ──────────────────────────────────────────────────────────────

interface CachedCandles {
  data: Candle[];
  timeframe: Timeframe;
  fetchedAt: number;
}

interface MarketState {
  // Data
  quotes: Record<string, Quote>;
  candles: Record<string, CachedCandles>;
  movers: MoversResponse;
  marketStatus: Record<string, MarketStatusDetails>;
  exchangeRates: Record<string, number>;

  // UI state
  loading: boolean;
  error: string | null;
  lastSuccessfulFetch: number;

  // Subscription tracking (ref counting)
  subscriptionCounts: Record<string, number>;

  // Actions
  subscribe: (symbol: string) => void;
  unsubscribe: (symbol: string) => void;
  fetchQuotes: () => Promise<void>;
  fetchCandles: (symbol: string, timeframe: Timeframe) => Promise<Candle[]>;
  fetchMovers: () => Promise<void>;
  fetchStatus: (symbol?: string) => Promise<void>;
  fetchRates: () => Promise<void>;
  initialize: () => Promise<void>;
}

// ─── Polling Management ─────────────────────────────────────────────────

let pollTimer: ReturnType<typeof setTimeout> | null = null;
let moversPollTimer: ReturnType<typeof setTimeout> | null = null;
let ratesPollTimer: ReturnType<typeof setTimeout> | null = null;
let isPolling = false;

const POLL_INTERVAL_OPEN = 15 * 1000;    // 15s during market hours
const POLL_INTERVAL_CLOSED = 10 * 60 * 1000; // 10min when closed
const MOVERS_POLL_INTERVAL = 60 * 1000;  // 60s
const RATES_POLL_INTERVAL = 15 * 60 * 1000; // 15min
const CANDLE_CACHE_TTL = 5 * 60 * 1000;  // 5min

function getPollInterval(marketStatus: Record<string, MarketStatusDetails>): number {
  // If any subscribed exchange is open, use the faster interval
  const anyOpen = Object.values(marketStatus).some(s => s.isOpen);
  return anyOpen ? POLL_INTERVAL_OPEN : POLL_INTERVAL_CLOSED;
}

function startPolling() {
  if (isPolling) return;
  isPolling = true;

  const poll = async () => {
    const state = useMarketStore.getState();
    const subscribedSymbols = Object.keys(state.subscriptionCounts);

    if (subscribedSymbols.length === 0) {
      isPolling = false;
      return;
    }

    await state.fetchQuotes();

    const interval = getPollInterval(state.marketStatus);
    pollTimer = setTimeout(poll, interval);
  };

  // Start immediately
  poll();
}

function stopPolling() {
  isPolling = false;
  if (pollTimer) {
    clearTimeout(pollTimer);
    pollTimer = null;
  }
}

function startMoversPoll() {
  const poll = async () => {
    await useMarketStore.getState().fetchMovers();
    moversPollTimer = setTimeout(poll, MOVERS_POLL_INTERVAL);
  };
  poll();
}

function stopMoversPoll() {
  if (moversPollTimer) {
    clearTimeout(moversPollTimer);
    moversPollTimer = null;
  }
}

function startRatesPoll() {
  const poll = async () => {
    await useMarketStore.getState().fetchRates();
    ratesPollTimer = setTimeout(poll, RATES_POLL_INTERVAL);
  };
  poll();
}

function stopRatesPoll() {
  if (ratesPollTimer) {
    clearTimeout(ratesPollTimer);
    ratesPollTimer = null;
  }
}

// ─── Store Definition ───────────────────────────────────────────────────

export const useMarketStore = create<MarketState>((set, get) => ({
  // Initial state
  quotes: {},
  candles: {},
  movers: { gainers: [], losers: [], active: [], all: [] },
  marketStatus: {},
  exchangeRates: { USD: 1 },
  loading: true,
  error: null,
  lastSuccessfulFetch: 0,
  subscriptionCounts: {},

  initialize: async () => {
    set({ loading: false, error: null });
    // Start exchange rate polling
    startRatesPoll();
  },

  subscribe: (symbol: string) => {
    const state = get();
    const currentCount = state.subscriptionCounts[symbol] || 0;
    const newCounts = { ...state.subscriptionCounts, [symbol]: currentCount + 1 };
    set({ subscriptionCounts: newCounts });

    if (currentCount === 0) {
      // First subscriber for this symbol — fetch immediately
      fetchQuote(symbol).then(quote => {
        const { preferredCurrency, exchangeRates } = useSettingsStore.getState().financial || {};
        const userCurr = preferredCurrency || 'USD';
        const converted = CurrencyService.convertQuote(quote, userCurr, exchangeRates || {});

        set(prev => ({
          quotes: { ...prev.quotes, [symbol]: converted },
          error: null,
          lastSuccessfulFetch: Date.now(),
        }));
      }).catch(err => {
        console.error(`Failed initial fetch for ${symbol}:`, err);
        // Only set error if we have no data at all
        if (!get().quotes[symbol]) {
          set({ error: 'Live market data temporarily unavailable.' });
        }
      });

      // Start polling if not already running
      startPolling();
    }
  },

  unsubscribe: (symbol: string) => {
    const state = get();
    const currentCount = state.subscriptionCounts[symbol] || 0;

    if (currentCount <= 1) {
      // Last subscriber removed
      const newCounts = { ...state.subscriptionCounts };
      delete newCounts[symbol];
      set({ subscriptionCounts: newCounts });

      // Stop polling if no more subscriptions
      if (Object.keys(newCounts).length === 0) {
        stopPolling();
      }
    } else {
      set({
        subscriptionCounts: {
          ...state.subscriptionCounts,
          [symbol]: currentCount - 1,
        },
      });
    }
  },

  fetchQuotes: async () => {
    const state = get();
    const symbols = Object.keys(state.subscriptionCounts);
    if (symbols.length === 0) return;

    try {
      const quotes = await fetchBatchQuotes(symbols);
      const quotesMap: Record<string, Quote> = { ...state.quotes };
      
      const { preferredCurrency, exchangeRates } = useSettingsStore.getState().financial || {};
      const userCurr = preferredCurrency || 'USD';

      for (const quote of quotes) {
        const converted = CurrencyService.convertQuote(quote, userCurr, exchangeRates || {});
        quotesMap[quote.symbol] = converted;
        // Also store under short alias for crypto (BTC-USD → BTC)
        if (quote.symbol.endsWith('-USD')) {
          quotesMap[quote.symbol.replace('-USD', '')] = converted;
        }
        // Store under short alias for NSE (.NS suffix)
        if (quote.symbol.endsWith('.NS')) {
          quotesMap[quote.symbol.replace('.NS', '')] = converted;
        }
      }

      set({
        quotes: quotesMap,
        error: null,
        lastSuccessfulFetch: Date.now(),
      });
    } catch (error) {
      console.error('Batch quote fetch failed:', error);
      // Keep last successful data, only set error if we have nothing
      if (Object.keys(state.quotes).length === 0) {
        set({ error: 'Live market data temporarily unavailable.' });
      }
    }
  },

  fetchCandles: async (symbol: string, timeframe: Timeframe): Promise<Candle[]> => {
    const state = get();
    const cacheKey = `${symbol}:${timeframe}`;
    const cached = state.candles[cacheKey];

    // Return cached if fresh enough
    if (cached && cached.timeframe === timeframe && (Date.now() - cached.fetchedAt) < CANDLE_CACHE_TTL) {
      return cached.data;
    }

    try {
      const rawCandles = await fetchCandlesService(symbol, timeframe);
      
      const { preferredCurrency, exchangeRates } = useSettingsStore.getState().financial || {};
      const userCurr = preferredCurrency || 'USD';
      
      // We need the original currency to convert. We can get it from the cached quote.
      const quote = state.quotes[symbol];
      const fromCurrency = quote ? quote.currency : 'USD'; // If we don't have it, assume USD (unlikely)

      const convertedCandles = CurrencyService.convertCandles(rawCandles, fromCurrency || 'USD', userCurr, exchangeRates || {});

      set({
        candles: {
          ...state.candles,
          [cacheKey]: { data: convertedCandles, timeframe, fetchedAt: Date.now() },
        },
      });

      return convertedCandles;
    } catch (error) {
      console.error(`Failed to fetch candles for ${symbol}:`, error);
      // Return cached data if available
      return cached?.data || [];
    }
  },

  fetchMovers: async () => {
    try {
      const rawMovers = await fetchMarketMovers();
      
      const { preferredCurrency, exchangeRates } = useSettingsStore.getState().financial || {};
      const userCurr = preferredCurrency || 'USD';
      const rates = exchangeRates || {};

      const convertedMovers = {
        gainers: rawMovers.gainers.map(m => CurrencyService.convertMover(m, 'USD', userCurr, rates)), // Yahoo movers default to US market usually
        losers: rawMovers.losers.map(m => CurrencyService.convertMover(m, 'USD', userCurr, rates)),
        active: rawMovers.active.map(m => CurrencyService.convertMover(m, 'USD', userCurr, rates)),
        all: rawMovers.all.map(m => CurrencyService.convertMover(m, 'USD', userCurr, rates)),
      };

      set({ movers: convertedMovers });
    } catch (error) {
      console.error('Failed to fetch movers:', error);
    }
  },

  fetchStatus: async (symbol: string = 'AAPL') => {
    try {
      const status = await fetchMarketStatus(symbol);
      set(prev => ({
        marketStatus: { ...prev.marketStatus, [symbol]: status },
      }));
    } catch (error) {
      console.error('Failed to fetch market status:', error);
    }
  },

  fetchRates: async () => {
    try {
      const rates = await fetchExchangeRates();
      set({ exchangeRates: rates });
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
    }
  },
}));
