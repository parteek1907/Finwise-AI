"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Target, Plus, TrendingUp, Calendar, Zap, Edit2, Trash2, X, AlertCircle, CheckCircle, Info, Award, Clock, BarChart3, MessageSquare, ChevronDown, ChevronUp, Pencil, Trash, StickyNote, Star, Flame, Rocket } from 'lucide-react';
import styles from './GoalDetail.module.css';
import { useAppStore } from '@/store/useAppStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrencyRaw, getCurrencySymbol, formatRelativeDate } from '@/utils/formatters';
import {
  calculateGoalStatus,
  calculateProjectedCompletion,
  calculateRequiredMonthly,
  calculateMonthlyContributionRate,
  calculateSuccessProbability,
  calculateHealthScore,
  generateMilestones,
  generateMotivationalInsight,
  generateCompletionAnalysis,
  generateNotifications,
  generateSmartRecommendations,
  getQuickAmounts,
  getMonthlyContributionData,
  getProgressOverTimeData,
} from '@/utils/goalCalculations';
import { BarChart, Bar, AreaChart, Area, XAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

export default function GoalDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const goals = useAppStore(state => state.goals);
  const addContribution = useAppStore(state => state.addContribution);
  const editContribution = useAppStore(state => state.editContribution);
  const deleteContribution = useAppStore(state => state.deleteContribution);
  const updateGoalDetails = useAppStore(state => state.updateGoalDetails);
  const deleteGoal = useAppStore(state => state.deleteGoal);
  
  const preferredCurrency = useSettingsStore(state => state.financial?.preferredCurrency) || 'USD';
  
  const goal = goals.find(g => g.id === id);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddFundsModal, setShowAddFundsModal] = useState(false);
  const [editData, setEditData] = useState({ name: '', target: 0, deadline: '' });
  const [fundAmount, setFundAmount] = useState('');
  const [fundNote, setFundNote] = useState('');
  const [showAllContributions, setShowAllContributions] = useState(false);
  const [editingContribId, setEditingContribId] = useState<string | null>(null);
  const [editingContribAmount, setEditingContribAmount] = useState('');
  const [editingContribNote, setEditingContribNote] = useState('');

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);

  useEffect(() => {
    if (!goal) return;
    setIsLoadingSuggestions(true);
    fetch('/api/goal-suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal })
    })
      .then(res => res.json())
      .then(data => { if (data.suggestions) setSuggestions(data.suggestions); })
      .catch(err => console.error(err))
      .finally(() => setIsLoadingSuggestions(false));
  }, [goal?.id, goal?.current]);

  // Monthly totals for contribution history
  const monthlyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    if (!goal || !goal.contributions) return totals;
    goal.contributions.forEach(c => {
      const d = new Date(c.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      totals[key] = (totals[key] || 0) + c.amount;
    });
    return totals;
  }, [goal?.contributions]);

  if (!goal) return null;

  const goalCurrency = preferredCurrency; // Force preferred currency over legacy goal currency
  const fmt = (v: number) => formatCurrencyRaw(v, goalCurrency);
  const symbol = getCurrencySymbol(goalCurrency);
  const progressPercent = Math.min(100, Math.round((goal.current / goal.target) * 100));
  const remaining = Math.max(0, goal.target - goal.current);
  const isCompleted = goal.current >= goal.target;

  // Calculations
  const goalData = { target: goal.target, current: goal.current, deadline: goal.deadline, createdAt: goal.createdAt, contributions: goal.contributions, completedAt: goal.completedAt };
  const projectedDate = calculateProjectedCompletion(goalData);
  const requiredMonthly = calculateRequiredMonthly(goalData);
  const monthlyRate = calculateMonthlyContributionRate(goalData);
  const successProb = calculateSuccessProbability(goalData);
  const healthScore = calculateHealthScore(goalData);
  const milestones = generateMilestones(goalData);
  const motivationalInsight = generateMotivationalInsight(goalData);
  const notifications = generateNotifications(goalData);
  const smartRecommendations = generateSmartRecommendations(goalData);
  const completionAnalysis = generateCompletionAnalysis(goalData);
  const quickAmounts = getQuickAmounts(goalCurrency);
  const monthlyChartData = getMonthlyContributionData(goal.contributions, 6);
  const progressChartData = getProgressOverTimeData(goal.contributions);

  // Contribution history
  const sortedContributions = [...goal.contributions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const visibleContributions = showAllContributions ? sortedContributions : sortedContributions.slice(0, 5);


  const handleAddFunds = () => {
    const amount = Number(fundAmount);
    if (!amount || amount <= 0) return;
    addContribution(goal.id, amount, fundNote || undefined);
    setFundAmount('');
    setFundNote('');
    setShowAddFundsModal(false);
  };

  const handleQuickAdd = (amount: number) => {
    setFundAmount(String(amount));
  };

  const handleDiscuss = () => {
    const prompt = `I'm currently working toward my ${goal.name} goal.\n\nTarget Amount: ${fmt(goal.target)}\nCurrent Savings: ${fmt(goal.current)}\nCompletion: ${progressPercent}%\nDeadline: ${new Date(goal.deadline).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}\nContributions: ${goal.contributions.length}\nMonthly Rate: ${fmt(Math.round(monthlyRate))}/mo\nRequired Monthly: ${fmt(requiredMonthly)}/mo\nHealth Score: ${healthScore.score}/100\n\nAnalyze my progress, identify risks, suggest ways to reach my goal faster, and recommend realistic adjustments without increasing financial stress.`;
    sessionStorage.setItem('mentorDraft', prompt);
    router.push('/mentor');
  };

  const openEditModal = () => {
    setEditData({ name: goal.name, target: goal.target, deadline: goal.deadline });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    updateGoalDetails(goal.id, editData);
    setShowEditModal(false);
  };

  const handleDeleteConfirm = () => {
    deleteGoal(goal.id);
    setShowDeleteConfirm(false);
    router.push('/goals');
  };

  const handleEditContribution = (contribId: string) => {
    const contrib = goal.contributions.find(c => c.id === contribId);
    if (!contrib) return;
    setEditingContribId(contribId);
    setEditingContribAmount(String(contrib.amount));
    setEditingContribNote(contrib.note || '');
  };

  const handleSaveContribEdit = () => {
    if (!editingContribId) return;
    editContribution(goal.id, editingContribId, {
      amount: Number(editingContribAmount),
      note: editingContribNote || undefined,
    });
    setEditingContribId(null);
  };

  const handleDeleteContribution = (contribId: string) => {
    deleteContribution(goal.id, contribId);
  };

  return (
    <AppLayout>
      <div className={styles.workspace}>
        <button className={styles.backBtn} onClick={() => router.push('/goals')}>
          <ArrowLeft size={16} /> Back to Goals
        </button>

        {/* Notifications Banner */}
        {notifications.length > 0 && !isCompleted && (
          <div className={styles.notificationsBar}>
            {notifications.map((n, i) => (
              <div key={i} className={`${styles.notifItem} ${styles[`notif_${n.type}`]}`}>
                {n.type === 'warning' && <AlertCircle size={14} />}
                {n.type === 'success' && <CheckCircle size={14} />}
                {n.type === 'info' && <Info size={14} />}
                <span>{n.message}</span>
              </div>
            ))}
          </div>
        )}

        {/* Completion Achievement Page */}
        {isCompleted && completionAnalysis && (
          <motion.div
            className={styles.completionCard}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.completionBadge}><Award size={48} className={styles.completionBadgeIcon} /></div>
            <h2 className={styles.completionTitle}>Goal Completed!</h2>
            <h3 className={styles.completionGoalName}>{goal.name}</h3>
            <p className={styles.completionTiming}>
              {completionAnalysis.completedEarly
                ? `Completed ${completionAnalysis.daysDifference} Days Early`
                : completionAnalysis.daysDifference === 0
                  ? 'Completed Right On Time'
                  : `Completed ${completionAnalysis.daysDifference} Days After Target`}
            </p>
            <div className={styles.completionStats}>
              <div className={styles.completionStat}>
                <span className={styles.completionStatLabel}>Total Saved</span>
                <strong>{fmt(goal.current)}</strong>
              </div>
              <div className={styles.completionStat}>
                <span className={styles.completionStatLabel}>Avg Monthly</span>
                <strong>{fmt(completionAnalysis.avgMonthlyContribution)}/mo</strong>
              </div>
              <div className={styles.completionStat}>
                <span className={styles.completionStatLabel}>Contributions</span>
                <strong>{completionAnalysis.totalContributions}</strong>
              </div>
              <div className={styles.completionStat}>
                <span className={styles.completionStatLabel}>Consistency</span>
                <strong>{completionAnalysis.consistencyScore}%</strong>
              </div>
            </div>
            <div className={styles.completionInsight}>
              <Zap size={16} />
              <p>{completionAnalysis.insight}</p>
            </div>
          </motion.div>
        )}

        <div className={styles.layout}>
          {/* Main Info Column */}
          <main className={styles.mainCol}>
            <header className={styles.goalHeader}>
              <div className={styles.headerTop}>
                <div className={styles.titleWrap}>
                  <div className={styles.iconBox}><Target size={24} /></div>
                  <div>
                    <span className={styles.categoryBadge}>{goal.category}</span>
                    <h1 className={styles.title}>{goal.name}</h1>
                  </div>
                </div>
                <div className={styles.headerActions}>
                  <button className={styles.iconBtn} title="Edit Goal" onClick={openEditModal}><Edit2 size={16}/></button>
                  <button className={styles.iconBtn} title="Delete Goal" onClick={() => setShowDeleteConfirm(true)} style={{color: '#ef4444'}}><Trash2 size={16}/></button>
                </div>
              </div>
            </header>

            {/* Progress Card */}
            <div className={styles.progressCard}>
              <div className={styles.progressTop}>
                <div>
                  <span className={styles.label}>Current Saved</span>
                  <h2 className={styles.mainAmount}>{fmt(goal.current)}</h2>
                </div>
                <div style={{textAlign: 'right'}}>
                  <span className={styles.label}>Target Amount</span>
                  <h2 className={styles.targetAmountLarge}>{fmt(goal.target)}</h2>
                </div>
              </div>
              
              <div className={styles.progressBarLarge}>
                <motion.div 
                  className={styles.progressFill}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
              
              <div className={styles.progressBottom}>
                <span className={styles.percentText}>{progressPercent}% Funded</span>
                <span className={`${styles.statusBadge} ${styles[goal.status.replace(/\s+/g, '')]}`}>{goal.status}</span>
              </div>

              {/* Motivation Insight */}
              <div className={styles.insightBanner}>
                <Zap size={16} className={styles.insightIcon} />
                <p>{motivationalInsight}</p>
              </div>

              <div className={styles.actionRow}>
                <button className={styles.addFundsBtn} onClick={() => setShowAddFundsModal(true)}>
                  <Plus size={18} /> Add Funds
                </button>
                <button className={styles.chatBtn} onClick={handleDiscuss}>
                  <MessageSquare size={16} /> Discuss with Mentor
                </button>
              </div>
            </div>

            {/* Forecasting Card */}
            {!isCompleted && goal.contributions.length > 0 && (
              <div className={styles.forecastCard}>
                <h3 className={styles.sectionTitle}><TrendingUp size={18} /> Goal Forecast</h3>
                <div className={styles.forecastGrid}>
                  <div className={styles.forecastItem}>
                    <span className={styles.forecastLabel}>Current Pace</span>
                    <strong className={styles.forecastValue}>{fmt(Math.round(monthlyRate))}/mo</strong>
                  </div>
                  <div className={styles.forecastItem}>
                    <span className={styles.forecastLabel}>Required Monthly</span>
                    <strong className={styles.forecastValue}>{fmt(requiredMonthly)}/mo</strong>
                  </div>
                  <div className={styles.forecastItem}>
                    <span className={styles.forecastLabel}>Projected Completion</span>
                    <strong className={styles.forecastValue}>
                      {projectedDate ? projectedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—'}
                    </strong>
                  </div>
                  <div className={styles.forecastItem}>
                    <span className={styles.forecastLabel}>Success Probability</span>
                    <strong className={`${styles.forecastValue} ${successProb >= 70 ? styles.forecastGood : successProb >= 40 ? styles.forecastOk : styles.forecastBad}`}>{successProb}%</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Milestones */}
            <div className={styles.milestonesSection}>
              <h3 className={styles.sectionTitle}>Milestones</h3>
              <div className={styles.timeline}>
                {milestones.map((m) => {
                  const IconComp = m.icon === 'Star' ? Star : m.icon === 'TrendingUp' ? TrendingUp : m.icon === 'Flame' ? Flame : m.icon === 'Rocket' ? Rocket : Award;
                  return (
                    <div key={m.id} className={`${styles.timelineItem} ${m.achieved ? styles.achieved : ''}`}>
                      <div className={styles.node}>
                        {m.achieved && <IconComp size={10} className={styles.nodeIcon} />}
                      </div>
                      <div className={styles.timelineContent}>
                        <h4><IconComp size={14} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> {m.label}</h4>
                        <p>{m.percent > 0 ? fmt(m.amount) : 'Start saving'}</p>
                        {m.achieved && m.insight && (
                          <p className={styles.milestoneInsight}>{m.insight}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contribution History */}
            <div className={styles.historySection}>
              <h3 className={styles.sectionTitle}><Clock size={18} /> Contribution History</h3>
              {goal.contributions.length === 0 ? (
                <p className={styles.emptyHistory}>No contributions yet. Add your first contribution to start tracking.</p>
              ) : (
                <>
                  <div className={styles.historyList}>
                    {visibleContributions.map(c => (
                      <div key={c.id} className={styles.historyItem}>
                        {editingContribId === c.id ? (
                          <div className={styles.editContribRow}>
                            <input type="number" value={editingContribAmount} onChange={e => setEditingContribAmount(e.target.value)} className={styles.editContribInput} />
                            <input type="text" value={editingContribNote} onChange={e => setEditingContribNote(e.target.value)} className={styles.editContribInput} placeholder="Note" />
                            <button className={styles.editContribSaveBtn} onClick={handleSaveContribEdit}>Save</button>
                            <button className={styles.editContribCancelBtn} onClick={() => setEditingContribId(null)}>Cancel</button>
                          </div>
                        ) : (
                          <>
                            <div className={styles.historyLeft}>
                              <span className={styles.historyDate}>{formatRelativeDate(c.date)}</span>
                              {c.note && <span className={styles.historyNote}><StickyNote size={10} /> {c.note}</span>}
                            </div>
                            <div className={styles.historyRight}>
                              <span className={styles.historyAmount}>+{fmt(c.amount)}</span>
                              <div className={styles.historyActions}>
                                <button onClick={() => handleEditContribution(c.id)} title="Edit"><Pencil size={12} /></button>
                                <button onClick={() => handleDeleteContribution(c.id)} title="Delete"><Trash size={12} /></button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  {sortedContributions.length > 5 && (
                    <button className={styles.showMoreBtn} onClick={() => setShowAllContributions(!showAllContributions)}>
                      {showAllContributions ? <><ChevronUp size={14} /> Show Less</> : <><ChevronDown size={14} /> Show All ({sortedContributions.length})</>}
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Analytics Charts */}
            {goal.contributions.length >= 2 && (
              <div className={styles.analyticsSection}>
                <h3 className={styles.sectionTitle}><BarChart3 size={18} /> Analytics</h3>
                <div className={styles.chartsGrid}>
                  <div className={styles.chartCard}>
                    <h4>Monthly Contributions</h4>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={monthlyChartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
                        <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip formatter={(v: number) => fmt(v)} />
                        <Bar dataKey="amount" fill="#19533B" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className={styles.chartCard}>
                    <h4>Progress Over Time</h4>
                    <ResponsiveContainer width="100%" height={160}>
                      <AreaChart data={progressChartData}>
                        <defs>
                          <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#19533B" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#19533B" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
                        <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip formatter={(v: number) => fmt(v)} />
                        <Area type="monotone" dataKey="total" stroke="#19533B" fill="url(#colorProgress)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* Right Sidebar */}
          <aside className={styles.sideCol}>
            {/* Quick Stats */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <Calendar size={18} className={styles.statIcon} />
                <span className={styles.statLabel}>Deadline</span>
                <strong className={styles.statValue}>{new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
              </div>
              <div className={styles.statCard}>
                <TrendingUp size={18} className={styles.statIcon} />
                <span className={styles.statLabel}>Monthly Needed</span>
                <strong className={styles.statValue}>{fmt(requiredMonthly)}/mo</strong>
              </div>
            </div>

            {/* Health Score */}
            <div className={styles.healthCard}>
              <h3>Goal Health Score</h3>
              <div className={styles.healthScoreDisplay}>
                <div className={styles.healthScoreRing}>
                  <svg viewBox="0 0 120 120">
                    <circle cx="60" cy="60" r="50" fill="none" stroke="#F3F4F6" strokeWidth="8" />
                    <circle cx="60" cy="60" r="50" fill="none" stroke={healthScore.score >= 70 ? '#22c55e' : healthScore.score >= 50 ? '#f59e0b' : '#ef4444'} strokeWidth="8"
                      strokeDasharray={`${(healthScore.score / 100) * 314} 314`}
                      strokeLinecap="round"
                      transform="rotate(-90 60 60)"
                      style={{ transition: 'stroke-dasharray 0.8s ease-out' }}
                    />
                  </svg>
                  <div className={styles.healthScoreValue}>
                    <strong>{healthScore.score}</strong>
                    <span>/100</span>
                  </div>
                </div>
                <span className={styles.healthLabel}>{healthScore.label}</span>
              </div>
              <ul className={styles.healthReasons}>
                {healthScore.reasons.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>

            {/* AI Suggestions */}
            <div className={styles.aiCard}>
              <div className={styles.aiHeader}>
                <Zap size={18} />
                <h3>AI Mentor Suggestions</h3>
              </div>
              <ul className={styles.suggestionList}>
                {isLoadingSuggestions ? (
                  <div style={{ padding: '1rem', color: '#6b7280', fontSize: '0.9rem', fontStyle: 'italic' }}>Analyzing goal data...</div>
                ) : (
                  suggestions.map((s, idx) => (
                    <li key={idx}>
                      <strong>{s.title}:</strong> {s.description}
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* Smart Recommendations */}
            <div className={styles.recommendationsCard}>
              <h3><Award size={16} /> Smart Recommendations</h3>
              <ul className={styles.recommendationsList}>
                {smartRecommendations.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div className={styles.modalOverlay} onClick={() => setShowDeleteConfirm(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className={styles.modalSmall} onClick={e => e.stopPropagation()} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <h3>Delete Goal?</h3>
              <p>Are you sure you want to delete &ldquo;{goal.name}&rdquo;? This action cannot be undone.</p>
              <div className={styles.modalActions}>
                <button className={styles.modalCancelBtn} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                <button className={styles.modalDeleteBtn} onClick={handleDeleteConfirm}>Yes, Delete</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div className={styles.modalOverlay} onClick={() => setShowEditModal(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className={styles.modalSmall} onClick={e => e.stopPropagation()} initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}>
              <h3>Edit Goal</h3>
              <div className={styles.editForm}>
                <div className={styles.editFormGroup}>
                  <label>Goal Name</label>
                  <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                </div>
                <div className={styles.editFormGroup}>
                  <label>Target Amount ({symbol})</label>
                  <input type="number" value={editData.target} onChange={e => setEditData({...editData, target: Number(e.target.value)})} />
                </div>
                <div className={styles.editFormGroup}>
                  <label>Deadline</label>
                  <input type="date" value={editData.deadline.split('T')[0]} onChange={e => setEditData({...editData, deadline: e.target.value})} />
                </div>
              </div>
              <div className={styles.modalActions}>
                <button className={styles.modalCancelBtn} onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className={styles.modalSaveBtn} onClick={handleSaveEdit}>Save Changes</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Funds Modal */}
      <AnimatePresence>
        {showAddFundsModal && (
          <motion.div className={styles.modalOverlay} onClick={() => setShowAddFundsModal(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className={styles.fundsModal} onClick={e => e.stopPropagation()} initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
              <button className={styles.fundsCloseBtn} onClick={() => setShowAddFundsModal(false)}><X size={18} /></button>
              
              <div className={styles.fundsHeader}>
                <h2>Add Contribution</h2>
                <p>{goal.name}</p>
              </div>

              <div className={styles.fundsProgress}>
                <div className={styles.fundsProgressRow}>
                  <span>Progress</span>
                  <strong>{progressPercent}%</strong>
                </div>
                <div className={styles.fundsProgressBar}>
                  <div className={styles.fundsProgressFill} style={{ width: `${progressPercent}%` }} />
                </div>
                <div className={styles.fundsProgressDetails}>
                  <span>{fmt(goal.current)} saved</span>
                  <span>{fmt(remaining)} remaining</span>
                </div>
              </div>

              <div className={styles.fundsDeadline}>
                <Calendar size={14} />
                <span>Target Date: {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              </div>

              <div className={styles.quickAmounts}>
                {quickAmounts.map(amt => (
                  <button key={amt} className={`${styles.quickAmountBtn} ${fundAmount === String(amt) ? styles.quickAmountActive : ''}`} onClick={() => handleQuickAdd(amt)}>
                    +{fmt(amt)}
                  </button>
                ))}
              </div>

              <div className={styles.fundsInputGroup}>
                <label>Custom Amount</label>
                <div className={styles.fundsInputWrap}>
                  <span className={styles.fundsInputSymbol}>{symbol}</span>
                  <input type="number" value={fundAmount} onChange={e => setFundAmount(e.target.value)} placeholder="0" className={styles.fundsInput} />
                </div>
              </div>

              <div className={styles.fundsInputGroup}>
                <label>Note (optional)</label>
                <input type="text" value={fundNote} onChange={e => setFundNote(e.target.value)} placeholder="e.g. Monthly savings" className={styles.fundsNoteInput} />
              </div>

              <button className={styles.fundsConfirmBtn} onClick={handleAddFunds} disabled={!fundAmount || Number(fundAmount) <= 0}>
                <Plus size={16} /> Add {fundAmount ? fmt(Number(fundAmount)) : 'Funds'}
              </button>

              {/* Recent Contributions */}
              {sortedContributions.length > 0 && (
                <div className={styles.fundsHistory}>
                  <h4>Recent Contributions</h4>
                  {sortedContributions.slice(0, 3).map(c => (
                    <div key={c.id} className={styles.fundsHistoryItem}>
                      <span>{formatRelativeDate(c.date)}</span>
                      <strong>+{fmt(c.amount)}</strong>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}
