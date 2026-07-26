import React from 'react';
import { Quote, Indicator } from '../../../types/market';
import { Timeframe } from '../../../constants/symbols';
import { getMarketRegion, getExchangeStatus } from '../../../utils/market-hours';
import { useSettingsStore } from '@/store/useSettingsStore';
import { CURRENCY_MAP } from '../../../utils/formatters';
import NumberFlow from '@number-flow/react';
import { ChevronDown, BarChart2 } from 'lucide-react';
import styles from './TradingChart.module.css';

interface ChartHeaderProps {
  quote: Quote | null;
  selectedTimeframe: Timeframe;
  onSelectTimeframe: (tf: Timeframe) => void;
  indicators: Indicator[];
  onToggleIndicator: (id: string) => void;
}

export const ChartHeader: React.FC<ChartHeaderProps> = ({
  quote,
  selectedTimeframe,
  onSelectTimeframe,
  indicators,
  onToggleIndicator
}) => {
  const [indicatorsOpen, setIndicatorsOpen] = React.useState(false);
  const preferredCurrency = useSettingsStore(state => state.financial?.preferredCurrency || 'USD');
  const currencyRate = CURRENCY_MAP[preferredCurrency]?.rate || 1;
  
  if (!quote) return <div className={styles.chartHeader} style={{ minHeight: '80px' }} />;

  const region = getMarketRegion(quote.exchange);
  const status = getExchangeStatus(region);
  const isPositive = quote.change >= 0;
  
  const timeframes: Timeframe[] = ['1D', '5D', '1M', '3M', '6M', '1Y', 'ALL'];

  return (
    <div className={styles.compactHeader}>
      
      {/* Left: Info & Price */}
      <div className={styles.headerLeft}>
        <div className={styles.headerInfoGroup}>
          <div className={styles.headerTitleWrap}>
            <h2 className={styles.headerSymbol}>{quote.symbol}</h2>
            <span className={styles.headerName}>{quote.name}</span>
          </div>
          <div className={styles.headerTags}>
            {quote.exchange && <span className={styles.tag}>{quote.exchange}</span>}
            {status.isOpen ? (
              <span className={`${styles.tag} ${styles.tagLive}`}>
                <span className={styles.liveDot} /> LIVE
              </span>
            ) : (
              <span className={`${styles.tag} ${styles.tagClosed}`}>CLOSED</span>
            )}
          </div>
        </div>
      </div>

      {/* Center: Live Price Block */}
      <div className={styles.headerCenter}>
        <div className={styles.headerPriceCol}>
          <div className={styles.headerPriceRow}>
            <div className={styles.headerPriceText}>
              <NumberFlow 
                value={quote.price * currencyRate} 
                format={{ style: 'currency', currency: preferredCurrency || 'USD' }} 
              />
            </div>
            <div className={isPositive ? styles.headerChangePosText : styles.headerChangeNegText}>
              <NumberFlow 
                value={quote.changePercent / 100} 
                format={{ style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: 'always' }} 
              />
            </div>
          </div>
          <div className={styles.marketStatusUnder}>
            {status.isOpen ? (
              <span className={styles.marketStatusOpen}>
                <span className={styles.liveDot} /> Market Open
              </span>
            ) : (
              <span className={styles.marketStatusClosed}>
                {status.timeUntilOpen || 'Market Closed'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Controls */}
      <div className={styles.headerRight}>
        <div className={styles.toolbarContainer}>
          <div className={styles.timeframes}>
            {timeframes.map((tf) => (
              <button
                key={tf}
                className={`${styles.timeframeBtn} ${selectedTimeframe === tf ? styles.activeTimeframe : ''}`}
                onClick={() => onSelectTimeframe(tf)}
              >
                {tf}
              </button>
            ))}
          </div>
          
          <div className={styles.divider} />

          <div className={styles.indicatorsWrapper}>
            <button 
              className={`${styles.indicatorsBtn} ${indicatorsOpen ? styles.indicatorsBtnActive : ''}`}
              onClick={() => setIndicatorsOpen(!indicatorsOpen)}
            >
              <BarChart2 size={16} />
              Indicators
              <ChevronDown size={14} />
            </button>

            {indicatorsOpen && (
              <div className={styles.indicatorsDropdown}>
                <div className={styles.indicatorsHeader}>Overlays & Studies</div>
                {indicators.map(ind => (
                  <label key={ind.id} className={styles.indicatorLabel}>
                    <input 
                      type="checkbox" 
                      checked={ind.visible}
                      onChange={() => onToggleIndicator(ind.id)}
                    />
                    <span className={styles.indicatorName}>{ind.name}</span>
                    {ind.type === 'BollingerBands' && <span className={styles.indicatorComingSoon}>SOON</span>}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
    </div>
  );
};
