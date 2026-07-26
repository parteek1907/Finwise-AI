import { PortfolioHolding } from '../types/portfolio';
import { Trade } from '../types/trade';
import { INITIAL_HOLDINGS, INITIAL_TRADES } from '../mocks/portfolio';

import { getQuote } from './market';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getPortfolioHoldings = async (): Promise<PortfolioHolding[]> => {
  try {
    const holdingsWithLiveQuotes = await Promise.all(
      INITIAL_HOLDINGS.map(async (holding) => {
        try {
          const quote = await getQuote(holding.symbol);
          
          const currentPrice = quote.price;
          const todaysReturnPercent = quote.changePercent;
          const todaysReturn = currentPrice * todaysReturnPercent / 100 * holding.shares; // Rough approximation
          
          const totalValue = currentPrice * holding.shares;
          const totalCost = holding.averagePrice * holding.shares;
          const totalReturn = totalValue - totalCost;
          const totalReturnPercent = (totalReturn / totalCost) * 100;

          return {
            ...holding,
            currentPrice,
            totalValue,
            totalReturn,
            totalReturnPercent,
            todaysReturn,
            todaysReturnPercent,
          };
        } catch (e) {
          return holding; // fallback to static if quote fails
        }
      })
    );
    return holdingsWithLiveQuotes;
  } catch (error) {
    console.warn("Failed to fetch live portfolio holdings, falling back to mock.", error);
    await delay(400);
    return INITIAL_HOLDINGS;
  }
};

export const getTradeHistory = async (): Promise<Trade[]> => {
  await delay(400);
  return INITIAL_TRADES;
};
