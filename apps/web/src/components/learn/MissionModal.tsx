import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, X, CheckCircle2, ChevronRight } from 'lucide-react';
import { TradingChart } from '../market/TradingChart/TradingChart';
import styles from './MissionModal.module.css';

interface MissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mission: any;
  onComplete: () => void;
}

export const MissionModal: React.FC<MissionModalProps> = ({ isOpen, onClose, mission, onComplete }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Generate deterministic mock data for the 4 charts so they don't re-render wildly
  const [mockCharts] = useState(() => {
    const generateTrend = (trendType: 'up' | 'down' | 'sideways') => {
      const data = [];
      let currentPrice = 100;
      let timeDate = new Date('2023-01-01T00:00:00Z');
      for (let i = 0; i < 30; i++) {
        let change = (Math.random() - 0.5) * 2;
        if (trendType === 'up') change += 0.8;
        if (trendType === 'down') change -= 0.8;
        currentPrice += change;
        data.push({ time: timeDate.toISOString().split('T')[0], close: currentPrice, volume: 1000 });
        timeDate.setDate(timeDate.getDate() + 1);
      }
      return data;
    };

    return [
      { symbol: 'AAPL', data: generateTrend('down'), isWinner: false },
      { symbol: 'TSLA', data: generateTrend('sideways'), isWinner: false },
      { symbol: 'NVDA', data: generateTrend('up'), isWinner: true },
      { symbol: 'AMZN', data: generateTrend('down'), isWinner: false },
    ];
  });

  if (!isOpen || !mission) return null;

  const handleAction = () => {
    setErrorMsg(null);
    if (mission.type === 'observation' && selectedOption !== null) {
      if (selectedOption === mission.answerIndex) {
        setIsSuccess(true);
      } else {
        setErrorMsg("Not quite right. Look closer at the chart!");
      }
    } else if (mission.type === 'action' || mission.type === 'trade_setup') {
      // Mock validation for now
      setIsSuccess(true);
    }
  };

  const handleFinish = () => {
    onComplete();
    setIsSuccess(false);
    setSelectedOption(null);
  };

  return (
    <AnimatePresence>
      <div className={styles.overlay}>
        <motion.div 
          className={styles.modal}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
        >
          <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
          
          <div className={styles.header}>
            <div className={styles.iconBox}>
              <Target size={24} color="#3b82f6" />
            </div>
            <h2>{mission.title}</h2>
          </div>

          <div className={styles.content}>
            {!isSuccess ? (
              <>
                <p className={styles.prompt}>{mission.prompt}</p>
                
                {mission.type === 'observation' && mission.options && (
                  <div className={styles.options}>
                    {mission.options.map((opt: string, idx: number) => (
                      <button 
                        key={idx}
                        className={`${styles.optionBtn} ${selectedOption === idx ? styles.selected : ''}`}
                        onClick={() => setSelectedOption(idx)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {mission.type === 'action' && mission.validation === 'find_gainer' && (
                  <div style={{ marginTop: '16px' }}>
                    <p style={{marginBottom: '16px', color: '#6b7280', fontSize: '14px'}}>Select a stock chart that shows an uptrend of &gt; 2%:</p>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                      {mockCharts.map((stock) => (
                        <div 
                          key={stock.symbol}
                          onClick={() => {
                            setErrorMsg(null);
                            if (stock.isWinner) {
                              setIsSuccess(true);
                            } else {
                              setErrorMsg("This stock isn't showing a strong uptrend. Keep looking!");
                            }
                          }}
                          style={{
                            border: '2px solid #e5e7eb', borderRadius: '12px', background: 'white',
                            cursor: 'pointer', transition: 'all 0.2s', overflow: 'hidden',
                            display: 'flex', flexDirection: 'column'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = '#3b82f6';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.1)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = '#e5e7eb';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          <div style={{ padding: '8px 12px', borderBottom: '1px solid #e5e7eb', fontWeight: 600, fontSize: '13px', background: '#f9fafb' }}>
                            {stock.symbol}
                          </div>
                          <div style={{ height: '120px', width: '100%' }}>
                            <TradingChart
                              asset={stock.symbol}
                              timeframe="1D"
                              candles={stock.data}
                              quote={{}}
                              loading={false}
                              error={null}
                              onTimeframeChange={() => {}}
                              chartType="line"
                              hideHeader={true}
                              hidePriceScale={true}
                              hideIndicators={true}
                              hideTooltip={true}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {((mission.type === 'action' && mission.validation !== 'find_gainer') || mission.type === 'trade_setup') && (
                  <div className={styles.mockTerminal}>
                    <p>Virtual Market connected.</p>
                    <button className={styles.simulateBtn} onClick={handleAction}>
                      Simulate Trade Execution
                    </button>
                  </div>
                )}

                {errorMsg && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    style={{ marginTop: '16px', padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#ef4444', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    <X size={16} /> {errorMsg}
                  </motion.div>
                )}

                {mission.type === 'observation' && (
                  <button 
                    className={styles.submitBtn} 
                    onClick={handleAction}
                    disabled={selectedOption === null}
                  >
                    Submit Analysis
                  </button>
                )}
              </>
            ) : (
              <div className={styles.successState}>
                <CheckCircle2 size={48} color="#10b981" />
                <h3>Mission Accomplished!</h3>
                <p>Great job! You've successfully applied this concept.</p>
                <button className={styles.continueBtn} onClick={handleFinish}>
                  Continue Lesson <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
