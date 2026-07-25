export interface PortfolioHolding {
  symbol: string;
  name: string;
  shares: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  totalReturn: number;
  totalReturnPercent: number;
  todaysReturn: number;
  todaysReturnPercent: number;
  allocationPercent: number;
}

export interface PortfolioSummary {
  totalValue: number;
  buyingPower: number;
  cash: number;
  todaysReturn: number;
  todaysReturnPercent: number;
  totalReturn: number;
  totalReturnPercent: number;
}
