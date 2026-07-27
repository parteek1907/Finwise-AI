"use client";

import React, { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Target, Plus, TrendingUp, Calendar, Zap, Edit2, Trash2 } from 'lucide-react';
import styles from './GoalDetail.module.css';
import { useAppStore } from '@/store/useAppStore';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/utils/formatters';

export default function GoalDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const goals = useAppStore(state => state.goals);
  const updateGoal = useAppStore(state => state.updateGoal);
  const updateGoalDetails = useAppStore(state => state.updateGoalDetails);
  const deleteGoal = useAppStore(state => state.deleteGoal);
  
  // Subscribe to currency changes so it updates live
  const { useSettingsStore } = require('@/store/useSettingsStore');
  useSettingsStore((state: any) => state.financial?.preferredCurrency);
  
  const goal = goals.find(g => g.id === id) || goals[0]; // fallback
  const progressPercent = Math.min(100, Math.round((goal?.current / goal?.target) * 100)) || 0;

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ name: '', target: 0, deadline: '' });

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
      .then(data => {
        if (data.suggestions) setSuggestions(data.suggestions);
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoadingSuggestions(false));
  }, [goal.id, goal.current]);

  const handleAddFunds = () => {
    updateGoal(goal.id, 500); // Mock adding $500
  };

  const handleDiscuss = () => {
    const prompt = `I want to discuss my goal: ${goal?.name}. My target is $${goal?.target} and I have saved $${goal?.current}. Can you help me strategize?`;
    sessionStorage.setItem('mentorDraft', prompt);
    router.push('/mentor');
  };

  const openEditModal = () => {
    if (!goal) return;
    setEditData({ name: goal.name, target: goal.target, deadline: goal.deadline });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!goal) return;
    updateGoalDetails(goal.id, editData);
    setShowEditModal(false);
  };

  const handleDeleteConfirm = () => {
    if (!goal) return;
    deleteGoal(goal.id);
    setShowDeleteConfirm(false);
    router.push('/goals');
  };

  if (!goal) return null;

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
                  <button className={styles.iconBtn} title="Edit Goal" onClick={openEditModal}><Edit2 size={16}/></button>
                  <button className={styles.iconBtn} title="Delete Goal" onClick={() => setShowDeleteConfirm(true)} style={{color: '#ef4444'}}><Trash2 size={16}/></button>
                </div>
              </div>
            </header>

            {/* Massive Progress Card */}
            <div className={styles.progressCard}>
              <div className={styles.progressTop}>
                <div>
                  <span className={styles.label}>Current Saved</span>
                  <h2 className={styles.mainAmount}>{formatCurrency(goal.current)}</h2>
                </div>
                <div style={{textAlign: 'right'}}>
                  <span className={styles.label}>Target Amount</span>
                  <h2 className={styles.targetAmount}>{formatCurrency(goal.target)}</h2>
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
                  <Plus size={18} /> Add Funds ({formatCurrency(500)})
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
                    <p>{formatCurrency(goal.target * 0.25)}</p>
                  </div>
                </div>
                <div className={`${styles.timelineItem} ${progressPercent >= 50 ? styles.achieved : ''}`}>
                  <div className={styles.node}></div>
                  <div className={styles.content}>
                    <h4>50% Milestone - Halfway there!</h4>
                    <p>{formatCurrency(goal.target * 0.5)}</p>
                  </div>
                </div>
                <div className={`${styles.timelineItem} ${progressPercent >= 75 ? styles.achieved : ''}`}>
                  <div className={styles.node}></div>
                  <div className={styles.content}>
                    <h4>75% Milestone</h4>
                    <p>{formatCurrency(goal.target * 0.75)}</p>
                  </div>
                </div>
                <div className={`${styles.timelineItem} ${progressPercent >= 100 ? styles.achieved : ''}`}>
                  <div className={styles.node}></div>
                  <div className={styles.content}>
                    <h4>Goal Completed</h4>
                    <p>{formatCurrency(goal.target)}</p>
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
                <strong className={styles.statValue}>{formatCurrency(450)}/mo</strong>
              </div>
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
              <button className={styles.chatBtn} onClick={handleDiscuss}>
                Discuss with Mentor
              </button>
            </div>
          </aside>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#1f2937' }}>Delete Goal?</h3>
            <p style={{ color: '#4b5563', marginBottom: '1.5rem', lineHeight: 1.5 }}>Are you sure you want to delete "{goal.name}"? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white', cursor: 'pointer', fontWeight: 500, color: '#374151' }}>Cancel</button>
              <button onClick={handleDeleteConfirm} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', backgroundColor: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 500 }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: '#1f2937' }}>Edit Goal</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '0.35rem', fontWeight: 500 }}>Goal Name</label>
                <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '1rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '0.35rem', fontWeight: 500 }}>Target Amount ($)</label>
                <input type="number" value={editData.target} onChange={e => setEditData({...editData, target: Number(e.target.value)})} style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '1rem' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#374151', marginBottom: '0.35rem', fontWeight: 500 }}>Deadline</label>
                <input type="date" value={editData.deadline.split('T')[0]} onChange={e => setEditData({...editData, deadline: e.target.value})} style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '1rem' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowEditModal(false)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white', cursor: 'pointer', fontWeight: 500, color: '#374151' }}>Cancel</button>
              <button onClick={handleSaveEdit} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', backgroundColor: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: 500 }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
