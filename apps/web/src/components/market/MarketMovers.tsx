import React from 'react';
import { Search } from 'lucide-react';
import { MarketMover } from '../../types/market';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { ErrorCard } from '../common/ErrorCard';
import { formatPercentage, formatCurrency } from '../../utils/formatters';
import { useSettingsStore } from '@/store/useSettingsStore';
import NumberFlow from '@/components/ui/ClientNumberFlow';
import styles from './Market.module.css';

const AnimatedNumberFlow = ({ value, format }: { value: number, format?: any }) => {
  const [displayValue, setDisplayValue] = React.useState(0);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(value);
    }, 50);
    return () => clearTimeout(timer);
  }, [value]);

  return <NumberFlow value={displayValue} format={format} />;
};

interface MarketMoversProps {
  movers: MarketMover[];
  loading: boolean;
  error: string | null;
  onSelect: (symbol: string) => void;
}

export const MarketMovers: React.FC<MarketMoversProps> = ({ movers, loading, error, onSelect }) => {
  const [activeTab, setActiveTab] = React.useState<'Gainers' | 'Losers' | 'Active'>('Gainers');

  const preferredCurrency = useSettingsStore(state => state.financial?.preferredCurrency || 'USD');
  const exchangeRates = useSettingsStore(state => state.financial?.exchangeRates);
  const activeRate = exchangeRates ? (exchangeRates[preferredCurrency] || 1) : 1;

  const sortedMovers = React.useMemo(() => {
    let sorted = [...movers];
    if (activeTab === 'Gainers') {
      sorted.sort((a, b) => b.changePercent - a.changePercent);
      return sorted.filter(m => m.changePercent > 0).slice(0, 5);
    } else if (activeTab === 'Losers') {
      sorted.sort((a, b) => a.changePercent - b.changePercent);
      return sorted.filter(m => m.changePercent < 0).slice(0, 5);
    } else {
      sorted.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
      return sorted.slice(0, 5);
    }
  }, [movers, activeTab]);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3>Market Movers</h3>
      </div>

      <div className={styles.moversTabs}>
        <button 
          className={activeTab === 'Gainers' ? styles.moversTabActive : styles.moversTab}
          onClick={() => setActiveTab('Gainers')}
        >
          Gainers
        </button>
        <button 
          className={activeTab === 'Losers' ? styles.moversTabActive : styles.moversTab}
          onClick={() => setActiveTab('Losers')}
        >
          Losers
        </button>
        <button 
          className={activeTab === 'Active' ? styles.moversTabActive : styles.moversTab}
          onClick={() => setActiveTab('Active')}
        >
          Active
        </button>
      </div>
      
      {error && <ErrorCard message={error} />}
      
      {loading && !error && <SkeletonLoader type="list" count={5} />}

      {!loading && !error && (
        <div className={styles.list}>
          {sortedMovers.map((item) => (
            <div key={activeTab + item.symbol} className={styles.item} onClick={() => onSelect(item.symbol)}>
              <div className={styles.info}>
                <strong>{item.symbol}</strong>
                <span>{item.name}</span>
              </div>
              <div className={styles.price}>
                <strong>
                  <AnimatedNumberFlow 
                    value={item.price * activeRate} 
                    format={{ style: 'currency', currency: preferredCurrency }} 
                  />
                </strong>
                <span className={item.isUp ? styles.positiveText : styles.negativeText}>
                  <AnimatedNumberFlow 
                    value={item.changePercent / 100} 
                    format={{ style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: 'always' }} 
                  />
                </span>
              </div>
            </div>
          ))}
          {sortedMovers.length === 0 && (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
              No {activeTab.toLowerCase()} found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
