import React, { useMemo } from 'react';
import { PortfolioHolding } from '../../types/portfolio';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import { useSettingsStore } from '@/store/useSettingsStore';
import { ShieldAlert, ShieldCheck, Activity } from 'lucide-react';
import styles from './RiskAnalysis.module.css';

interface RiskAnalysisProps {
  holdings: PortfolioHolding[];
}

// Simple mapping for demo purposes. Real app would fetch this from an API.
const SECTOR_MAP: Record<string, string> = {
  AAPL: 'Technology',
  TSLA: 'Consumer Cyclical',
  NVDA: 'Technology',
  GOOGL: 'Communication',
  BTC: 'Crypto',
  ETH: 'Crypto',
  GOLD: 'Commodity',
  VOO: 'ETF (Blend)',
  QQQ: 'ETF (Tech)',
};

const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

export const RiskAnalysis: React.FC<RiskAnalysisProps> = ({ holdings }) => {
  const preferredCurrency = useSettingsStore(state => state.financial?.preferredCurrency) || 'USD';
  const exchangeRates = useSettingsStore(state => state.financial?.exchangeRates);
  const activeRate = exchangeRates ? (exchangeRates[preferredCurrency] || 1) : 1;

  const { sectorData, riskScore, riskLevel } = useMemo(() => {
    if (holdings.length === 0) return { sectorData: [], riskScore: 0, riskLevel: 'N/A' };

    const sectors: Record<string, number> = {};
    let totalVal = 0;
    
    // Crypto is very high risk (100), Tech is High (80), ETFs are low (30), etc.
    const RISK_WEIGHTS: Record<string, number> = {
      'Crypto': 100,
      'Technology': 80,
      'Consumer Cyclical': 75,
      'Communication': 70,
      'Commodity': 50,
      'ETF (Blend)': 30,
      'ETF (Tech)': 50,
      'Unknown': 75,
    };

    let totalRisk = 0;

    holdings.forEach(h => {
      const sector = SECTOR_MAP[h.symbol] || 'Unknown';
      sectors[sector] = (sectors[sector] || 0) + h.totalValue;
      totalVal += h.totalValue;
      
      const assetRisk = RISK_WEIGHTS[sector] || 75;
      totalRisk += assetRisk * h.totalValue;
    });

    const sectorData = Object.entries(sectors)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    const riskScore = totalVal > 0 ? Math.round(totalRisk / totalVal) : 0;
    let riskLevel = 'Low';
    if (riskScore > 75) riskLevel = 'Very High';
    else if (riskScore > 60) riskLevel = 'High';
    else if (riskScore > 40) riskLevel = 'Moderate';

    return { sectorData, riskScore, riskLevel };
  }, [holdings]);

  if (holdings.length === 0) {
    return (
      <div className={styles.emptyRisk}>
        <Activity size={48} className={styles.emptyIcon} />
        <h4>Not Enough Data</h4>
        <p>Buy some assets to see your portfolio risk analysis.</p>
      </div>
    );
  }

  const getRiskColor = (score: number) => {
    if (score > 75) return '#dc2626'; // Red
    if (score > 60) return '#f59e0b'; // Yellow
    return '#16a34a'; // Green
  };

  const riskColor = getRiskColor(riskScore);

  return (
    <div className={styles.riskContainer}>
      
      <div className={styles.riskHeader}>
        <div className={styles.riskScoreCard}>
          <div className={styles.scoreTop}>
            {riskScore > 75 ? (
              <ShieldAlert size={28} color={riskColor} />
            ) : (
              <ShieldCheck size={28} color={riskColor} />
            )}
            <h3>Risk Profile</h3>
          </div>
          <div className={styles.scoreBottom}>
            <span className={styles.scoreValue} style={{ color: riskColor }}>
              {riskScore}/100
            </span>
            <span className={styles.scoreLevel} style={{ backgroundColor: `${riskColor}20`, color: riskColor }}>
              {riskLevel} Risk
            </span>
          </div>
          <p className={styles.scoreDesc}>
            {riskScore > 75 
              ? 'Your portfolio is highly concentrated in volatile assets (like Crypto or Tech). Consider diversifying with broad-market ETFs to balance risk.'
              : 'Your portfolio has a balanced mix of assets. Keep monitoring to ensure it stays aligned with your goals.'}
          </p>
        </div>
      </div>

      <div className={styles.chartSection}>
        <h3>Sector Allocation</h3>
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sectorData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {sectorData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any) => formatCurrency(Number(value) * activeRate)} 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
