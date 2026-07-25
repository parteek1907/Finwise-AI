import React from 'react';
import { PortfolioHolding, PortfolioSummary } from '../../types/portfolio';
import { Trade } from '../../types/trade';
import { formatCurrency, formatPercentage } from '../../utils/formatters';
import { EmptyState } from '../common/EmptyState';
import styles from './Portfolio.module.css';

interface PortfolioTableProps {
  holdings: PortfolioHolding[];
  trades: Trade[];
  summary: PortfolioSummary;
  activeTab: 'Holdings' | 'History';
  onTabChange: (tab: 'Holdings' | 'History') => void;
}

export const PortfolioTable: React.FC<PortfolioTableProps> = ({ 
  holdings, 
  trades,
  summary,
  activeTab,
  onTabChange
}) => {

  return (
    <div className={styles.portfolioView}>
      <div className={styles.portStats}>
        <div className={styles.statBox}>
          <span>Total Value</span>
          <h3>{formatCurrency(summary.totalValue)}</h3>
        </div>
        <div className={styles.statBox}>
          <span>Total Return</span>
          <h3 className={summary.totalReturn >= 0 ? styles.positiveText : styles.negativeText}>
            {formatCurrency(summary.totalReturn)} ({formatPercentage(summary.totalReturnPercent)})
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
                    <th>Total Return</th>
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
                      <td>{formatCurrency(pos.currentPrice)}</td>
                      <td className={pos.totalReturn >= 0 ? styles.positiveText : styles.negativeText}>
                        {formatCurrency(pos.totalReturn)}
                        <span className={styles.percentText}>({formatPercentage(pos.totalReturnPercent)})</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
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
                  {trades.map((trade, i) => (
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
