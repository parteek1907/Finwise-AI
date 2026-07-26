import { useState, useEffect, useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PortfolioHolding, PortfolioSummary } from '../types/portfolio';
import { Trade, Order } from '../types/trade';
import { getPortfolioHoldings, getTradeHistory } from '../services/portfolio';
import { executeOrder } from '../services/trade';
import { getQuote } from '../services/market';
import { calculatePortfolioSummary } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { INITIAL_BUYING_POWER } from '../mocks/portfolio';
import { useMarketStore } from '../store/useMarketStore';

// Internal global state for static trade history and holding records
interface PortfolioState {
  baseHoldings: PortfolioHolding[]; // Holdings before applying live prices
  trades: Trade[];
  buyingPower: number;
  isInitialized: boolean;
  setInitialized: (val: boolean) => void;
  setBaseHoldings: (h: PortfolioHolding[]) => void;
  setTrades: (t: Trade[]) => void;
  updateAfterTrade: (trade: Trade, stockName: string) => void;
}

const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set) => ({
      baseHoldings: [],
      trades: [],
      buyingPower: INITIAL_BUYING_POWER,
      isInitialized: false,
      setInitialized: (val) => set({ isInitialized: val }),
      setBaseHoldings: (h) => set({ baseHoldings: h }),
      setTrades: (t) => set({ trades: t }),
      updateAfterTrade: (trade, stockName) => set((state) => {
        const isBuy = trade.side === 'BUY';
        const newBuyingPower = isBuy ? state.buyingPower - trade.totalValue : state.buyingPower + trade.totalValue;
        
        let newHoldings = [...state.baseHoldings];
        const existingIdx = newHoldings.findIndex(h => h.symbol === trade.symbol);
        const existingHolding = existingIdx >= 0 ? newHoldings[existingIdx] : undefined;
        
        let updatedHolding: PortfolioHolding;
        
        if (isBuy) {
          if (existingHolding) {
            const totalShares = existingHolding.shares + trade.quantity;
            const totalCost = (existingHolding.averagePrice * existingHolding.shares) + trade.totalValue;
            updatedHolding = {
              ...existingHolding,
              shares: totalShares,
              averagePrice: totalCost / totalShares,
              currentPrice: trade.executionPrice,
              totalValue: totalShares * trade.executionPrice,
              totalReturn: (trade.executionPrice - (totalCost / totalShares)) * totalShares,
              totalReturnPercent: ((trade.executionPrice - (totalCost / totalShares)) / (totalCost / totalShares)) * 100,
              todaysReturn: 0,
              todaysReturnPercent: 0,
            };
          } else {
            updatedHolding = {
              symbol: trade.symbol,
              name: stockName || trade.symbol,
              shares: trade.quantity,
              averagePrice: trade.executionPrice,
              currentPrice: trade.executionPrice,
              totalValue: trade.quantity * trade.executionPrice,
              totalReturn: 0,
              totalReturnPercent: 0,
              todaysReturn: 0,
              todaysReturnPercent: 0,
              allocationPercent: 0
            };
          }
        } else { // SELL
          if (!existingHolding) return state; // Should not happen if validated
          const remainingShares = existingHolding.shares - trade.quantity;
          updatedHolding = {
            ...existingHolding,
            shares: remainingShares,
            totalValue: remainingShares * trade.executionPrice,
            totalReturn: (trade.executionPrice - existingHolding.averagePrice) * remainingShares,
          };
        }
        
        if (existingIdx >= 0) {
          if (updatedHolding.shares <= 0) {
            newHoldings.splice(existingIdx, 1);
          } else {
            newHoldings[existingIdx] = updatedHolding;
          }
        } else if (updatedHolding.shares > 0) {
          newHoldings.push(updatedHolding);
        }
        
        return {
          buyingPower: newBuyingPower,
          baseHoldings: newHoldings,
          trades: [trade, ...state.trades]
        };
      })
    }),
    {
      name: 'finwise-portfolio-storage', // unique name for localStorage key
    }
  )
);

export const usePortfolio = () => {
  const store = usePortfolioStore();
  const { quotes, subscribe, unsubscribe } = useMarketStore();
  
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (store.isInitialized) return;
    
    let mounted = true;
    const fetchInitialData = async () => {
      try {
        setIsFetching(true);
        const [initialHoldings, initialTrades] = await Promise.all([
          getPortfolioHoldings(),
          getTradeHistory()
        ]);
        
        if (mounted) {
          store.setBaseHoldings(initialHoldings);
          store.setTrades(initialTrades);
          store.setInitialized(true);
        }
      } catch (err: any) {
        if (mounted) setError(err.message || 'Failed to fetch portfolio data');
      } finally {
        if (mounted) setIsFetching(false);
      }
    };
    
    fetchInitialData();
    return () => { mounted = false; };
  }, [store.isInitialized, store]);

  const loading = !store.isInitialized || isFetching;

  // Subscribe to all holdings in the market store to get live updates
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

  // Dynamically compute live holdings using quotes from MarketStore
  const liveHoldings = useMemo(() => {
    // First pass to get total portfolio value
    let totalHoldingsValue = 0;
    
    const preCalcHoldings = store.baseHoldings.map(h => {
      const quote = quotes[h.symbol];
      const livePrice = quote?.price || h.currentPrice;
      const totalValue = livePrice * h.shares;
      
      totalHoldingsValue += totalValue;
      
      const totalReturn = (livePrice - h.averagePrice) * h.shares;
      const totalReturnPercent = h.averagePrice > 0 ? ((livePrice - h.averagePrice) / h.averagePrice) * 100 : 0;
      const todaysReturn = quote ? (quote.change * h.shares) : 0;
      const todaysReturnPercent = quote ? quote.changePercent : 0;

      return {
        ...h,
        currentPrice: livePrice,
        totalValue,
        totalReturn,
        totalReturnPercent,
        todaysReturn,
        todaysReturnPercent
      };
    });

    const totalPortfolioValue = totalHoldingsValue + store.buyingPower;

    // Second pass to calculate allocation %
    return preCalcHoldings.map(h => ({
      ...h,
      allocationPercent: totalPortfolioValue > 0 ? (h.totalValue / totalPortfolioValue) * 100 : 0
    }));
  }, [store.baseHoldings, quotes, store.buyingPower]);

  const summary = useMemo(() => {
    return calculatePortfolioSummary(liveHoldings, store.buyingPower);
  }, [liveHoldings, store.buyingPower]);

  return {
    holdings: liveHoldings,
    trades: store.trades,
    summary,
    loading,
    error
  };
};

export const useTradeExecution = () => {
  const store = usePortfolioStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitOrder = async (order: Order, uiPrice: number, stockName: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const isBuy = order.side === 'BUY';
      
      // Fetch fresh price right before execution for real-time realism
      const freshQuote = await getQuote(order.symbol);
      const executionPrice = freshQuote.price;
      
      const orderValue = executionPrice * order.quantity;
      
      // Validation
      if (isBuy && orderValue > store.buyingPower) {
        throw new Error(`Insufficient buying power (Market price: ${formatCurrency(executionPrice)})`);
      }
      
      const existingHolding = store.baseHoldings.find(h => h.symbol === order.symbol);
      if (!isBuy && (!existingHolding || existingHolding.shares < order.quantity)) {
        throw new Error('Insufficient shares to sell');
      }

      // Execute via API layer using the fresh execution price
      const trade = await executeOrder(order, executionPrice);
      
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
