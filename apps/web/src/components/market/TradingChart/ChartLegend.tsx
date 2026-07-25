import React from 'react';
import { Quote, MarketStatus } from '../../../types/market';
import { formatCurrency, formatPercentage } from '../../../utils/formatters';
import styles from './TradingChart.module.css';

interface ChartLegendProps {
  quote: Quote | null;
  status: MarketStatus | null;
}

export const ChartLegend: React.FC<ChartLegendProps> = ({ quote, status }) => {
  if (!quote) return null;
  
  const isPositive = quote.change >= 0;

  return (
    <div className={styles.legendContainer}>
      <div className={styles.legendTitle}>
        <h2>{quote.name}</h2>
        <span className={styles.legendExchange}>NASDAQ</span>
      </div>
    </div>
  );
};
