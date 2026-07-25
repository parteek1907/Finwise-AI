import React, { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { Indicator } from '../../../types/market';
import styles from './TradingChart.module.css';

interface IndicatorsMenuProps {
  indicators: Indicator[];
  onToggle: (id: string) => void;
}

export const IndicatorsMenu: React.FC<IndicatorsMenuProps> = ({ indicators, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.indicatorsWrapper}>
      <button 
        className={`${styles.indicatorsBtn} ${isOpen ? styles.indicatorsBtnActive : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Settings2 size={16} />
        Indicators
      </button>

      {isOpen && (
        <div className={styles.indicatorsDropdown}>
          <div className={styles.indicatorsHeader}>Technical Indicators</div>
          {indicators.map(ind => (
            <label key={ind.id} className={styles.indicatorLabel}>
              <input 
                type="checkbox" 
                checked={ind.visible} 
                onChange={() => onToggle(ind.id)}
              />
              <span className={styles.indicatorName}>
                {ind.name}
                {ind.period && ` (${ind.period})`}
              </span>
              {!['SMA', 'EMA', 'Volume'].includes(ind.type) && (
                <span className={styles.indicatorComingSoon}>Soon</span>
              )}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
