import React from 'react';
import { formatCurrency, CURRENCY_MAP } from '../../../utils/formatters';
import { useSettingsStore } from '@/store/useSettingsStore';
import NumberFlow from '@number-flow/react';
import styles from './TradingChart.module.css';

interface PriceBadgeProps {
  symbol: string;
  price: number;
  changePercent: number;
}

export const PriceBadge: React.FC<PriceBadgeProps> = ({ symbol, price, changePercent }) => {
  const preferredCurrency = useSettingsStore(state => state.financial?.preferredCurrency || 'USD');
  const currencyRate = CURRENCY_MAP[preferredCurrency]?.rate || 1;
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
          <NumberFlow 
            value={price * currencyRate} 
            format={{ style: 'currency', currency: preferredCurrency || 'USD' }} 
          />
        </div>
        <div className={isPositive ? styles.badgeChangePos : styles.badgeChangeNeg}>
          <NumberFlow 
            value={changePercent / 100} 
            format={{ style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: 'always' }} 
          />
        </div>
      </div>
    </div>
  );
};
