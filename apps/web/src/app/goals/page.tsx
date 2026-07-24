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

// Removed old variants to use dashboard's explicit stagger pattern

export default function GoalsPage() {
  const router = useRouter();
  const goals = useAppStore(state => state.goals);
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <AppLayout>
      <div className={styles.workspace}>
        {/* Header Section */}
        <motion.header 
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>Financial Goals</h1>
              <p className={styles.subtitle}>Track your milestones and automate your wealth building.</p>
            </div>
            
            <button className={styles.addGoalBtn} onClick={() => setShowAddModal(true)}>
              <Plus size={18} /> New Goal
            </button>
          </div>
        </motion.header>

        {/* Goals Grid */}
        <motion.div 
          className={styles.grid}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {goals.map(goal => {
            const Icon = CATEGORY_ICONS[goal.category as keyof typeof CATEGORY_ICONS] || Target;
            const progressPercent = Math.min(100, Math.round((goal.current / goal.target) * 100));
            
            return (
              <motion.div 
                key={goal.id} 
                className={styles.goalCard}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + (goals.indexOf(goal) * 0.05), ease: [0.16, 1, 0.3, 1] }}
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

        {/* Simple Add Modal Overlay */}
        {showAddModal && (
          <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <h2>Create New Goal</h2>
              <p>This is a frontend mockup. Real app would have a form here to add to global state.</p>
              <div style={{display: 'flex', gap: '1rem', marginTop: '2rem'}}>
                <button className={styles.addGoalBtn} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className={styles.addGoalBtn} style={{backgroundColor: 'var(--color-accent-green)', color: 'black'}}>Save Goal</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
