"use client";

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { LineChart, TrendingUp, TrendingDown, Clock, Search, BookOpen, AlertTriangle } from 'lucide-react';
import styles from './Simulator.module.css';
import { motion } from 'framer-motion';

const MARKET_DATA = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: '$173.50', change: '+1.2%', up: true },
  { symbol: 'VOO', name: 'Vanguard S&P 500', price: '$410.20', change: '+0.5%', up: true },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: '$202.10', change: '-2.4%', up: false },
  { symbol: 'BTC', name: 'Bitcoin', price: '$64,200', change: '+5.1%', up: true },
];

const PORTFOLIO = [
  { symbol: 'VOO', shares: 5, avgPrice: 400.00, currentPrice: 410.20 },
  { symbol: 'AAPL', shares: 10, avgPrice: 180.00, currentPrice: 173.50 },
];

export default function SimulatorPage() {
  const [activeTab, setActiveTab] = useState('Trade');
  
  const portfolioValue = PORTFOLIO.reduce((acc, pos) => acc + (pos.shares * pos.currentPrice), 0);
  const totalReturn = PORTFOLIO.reduce((acc, pos) => acc + (pos.shares * (pos.currentPrice - pos.avgPrice)), 0);

  return (
    <AppLayout>
      <div className={styles.workspace}>
        
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>Virtual Market</h1>
              <p className={styles.subtitle}>Practice trading without the risk. Learn from every trade.</p>
            </div>
            
            <div className={styles.balanceCard}>
              <span className={styles.label}>Buying Power</span>
              <h2 className={styles.balance}>$10,000.00</h2>
            </div>
          </div>
        </header>

        <div className={styles.layout}>
          
          {/* Main Area: Chart & Trading */}
          <main className={styles.mainCol}>
            
            <div className={styles.tabs}>
              <button className={`${styles.tabBtn} ${activeTab === 'Trade' ? styles.activeTab : ''}`} onClick={() => setActiveTab('Trade')}>Trade</button>
              <button className={`${styles.tabBtn} ${activeTab === 'Portfolio' ? styles.activeTab : ''}`} onClick={() => setActiveTab('Portfolio')}>Portfolio</button>
              <button className={`${styles.tabBtn} ${activeTab === 'History' ? styles.activeTab : ''}`} onClick={() => setActiveTab('History')}>Trade History</button>
            </div>

            <div className={styles.card}>
              {activeTab === 'Trade' && (
                <>
                  <div className={styles.chartHeader}>
                    <div>
                      <h2>Vanguard S&P 500 ETF (VOO)</h2>
                      <div className={styles.priceRow}>
                        <span className={styles.currentPrice}>$410.20</span>
                        <span className={styles.positiveChange}><TrendingUp size={16}/> +$2.05 (0.50%)</span>
                      </div>
                    </div>
                    <div className={styles.timeframes}>
                      <button>1D</button>
                      <button className={styles.activeTime}>1W</button>
                      <button>1M</button>
                      <button>1Y</button>
                    </div>
                  </div>

                  {/* Mock Chart Area */}
                  <div className={styles.chartArea}>
                    <div className={styles.chartPlaceholder}>
                      <LineChart size={48} opacity={0.1} />
                      <p>Interactive Chart Component</p>
                    </div>
                  </div>

                  {/* Order Entry */}
                  <div className={styles.orderEntry}>
                    <div className={styles.orderType}>
                      <button className={styles.activeType}>Buy</button>
                      <button>Sell</button>
                    </div>
                    <div className={styles.orderInputs}>
                      <div className={styles.inputGroup}>
                        <label>Shares</label>
                        <input type="number" defaultValue="1" />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Market Price</label>
                        <input type="text" value="$410.20" readOnly />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Estimated Total</label>
                        <input type="text" value="$410.20" readOnly className={styles.totalInput} />
                      </div>
                    </div>
                    
                    {/* Educational Reflection Check */}
                    <div className={styles.reflectionCheck}>
                      <div className={styles.reflectionHeader}>
                        <BookOpen size={16} />
                        <h4>Trade Reflection Required</h4>
                      </div>
                      <textarea placeholder="Why are you making this trade? What is your thesis?" rows={2}></textarea>
                    </div>

                    <button className={styles.submitOrderBtn}>Submit Order</button>
                  </div>
                </>
              )}

              {activeTab === 'Portfolio' && (
                <div className={styles.portfolioView}>
                  <div className={styles.portStats}>
                    <div className={styles.statBox}>
                      <span>Total Value</span>
                      <h3>${portfolioValue.toLocaleString()}</h3>
                    </div>
                    <div className={styles.statBox}>
                      <span>Total Return</span>
                      <h3 className={totalReturn >= 0 ? styles.positiveText : styles.negativeText}>
                        {totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(2)}
                      </h3>
                    </div>
                  </div>
                  
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
                      {PORTFOLIO.map((pos, i) => {
                        const returnVal = (pos.currentPrice - pos.avgPrice) * pos.shares;
                        return (
                          <tr key={i}>
                            <td><strong>{pos.symbol}</strong></td>
                            <td>{pos.shares}</td>
                            <td>${pos.avgPrice.toFixed(2)}</td>
                            <td>${pos.currentPrice.toFixed(2)}</td>
                            <td className={returnVal >= 0 ? styles.positiveText : styles.negativeText}>
                              {returnVal >= 0 ? '+' : ''}${returnVal.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </main>

          {/* Right Sidebar: Watchlist */}
          <aside className={styles.sideCol}>
            <div className={styles.card}>
              <div className={styles.watchlistHeader}>
                <h3>Market Movers</h3>
                <Search size={16} className={styles.searchIcon} />
              </div>
              <div className={styles.watchlist}>
                {MARKET_DATA.map((item, i) => (
                  <div key={i} className={styles.watchItem}>
                    <div className={styles.watchInfo}>
                      <strong>{item.symbol}</strong>
                      <span>{item.name}</span>
                    </div>
                    <div className={styles.watchPrice}>
                      <strong>{item.price}</strong>
                      <span className={item.up ? styles.positiveText : styles.negativeText}>
                        {item.change}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.warningCard}>
              <AlertTriangle size={20} className={styles.warningIcon} />
              <h4>Remember</h4>
              <p>This is a simulated environment. Real markets involve significant risk. Always stick to your strategy and avoid emotional trading.</p>
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}
