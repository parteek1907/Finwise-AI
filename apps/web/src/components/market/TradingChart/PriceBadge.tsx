import React from 'react';
import NumberFlow from '@number-flow/react';
import { formatCurrency } from '../../../utils/formatters';
import styles from './TradingChart.module.css';

interface PriceBadgeProps {
  symbol: string;
  price: number;
  changePercent: number;
}

export const PriceBadge: React.FC<PriceBadgeProps> = ({ symbol, price, changePercent }) => {
  const isPositive = changePercent >= 0;
  
  return (
    <div className={styles.priceBadge}>
      <div className={styles.badgeTop}>
        <span className={styles.badgeSymbol}>{symbol}</span>
        <span className={styles.liveIndicator}>
          <span className={styles.liveDot} /> LIVE
        </span>
      </div>
      <div className={styles.badgeBottom}>
        <div className={styles.badgePrice}>
          $<NumberFlow value={price} format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />
        </div>
        <div className={isPositive ? styles.badgeChangePos : styles.badgeChangeNeg}>
          {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
        </div>
      </div>
    </div>
  );
};
