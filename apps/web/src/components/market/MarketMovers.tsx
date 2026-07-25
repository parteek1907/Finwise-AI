import React from 'react';
import { Search } from 'lucide-react';
import { MarketMover } from '../../types/market';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { ErrorCard } from '../common/ErrorCard';
import { formatPercentage } from '../../utils/formatters';
import styles from './Market.module.css';

interface MarketMoversProps {
  movers: MarketMover[];
  loading: boolean;
  error: string | null;
  onSelect: (symbol: string) => void;
}

export const MarketMovers: React.FC<MarketMoversProps> = ({ movers, loading, error, onSelect }) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>Market Movers</h3>
      </div>
      
      {error && <ErrorCard message={error} />}
      
      {loading && !error && <SkeletonLoader type="list" count={5} />}

      {!loading && !error && (
        <div className={styles.list}>
          {movers.map((item, i) => (
            <div key={i} className={styles.item} onClick={() => onSelect(item.symbol)}>
              <div className={styles.info}>
                <strong>{item.symbol}</strong>
                <span>{item.name}</span>
              </div>
              <div className={styles.price}>
                <strong>${item.price.toFixed(2)}</strong>
                <span className={item.isUp ? styles.positiveText : styles.negativeText}>
                  {formatPercentage(item.changePercent)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
