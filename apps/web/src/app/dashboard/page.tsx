"use client";

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { formatCurrency, formatCurrencyRaw } from '@/utils/formatters';
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { motion } from 'framer-motion';
import NumberFlow from "@/components/ui/ClientNumberFlow";
import { 
  ArrowUpRight, 
  MessageSquare,
  BookOpen,
  Target,
  ShieldCheck,
  Video, 
  Play, 
  Pause,
  AlertCircle,
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import styles from './Dashboard.module.css';

// Generate 30 days of denser data for a more professional look
const HEALTH_TREND = Array.from({ length: 30 }).map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    score: Math.floor(65 + (i * 0.8) + (Math.random() * 10 - 5))
  };
});

const chartConfig = {
  score: {
    label: "Health Score",
    color: "#19533B",
  },
} satisfies ChartConfig;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showNumbers, setShowNumbers] = useState(false);
  const [chartData, setChartData] = useState(HEALTH_TREND.map(d => ({ ...d, score: 0 })));
  
  // Connect to Zustand Store
  const user = useAppStore(state => state.user);
  const goals = useAppStore(state => state.goals);
  const lessons = useAppStore(state => state.lessons);
  const chats = useAppStore(state => state.chats);
  const preferredCurrency = useSettingsStore(state => state.financial?.preferredCurrency);
  const profileName = useSettingsStore(state => state.profile?.name) || user.name || 'User';

  useEffect(() => {
    setMounted(true);
    // Trigger NumberFlow animations very quickly after mount for snappy feel
    const timer = setTimeout(() => setShowNumbers(true), 150); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showNumbers) {
      let currentIdx = 0;
      // Stagger the bars growing one by one from left to right (oldest to latest)
      const interval = setInterval(() => {
        setChartData(prev => {
          const next = [...prev];
          next[currentIdx] = HEALTH_TREND[currentIdx];
          return next;
        });
        currentIdx++;
        if (currentIdx >= HEALTH_TREND.length) clearInterval(interval);
      }, 15); // very fast wave
      return () => clearInterval(interval);
    }
  }, [showNumbers]);

  // Derived Data
  const completedLessons = lessons.filter(l => l.status === 'Completed').length;
  const inProgressLesson = lessons.find(l => l.status === 'In Progress') || lessons[0];
  const activeGoals = goals.filter(g => g.status !== 'Planning');

  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const semiCircumference = circumference / 2;
  const scorePercent = mounted ? (user.healthScore / 100) * semiCircumference : 0;

  if (!mounted) return null; // Avoid hydration mismatch on initial render

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <AppLayout>
      <div className={styles.workspace}>
        {/* Header */}
        <motion.header 
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>{getGreeting()}, <span className={styles.nameBold}>{profileName.split(' ')[0]}</span></h1>
            <p className={styles.subtitle}>Welcome back. Let's continue building your financial foundation.</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.btnPrimary} onClick={() => router.push('/mentor')}>
              <Sparkles size={16} /> AI Mentor
            </button>
            <button className={styles.btnSecondary} onClick={() => router.push('/learn')}>
              Resume Learning
            </button>
          </div>
        </motion.header>

        {/* Top Metrics Row */}
        <motion.div 
          className={styles.topMetrics}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={`${styles.metricCard} ${styles.metricCardDark}`}>
            <div className={styles.metricHeader}>
              <span>Goals on Track</span>
              <div className={styles.metricIcon}><Target size={14} /></div>
            </div>
            <div className={styles.metricValue}><NumberFlow value={showNumbers ? activeGoals.length : 0} /></div>
            <div className={styles.metricChange}>
              <span className={styles.metricChangeBadge}><ArrowUpRight size={10} /> 1</span>
              <span>New goal this month</span>
            </div>
          </div>
          
          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span>Modules Completed</span>
              <div className={styles.metricIcon}><BookOpen size={14} color="#19533B" /></div>
            </div>
            <div className={styles.metricValue}><NumberFlow value={showNumbers ? completedLessons : 0} /></div>
            <div className={styles.metricChange}>
              <span className={styles.metricChangeBadge}><ArrowUpRight size={10} /> 2</span>
              <span className={styles.metricChangeText}>Finished this week</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span>Mentor Sessions</span>
              <div className={styles.metricIcon}><MessageSquare size={14} color="#19533B" /></div>
            </div>
            <div className={styles.metricValue}><NumberFlow value={showNumbers ? chats.length : 0} /></div>
            <div className={styles.metricChange}>
              <span className={styles.metricChangeBadge}><ArrowUpRight size={10} /> 5</span>
              <span className={styles.metricChangeText}>Insights generated</span>
            </div>
          </div>

          <div className={styles.metricCard}>
            <div className={styles.metricHeader}>
              <span>Scams Avoided</span>
              <div className={styles.metricIcon}><ShieldCheck size={14} color="#19533B" /></div>
            </div>
            <div className={styles.metricValue}><NumberFlow value={showNumbers ? 3 : 0} /></div>
            <div className={styles.metricChange}>
              <span className={styles.metricChangeText}>Protected successfully</span>
            </div>
          </div>
        </motion.div>

        {/* Middle Row */}
        <motion.div 
          className={styles.middleRow}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Financial Health Trend */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Financial Health Trend</h3>
            <ChartContainer config={chartConfig} className="aspect-auto h-[180px] w-full mt-4">
              <AreaChart accessibilityLayer data={chartData} margin={{ top: 10, left: -20, right: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#19533B" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#19533B" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.4} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  minTickGap={24}
                  fontSize={11}
                  stroke="#9CA3AF"
                />
                <ChartTooltip 
                  cursor={false} 
                  content={<ChartTooltipContent hideLabel className="bg-white border-[#E5E7EB] shadow-lg rounded-xl text-black font-sans" />} 
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#19533B" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                  isAnimationActive={false}
                />
              </AreaChart>
            </ChartContainer>
          </div>

          {/* Action Item */}
          <div className={`${styles.card} ${styles.reminderCard}`}>
            <h3 className={styles.cardTitle}>Upcoming Action</h3>
            <h4 className={styles.reminderTitle}>Review Weekend<br/>Budget</h4>
            <span className={styles.reminderTime}>Detected 15% increase in dining</span>
            <button className={styles.reminderBtn} onClick={() => router.push('/mentor')}>
              <MessageSquare size={16} /> Ask AI Mentor
            </button>
          </div>

          {/* Active Milestones */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              Active Goals <button className={styles.btnSmallOutline} onClick={() => router.push('/goals')}>+ New</button>
            </h3>
            <div className={styles.projectList}>
              {goals.length === 0 ? (
                <div style={{ padding: '1rem', color: '#6b7280', fontSize: '0.9rem', textAlign: 'center' }}>
                  No goals yet — <span style={{ color: '#19533B', cursor: 'pointer', fontWeight: 600 }} onClick={() => router.push('/goals')}>create one</span>
                </div>
              ) : goals.slice(0, 4).map((goal, idx) => {
                const colors = [
                  { bg: '#EEF2FF', text: '#4F46E5' },
                  { bg: '#ECFDF5', text: '#10B981' },
                  { bg: '#FEF3C7', text: '#F59E0B' },
                  { bg: '#FCE7F3', text: '#DB2777' },
                ];
                const c = colors[idx % colors.length];
                const goalCurrency = goal.currency || 'USD';
                return (
                  <div key={goal.id} className={styles.projectItem} onClick={() => router.push(`/goals/${goal.id}`)} style={{ cursor: 'pointer' }}>
                    <div className={styles.projectIcon} style={{ background: c.bg, color: c.text }}><Target size={16} /></div>
                    <div className={styles.projectInfo}>
                      <span className={styles.projectName}>{goal.name}</span>
                      <span className={styles.projectDate}>
                        {formatCurrencyRaw(showNumbers ? goal.current : 0, goalCurrency)} / {formatCurrencyRaw(showNumbers ? goal.target : 0, goalCurrency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Bottom Row */}
        <motion.div 
          className={styles.bottomRow}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Recent Mentor Insights */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              Recent Insights <button className={styles.btnSmallOutline} onClick={() => router.push('/mentor')}>View All</button>
            </h3>
            <div className={styles.teamList}>
              <div className={styles.teamItem}>
                <div className={styles.teamAvatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FEF2F2', color: '#EF4444' }}>
                  <AlertCircle size={18} />
                </div>
                <div className={styles.teamInfo}>
                  <span className={styles.teamName}>Action Needed</span>
                  <span className={styles.teamTask}>Detected <b>lifestyle creep</b> in dining</span>
                </div>
                <span className={styles.sleekBadge} style={{ color: '#EF4444' }}><div className={styles.dot} style={{background: '#EF4444'}}></div> Warning</span>
              </div>
              <div className={styles.teamItem}>
                <div className={styles.teamAvatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#ECFCCB', color: '#65A30D' }}>
                  <TrendingUp size={18} />
                </div>
                <div className={styles.teamInfo}>
                  <span className={styles.teamName}>Saving Insight</span>
                  <span className={styles.teamTask}>Saving more on <b>weekdays</b></span>
                </div>
                <span className={styles.sleekBadge} style={{ color: '#19533B' }}><div className={styles.dot} style={{background: '#19533B'}}></div> Review</span>
              </div>
              <div className={styles.teamItem}>
                <div className={styles.teamAvatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#E0E7FF', color: '#4F46E5' }}>
                  <Award size={18} />
                </div>
                <div className={styles.teamInfo}>
                  <span className={styles.teamName}>Milestone</span>
                  <span className={styles.teamTask}>Emergency fund <b>50% complete</b></span>
                </div>
                <span className={styles.sleekBadge} style={{ color: '#4F46E5' }}><div className={styles.dot} style={{background: '#4F46E5'}}></div> Achieved</span>
              </div>
              <div className={styles.teamItem}>
                <div className={styles.teamAvatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAF5FF', color: '#9333EA' }}>
                  <ShieldCheck size={18} />
                </div>
                <div className={styles.teamInfo}>
                  <span className={styles.teamName}>Security</span>
                  <span className={styles.teamTask}>Suspicious <b>crypto text</b> blocked</span>
                </div>
                <span className={styles.sleekBadge} style={{ color: '#9333EA' }}><div className={styles.dot} style={{background: '#9333EA'}}></div> Protected</span>
              </div>
            </div>
          </div>

          {/* Financial Health Score */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Health Score</h3>
            <div className={styles.healthScoreBody}>
              <div className={styles.donutContainer}>
                <div className={styles.donutTopValue}>
                  <NumberFlow value={showNumbers ? user.healthScore : 0} />
                </div>
                <svg viewBox="0 0 100 52" className={styles.donutSvg}>
                  {/* Background path */}
                  <path d="M 12 48 A 38 38 0 0 1 88 48" fill="none" stroke="#F3F4F6" strokeWidth="6" strokeLinecap="round" />
                  {/* Foreground path (Score) */}
                  <path 
                    d="M 12 48 A 38 38 0 0 1 88 48" 
                    fill="none" 
                    stroke="#19533B" 
                    strokeWidth="6" 
                    strokeLinecap="round" 
                    strokeDasharray={`${scorePercent} 120`}
                    strokeDashoffset="0"
                    style={{ transition: 'stroke-dasharray 1s ease-out' }}
                  />
                </svg>
                <div className={styles.donutBottomBadge}>
                  <span>EXCELLENT</span>
                </div>
              </div>

              <div className={styles.donutLegend}>
                <div className={styles.legendItem}><div className={styles.legendDot} style={{ background: '#19533B' }}></div> Score</div>
                <div className={styles.legendItem}><div className={styles.legendDot} style={{ background: '#F3F4F6' }}></div> Target</div>
              </div>

              <div className={styles.scoreMetricsList}>
                <div className={styles.scoreMetricRow}>
                  <span className={styles.metricName}>Saving Habits</span>
                  <span className={styles.metricScore}>92/100</span>
                </div>
                <div className={styles.scoreMetricRow}>
                  <span className={styles.metricName}>Risk Management</span>
                  <span className={styles.metricScore}>80/100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Next Module Tracker */}
          <div className={`${styles.card} ${styles.timeTrackerCard}`}>
            <div className={styles.timeTrackerWave}></div>
            <div className={styles.timeTrackerContent}>
              <div className={styles.lessonTag}>
                <BookOpen size={12} /> UP NEXT
              </div>
              
              <h4 className={styles.timeTrackerLessonTitle}>{inProgressLesson.title}</h4>
              
              <div className={styles.timeTrackerMeta}>
                <span>⏱️ {inProgressLesson.duration}</span>
                <span>•</span>
                <span>+{inProgressLesson.xp || 50} XP</span>
              </div>

              <div className={styles.lessonProgressBarWrap}>
                <div className={styles.lessonProgressTop}>
                  <span>Course Progress</span>
                  <strong>60%</strong>
                </div>
                <div className={styles.lessonTrackFill}>
                  <div className={styles.lessonTrackBar} style={{ width: '60%' }}></div>
                </div>
              </div>

              <button className={styles.resumeLessonBtn} onClick={() => router.push(`/learn/${inProgressLesson.id}`)}>
                <Play size={15} fill="currentColor" /> Resume Lesson
              </button>
            </div>
          </div>
        </motion.div>

      </div>
    </AppLayout>
  );
}
