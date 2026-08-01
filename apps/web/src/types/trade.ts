export type OrderType = 'MARKET' | 'LIMIT' | 'STOP';
export type OrderSide = 'BUY' | 'SELL';
export type OrderStatus = 'PENDING' | 'FILLED' | 'REJECTED' | 'CANCELED';

export interface Order {
  id: string;
  symbol: string;
  side: OrderSide;
  type: OrderType;
  quantity: number;
  price?: number; // Target price for limit/stop orders
  status: OrderStatus;
  createdAt: string;
  
  // Emotion AI Metadata
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

export interface Trade {
  id: string;
  orderId: string;
  symbol: string;
  side: OrderSide;
  quantity: number;
  executionPrice: number;
  totalValue: number;
  executedAt: string;
  
  // Emotion AI Metadata
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
