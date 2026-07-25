import { useState, useEffect } from 'react';
import { create } from 'zustand';
import { PortfolioHolding, PortfolioSummary } from '../types/portfolio';
import { Trade, Order } from '../types/trade';
import { getPortfolioHoldings, getTradeHistory } from '../services/portfolio';
import { executeOrder } from '../services/trade';
import { calculatePortfolioSummary } from '../utils/calculations';
import { INITIAL_BUYING_POWER } from '../mocks/portfolio';

// Internal global state to simulate backend DB across components
interface PortfolioState {
  holdings: PortfolioHolding[];
  trades: Trade[];
  buyingPower: number;
  isInitialized: boolean;
  setInitialized: (val: boolean) => void;
  setHoldings: (h: PortfolioHolding[]) => void;
  setTrades: (t: Trade[]) => void;
  updateAfterTrade: (trade: Trade, holding: PortfolioHolding) => void;
}

const usePortfolioStore = create<PortfolioState>((set) => ({
  holdings: [],
  trades: [],
  buyingPower: INITIAL_BUYING_POWER,
  isInitialized: false,
  setInitialized: (val) => set({ isInitialized: val }),
  setHoldings: (holdings) => set({ holdings }),
  setTrades: (trades) => set({ trades }),
  updateAfterTrade: (trade, updatedHolding) => set((state) => {
    const isBuy = trade.side === 'BUY';
    const newBuyingPower = isBuy ? state.buyingPower - trade.totalValue : state.buyingPower + trade.totalValue;
    
    let newHoldings = [...state.holdings];
    const existingIdx = newHoldings.findIndex(h => h.symbol === updatedHolding.symbol);
    
    if (existingIdx >= 0) {
      if (updatedHolding.shares === 0) {
        newHoldings.splice(existingIdx, 1);
      } else {
        newHoldings[existingIdx] = updatedHolding;
      }
    } else {
      newHoldings.push(updatedHolding);
    }
    
    return {
      buyingPower: newBuyingPower,
      holdings: newHoldings,
      trades: [trade, ...state.trades]
    };
  })
}));

export const usePortfolio = () => {
  const store = usePortfolioStore();
  const [loading, setLoading] = useState(!store.isInitialized);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (store.isInitialized) return;
    
    let mounted = true;
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [initialHoldings, initialTrades] = await Promise.all([
          getPortfolioHoldings(),
          getTradeHistory()
        ]);
        
        if (mounted) {
          store.setHoldings(initialHoldings);
          store.setTrades(initialTrades);
          store.setInitialized(true);
        }
      } catch (err: any) {
        if (mounted) setError(err.message || 'Failed to fetch portfolio data');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    
    fetchInitialData();
    return () => { mounted = false; };
  }, [store.isInitialized]);

  const summary = calculatePortfolioSummary(store.holdings, store.buyingPower);

  return {
    holdings: store.holdings,
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

  const submitOrder = async (order: Order, currentPrice: number, stockName: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const isBuy = order.side === 'BUY';
      const orderValue = currentPrice * order.quantity;
      
      // Validation
      if (isBuy && orderValue > store.buyingPower) {
        throw new Error('Insufficient buying power');
      }
      
      const existingHolding = store.holdings.find(h => h.symbol === order.symbol);
      if (!isBuy && (!existingHolding || existingHolding.shares < order.quantity)) {
        throw new Error('Insufficient shares to sell');
      }

      // Execute via API layer
      const trade = await executeOrder(order, currentPrice);
      
      // Calculate new holding state
      let updatedHolding: PortfolioHolding;
      
      if (isBuy) {
        if (existingHolding) {
          const totalShares = existingHolding.shares + trade.quantity;
          const totalCost = (existingHolding.averagePrice * existingHolding.shares) + trade.totalValue;
          updatedHolding = {
            ...existingHolding,
            shares: totalShares,
            averagePrice: totalCost / totalShares,
            currentPrice: currentPrice,
            totalValue: totalShares * currentPrice,
            totalReturn: (currentPrice - (totalCost / totalShares)) * totalShares,
            totalReturnPercent: ((currentPrice - (totalCost / totalShares)) / (totalCost / totalShares)) * 100,
            todaysReturn: 0,
            todaysReturnPercent: 0,
          };
        } else {
          updatedHolding = {
            symbol: trade.symbol,
            name: stockName,
            shares: trade.quantity,
            averagePrice: trade.executionPrice,
            currentPrice: currentPrice,
            totalValue: trade.quantity * currentPrice,
            totalReturn: 0,
            totalReturnPercent: 0,
            todaysReturn: 0,
            todaysReturnPercent: 0,
            allocationPercent: 0
          };
        }
      } else { // SELL
        const remainingShares = existingHolding!.shares - trade.quantity;
        updatedHolding = {
          ...existingHolding!,
          shares: remainingShares,
          totalValue: remainingShares * currentPrice,
          totalReturn: (currentPrice - existingHolding!.averagePrice) * remainingShares,
          // Percent stays same
        };
      }
      
      // Update store
      store.updateAfterTrade(trade, updatedHolding);
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
