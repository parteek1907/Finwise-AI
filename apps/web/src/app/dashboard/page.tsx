"use client";

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useRouter } from 'next/navigation';
import { 
  ArrowUpRight, ArrowDownRight, MessageSquare, 
  BookOpen, Target, ShieldCheck, Play, ArrowRight,
  Search, Filter, Info, Sun, Sparkles
} from 'lucide-react';
import styles from './Dashboard.module.css';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { Gauge } from '@/components/ui/gauge';

// Static Data for Dashboard
const INSIGHTS = [
  { id: 'INS_001', type: 'Warning', desc: 'Detected lifestyle creep in dining out (+15% this month)', status: 'Action Needed', date: '17 Apr, 2026', iconColor: '#ef4444' },
  { id: 'INS_002', type: 'Insight', desc: 'You are saving more on weekdays than weekends.', status: 'Review', date: '15 Apr, 2026', iconColor: '#3b82f6' },
  { id: 'INS_003', type: 'Milestone', desc: 'Emergency fund reached 50% completion!', status: 'Achieved', date: '15 Apr, 2026', iconColor: '#22c55e' },
  { id: 'INS_004', type: 'Security', desc: 'Suspicious crypto investment text detected and blocked.', status: 'Protected', date: '14 Apr, 2026', iconColor: '#8b5cf6' },
  { id: 'INS_005', type: 'Module', desc: 'Finished "The Psychology of Debt" lesson.', status: 'Completed', date: '10 Apr, 2026', iconColor: '#eab308' },
];

