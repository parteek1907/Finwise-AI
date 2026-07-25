import { PortfolioHolding, PortfolioSummary } from '../types/portfolio';

export const calculateProfitLoss = (averagePrice: number, currentPrice: number, shares: number) => {
  const totalReturn = (currentPrice - averagePrice) * shares;
  const totalReturnPercent = ((currentPrice - averagePrice) / averagePrice) * 100;
  return { totalReturn, totalReturnPercent };
};

export const calculatePortfolioSummary = (
  holdings: PortfolioHolding[],
  buyingPower: number
): PortfolioSummary => {
  let totalValue = buyingPower;
  let todaysReturn = 0;
  let todaysReturnPercent = 0; // simplified for mock
  let totalReturn = 0;
  
  let originalInvested = 0;

  holdings.forEach(holding => {
    totalValue += holding.totalValue;
    todaysReturn += holding.todaysReturn;
    totalReturn += holding.totalReturn;
    originalInvested += (holding.averagePrice * holding.shares);
  });

  const totalReturnPercent = originalInvested > 0 ? (totalReturn / originalInvested) * 100 : 0;
  const initialTodaysValue = totalValue - buyingPower - todaysReturn;
  todaysReturnPercent = initialTodaysValue > 0 ? (todaysReturn / initialTodaysValue) * 100 : 0;

  return {
    totalValue,
    buyingPower,
    cash: buyingPower,
    todaysReturn,
    todaysReturnPercent,
    totalReturn,
    totalReturnPercent
  };
};

export const calculateAllocations = (holdings: PortfolioHolding[]): PortfolioHolding[] => {
  const totalHoldingValue = holdings.reduce((sum, h) => sum + h.totalValue, 0);
  if (totalHoldingValue === 0) return holdings;
  
  return holdings.map(h => ({
    ...h,
    allocationPercent: (h.totalValue / totalHoldingValue) * 100
  }));
};
