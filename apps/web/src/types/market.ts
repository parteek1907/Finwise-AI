export interface Quote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
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
  time: number; // Unix timestamp for lightweight-charts
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
