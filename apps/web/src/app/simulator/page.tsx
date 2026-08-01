"use client";

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { AlertTriangle, LineChart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs } from '@/components/ui/vercel-tabs';
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
import { EducationalInsights } from '@/components/market/EducationalInsights';
import { RiskAnalysis } from '@/components/portfolio/RiskAnalysis';

// Types & Utils
import { Timeframe } from '@/constants/symbols';
import { formatCurrency } from '@/utils/formatters';
import { SkeletonLoader } from '@/components/common/SkeletonLoader';

export default function SimulatorPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'Trade' | 'Portfolio'>('Trade');
  const [portfolioTab, setPortfolioTab] = useState<'Holdings' | 'History' | 'Analytics'>('Holdings');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('VOO');
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');

  const [chartType, setChartType] = useState<'candle' | 'line' | 'area'>('candle');

  // Fetch Data
  const { movers, loading: moversLoading, error: moversError } = useMarketMovers();
  const { holdings, trades, summary, loading: portfolioLoading } = usePortfolio();
  
  const {
    candles,
    quote,
    loading: chartLoading,
    error: chartError,
    refresh,
    realTimeTick
  } = useChart(selectedSymbol, timeframe);

  // Generate markers from trades for the current symbol
  const markers: ChartMarker[] = [];

  // Example educational insights (in a real app, this would be more dynamic)
  const showInsight = trades.length > 0;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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
            <div className={styles.titleWrap}>
              <div className={styles.iconBox}>
                <LineChart size={28} color="#19533B" />
              </div>
              <div>
                <h1 className={styles.title}>Virtual Market</h1>
                <p className={styles.subtitle}>Practice trading without the risk. Learn from every trade.</p>
              </div>
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
            
            <div style={{ marginBottom: '16px' }}>
              <Tabs 
                tabs={[
                  { id: 'Trade', label: 'Trade' },
                  { id: 'Portfolio', label: 'Portfolio' }
                ]}
                activeTab={activeTab}
                onTabChange={(id) => setActiveTab(id as 'Trade' | 'Portfolio')}
              />
            </div>

            <div className={styles.card}>
              {activeTab === 'Trade' && (
                <>
                  <TradingChart 
                    asset={selectedSymbol}
                    timeframe={timeframe}
                    candles={candles}
                    quote={quote}
                    loading={chartLoading}
                    error={chartError}
                    onTimeframeChange={setTimeframe}
                    markers={markers}
                    realTimeTick={realTimeTick}
                    chartType={chartType}
                    onChartTypeChange={setChartType}
                  />
                  

                  
                  {chartLoading || portfolioLoading ? (
                    <div style={{padding: '1.5rem'}}><SkeletonLoader type="card" /></div>
                  ) : (
                    <>
                      <TradePanel 
                        quote={quote} 
                        buyingPower={summary.buyingPower} 
                      />
                      <div style={{ padding: '0 1.5rem 1.5rem 1.5rem' }}>
                        <EducationalInsights symbol={selectedSymbol} />
                      </div>
                    </>
                  )}
                </>
              )}

              {activeTab === 'Portfolio' && (
                <>
                  {portfolioLoading ? (
                    <div style={{padding: '1.5rem'}}><SkeletonLoader type="table" count={5} /></div>
                  ) : (
                    <>
                      <PortfolioTable 
                        holdings={holdings}
                        trades={trades}
                        summary={summary}
                        activeTab={portfolioTab}
                        onTabChange={setPortfolioTab as any}
                      />
                      {portfolioTab === 'Analytics' && (
                        <RiskAnalysis holdings={holdings} />
                      )}
                    </>
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
