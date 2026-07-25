import { Quote, MarketMover, Candle, NewsArticle } from '../types/market';
import { POPULAR_SYMBOLS } from '../constants/symbols';

const generateMockPrice = (base: number) => {
  const volatility = base * 0.05;
  return base + (Math.random() * volatility * 2 - volatility);
};

export const MOCK_QUOTES: Record<string, Quote> = {
  AAPL: { symbol: 'AAPL', name: 'Apple Inc.', price: 173.50, change: 2.10, changePercent: 1.2, volume: 54000000, marketCap: 2800000000000, aiInsight: 'Strong iPhone sales beat expectations, though services growth is slowing.', riskLevel: 'Low', confidenceScore: 85 },
  MSFT: { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.20, change: 5.40, changePercent: 1.3, volume: 22000000, marketCap: 3000000000000, aiInsight: 'Cloud revenue continues to drive massive growth margins.', riskLevel: 'Low', confidenceScore: 92 },
  NVDA: { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 890.10, change: 45.20, changePercent: 5.3, volume: 45000000, marketCap: 2200000000000, aiInsight: 'Unprecedented demand for AI chips keeps guidance incredibly high.', riskLevel: 'Medium', confidenceScore: 78 },
  TSLA: { symbol: 'TSLA', name: 'Tesla Inc.', price: 202.10, change: -4.80, changePercent: -2.4, volume: 88000000, marketCap: 650000000000, aiInsight: 'Price cuts are eating into margins despite higher delivery volumes.', riskLevel: 'High', confidenceScore: 60 },
  AMZN: { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 178.40, change: 1.20, changePercent: 0.7, volume: 38000000, marketCap: 1800000000000, aiInsight: 'AWS stabilization offsets slower e-commerce growth.', riskLevel: 'Medium', confidenceScore: 81 },
  META: { symbol: 'META', name: 'Meta Platforms', price: 495.00, change: 12.00, changePercent: 2.5, volume: 15000000, marketCap: 1200000000000, aiInsight: 'Ad targeting improvements driving record free cash flow.', riskLevel: 'Medium', confidenceScore: 75 },
  GOOGL: { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 145.30, change: -1.10, changePercent: -0.7, volume: 28000000, marketCap: 1700000000000, aiInsight: 'Search dominance challenged by AI competitors, though Cloud is strong.', riskLevel: 'Low', confidenceScore: 80 },
  NFLX: { symbol: 'NFLX', name: 'Netflix Inc.', price: 610.50, change: 8.50, changePercent: 1.4, volume: 8000000, marketCap: 260000000000, aiInsight: 'Password sharing crackdown yielding excellent subscriber growth.', riskLevel: 'Medium', confidenceScore: 72 },
  AMD: { symbol: 'AMD', name: 'Advanced Micro Devices', price: 180.20, change: 6.40, changePercent: 3.6, volume: 65000000, marketCap: 290000000000, aiInsight: 'Gaining server market share against Intel, AI chips ramping up.', riskLevel: 'High', confidenceScore: 68 },
  INTC: { symbol: 'INTC', name: 'Intel Corp.', price: 42.10, change: -0.80, changePercent: -1.8, volume: 42000000, marketCap: 180000000000, aiInsight: 'Turnaround efforts ongoing, foundry business highly capital intensive.', riskLevel: 'High', confidenceScore: 55 },
  VOO: { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', price: 410.20, change: 2.05, changePercent: 0.5, volume: 5000000, marketCap: 950000000000, aiInsight: 'Broad market exposure, highly recommended for long-term growth.', riskLevel: 'Low', confidenceScore: 95 },
  QQQ: { symbol: 'QQQ', name: 'Invesco QQQ Trust', price: 445.80, change: 4.50, changePercent: 1.0, volume: 35000000, marketCap: 250000000000, aiInsight: 'Tech-heavy ETF benefiting from the AI megatrend.', riskLevel: 'Medium', confidenceScore: 88 },
  BTC: { symbol: 'BTC', name: 'Bitcoin', price: 64200, change: 3200, changePercent: 5.1, volume: 45000000000, marketCap: 1200000000000, aiInsight: 'Institutional adoption via ETFs driving massive inflows.', riskLevel: 'High', confidenceScore: 65 },
  ETH: { symbol: 'ETH', name: 'Ethereum', price: 3450, change: 120, changePercent: 3.5, volume: 15000000000, marketCap: 400000000000, aiInsight: 'Network upgrades and ETF anticipation fueling bullish sentiment.', riskLevel: 'High', confidenceScore: 62 },
  SOL: { symbol: 'SOL', name: 'Solana', price: 145.20, change: -8.40, changePercent: -5.4, volume: 4000000000, marketCap: 65000000000, aiInsight: 'High throughput network attracting significant developer activity.', riskLevel: 'High', confidenceScore: 50 },
  GOLD: { symbol: 'GOLD', name: 'Gold', price: 2150.40, change: 15.20, changePercent: 0.7, volume: 0, marketCap: 0, aiInsight: 'Safe haven asset performing well amid inflation concerns.', riskLevel: 'Low', confidenceScore: 82 },
  SILVER: { symbol: 'SILVER', name: 'Silver', price: 24.80, change: 0.40, changePercent: 1.6, volume: 0, marketCap: 0, aiInsight: 'Industrial demand supporting price floors.', riskLevel: 'Medium', confidenceScore: 70 },
  NIFTY: { symbol: 'NIFTY', name: 'Nifty 50', price: 22400, change: 150, changePercent: 0.6, volume: 0, marketCap: 0, aiInsight: 'Indian broad market index showing robust domestic growth.', riskLevel: 'Medium', confidenceScore: 85 },
  SENSEX: { symbol: 'SENSEX', name: 'BSE SENSEX', price: 73800, change: 450, changePercent: 0.6, volume: 0, marketCap: 0, aiInsight: 'Mirroring Nifty, driven by strong banking and IT sectors.', riskLevel: 'Medium', confidenceScore: 85 },
  RELIANCE: { symbol: 'RELIANCE', name: 'Reliance Industries', price: 2950, change: 45, changePercent: 1.5, volume: 5000000, marketCap: 200000000000, aiInsight: 'Retail and Jio segments driving consistent valuation upgrades.', riskLevel: 'Low', confidenceScore: 90 },
  TCS: { symbol: 'TCS', name: 'Tata Consultancy Services', price: 4120, change: -35, changePercent: -0.8, volume: 2000000, marketCap: 150000000000, aiInsight: 'Global IT spending slowdown putting slight pressure on margins.', riskLevel: 'Low', confidenceScore: 88 },
  INFY: { symbol: 'INFY', name: 'Infosys', price: 1640, change: 12, changePercent: 0.7, volume: 4500000, marketCap: 70000000000, aiInsight: 'Securing large deals despite macro headwinds.', riskLevel: 'Medium', confidenceScore: 82 },
  ICICIBANK: { symbol: 'ICICIBANK', name: 'ICICI Bank', price: 1080, change: 15, changePercent: 1.4, volume: 12000000, marketCap: 90000000000, aiInsight: 'Strong credit growth and stable asset quality.', riskLevel: 'Low', confidenceScore: 92 },
  HDFCBANK: { symbol: 'HDFCBANK', name: 'HDFC Bank', price: 1450, change: -10, changePercent: -0.6, volume: 18000000, marketCap: 130000000000, aiInsight: 'Merger synergies taking longer to realize than expected.', riskLevel: 'Medium', confidenceScore: 85 },
};

export const MOCK_MOVERS: MarketMover[] = [
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 890.10, changePercent: 5.3, isUp: true },
  { symbol: 'BTC', name: 'Bitcoin', price: 64200, changePercent: 5.1, isUp: true },
  { symbol: 'AMD', name: 'Advanced Micro Devices', price: 180.20, changePercent: 3.6, isUp: true },
  { symbol: 'SOL', name: 'Solana', price: 145.20, changePercent: -5.4, isUp: false },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 202.10, changePercent: -2.4, isUp: false },
  { symbol: 'INTC', name: 'Intel Corp.', price: 42.10, changePercent: -1.8, isUp: false },
];

// Helper to generate a realistic looking candlestick series
export const generateMockCandles = (basePrice: number, points: number = 30): Candle[] => {
  const data: Candle[] = [];
  let currentClose = basePrice;
  
  // We want the last candle (today) to have `close = basePrice`
  for (let i = 0; i <= points; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setUTCHours(0, 0, 0, 0);
    
    const volatility = currentClose * 0.02;
    const open = currentClose + (Math.random() * volatility * 2 - volatility);
    const high = Math.max(open, currentClose) + (Math.random() * volatility);
    const low = Math.min(open, currentClose) - (Math.random() * volatility);
    
    data.push({
      time: Math.floor(date.getTime() / 1000),
      open,
      high,
      low,
      close: currentClose,
      volume: Math.floor(Math.random() * 1000000)
    });
    
    // The previous day's close is approximately today's open
    currentClose = open;
  }
  
  // sort by time ascending
  return data.sort((a, b) => a.time - b.time);
};