const HEALTH_TREND = [
  { month: 'Jan', score: 65 },
  { month: 'Feb', score: 68 },
  { month: 'Mar', score: 70 },
  { month: 'Apr', score: 75 },
  { month: 'May', score: 74 },
  { month: 'Jun', score: 80 },
  { month: 'Jul', score: 82 },
  { month: 'Aug', score: 85 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function DashboardPage() {
  const router = useRouter();
  
  // Connect to Zustand Store
  const user = useAppStore(state => state.user);
  const goals = useAppStore(state => state.goals);
  const lessons = useAppStore(state => state.lessons);
  const mentorHistory = useAppStore(state => state.mentorHistory);

  // Derived Data
  const completedLessons = lessons.filter(l => l.status === 'Completed').length;
  const inProgressLesson = lessons.find(l => l.status === 'In Progress') || lessons[0];
  const activeGoals = goals.filter(g => g.status !== 'Planning');

  const METRICS = [
    { id: 'mentor', title: 'Mentor Sessions', value: mentorHistory.length.toString(), change: '+ 3', icon: MessageSquare, active: true },
    { id: 'modules', title: 'Modules Completed', value: completedLessons.toString(), change: '+ 1', icon: BookOpen, active: false },
    { id: 'goals', title: 'Goals on Track', value: activeGoals.length.toString(), change: '0', icon: Target, active: false },
    { id: 'scams', title: 'Scams Avoided', value: '3', change: '+ 1', icon: ShieldCheck, active: false },
  ];

  return (
    <AppLayout>
      <div className={styles.workspace}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.greetingHeader}>
            <Sun size={24} className={styles.greetingIcon} />
            <h1 className={styles.greeting}>Good morning, {user.name.split(' ')[0]}</h1>
          </div>
          <p className={styles.subtitle}>Welcome back. Let's continue building your financial foundation.</p>
        </header>

        <motion.div className={styles.grid} variants={containerVariants} initial="hidden" animate="show">
          {/* LEFT COLUMN */}
          <div className={styles.leftColumn}>
            
            {/* Financial Health Score */}
            <motion.div variants={itemVariants} className={styles.card}>
              <div className={styles.cardHeaderFlex}>
                <span className={styles.cardLabel}>Financial Health Score</span>
                <div className={styles.currencySelector}>
                  <span>Excellent</span>
                </div>
              </div>
              
              <div className={styles.balanceContainer} style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <Gauge 
                  value={user.healthScore} 
                  size={120} 
                  primary="success" 
                  showValue={true} 
                  strokeWidth={8} 
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <h2 className={styles.mainBalance}>{user.healthScore}<span style={{fontSize: '1.25rem', color: 'var(--color-text-secondary)', marginLeft: '4px'}}>/100</span></h2>
                  <div className={styles.growthBadge}>
                    <ArrowUpRight size={14} />
                    <span>5 pts</span>
                    <span className={styles.growthText}>than last month</span>
                  </div>
                </div>
              </div>

              <div className={styles.actionButtons}>
                <button className={`${styles.actionBtn} ${styles.primaryBtn}`} onClick={() => router.push('/mentor')}>
                  <Sparkles size={16} /> Talk to Mentor
                </button>
                <button className={`${styles.actionBtn} ${styles.secondaryBtn}`} onClick={() => router.push('/learn')}>
                  <Play size={16} /> Resume Learning
                </button>
              </div>

              {/* Active Milestones */}
              <div className={styles.walletsSection}>
                <div className={styles.walletsHeader}>
                  <span className={styles.cardLabel}>Active Milestones | Total {goals.length} goals</span>
                </div>
                <div className={styles.walletList}>
                  {goals.map(m => (
                    <div key={m.id} className={styles.walletItem} onClick={() => router.push(`/goals`)} style={{ cursor: 'pointer' }}>
                      <div className={styles.walletTop}>
                        <div className={styles.walletCurrency}>
                          <Target size={14} />
                          <span>{m.name}</span>
                        </div>
                      </div>
                      <div className={styles.walletBalance}>${m.current.toLocaleString()}</div>
                      <div className={styles.walletLimit}>Target is ${m.target.toLocaleString()}</div>
                      <div className={`${styles.walletStatus} ${m.status === 'On Track' || m.status === 'Ahead' ? styles.statusActive : styles.statusInactive}`}>
                        {m.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Current Module Progress */}
            <motion.div variants={itemVariants} className={styles.card} onClick={() => router.push(`/learn/${inProgressLesson.id}`)} style={{ cursor: 'pointer' }}>
              <div className={styles.cardHeaderFlex}>
                <h3 className={styles.cardTitle}>Module: {inProgressLesson.title}</h3>
                <span className={styles.cardSubtitle}>{inProgressLesson.duration}</span>
              </div>
              <div className={styles.spendingBarContainer}>
                <motion.div 
                  className={styles.spendingBarFill}
                  initial={{ width: 0 }}
                  animate={{ width: '40%' }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </div>
              <div className={styles.spendingLabels}>
                <span>In Progress</span>
                <span>40%</span>
              </div>
            </motion.div>

            {/* Action Items */}
            <motion.div variants={itemVariants} className={styles.card}>
              <div className={styles.cardHeaderFlex}>
                <h3 className={styles.cardTitle}>Upcoming Action Items</h3>
              </div>
              <div className={styles.cardsContainer}>
                <div className={`${styles.creditCard} ${styles.cardDark}`} onClick={() => router.push('/mentor')} style={{ cursor: 'pointer' }}>
                  <div className={styles.cardTopRow}>
                    <div className={styles.nfcIcon}><MessageSquare size={20} opacity={0.5}/></div>
                    <span className={styles.cardStatus}>AI Mentor</span>
                  </div>
                  <div className={styles.cardBottomRow}>
                    <div className={styles.cardData}>
                      <span>Action Required</span>
                      <strong>Review Weekend Budget</strong>
                    </div>
                  </div>
                </div>
                
                <div className={`${styles.creditCard} ${styles.cardGreen}`} onClick={() => router.push('/learn')} style={{ cursor: 'pointer' }}>
                  <div className={styles.cardTopRow}>
                    <div className={styles.nfcIcon}><BookOpen size={20} opacity={0.5}/></div>
                    <span className={styles.cardStatus}>Education</span>
                  </div>
                  <div className={styles.cardBottomRow}>
                    <div className={styles.cardData}>
                      <span>Up Next</span>
                      <strong>Delay Discounting Trap</strong>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT COLUMN */}
          <div className={styles.rightColumn}>
            
            {/* Top Row: Metrics & Chart */}
            <div className={styles.metricsChartRow}>
              
              {/* 2x2 Metrics Grid */}
              <div className={styles.metricsGrid}>
                {METRICS.map(m => (
                  <motion.div key={m.id} variants={itemVariants} className={`${styles.metricCard} ${m.active ? styles.metricActive : ''}`}>
                    <div className={styles.metricHeader}>
                      <span className={styles.cardLabel}>{m.title}</span>
                      <div className={styles.metricIconBox}>
                        <m.icon size={16} />
                      </div>
                    </div>
                    <h3 className={styles.metricValue}>{m.value}</h3>
                    <div className={styles.metricGrowth}>
                      <span className={`${styles.badge} ${m.change.includes('+') ? styles.badgeGreen : styles.badgeRed}`}>
                        {m.change.includes('+') ? <ArrowUpRight size={12} /> : m.change === '0' ? <ArrowRight size={12}/> : <ArrowDownRight size={12} />}
                        {m.change.replace('+', '').replace('-', '')}
                      </span>
                      <span className={styles.growthText}>This month</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Financial Health Trend Chart */}
              <motion.div variants={itemVariants} className={styles.card}>
                <div className={styles.cardHeaderFlex}>
                  <div>
                    <h3 className={styles.cardTitle}>Financial Health Trend</h3>
                    <p className={styles.cardSubtitle}>Your AI-calculated health score over time</p>
                  </div>
                </div>
                <div className={styles.chartLegend}>
                  <span className={styles.legendTitle}>Performance</span>
                  <div className={styles.legendItems}>
                    <span className={styles.legendItem}><div className={styles.dotGreen}></div> Score</span>
                  </div>
                </div>
                <div className={styles.chartArea}>
                  {/* Y Axis */}
                  <div className={styles.yAxis}>
                    <span>100</span>
                    <span>80</span>
                    <span>60</span>
                    <span>40</span>
                    <span>20</span>
                    <span>0</span>
                  </div>
                  {/* Chart Bars */}
                  <div className={styles.chartBars}>
                    {HEALTH_TREND.map((data, i) => (
                      <div key={i} className={styles.barGroup}>
                        <div className={styles.barContainer}>
                          <motion.div 
                            className={styles.barProfit}
                            style={{ height: `${data.score}%`, bottom: 0, width: '100%', position: 'absolute' }}
                            initial={{ height: 0 }}
                            animate={{ height: `${data.score}%` }}
                            transition={{ duration: 1, delay: 0.5 + i * 0.05 }}
                          />
                        </div>
                        <span className={styles.xAxisLabel}>{data.month}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Bottom Row: Recent Mentor Insights */}
            <motion.div variants={itemVariants} className={`${styles.card} ${styles.activitiesCard}`}>
              <div className={styles.cardHeaderFlex}>
                <h3 className={styles.cardTitle}>Recent Mentor Insights</h3>
                <div className={styles.tableActions}>
                  <div className={styles.searchBox}>
                    <Search size={16} />
                    <input type="text" placeholder="Search insights..." />
                  </div>
                  <button className={styles.filterBtn}>
                    Filter <Filter size={14} />
                  </button>
                </div>
              </div>
              
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th><input type="checkbox" /></th>
                      <th>Ref ID</th>
                      <th>Category</th>
                      <th>Insight / Description</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {INSIGHTS.map((act, i) => (
                      <tr key={i}>
                        <td><input type="checkbox" defaultChecked={i === 0} /></td>
                        <td className={styles.cellMuted}>{act.id}</td>
                        <td>
                          <div className={styles.activityNameCell}>
                            <div className={styles.activityIcon} style={{backgroundColor: `${act.iconColor}20`, color: act.iconColor}}>
                              <Info size={14} />
                            </div>
                            <span>{act.type}</span>
                          </div>
                        </td>
                        <td className={styles.cellBold}>{act.desc}</td>
                        <td>
                          <span className={styles.statusCell}>
                            <div className={styles.statusDot} style={{
                              backgroundColor: act.status === 'Achieved' || act.status === 'Protected' || act.status === 'Completed' ? '#22c55e' : act.status === 'Action Needed' ? '#ef4444' : '#3b82f6'
                            }}></div>
                            {act.status}
                          </span>
                        </td>
                        <td className={styles.cellMuted}>{act.date}</td>
                        <td><button className={styles.moreBtn} onClick={() => router.push('/mentor')}><ArrowRight size={16} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
}
