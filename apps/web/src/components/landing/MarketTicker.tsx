"use client";
import React, { useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import styles from './Landing.module.css';
import { useMarketStore } from '@/store/useMarketStore';

// Yahoo Finance symbols mapped to display names
const TICKER_SYMBOLS = [
  { yahoo: '^NSEI', display: 'NIFTY', type: 'number' },
  { yahoo: '^BSESN', display: 'SENSEX', type: 'number' },
  { yahoo: 'BTC-USD', display: 'BTC', type: 'currency_usd' },
  { yahoo: 'ETH-USD', display: 'ETH', type: 'currency_usd' },
  { yahoo: '^IXIC', display: 'NASDAQ', type: 'number' },
  { yahoo: 'INR=X', display: 'USD/INR', type: 'number' },
  { yahoo: 'GC=F', display: 'GOLD', type: 'currency_usd' },
  { yahoo: '^GSPC', display: 'S&P 500', type: 'number' },
];

function formatValue(value: number, type: string, currency?: string) {
  if (type === 'currency_inr') {
    if (value >= 1000000) return `₹${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value.toFixed(2)}`;
  }
  if (type === 'currency_usd') {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `$${value.toFixed(2)}`;
  }
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function MarketTicker() {
  const { quotes, subscribe, unsubscribe, initialize } = useMarketStore();

  // Subscribe to all ticker symbols on mount
  useEffect(() => {
    initialize();
    TICKER_SYMBOLS.forEach(s => subscribe(s.yahoo));
    return () => {
      TICKER_SYMBOLS.forEach(s => unsubscribe(s.yahoo));
    };
  }, [subscribe, unsubscribe, initialize]);

  // Build ticker data from store quotes
  const marketData = TICKER_SYMBOLS.map(item => {
    const quote = quotes[item.yahoo];
    if (!quote) {
      return {
        symbol: item.display,
        value: 0,
        change: '',
        trend: 'flat' as const,
        type: item.type,
        loading: true,
      };
    }

    // Determine display type based on currency
    let displayType = item.type;
    if (quote.currency === 'INR') displayType = 'currency_inr';

    const changeStr = `${quote.changePercent >= 0 ? '+' : ''}${quote.changePercent.toFixed(2)}%`;
    const trend = quote.changePercent > 0 ? 'up' : quote.changePercent < 0 ? 'down' : 'flat';

    return {
      symbol: item.display,
      value: quote.price,
      change: changeStr,
      trend: trend as 'up' | 'down' | 'flat',
      type: displayType,
      loading: false,
    };
  });

  return (
    <div className={styles.tickerContainer}>
      <div className={styles.tickerScroll}>
        {[...marketData, ...marketData, ...marketData].map((item, i) => {
          const color = item.loading ? '#555'
            : item.trend === 'up' ? '#4ade80'
            : item.trend === 'down' ? '#f87171'
            : '#A8AD9E';
          return (
            <div key={`${item.symbol}-${i}`} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              fontFamily: 'var(--font-mono), monospace',
              letterSpacing: '0.05em',
              color: '#A8AD9E',
              transition: 'color 0.3s ease'
            }}>
              <span style={{ fontWeight: 600, color: '#DDD7C9' }}>{item.symbol}</span>
              <span style={{ color }}>
                {item.loading ? '—' : formatValue(item.value, item.type)}
              </span>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: item.trend === 'up' ? '#4ade80' : item.trend === 'down' ? '#f87171' : '#A8AD9E',
                opacity: 0.8
              }}>
                {item.trend === 'up' ? <TrendingUp size={12} /> : item.trend === 'down' ? <TrendingDown size={12} /> : <Minus size={12} />}
                {item.loading ? '' : item.change}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
