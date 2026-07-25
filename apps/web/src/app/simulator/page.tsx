"use client";

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './Simulator.module.css';

// Hooks
import { useMarketMovers } from '@/hooks/useMarket';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useChart } from '@/hooks/useChart';

// Components
import { MarketMovers } from '@/components/market/MarketMovers';
import { SearchBar } from '@/components/market/SearchBar';
import { TradingChart, ChartMarker } from '@/components/market/TradingChart/TradingChart';
import { TradePanel } from '@/components/trade/TradePanel';
import { PortfolioTable } from '@/components/portfolio/PortfolioTable';

// Types & Utils
import { Timeframe } from '@/constants/symbols';
import { formatCurrency } from '@/utils/formatters';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';

export default function SimulatorPage() {
  const [activeTab, setActiveTab] = useState<'Trade' | 'Portfolio'>('Trade');
  const [portfolioTab, setPortfolioTab] = useState<'Holdings' | 'History'>('Holdings');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('VOO');
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');

  // Fetch Data
  const { movers, loading: moversLoading, error: moversError } = useMarketMovers();
  const { holdings, trades, summary, loading: portfolioLoading } = usePortfolio();
  
  const {
    candles,
    quote,
    marketStatus,
    loading: chartLoading,
    error: chartError,
    refresh,
    realTimeTick
  } = useChart(selectedSymbol, timeframe);

  // Generate markers from trades for the current symbol
  const markers: ChartMarker[] = trades
    .filter(t => t.symbol === selectedSymbol)
    .map(t => {
      const isBuy = t.side === 'BUY';
      return {
        time: Math.floor(new Date(t.executedAt).getTime() / 1000),
        position: isBuy ? 'belowBar' : 'aboveBar',
        color: isBuy ? '#16a34a' : '#dc2626',
        shape: isBuy ? 'arrowUp' : 'arrowDown',
        text: `${isBuy ? 'BUY' : 'SELL'} @ $${t.executionPrice.toFixed(2)}`
      } as ChartMarker;
    })
    .sort((a, b) => (a.time as number) - (b.time as number));

  // Example educational insights (in a real app, this would be more dynamic)
  const showInsight = trades.length > 0;

  return (
    <AppLayout>
      <div className={styles.workspace}>
        
        <motion.header 
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>Virtual Market</h1>
              <p className={styles.subtitle}>Practice trading without the risk. Learn from every trade.</p>
            </div>
            
            <div className={styles.balanceCard}>
              <span className={styles.label}>Buying Power</span>
              <h2 className={styles.balance}>
                {portfolioLoading ? <div style={{width: '120px', height: '32px'}}><SkeletonLoader type="card" /></div> : formatCurrency(summary.buyingPower)}
              </h2>
            </div>
          </div>
        </motion.header>

        <motion.div 
          className={styles.layout}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          
          {/* Main Area: Chart & Trading / Portfolio */}
          <main className={styles.mainCol}>
            
            <div className={styles.tabs}>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'Trade' ? styles.activeTab : ''}`} 
                onClick={() => setActiveTab('Trade')}
              >
                Trade
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'Portfolio' ? styles.activeTab : ''}`} 
                onClick={() => setActiveTab('Portfolio')}
              >
                Portfolio
              </button>
            </div>

            <div className={styles.card}>
              {activeTab === 'Trade' && (
                <>
                  <TradingChart 
                    asset={selectedSymbol}
                    timeframe={timeframe}
                    candles={candles}
                    quote={quote}
                    marketStatus={marketStatus}
                    loading={chartLoading}
                    error={chartError}
                    onTimeframeChange={setTimeframe}
                    markers={markers}
                    realTimeTick={realTimeTick}
                  />
                  
                  {showInsight && (
                    <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#eff6ff', color: '#1d4ed8', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                      💡 <strong>FinWise Insight:</strong> You've recently traded {selectedSymbol}. Ensure this aligns with your long-term diversification strategy!
                    </div>
                  )}
                  
                  {chartLoading || portfolioLoading ? (
                    <div style={{padding: '1.5rem'}}><SkeletonLoader type="card" /></div>
                  ) : (
                    <TradePanel 
                      quote={quote} 
                      buyingPower={summary.buyingPower} 
                    />
                  )}
                </>
              )}

              {activeTab === 'Portfolio' && (
                <>
                  {portfolioLoading ? (
                    <div style={{padding: '1.5rem'}}><SkeletonLoader type="table" count={5} /></div>
                  ) : (
                    <PortfolioTable 
                      holdings={holdings}
                      trades={trades}
                      summary={summary}
                      activeTab={portfolioTab}
                      onTabChange={setPortfolioTab}
                    />
                  )}
                </>
              )}
            </div>
          </main>

          {/* Right Sidebar: Watchlist & Movers */}
          <aside className={styles.sideCol}>
            
            <div className={styles.searchSection}>
              <SearchBar onSelect={setSelectedSymbol} />
            </div>

            <MarketMovers 
              movers={movers} 
              loading={moversLoading} 
              error={moversError} 
              onSelect={setSelectedSymbol} 
            />

            <div className={styles.warningCard}>
              <AlertTriangle size={20} className={styles.warningIcon} />
              <h4>Remember</h4>
              <p>This is a simulated environment. Real markets involve significant risk. Always stick to your strategy and avoid emotional trading.</p>
            </div>
            
          </aside>
        </motion.div>
      </div>
    </AppLayout>
  );
}
