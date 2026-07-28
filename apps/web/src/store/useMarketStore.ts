import { create } from 'zustand';
import { Quote, MarketStatus } from '../types/market';
import { getQuote } from '../services/market';

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

// Keep polling intervals outside of zustand state
const pollingIntervals: Record<string, NodeJS.Timeout> = {};

export const useMarketStore = create<MarketState>((set, get) => {
  return {
    quotes: {},
    liveTicks: {},
    loading: true,
    error: null,
    activeSymbols: new Set(),

    initialize: async () => {
      set({ loading: false, error: null });
    },

    subscribe: async (symbol: string) => {
      const state = get();
      const newSymbols = new Set(state.activeSymbols);
      newSymbols.add(symbol);
      set({ activeSymbols: newSymbols });

      const fetchAndUpdate = async () => {
        try {
          const quote = await getQuote(symbol);
          
          set(prev => {
            const prevQuote = prev.quotes[symbol];
            
            // Only generate a chart tick if the price actually changed to avoid spamming the chart
            // with identical prices, unless it's the very first quote
            let newLiveTicks = prev.liveTicks;
            if (!prevQuote || prevQuote.price !== quote.price) {
              newLiveTicks = {
                ...prev.liveTicks,
                [symbol]: {
                  symbol,
                  price: quote.price,
                  time: Date.now(),
                  volume: quote.volume || Math.floor(Math.random() * 500) + 100
                }
              };
            }

            return {
              quotes: { ...prev.quotes, [symbol]: quote },
              liveTicks: newLiveTicks
            };
          });
        } catch (error) {
          console.error(`Failed to fetch quote for ${symbol}`, error);
        }
      };

      // Fetch initial quote immediately
      if (!state.quotes[symbol]) {
        await fetchAndUpdate();
      }

      // Start polling every 5 seconds if not already polling
      if (!pollingIntervals[symbol]) {
        console.log(`Started polling for ${symbol}`);
        pollingIntervals[symbol] = setInterval(fetchAndUpdate, 5000);
      }
    },

    unsubscribe: (symbol: string) => {
      const state = get();
      const newSymbols = new Set(state.activeSymbols);
      newSymbols.delete(symbol);
      set({ activeSymbols: newSymbols });

      // Stop polling
      if (pollingIntervals[symbol]) {
        clearInterval(pollingIntervals[symbol]);
        delete pollingIntervals[symbol];
        console.log(`Stopped polling for ${symbol}`);
      }
    }
  };
});
