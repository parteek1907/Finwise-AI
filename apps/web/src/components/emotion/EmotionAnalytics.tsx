import React from 'react';
import { EmotionStats } from '../../types/emotion';
import styles from './EmotionAnalytics.module.css';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface EmotionAnalyticsProps {
  stats: EmotionStats;
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

export const EmotionAnalytics: React.FC<EmotionAnalyticsProps> = ({ stats }) => {
  // Format Data for Pie Chart
  const pieData = Object.entries(stats.emotionDistribution).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value);

  // Format Data for Bar Chart
  const barData = Object.entries(stats.biasFrequencies).map(([name, value]) => ({
    name,
    count: value
  })).sort((a, b) => b.count - a.count).slice(0, 5); // top 5

  return (
    <div className={styles.analyticsContainer}>
      
      {/* Top Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Analyses</div>
          <div className={styles.statValue}>{stats.totalAnalyses}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Most Common Emotion</div>
          <div className={styles.statValue}>{stats.mostCommonEmotion || 'N/A'}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Avg Confidence</div>
          <div className={styles.statValue}>{stats.averageConfidence}%</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Avg Risk</div>
          <div className={styles.statValue}>{stats.averageRisk}</div>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        
        {/* Emotion Distribution */}
        <div className={styles.chartCard}>
          <h3>Emotion Distribution</h3>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={380}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: any) => [`${value} instances`, 'Count']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bias Frequency */}
        <div className={styles.chartCard}>
          <h3>Top Behavioral Biases</h3>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={380}>
              <BarChart
                data={barData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 14, fill: '#4b5563', fontWeight: 500 }} width={140} />
                <RechartsTooltip 
                  cursor={{ fill: '#f9fafb' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={48}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emotion Trend */}
        <div className={`${styles.chartCard} ${styles.fullWidth}`}>
          <h3>Confidence Trend</h3>
          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.emotionTrend} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="id" tickFormatter={(val) => stats.emotionTrend.find(d => d.id === val)?.date || val} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} domain={[0, 100]} />
                <RechartsTooltip 
                  labelFormatter={(val) => stats.emotionTrend.find(d => d.id === val)?.date || val}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
                />
                <Line type="monotone" dataKey="confidence" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
