"use client";
import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import styles from './Landing.module.css';

const initialMarketData = [
  { symbol: "NIFTY", value: 22514.65, change: "+1.24%", trend: "up", type: "number" },
  { symbol: "SENSEX", value: 74248.22, change: "+0.89%", trend: "up", type: "number" },
  { symbol: "BTC", value: 5800000, change: "+2.1%", trend: "up", type: "currency_inr" },
  { symbol: "ETH", value: 276000, change: "-0.4%", trend: "down", type: "currency_inr" },
  { symbol: "NASDAQ", value: 16428.82, change: "+0.61%", trend: "up", type: "number" },
  { symbol: "USD/INR", value: 83.45, change: "-0.12%", trend: "down", type: "number" },
  { symbol: "GOLD", value: 72400, change: "+0.2%", trend: "up", type: "currency_inr" },
  { symbol: "S&P 500", value: 5234.18, change: "+0.86%", trend: "up", type: "number" },
];

function formatValue(value: number, type: string) {
  if (type === 'currency_inr') {
    if (value >= 1000000) return `₹${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value.toFixed(2)}`;
  }
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function MarketTicker() {
  const [marketData, setMarketData] = useState(initialMarketData);
  const [flashStates, setFlashStates] = useState<Record<string, 'up' | 'down' | null>>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(current => current.map(item => {
        // Randomly update 30% of items each tick
        if (Math.random() > 0.3) return item;
        
        const changeFactor = 1 + (Math.random() * 0.002 - 0.001); // +/- 0.1% change
        const newValue = item.value * changeFactor;
        
        // Update flash state
        const direction = newValue > item.value ? 'up' : 'down';
        setFlashStates(prev => ({ ...prev, [item.symbol]: direction }));
        
        // Reset flash state after 500ms
        setTimeout(() => {
          setFlashStates(prev => ({ ...prev, [item.symbol]: null }));
        }, 500);

        return {
          ...item,
          value: newValue,
          trend: direction,
          change: `${direction === 'up' ? '+' : ''}${(Math.random() * 2).toFixed(2)}%`
        };
      }));
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.tickerContainer}>
      <div className={styles.tickerScroll}>
        {[...marketData, ...marketData, ...marketData].map((item, i) => {
          const flash = flashStates[item.symbol];
          const color = flash === 'up' ? '#4ade80' : flash === 'down' ? '#f87171' : '#A8AD9E';
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
              <span style={{ color }}>{formatValue(item.value, item.type)}</span>
              <span style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: item.trend === 'up' ? '#4ade80' : '#f87171',
                opacity: 0.8
              }}>
                {item.trend === 'up' ? <TrendingUp size={12} /> : item.trend === 'down' ? <TrendingDown size={12} /> : <Minus size={12} />}
                {item.change}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
