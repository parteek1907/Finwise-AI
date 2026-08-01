/**
 * Portfolio Hook — Holdings NEVER store current prices.
 *
 * Portfolio persists ONLY: symbol, name, shares, averagePrice
 * Current value is ALWAYS computed from Yahoo Finance via Market Store.
 *
 * Trade execution uses the latest Market Store price (from Yahoo).
 */

import { useState, useEffect, useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PortfolioHoldingBase, PortfolioHolding, PortfolioSummary } from '../types/portfolio';
import { Trade, Order } from '../types/trade';
import { executeOrder } from '../services/trade';
import { calculatePortfolioSummary } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { useMarketStore } from '../store/useMarketStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { CurrencyService } from '../services/currency';

// ─── Initial Data ───────────────────────────────────────────────────────
// Portfolio stores ONLY static trade data. No live prices.

const INITIAL_BUYING_POWER = 10000;

const INITIAL_BASE_HOLDINGS: PortfolioHoldingBase[] = [
  {
    symbol: 'VOO',
    name: 'Vanguard S&P 500 ETF',
    shares: 5,
    averagePrice: 400.00,
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    shares: 10,
    averagePrice: 180.00,
  },
];

const INITIAL_TRADES: Trade[] = [
  {
    id: 't1',
    orderId: 'o1',
    symbol: 'VOO',
    side: 'BUY',
    quantity: 5,
    executionPrice: 400.00,
    totalValue: 2000.00,
    executedAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 't2',
    orderId: 'o2',
    symbol: 'AAPL',
    side: 'BUY',
    quantity: 10,
    executionPrice: 180.00,
    totalValue: 1800.00,
    executedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

// ─── Portfolio Store (Persisted) ────────────────────────────────────────

interface PortfolioState {
  baseHoldings: PortfolioHoldingBase[];
  trades: Trade[];
  buyingPower: number;
  isInitialized: boolean;
  setInitialized: (val: boolean) => void;
  setBaseHoldings: (h: PortfolioHoldingBase[]) => void;
  setTrades: (t: Trade[]) => void;
  updateAfterTrade: (trade: Trade, stockName: string) => void;
}

const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      baseHoldings: INITIAL_BASE_HOLDINGS,
      trades: INITIAL_TRADES,
      buyingPower: INITIAL_BUYING_POWER,
      isInitialized: true,
      setInitialized: (val) => set({ isInitialized: val }),
      setBaseHoldings: (h) => set({ baseHoldings: h }),
      setTrades: (t) => set({ trades: t }),
      updateAfterTrade: (trade, stockName) => set((state) => {
        const isBuy = trade.side === 'BUY';
        const newBuyingPower = isBuy ? state.buyingPower - trade.totalValue : state.buyingPower + trade.totalValue;

        let newHoldings = [...state.baseHoldings];
        const existingIdx = newHoldings.findIndex(h => h.symbol === trade.symbol);
        const existingHolding = existingIdx >= 0 ? newHoldings[existingIdx] : undefined;

        if (isBuy) {
          if (existingHolding) {
            const totalShares = existingHolding.shares + trade.quantity;
            const totalCost = (existingHolding.averagePrice * existingHolding.shares) + trade.totalValue;
            newHoldings[existingIdx] = {
              ...existingHolding,
              shares: totalShares,
              averagePrice: totalCost / totalShares,
            };
          } else {
            newHoldings.push({
              symbol: trade.symbol,
              name: stockName || trade.symbol,
              shares: trade.quantity,
              averagePrice: trade.executionPrice,
            });
          }
        } else {
          if (!existingHolding) return state;
          const remainingShares = existingHolding.shares - trade.quantity;
          if (remainingShares <= 0) {
            newHoldings.splice(existingIdx, 1);
          } else {
            newHoldings[existingIdx] = {
              ...existingHolding,
              shares: remainingShares,
            };
          }
        }

        return {
          buyingPower: newBuyingPower,
          baseHoldings: newHoldings,
          trades: [trade, ...state.trades]
        };
      })
    }),
    {
      name: 'finwise-portfolio-storage',
    }
  )
);

// ─── usePortfolio Hook ──────────────────────────────────────────────────

