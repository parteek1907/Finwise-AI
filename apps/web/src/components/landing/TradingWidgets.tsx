"use client";
import React from 'react';
import { ArrowUpRight, ArrowDownRight, Activity, ShieldAlert, PieChart, TrendingUp, Info } from 'lucide-react';

export const WatchlistWidget = () => (
  <div style={{
    background: 'rgba(221,215,201,0.02)',
    border: '1px solid rgba(221,215,201,0.1)',
    borderRadius: '12px',
    padding: '16px',
    width: '100%',
    maxWidth: '240px',
    fontFamily: 'var(--font-sans)',
  }}>
    <div style={{ fontSize: '11px', fontWeight: 600, color: '#A8AD9E', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
      Watchlist
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {[
        { name: 'Apple', symbol: 'AAPL', change: '+1.2%', up: true },
        { name: 'Bitcoin', symbol: 'BTC', change: '+2.6%', up: true },
        { name: 'Gold', symbol: 'XAU', change: '-0.4%', up: false },
        { name: 'NIFTY 50', symbol: 'NIFTY', change: '+0.9%', up: true },
      ].map((item, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#DDD7C9' }}>{item.name}</div>
            <div style={{ fontSize: '11px', color: '#7A8178' }}>{item.symbol}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: item.up ? '#8A9080' : '#8A9080' }}>
            {item.change}
            {item.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SentimentGauge = () => (
  <div style={{
    background: 'transparent',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  }}>
    <div style={{
      width: '48px', height: '48px', borderRadius: '50%',
      background: 'conic-gradient(#C4B896 0% 68%, rgba(221,215,201,0.1) 68% 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative'
    }}>
      <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#303A3C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#DDD7C9' }}>68</span>
      </div>
    </div>
    <div>
      <div style={{ fontSize: '11px', fontWeight: 600, color: '#A8AD9E', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
        Market Sentiment
      </div>
      <div style={{ fontSize: '15px', color: '#DDD7C9', fontWeight: 500 }}>
        Greed
      </div>
    </div>
  </div>
);

export const AIInsightCard = () => (
  <div style={{
    background: 'rgba(48,58,60,0.03)',
    border: '1px solid rgba(48,58,60,0.1)',
    borderRadius: '12px',
    padding: '24px',
    width: '100%',
    transition: 'transform 300ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 300ms ease',
    cursor: 'default',
  }}
  className="insight-card-hover"
  >
    <style>{`
      .insight-card-hover:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(48,58,60,0.05); }
    `}</style>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
      <Activity size={16} color="#303A3C" />
      <span style={{ fontSize: '11px', fontWeight: 600, color: '#5A6460', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Today's AI Insight</span>
    </div>
    <div style={{ fontSize: '18px', fontWeight: 500, color: '#303A3C', lineHeight: 1.4, marginBottom: '24px' }}>
      Technology stocks remain resilient despite macroeconomic pressures. Expected consolidation.
    </div>
    <div style={{ display: 'flex', gap: '24px' }}>
      <div>
        <div style={{ fontSize: '11px', color: '#8A9080', marginBottom: '4px' }}>Risk Level</div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#303A3C' }}>Medium</div>
      </div>
      <div>
        <div style={{ fontSize: '11px', color: '#8A9080', marginBottom: '4px' }}>Confidence</div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#303A3C' }}>89%</div>
      </div>
    </div>
  </div>
);

export const PortfolioPreview = () => (
  <div style={{
    background: 'rgba(221,215,201,0.02)',
    border: '1px solid rgba(221,215,201,0.1)',
    borderRadius: '12px',
    padding: '20px',
    width: '100%',
    maxWidth: '280px',
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
      <div>
        <div style={{ fontSize: '11px', fontWeight: 600, color: '#A8AD9E', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '4px' }}>
          Portfolio Value
        </div>
        <div style={{ fontSize: '24px', fontWeight: 600, color: '#DDD7C9', fontFamily: 'var(--font-heading)' }}>
          $12,450.00
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#8A9080', background: 'rgba(196,184,150,0.1)', padding: '4px 8px', borderRadius: '100px' }}>
        <TrendingUp size={12} />
        +14.2%
      </div>
    </div>
    
    {/* Mini Line Chart Mock */}
    <div style={{ height: '40px', width: '100%', position: 'relative', borderBottom: '1px solid rgba(221,215,201,0.1)', marginBottom: '16px' }}>
      <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: '100%', height: '100%', stroke: '#C4B896', strokeWidth: 2, fill: 'none', vectorEffect: 'non-scaling-stroke' }}>
        <path d="M0 30 Q 20 25, 40 15 T 70 10 T 100 5" />
      </svg>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <PieChart size={16} color="#A8AD9E" />
      <span style={{ fontSize: '13px', color: '#A8AD9E' }}>High Diversification</span>
    </div>
  </div>
);
