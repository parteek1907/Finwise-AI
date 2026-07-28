import React, { useState } from 'react';
import { PortfolioHolding, PortfolioSummary } from '../../types/portfolio';
import { Trade } from '../../types/trade';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { useSettingsStore } from '@/store/useSettingsStore';
import NumberFlow from '@/components/ui/ClientNumberFlow';
import { EmptyState } from '../common/EmptyState';
import { SellModal } from './SellModal';
import styles from './Portfolio.module.css';

interface PortfolioTableProps {
  holdings: PortfolioHolding[];
  trades: Trade[];
  summary: PortfolioSummary;
  activeTab: 'Holdings' | 'History' | 'Analytics';
  onTabChange: (tab: 'Holdings' | 'History' | 'Analytics') => void;
}

export const PortfolioTable: React.FC<PortfolioTableProps> = ({ 
  holdings, 
  trades,
  summary,
  activeTab,
  onTabChange
}) => {
  const [sellingHolding, setSellingHolding] = useState<PortfolioHolding | null>(null);
  const [tradeFilter, setTradeFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  
  const preferredCurrency = useSettingsStore(state => state.financial?.preferredCurrency) || 'USD';
  const exchangeRates = useSettingsStore(state => state.financial?.exchangeRates);
  const activeRate = exchangeRates ? (exchangeRates[preferredCurrency] || 1) : 1;

  const filteredTrades = trades.filter(t => tradeFilter === 'ALL' || t.side === tradeFilter);

  return (
    <div className={styles.portfolioView}>
      <div className={styles.portStats}>
        <div className={styles.statBox}>
          <span>Total Value</span>
          <h3>
            <NumberFlow 
              value={summary.totalValue * activeRate} 
              format={{ style: 'currency', currency: preferredCurrency }} 
            />
          </h3>
        </div>
        <div className={styles.statBox}>
          <span>Total Return</span>
          <h3 className={summary.totalReturn >= 0 ? styles.positiveText : styles.negativeText}>
            <NumberFlow 
              value={summary.totalReturn * activeRate} 
              format={{ style: 'currency', currency: preferredCurrency, signDisplay: 'always' }} 
            /> 
            {' '}
            <span style={{ whiteSpace: 'nowrap' }}>
              (<NumberFlow 
                value={summary.totalReturnPercent / 100} 
                format={{ style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: 'always' }} 
              />)
            </span>
          </h3>
        </div>
      </div>
      
      <div className={styles.tabToggle}>
        <button 
          className={activeTab === 'Holdings' ? styles.activeTab : ''}
          onClick={() => onTabChange('Holdings')}
        >
          Holdings
        </button>
        <button 
          className={activeTab === 'History' ? styles.activeTab : ''}
          onClick={() => onTabChange('History')}
        >
          Trade History
        </button>
        <button 
          className={activeTab === 'Analytics' ? styles.activeTab : ''}
          onClick={() => onTabChange('Analytics')}
        >
          Analytics
        </button>
      </div>

      {activeTab === 'Holdings' && (
        <>
          {holdings.length === 0 ? (
            <div className={styles.emptyContainer}>
              <EmptyState 
                type="portfolio"
                title="No holdings yet"
                description="Search for a stock and make your first simulated trade."
              />
            </div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Shares</th>
                    <th>Avg Price</th>
                    <th>Current Price</th>
                    <th>Allocation</th>
                    <th>Today's P/L</th>
                    <th>Total Return</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((pos, i) => (
                    <tr key={i}>
                      <td>
                        <strong>{pos.symbol}</strong>
                        <span className={styles.assetName}>{pos.name}</span>
                      </td>
                      <td>{pos.shares}</td>
                      <td>{formatCurrency(pos.averagePrice)}</td>
                      <td>
                        <NumberFlow 
                          value={pos.currentPrice * activeRate} 
                          format={{ style: 'currency', currency: preferredCurrency }} 
                        />
                      </td>
                      <td>
                        <NumberFlow 
                          value={pos.allocationPercent / 100} 
                          format={{ style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }} 
                        />
                      </td>
                      <td className={pos.todaysReturn >= 0 ? styles.positiveText : styles.negativeText}>
                        <NumberFlow 
                          value={pos.todaysReturn * activeRate} 
                          format={{ style: 'currency', currency: preferredCurrency, signDisplay: 'always' }} 
                        />
                        <span className={styles.percentText}>
                          (<NumberFlow 
                            value={pos.todaysReturnPercent / 100} 
                            format={{ style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: 'always' }} 
                          />)
                        </span>
                      </td>
                      <td className={pos.totalReturn >= 0 ? styles.positiveText : styles.negativeText}>
                        <NumberFlow 
                          value={pos.totalReturn * activeRate} 
                          format={{ style: 'currency', currency: preferredCurrency, signDisplay: 'always' }} 
                        />
                        <span className={styles.percentText}>
                          (<NumberFlow 
                            value={pos.totalReturnPercent / 100} 
                            format={{ style: 'percent', minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: 'always' }} 
                          />)
                        </span>
                      </td>
                      <td>
                        <button 
                          className={styles.sellActionBtn}
                          onClick={() => setSellingHolding(pos)}
                        >
                          Sell
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {sellingHolding && (
        <SellModal 
          holding={sellingHolding}
          onClose={() => setSellingHolding(null)}
          onSuccess={() => setSellingHolding(null)}
        />
      )}

      {activeTab === 'History' && (
        <>
          {trades.length === 0 ? (
            <div className={styles.emptyContainer}>
              <EmptyState 
                type="trades"
                title="No trades yet"
                description="Your trade history will appear here once you execute an order."
              />
            </div>
          ) : (
            <div className={styles.tableWrapper}>
                <div className={styles.tableHeaderSection}>
                  <h3 className={styles.tableTitle}>Trade History</h3>
                  <select 
                    className={styles.filterSelect}
                    value={tradeFilter}
                    onChange={(e) => setTradeFilter(e.target.value as any)}
                  >
                    <option value="ALL">All Trades</option>
                    <option value="BUY">Buy Only</option>
                    <option value="SELL">Sell Only</option>
                  </select>
                </div>
                
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Asset</th>
                      <th>Side</th>
                      <th>Shares</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrades.map((trade, i) => (
                      <tr key={i}>
                        <td>{new Date(trade.executedAt).toLocaleDateString()}</td>
                        <td><strong>{trade.symbol}</strong></td>
                        <td>
                          <span className={trade.side === 'BUY' ? styles.buyBadge : styles.sellBadge}>
                            {trade.side}
                          </span>
                        </td>
                        <td>{trade.quantity}</td>
                        <td>{formatCurrency(trade.executionPrice)}</td>
                        <td>{formatCurrency(trade.totalValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};
