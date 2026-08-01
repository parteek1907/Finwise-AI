export type MarketPhase = 'Pre-Market' | 'Market Open' | 'After Hours' | 'Market Closed' | 'Weekend';

export interface MarketStatusDetails {
  isOpen: boolean;
  phase: MarketPhase;
  nextOpenTime?: string;
  displayMessage: string;
}

export interface Quote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  exchange: string;
  currency: string;
  high?: number;
  low?: number;
  open?: number;
  previousClose?: number;
  marketState?: string;
  marketStatusMessage?: string;
  isMarketOpen?: boolean;
  // Future AI Fields
  aiInsight?: string;
  riskLevel?: 'Low' | 'Medium' | 'High';
  confidenceScore?: number;
}

export interface MarketMover {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  isUp: boolean;
}

export interface Candle {
  time: number | string; // Unix timestamp for intraday, 'YYYY-MM-DD' for daily
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Asset {
  symbol: string;
  name: string;
  exchange: string;
  type: 'Stock' | 'Crypto' | 'ETF' | 'Index';
}

export interface TradeMarker {
  time: number;
  position: 'aboveBar' | 'belowBar';
  color: string;
  shape: 'arrowUp' | 'arrowDown';
  text: string;
}

export interface PendingOrder {
  id: string;
  symbol: string;
  price: number;
  side: 'BUY' | 'SELL';
  quantity: number;
}

export interface Indicator {
  id: string;
  name: string;
  type: 'SMA' | 'EMA' | 'Volume' | 'RSI' | 'MACD' | 'BollingerBands';
  visible: boolean;
  color?: string;
  period?: number;
}

export interface MarketStatus {
  isOpen: boolean;
  nextOpenTime?: string;
  nextCloseTime?: string;
}

export interface NewsArticle {
  id: string;
  headline: string;
  source: string;
  url: string;
  summary: string;
  publishedAt: string;
  relatedSymbols: string[];
}
