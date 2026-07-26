import { create } from 'zustand';
import { Quote, MarketStatus } from '../types/market';
import { getMarketStatus, getQuote } from '../services/market';

import { getMarketRegion, getExchangeStatus } from '../utils/market-hours';

interface RealTimeTick {
  symbol: string;
  price: number;
  time: number;
  volume: number;
}

interface MarketState {
  quotes: Record<string, Quote>;
  liveTicks: Record<string, RealTimeTick>;
  loading: boolean;
  error: string | null;
  activeSymbols: Set<string>;
  
  // Actions
  initialize: () => Promise<void>;
  subscribe: (symbol: string) => void;
  unsubscribe: (symbol: string) => void;
}

export const useMarketStore = create<MarketState>((set, get) => {
  let tickInterval: NodeJS.Timeout | null = null;

  const startTickInterval = () => {
    if (tickInterval) return;
    
    // Simulate real-time updates for all subscribed symbols every 1s
    tickInterval = setInterval(() => {
      const state = get();

      const updatedQuotes = { ...state.quotes };
      const updatedTicks = { ...state.liveTicks };
      let hasChanges = false;

      state.activeSymbols.forEach(symbol => {
        const quote = updatedQuotes[symbol];
        if (quote) {
          // Check if market is open for this specific symbol
          const region = getMarketRegion(quote.exchange);
          const status = getExchangeStatus(region);
          
          if (!status.isOpen) return; // Freeze if closed

          // Random price fluctuation +/- 0.1%
          const change = quote.price * (Math.random() * 0.002 - 0.001);
          const newPrice = Number((quote.price + change).toFixed(2));
          const prevClose = quote.price - quote.change;

          updatedQuotes[symbol] = {
            ...quote,
            price: newPrice,
            change: newPrice - prevClose,
            changePercent: ((newPrice - prevClose) / prevClose) * 100
          };

          updatedTicks[symbol] = {
            symbol,
            price: newPrice,
            time: Math.floor(Date.now() / 1000),
            volume: 100
          };
          hasChanges = true;
        }
      });

      if (hasChanges) {
        set({ quotes: updatedQuotes, liveTicks: updatedTicks });
      }
    }, 1000);
  };

  const stopTickInterval = () => {
    if (tickInterval) {
      clearInterval(tickInterval);
      tickInterval = null;
    }
  };

  return {
    marketStatus: null,
    quotes: {},
    liveTicks: {},
    loading: true,
    error: null,
    activeSymbols: new Set(),

    initialize: async () => {
      try {
        set({ loading: true });
        // We no longer fetch a global market status.
        // The store handles open/closed per symbol based on getExchangeStatus.
        set({ loading: false });
        
        // Start the polling loop immediately, it will skip closed symbols inside
        startTickInterval();
      } catch (err: any) {
        set({ error: err.message, loading: false });
      }
    },

    subscribe: async (symbol: string) => {
      const state = get();
      const newSymbols = new Set(state.activeSymbols);
      newSymbols.add(symbol);
      set({ activeSymbols: newSymbols });

      if (!state.quotes[symbol]) {
        try {
          const initialQuote = await getQuote(symbol);
          set(prev => ({
            quotes: { ...prev.quotes, [symbol]: initialQuote }
          }));
        } catch (error) {
          console.error(`Failed to fetch quote for ${symbol}`, error);
        }
      }

      startTickInterval();
    },

    unsubscribe: (symbol: string) => {
      const state = get();
      const newSymbols = new Set(state.activeSymbols);
      newSymbols.delete(symbol);
      set({ activeSymbols: newSymbols });

      if (newSymbols.size === 0) {
        stopTickInterval();
      }
    }
  };
});
