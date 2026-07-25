export const POPULAR_SYMBOLS = [
  'AAPL', 'MSFT', 'NVDA', 'TSLA', 'AMZN', 
  'META', 'GOOGL', 'NFLX', 'AMD', 'INTC', 
  'VOO', 'QQQ', 'BTC', 'ETH', 'SOL', 
  'GOLD', 'SILVER', 'NIFTY', 'SENSEX', 
  'RELIANCE', 'TCS', 'INFY', 'ICICIBANK', 'HDFCBANK'
];

export const TIMEFRAMES = ['1D', '5D', '1M', '3M', '6M', '1Y', 'ALL'] as const;
export type Timeframe = typeof TIMEFRAMES[number];
