import { PortfolioHolding } from '../types/portfolio';
import { Trade } from '../types/trade';

export const INITIAL_BUYING_POWER = 10000;

export const INITIAL_HOLDINGS: PortfolioHolding[] = [
  {
    symbol: 'VOO',
    name: 'Vanguard S&P 500 ETF',
    shares: 5,
    averagePrice: 400.00,
    currentPrice: 410.20,
    totalValue: 2051.00,
    totalReturn: 51.00,
    totalReturnPercent: 2.55,
    todaysReturn: 10.25,
    todaysReturnPercent: 0.5,
    allocationPercent: 0
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    shares: 10,
    averagePrice: 180.00,
    currentPrice: 173.50,
    totalValue: 1735.00,
    totalReturn: -65.00,
    totalReturnPercent: -3.61,
    todaysReturn: 21.00,
    todaysReturnPercent: 1.2,
    allocationPercent: 0
  }
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
