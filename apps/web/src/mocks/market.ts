/**
 * Market Metadata — AI insights and risk info NOT available from Yahoo Finance.
 *
 * Yahoo provides prices, charts, volume. These fields are supplemental AI data
 * used by the Educational Insights and AI Mentor features.
 *
 * NOTE: No hardcoded prices. All prices come from Yahoo Finance via Market Store.
 */

import { Quote, MarketMover } from '../types/market';

/**
 * AI Insight metadata for known symbols.
 * These enrich Yahoo's price data with FinWise AI's analysis.
 */
export const SYMBOL_METADATA: Record<string, { aiInsight?: string; riskLevel?: 'Low' | 'Medium' | 'High'; confidenceScore?: number }> = {
  AAPL: { aiInsight: 'Strong iPhone sales beat expectations, though services growth is slowing.', riskLevel: 'Low', confidenceScore: 85 },
  MSFT: { aiInsight: 'Cloud revenue continues to drive massive growth margins.', riskLevel: 'Low', confidenceScore: 92 },
  NVDA: { aiInsight: 'Unprecedented demand for AI chips keeps guidance incredibly high.', riskLevel: 'Medium', confidenceScore: 78 },
  TSLA: { aiInsight: 'Price cuts are eating into margins despite higher delivery volumes.', riskLevel: 'High', confidenceScore: 60 },
  AMZN: { aiInsight: 'AWS stabilization offsets slower e-commerce growth.', riskLevel: 'Medium', confidenceScore: 81 },
  META: { aiInsight: 'Ad targeting improvements driving record free cash flow.', riskLevel: 'Medium', confidenceScore: 75 },
  GOOGL: { aiInsight: 'Search dominance challenged by AI competitors, though Cloud is strong.', riskLevel: 'Low', confidenceScore: 80 },
  NFLX: { aiInsight: 'Password sharing crackdown yielding excellent subscriber growth.', riskLevel: 'Medium', confidenceScore: 72 },
  AMD: { aiInsight: 'Gaining server market share against Intel, AI chips ramping up.', riskLevel: 'High', confidenceScore: 68 },
  INTC: { aiInsight: 'Turnaround efforts ongoing, foundry business highly capital intensive.', riskLevel: 'High', confidenceScore: 55 },
  VOO: { aiInsight: 'Broad market exposure, highly recommended for long-term growth.', riskLevel: 'Low', confidenceScore: 95 },
  QQQ: { aiInsight: 'Tech-heavy ETF benefiting from the AI megatrend.', riskLevel: 'Medium', confidenceScore: 88 },
  'BTC-USD': { aiInsight: 'Institutional adoption via ETFs driving massive inflows.', riskLevel: 'High', confidenceScore: 65 },
  'ETH-USD': { aiInsight: 'Network upgrades and ETF anticipation fueling bullish sentiment.', riskLevel: 'High', confidenceScore: 62 },
  'SOL-USD': { aiInsight: 'High throughput network attracting significant developer activity.', riskLevel: 'High', confidenceScore: 50 },
  'GC=F': { aiInsight: 'Safe haven asset performing well amid inflation concerns.', riskLevel: 'Low', confidenceScore: 82 },
  'RELIANCE.NS': { aiInsight: 'Retail and Jio segments driving consistent valuation upgrades.', riskLevel: 'Low', confidenceScore: 90 },
  'TCS.NS': { aiInsight: 'Global IT spending slowdown putting slight pressure on margins.', riskLevel: 'Low', confidenceScore: 88 },
  'INFY.NS': { aiInsight: 'Securing large deals despite macro headwinds.', riskLevel: 'Medium', confidenceScore: 82 },
  'ICICIBANK.NS': { aiInsight: 'Strong credit growth and stable asset quality.', riskLevel: 'Low', confidenceScore: 92 },
  'HDFCBANK.NS': { aiInsight: 'Merger synergies taking longer to realize than expected.', riskLevel: 'Medium', confidenceScore: 85 },
};

/**
 * Default symbols list for the movers panel.
 * These are the symbols fetched by the /api/market/movers endpoint.
 */
export const MOVERS_SYMBOLS: string[] = [
  'NVDA', 'BTC-USD', 'AMD', 'SOL-USD', 'TSLA', 'INTC',
  'AAPL', 'MSFT', 'AMZN', 'META', 'GOOGL', 'NFLX',
];

/**
 * Enriches a Yahoo quote with AI metadata.
 */
export const enrichQuoteWithMetadata = (quote: Quote): Quote => {
  const meta = SYMBOL_METADATA[quote.symbol];
  if (!meta) return quote;
  return {
    ...quote,
    aiInsight: meta.aiInsight,
    riskLevel: meta.riskLevel,
    confidenceScore: meta.confidenceScore,
  };
};

// ─── REMOVED: generateMockPrice, generateMockCandles, MOCK_QUOTES, MOCK_MOVERS ───
// All price data now comes exclusively from Yahoo Finance through the Market Store.
