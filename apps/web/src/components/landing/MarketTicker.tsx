"use client";
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import styles from './Landing.module.css';

const marketData = [
  { symbol: "NIFTY", value: "22,514.65", change: "+1.24%", trend: "up" },
  { symbol: "SENSEX", value: "74,248.22", change: "+0.89%", trend: "up" },
  { symbol: "BTC", value: "₹5.8M", change: "+2.1%", trend: "up" },
  { symbol: "ETH", value: "₹276K", change: "-0.4%", trend: "down" },
  { symbol: "NASDAQ", value: "16,428.82", change: "+0.61%", trend: "up" },
  { symbol: "USD/INR", value: "83.45", change: "-0.12%", trend: "down" },
  { symbol: "GOLD", value: "₹72,400", change: "+0.2%", trend: "up" },
  { symbol: "S&P 500", value: "5,234.18", change: "+0.86%", trend: "up" },
];

export function MarketTicker() {
  return (
    <div className={styles.tickerContainer}>
      <div className={styles.tickerScroll}>
        {/* We duplicate the list twice to create a seamless infinite loop */}
        {[...marketData, ...marketData, ...marketData].map((item, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            fontFamily: 'var(--font-mono), monospace',
            letterSpacing: '0.05em',
            color: '#A8AD9E',
          }}>
            <span style={{ fontWeight: 600, color: '#DDD7C9' }}>{item.symbol}</span>
            <span>{item.value}</span>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: item.trend === 'up' ? '#8A9080' : '#8A9080', // Using muted green/grey for both to keep it subtle
              opacity: 0.8
            }}>
              {item.trend === 'up' ? <TrendingUp size={12} /> : item.trend === 'down' ? <TrendingDown size={12} /> : <Minus size={12} />}
              {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
