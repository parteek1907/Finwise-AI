"use client";

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useRouter } from 'next/navigation';
import { Target, Plus, PiggyBank, Home, Car, Plane, Briefcase, TrendingUp } from 'lucide-react';
import styles from './Goals.module.css';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

const CATEGORY_ICONS = {
  'Emergency': PiggyBank,
  'Housing': Home,
  'Vehicle': Car,
  'Travel': Plane,
  'Retirement': TrendingUp,
  'Other': Briefcase
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function GoalsPage() {
  const router = useRouter();
  const { goals, addGoal } = useAppStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    target: '',
    deadline: '',
    category: 'Emergency'
  });

  const handleSaveGoal = () => {
    if (!newGoal.name || !newGoal.target || !newGoal.deadline) return;
    
    addGoal({
      name: newGoal.name,
      target: Number(newGoal.target),
      deadline: newGoal.deadline,
      category: newGoal.category as any
    });
    
    setShowAddModal(false);
    setNewGoal({ name: '', target: '', deadline: '', category: 'Emergency' });
  };

  return (
    <AppLayout>
      <div className={styles.workspace}>
        {/* Header Section */}
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>Financial Goals</h1>
              <p className={styles.subtitle}>Track your milestones and automate your wealth building.</p>
            </div>
            
            <button className={styles.addGoalBtn} onClick={() => setShowAddModal(true)}>
              <Plus size={18} /> New Goal
            </button>
          </div>
        </header>

        {/* Goals Grid */}
        <motion.div className={styles.grid} variants={containerVariants} initial="hidden" animate="show">
          {goals.map(goal => {
            const Icon = CATEGORY_ICONS[goal.category as keyof typeof CATEGORY_ICONS] || Target;
            const progressPercent = Math.min(100, Math.round((goal.current / goal.target) * 100));
            
            return (
              <motion.div 
                key={goal.id} 
                variants={itemVariants} 
                className={styles.goalCard}
                onClick={() => router.push(`/goals/${goal.id}`)}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.iconBox}>
                    <Icon size={20} />
                  </div>
                  <div className={`${styles.statusBadge} ${styles[goal.status.replace(/\s+/g, '')]}`}>
                    {goal.status}
                  </div>
                </div>
                
                <h3 className={styles.goalName}>{goal.name}</h3>
                <span className={styles.deadline}>Target: {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                
                <div className={styles.progressSection}>
                  <div className={styles.progressLabels}>
                    <span className={styles.currentAmount}>${goal.current.toLocaleString()}</span>
                    <span className={styles.targetAmount}>of ${goal.target.toLocaleString()}</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${progressPercent}%` }}></div>
                  </div>
                  <span className={styles.percentText}>{progressPercent}% Funded</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Add Modal Overlay */}
        {showAddModal && (
          <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <h2 style={{ marginBottom: '1.5rem', marginTop: 0 }}>Create New Goal</h2>
              
              <div className={styles.formGroup}>
                <label>Goal Name</label>
                <input 
                  type="text" 
                  className={styles.input}
                  value={newGoal.name} 
                  onChange={e => setNewGoal({...newGoal, name: e.target.value})} 
                  placeholder="e.g. Vacation Fund" 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Target Amount ($)</label>
                <input 
                  type="number" 
                  className={styles.input}
                  value={newGoal.target} 
                  onChange={e => setNewGoal({...newGoal, target: e.target.value})} 
                  placeholder="e.g. 5000" 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Target Date</label>
                <input 
                  type="date" 
                  className={styles.input}
                  value={newGoal.deadline} 
                  onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} 
                />
              </div>
              <div className={styles.formGroup}>
                <label>Category</label>
                <select 
                  className={styles.select}
                  value={newGoal.category} 
                  onChange={e => setNewGoal({...newGoal, category: e.target.value})}
                >
                  <option value="Emergency">Emergency</option>
                  <option value="Housing">Housing</option>
                  <option value="Vehicle">Vehicle</option>
                  <option value="Travel">Travel</option>
                  <option value="Retirement">Retirement</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
                <button className={styles.addGoalBtn} style={{flex: 1, justifyContent: 'center', backgroundColor: 'var(--color-surface-bg)', color: 'var(--color-text-secondary)'}} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className={styles.addGoalBtn} style={{flex: 1, justifyContent: 'center', backgroundColor: 'var(--color-accent-green)', color: 'black'}} onClick={handleSaveGoal}>Save Goal</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
