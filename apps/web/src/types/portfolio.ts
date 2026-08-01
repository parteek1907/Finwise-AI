/**
 * Base holding data that gets persisted to localStorage.
 * Does NOT include live market prices — those are computed from MarketStore.
 */
export interface PortfolioHoldingBase {
  symbol: string;
  name: string;
  shares: number;
  averagePrice: number;
  
  // Emotion AI Metadata from original buy
  emotion?: string;
  biases?: string[];
  readinessScore?: number;
  reflection?: {
    whyBuying: string;
    biggestConcern: string;
    sellCriteria: string;
  };
  intendedHorizon?: string;
}

/**
 * Full holding with live-computed fields from Yahoo Finance.
 * Used by UI components — never persisted.
 */
export interface PortfolioHolding extends PortfolioHoldingBase {
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