export const usePortfolio = () => {
  const store = usePortfolioStore();
  const { quotes, subscribe, unsubscribe } = useMarketStore();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const loading = !isMounted;
  const error = null;

  // Subscribe to all holdings in the market store
  useEffect(() => {
    store.baseHoldings.forEach(h => {
      subscribe(h.symbol);
    });
    return () => {
      store.baseHoldings.forEach(h => {
        unsubscribe(h.symbol);
      });
    };
  }, [store.baseHoldings, subscribe, unsubscribe]);

  // Compute live holdings from base holdings + Market Store quotes
  const liveHoldings = useMemo((): PortfolioHolding[] => {
    let totalHoldingsValue = 0;

    const { preferredCurrency, exchangeRates } = useSettingsStore.getState().financial || {};
    const userCurr = preferredCurrency || 'USD';
    const rates = exchangeRates || {};

    const preCalcHoldings = store.baseHoldings.map(h => {
      const quote = quotes[h.symbol];
      // h.averagePrice is stored in USD. We must convert it to user's currency for math
      const convertedAvgPrice = CurrencyService.convert(h.averagePrice, 'USD', userCurr, rates);
      
      const livePrice = quote?.price || convertedAvgPrice; // Fallback to avgPrice if Yahoo unavailable
      const totalValue = livePrice * h.shares;

      totalHoldingsValue += totalValue;

      const totalReturn = (livePrice - convertedAvgPrice) * h.shares;
      const totalReturnPercent = convertedAvgPrice > 0 ? ((livePrice - convertedAvgPrice) / convertedAvgPrice) * 100 : 0;
      const todaysReturn = quote ? (quote.change * h.shares) : 0;
      const todaysReturnPercent = quote ? quote.changePercent : 0;

      return {
        ...h,
        currentPrice: livePrice,
        totalValue,
        totalReturn,
        totalReturnPercent,
        todaysReturn,
        todaysReturnPercent,
        allocationPercent: 0, // Computed in second pass
      };
    });

    const totalPortfolioValue = totalHoldingsValue + CurrencyService.convert(store.buyingPower, 'USD', userCurr, rates);

    return preCalcHoldings.map(h => ({
      ...h,
      allocationPercent: totalPortfolioValue > 0 ? (h.totalValue / totalPortfolioValue) * 100 : 0
    }));
  }, [store.baseHoldings, quotes, useSettingsStore.getState().financial?.preferredCurrency, useSettingsStore.getState().financial?.exchangeRates]);

  // Compute portfolio summary
  const summary = useMemo((): PortfolioSummary => {
    const { preferredCurrency, exchangeRates } = useSettingsStore.getState().financial || {};
    const userCurr = preferredCurrency || 'USD';
    const rates = exchangeRates || {};
    
    // Convert buying power from USD to user's currency
    const convertedBuyingPower = CurrencyService.convert(store.buyingPower, 'USD', userCurr, rates);

    return calculatePortfolioSummary(liveHoldings, convertedBuyingPower);
  }, [liveHoldings, store.buyingPower, useSettingsStore.getState().financial?.preferredCurrency, useSettingsStore.getState().financial?.exchangeRates]);

  return {
    holdings: liveHoldings,
    trades: store.trades,
    summary,
    loading,
    error
  };
};

// ─── useTradeExecution Hook ─────────────────────────────────────────────

export const useTradeExecution = () => {
  const store = usePortfolioStore();
  const quotes = useMarketStore(s => s.quotes);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitOrder = async (order: Order, _uiPrice: number, stockName: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const isBuy = order.side === 'BUY';

      // Use the latest price from the Market Store (Yahoo Finance)
      const latestQuote = quotes[order.symbol];
      if (!latestQuote) {
        throw new Error(`No market data available for ${order.symbol}. Please wait for data to load.`);
      }
      const executionPrice = latestQuote.price;
      const orderValue = executionPrice * order.quantity;

      const { preferredCurrency, exchangeRates } = useSettingsStore.getState().financial || {};
      const userCurr = preferredCurrency || 'USD';
      const rates = exchangeRates || {};
      
      // store.buyingPower is in USD, so we must convert it to userCurr to validate against orderValue (which is in userCurr)
      const convertedBuyingPower = CurrencyService.convert(store.buyingPower, 'USD', userCurr, rates);

      // Validation
      if (isBuy && orderValue > convertedBuyingPower) {
        throw new Error(`Insufficient buying power (Market price: ${formatCurrency(executionPrice)})`);
      }

      const existingHolding = store.baseHoldings.find(h => h.symbol === order.symbol);
      if (!isBuy && (!existingHolding || existingHolding.shares < order.quantity)) {
        throw new Error('Insufficient shares to sell');
      }

      // We must store the execution price in USD in the portfolio!
      const executionPriceInUSD = CurrencyService.convert(executionPrice, userCurr, 'USD', rates);

      // Execute using the USD price for storage
      const trade = await executeOrder(order, executionPriceInUSD);
      store.updateAfterTrade(trade, stockName);
      return trade;

    } catch (err: any) {
      setError(err.message || 'Trade execution failed');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitOrder, isSubmitting, error };
};
