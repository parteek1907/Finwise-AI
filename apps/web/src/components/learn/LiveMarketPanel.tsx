import React, { useState, useEffect } from 'react';
import { TradingChart } from '../market/TradingChart/TradingChart';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, ChevronRight } from 'lucide-react';
import styles from './LiveMarketPanel.module.css';

interface LiveMarketPanelProps {
  lessonId: string;
  onExplainChart: () => void;
  onPractice: () => void;
}

export const LiveMarketPanel: React.FC<LiveMarketPanelProps> = ({ lessonId, onExplainChart, onPractice }) => {
  const [candles, setCandles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // We mock the asset as AAPL for the lab for now
  const asset = 'AAPL';

  const generateMockCandles = (symbol: string, startPrice: number, count: number) => {
    const data = [];
    let currentPrice = startPrice;
    let timeDate = new Date('2023-01-01T00:00:00Z');
    
    for (let i = 0; i < count; i++) {
      const open = currentPrice;
      const close = open + (Math.random() - 0.5) * 5;
      const high = Math.max(open, close) + Math.random() * 2;
      const low = Math.min(open, close) - Math.random() * 2;
      const volume = Math.floor(Math.random() * 10000) + 1000;
      
      const timeStr = timeDate.toISOString().split('T')[0];
      data.push({ time: timeStr, open, high, low, close, volume });
      
      timeDate.setDate(timeDate.getDate() + 1);
      currentPrice = close;
    }
    return data;
  };

  useEffect(() => {
    // Generate some mock 1D candles
    const data = generateMockCandles(asset, 150, 100);
    setCandles(data);
    setLoading(false);
  }, [asset]);

  const quote = {
    price: candles.length > 0 ? candles[candles.length - 1].close : 150,
    change: 2.5,
    changePercent: 1.6,
  };

  return (
    <div className={styles.panelContainer}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <TrendingUp size={18} className={styles.icon} />
          <span className={styles.title}>{lessonId === 'lab1' ? 'Market Trend Observation' : 'Live Market'}</span>
        </div>
        <span className={styles.liveBadge}>LIVE</span>
      </div>

      <div className={styles.chartArea}>
        <TradingChart
          asset={asset}
          timeframe="1D"
          candles={candles}
          quote={quote}
          loading={loading}
          error={null}
          onTimeframeChange={() => {}}
          chartType={lessonId === 'lab1' ? 'line' : 'candle'}
          hideHeader={lessonId === 'lab1'}
          hidePriceScale={lessonId === 'lab1'}
          hideIndicators={lessonId === 'lab1'}
        />
      </div>

      <div className={styles.actionArea}>
        <button className={styles.explainBtn} onClick={onExplainChart}>
          <Sparkles size={16} /> Explain This Chart
        </button>
      </div>
    </div>
  );
};
