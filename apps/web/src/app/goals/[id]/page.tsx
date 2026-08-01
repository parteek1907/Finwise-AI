"use client";

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Target, Plus, TrendingUp, Calendar, Zap, Edit2, Trash2 } from 'lucide-react';
import styles from './GoalDetail.module.css';
import { useAppStore } from '@/store/useAppStore';
import { motion } from 'framer-motion';

export default function GoalDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const goals = useAppStore(state => state.goals);
  const updateGoal = useAppStore(state => state.updateGoal);
  
  const goal = goals.find(g => g.id === id) || goals[0]; // fallback
  const progressPercent = Math.min(100, Math.round((goal.current / goal.target) * 100));

  const handleAddFunds = () => {
    updateGoal(goal.id, 500); // Mock adding $500
  };

  return (
    <AppLayout>
      <div className={styles.workspace}>
        {/* Top Navigation */}
        <button className={styles.backBtn} onClick={() => router.push('/goals')}>
          <ArrowLeft size={16} /> Back to Goals
        </button>

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
                  <button className={styles.iconBtn} title="Edit Goal"><Edit2 size={16}/></button>
                  <button className={styles.iconBtn} title="Delete Goal" style={{color: '#ef4444'}}><Trash2 size={16}/></button>
                </div>
              </div>
            </header>

            {/* Massive Progress Card */}
            <div className={styles.progressCard}>
              <div className={styles.progressTop}>
                <div>
                  <span className={styles.label}>Current Saved</span>
                  <h2 className={styles.mainAmount}>${goal.current.toLocaleString()}</h2>
                </div>
                <div style={{textAlign: 'right'}}>
                  <span className={styles.label}>Target Amount</span>
                  <h2 className={styles.targetAmount}>${goal.target.toLocaleString()}</h2>
                </div>
              </div>
              
              <div className={styles.progressBar}>
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

              <div className={styles.actionRow}>
                <button className={styles.addFundsBtn} onClick={handleAddFunds}>
                  <Plus size={18} /> Add Funds ($500)
                </button>
              </div>
            </div>

            {/* Timeline / Milestones */}
            <div className={styles.milestonesSection}>
              <h3>Timeline & Milestones</h3>
              <div className={styles.timeline}>
                <div className={`${styles.timelineItem} ${progressPercent >= 25 ? styles.achieved : ''}`}>
                  <div className={styles.node}></div>
                  <div className={styles.content}>
                    <h4>25% Milestone</h4>
                    <p>${(goal.target * 0.25).toLocaleString()}</p>
                  </div>
                </div>
                <div className={`${styles.timelineItem} ${progressPercent >= 50 ? styles.achieved : ''}`}>
                  <div className={styles.node}></div>
                  <div className={styles.content}>
                    <h4>50% Milestone - Halfway there!</h4>
                    <p>${(goal.target * 0.5).toLocaleString()}</p>
                  </div>
                </div>
                <div className={`${styles.timelineItem} ${progressPercent >= 75 ? styles.achieved : ''}`}>
                  <div className={styles.node}></div>
                  <div className={styles.content}>
                    <h4>75% Milestone</h4>
                    <p>${(goal.target * 0.75).toLocaleString()}</p>
                  </div>
                </div>
                <div className={`${styles.timelineItem} ${progressPercent >= 100 ? styles.achieved : ''}`}>
                  <div className={styles.node}></div>
                  <div className={styles.content}>
                    <h4>Goal Completed</h4>
                    <p>${goal.target.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Right Sidebar - Stats & AI */}
          <aside className={styles.sideCol}>
            {/* Quick Stats */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <Calendar size={18} className={styles.statIcon} />
                <span className={styles.statLabel}>Deadline</span>
                <strong className={styles.statValue}>{new Date(goal.deadline).toLocaleDateString()}</strong>
              </div>
              <div className={styles.statCard}>
                <TrendingUp size={18} className={styles.statIcon} />
                <span className={styles.statLabel}>Monthly Needed</span>
                <strong className={styles.statValue}>$450/mo</strong>
              </div>
            </div>

            {/* AI Suggestions */}
            <div className={styles.aiCard}>
              <div className={styles.aiHeader}>
                <Zap size={18} />
                <h3>AI Mentor Suggestions</h3>
              </div>
              <ul className={styles.suggestionList}>
                <li>
                  <strong>Reallocate Funds:</strong> You have $200 sitting idle in your checking account. Moving it here would boost your timeline by 2 weeks.
                </li>
                <li>
                  <strong>Automate:</strong> Set up a recurring transfer on the 1st of every month to ensure you never miss a contribution.
                </li>
              </ul>
              <button className={styles.chatBtn} onClick={() => router.push('/mentor')}>
                Discuss with Mentor
              </button>
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}
