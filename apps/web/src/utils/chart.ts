import { Candle } from '../types/market';

export interface LineData {
  time: number;
  value: number;
}

export const calculateSMA = (candles: Candle[], period: number): LineData[] => {
  const result: LineData[] = [];
  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += candles[i - j].close;
    }
    result.push({
      time: candles[i].time,
      value: sum / period,
    });
  }
  return result;
};

export const calculateEMA = (candles: Candle[], period: number): LineData[] => {
  const result: LineData[] = [];
  if (candles.length < period) return result;

  const k = 2 / (period + 1);
  
  // Start with SMA for the first EMA point
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }
  let prevEma = sum / period;

  result.push({
    time: candles[period - 1].time,
    value: prevEma,
  });

  for (let i = period; i < candles.length; i++) {
    const ema = (candles[i].close - prevEma) * k + prevEma;
    result.push({
      time: candles[i].time,
      value: ema,
    });
    prevEma = ema;
  }

  return result;
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};
