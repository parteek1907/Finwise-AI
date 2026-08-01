/**
 * Portfolio Mocks — Base holding data only.
 *
 * No currentPrice, totalValue, totalReturn, or any live fields.
 * All live data is computed from Yahoo Finance via Market Store.
 */

import { PortfolioHoldingBase } from '../types/portfolio';
import { Trade } from '../types/trade';

export const INITIAL_BUYING_POWER = 10000;

export const INITIAL_HOLDINGS: PortfolioHoldingBase[] = [
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

export const INITIAL_TRADES: Trade[] = [
  {
    id: 't1',
    orderId: 'o1',
    symbol: 'VOO',
    side: 'BUY',
    quantity: 5,
    executionPrice: 400.00,
    totalValue: 2000.00,
    executedAt: new Date(Date.now() - 86400000 * 5).toISOString() // 5 days ago
  },
  {
    id: 't2',
    orderId: 'o2',
    symbol: 'AAPL',
    side: 'BUY',
    quantity: 10,
    executionPrice: 180.00,
    totalValue: 1800.00,
    executedAt: new Date(Date.now() - 86400000 * 2).toISOString() // 2 days ago
  }
];
