/**
 * Portfolio Service
 *
 * Holdings and trade history are managed by the usePortfolio zustand store.
 * Current prices are always derived from the Market Store (Yahoo Finance).
 *
 * This service exists for backward compatibility.
 * In the future, portfolio persistence could move to a backend API.
 */

import { PortfolioHoldingBase } from '../types/portfolio';
import { Trade } from '../types/trade';

// No-op: holdings come from persisted zustand store
export const getPortfolioHoldings = async (): Promise<PortfolioHoldingBase[]> => {
  return [];
};

// No-op: trade history comes from persisted zustand store
export const getTradeHistory = async (): Promise<Trade[]> => {
  return [];
};
