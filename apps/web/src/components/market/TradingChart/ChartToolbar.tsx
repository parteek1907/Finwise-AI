import React from 'react';
import { Timeframe, TIMEFRAMES } from '../../../constants/symbols';
import styles from './TradingChart.module.css';

interface ChartToolbarProps {
  selectedTimeframe: Timeframe;
  onSelect: (tf: Timeframe) => void;
}

export const ChartToolbar: React.FC<ChartToolbarProps> = ({ selectedTimeframe, onSelect }) => {
  return (
    <div className={styles.toolbarContainer}>
      <div className={styles.timeframes}>
        {TIMEFRAMES.map(tf => (
          <button 
            key={tf}
            className={`${styles.timeframeBtn} ${selectedTimeframe === tf ? styles.activeTimeframe : ''}`}
            onClick={() => onSelect(tf)}
          >
            {tf}
          </button>
        ))}
      </div>
    </div>
  );
};
