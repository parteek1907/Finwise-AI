import { Order, Trade } from '../types/trade';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const executeOrder = async (order: Order, currentPrice: number): Promise<Trade> => {
  await delay(1200); // Simulate network latency and exchange execution
  
  // In a real app, backend validates balance and fills order.
  // Here we just mock a successful fill.
  const trade: Trade = {
    id: `t_${Date.now()}`,
    orderId: order.id,
    symbol: order.symbol,
    side: order.side,
    quantity: order.quantity,
    executionPrice: currentPrice,
    totalValue: currentPrice * order.quantity,
    executedAt: new Date().toISOString()
  };
  
  return trade;
};
