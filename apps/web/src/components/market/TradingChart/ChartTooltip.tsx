import React from 'react';
import { formatCurrency, formatNumber } from '../../../utils/formatters';
import styles from './TradingChart.module.css';

interface TooltipData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  x: number;
  y: number;
}

interface ChartTooltipProps {
  data: TooltipData | null;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div 
      className={styles.tooltip}
      style={{ left: data.x, top: data.y }}
    >
      <div className={styles.tooltipDate}>{data.time}</div>
      <div className={styles.tooltipRow}>
        <span className={styles.tooltipLabel}>O</span>
        <span className={styles.tooltipValue}>{formatCurrency(data.open)}</span>
      </div>
      <div className={styles.tooltipRow}>
        <span className={styles.tooltipLabel}>H</span>
        <span className={styles.tooltipValue}>{formatCurrency(data.high)}</span>
      </div>
      <div className={styles.tooltipRow}>
        <span className={styles.tooltipLabel}>L</span>
        <span className={styles.tooltipValue}>{formatCurrency(data.low)}</span>
      </div>
      <div className={styles.tooltipRow}>
        <span className={styles.tooltipLabel}>C</span>
        <span className={styles.tooltipValue}>{formatCurrency(data.close)}</span>
      </div>
      <div className={styles.tooltipRow}>
        <span className={styles.tooltipLabel}>Vol</span>
        <span className={styles.tooltipValue}>{formatNumber(data.volume)}</span>
      </div>
    </div>
  );
};
