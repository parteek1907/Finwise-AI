import { PortfolioHolding } from '../types/portfolio';
import { Trade } from '../types/trade';
import { INITIAL_HOLDINGS, INITIAL_TRADES } from '../mocks/portfolio';

import { getQuote } from './market';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getPortfolioHoldings = async (): Promise<PortfolioHolding[]> => {
  // Simulate a fast network request
  await delay(100);
  return INITIAL_HOLDINGS;
};

export const getTradeHistory = async (): Promise<Trade[]> => {
  await delay(400);
  return INITIAL_TRADES;
};
