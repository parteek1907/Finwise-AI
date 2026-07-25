import { PortfolioHolding } from '../types/portfolio';
import { Trade } from '../types/trade';
import { INITIAL_HOLDINGS, INITIAL_TRADES } from '../mocks/portfolio';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getPortfolioHoldings = async (): Promise<PortfolioHolding[]> => {
  await delay(400);
  return INITIAL_HOLDINGS; // Backend would return from DB
};

export const getTradeHistory = async (): Promise<Trade[]> => {
  await delay(400);
  return INITIAL_TRADES;
};
