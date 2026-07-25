import React from 'react';
import { TrendingUp, TrendingDown, LineChart } from 'lucide-react';
import { Quote } from '../../types/market';
import { Timeframe, TIMEFRAMES } from '../../constants/symbols';
import { useChartData } from '../../hooks/useMarket';
import { SkeletonLoader } from '../common/SkeletonLoader';
import { ErrorCard } from '../common/ErrorCard';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import styles from './Charts.module.css';

interface ChartCardProps {
  quote: Quote | null;
  quoteLoading: boolean;
  timeframe: Timeframe;
  onTimeframeChange: (tf: Timeframe) => void;
}

export const ChartCard: React.FC<ChartCardProps> = ({ quote, quoteLoading, timeframe, onTimeframeChange }) => {
  const { data: chartData, loading: chartLoading, error: chartError } = useChartData(quote?.symbol || '', timeframe);

  if (quoteLoading) {
    return <SkeletonLoader type="chart" />;
  }

  if (!quote) {
    return <ErrorCard message="No symbol selected" />;
  }

  const isPositive = quote.change >= 0;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <h2>{quote.name} ({quote.symbol})</h2>
          <div className={styles.priceRow}>
            <span className={styles.currentPrice}>{formatCurrency(quote.price)}</span>
            <span className={isPositive ? styles.positiveChange : styles.negativeChange}>
              {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {isPositive ? '+' : ''}{formatCurrency(quote.change)} ({formatPercentage(quote.changePercent)})
            </span>
          </div>
        </div>
        <div className={styles.timeframes}>
          {TIMEFRAMES.map(tf => (
            <button 
              key={tf}
              className={timeframe === tf ? styles.activeTime : ''}
              onClick={() => onTimeframeChange(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.chartArea}>
        {chartError && <ErrorCard message={chartError} />}
        {chartLoading && !chartError && (
          <div className={styles.chartPlaceholder}>
            <div className={styles.spinner} />
          </div>
        )}
        {!chartLoading && !chartError && (
          <div className={styles.chartPlaceholder}>
            <LineChart size={48} opacity={0.1} />
            <p>Interactive Chart Ready for Lightweight Charts API</p>
            <span className={styles.dataInfo}>{chartData.length} data points loaded</span>
          </div>
        )}
      </div>
    </div>
  );
};
