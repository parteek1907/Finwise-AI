"use client";

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useRouter } from 'next/navigation';
import { Target, Plus, PiggyBank, Home, Car, Plane, Briefcase, TrendingUp, ChevronDown, Check, Sparkles, ArrowRight, Shield, GraduationCap, Heart, Laptop, Smartphone } from 'lucide-react';
import styles from './Goals.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { DatePicker } from '@/components/ui/date-picker';
import { formatCurrencyRaw, getCurrencySymbol, convertCurrency } from '@/utils/formatters';
import { GOAL_TEMPLATES } from '@/utils/goalCalculations';

const CATEGORY_OPTIONS = [
  { value: 'Emergency', label: 'Emergency Fund', icon: PiggyBank },
  { value: 'Housing', label: 'Housing & Real Estate', icon: Home },
  { value: 'Vehicle', label: 'Vehicle & Transport', icon: Car },
  { value: 'Travel', label: 'Travel & Vacation', icon: Plane },
  { value: 'Retirement', label: 'Retirement & Wealth', icon: TrendingUp },
  { value: 'Other', label: 'Other Financial Goal', icon: Briefcase },
];

const CATEGORY_ICONS: Record<string, any> = {
  'Emergency': PiggyBank,
  'Housing': Home,
  'Vehicle': Car,
  'Travel': Plane,
  'Retirement': TrendingUp,
  'Other': Briefcase
};

export default function GoalsPage() {
  const router = useRouter();
  const { goals, addGoal } = useAppStore();
  const preferredCurrency = useSettingsStore(state => state.financial?.preferredCurrency) || 'USD';
  const [showAddModal, setShowAddModal] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    target: '',
    deadline: '',
    category: 'Emergency',
    priority: 'Medium' as 'High' | 'Medium' | 'Low',
    dependsOn: ''
  });

  const currencySymbol = getCurrencySymbol(preferredCurrency);

  const handleSaveGoal = () => {
    if (!newGoal.name || !newGoal.target || !newGoal.deadline) return;
    
    addGoal({
      name: newGoal.name,
      target: Number(newGoal.target),
      deadline: newGoal.deadline,
      category: newGoal.category as any,
      currency: preferredCurrency,
      priority: newGoal.priority,
      dependsOn: newGoal.dependsOn || undefined
    });
    
    setShowAddModal(false);
    setNewGoal({ name: '', target: '', deadline: '', category: 'Emergency', priority: 'Medium', dependsOn: '' });
  };

  const handleTemplateClick = (template: typeof GOAL_TEMPLATES[0]) => {
    const targetAmount = template.defaultTargets[preferredCurrency] || template.defaultTargets['USD'];
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + template.defaultMonths);

    setNewGoal({
      name: template.name,
      target: String(targetAmount),
      deadline: deadline.toISOString(),
      category: template.category,
      priority: 'Medium',
      dependsOn: ''
    });
    setShowAddModal(true);
  };

  const hasGoals = goals.length > 0;

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
            <div className={styles.titleWrap}>
              <div className={styles.iconBox}>
                <Target size={28} color="#19533B" />
              </div>
              <div>
                <h1 className={styles.title}>Financial Goals</h1>
                <p className={styles.subtitle}>Track your milestones and automate your wealth building.</p>
              </div>
            </div>
            
            <button className={styles.addGoalBtn} onClick={() => setShowAddModal(true)}>
              <Plus size={18} /> New Goal
            </button>
          </div>
        </motion.header>

        {/* Empty State */}
        {!hasGoals && (
          <motion.div
            className={styles.emptyState}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className={styles.emptyHero}>
              <div className={styles.emptyIconWrap}>
                <Sparkles size={32} />
              </div>
              <h2 className={styles.emptyTitle}>Start Your Financial Journey</h2>
              <p className={styles.emptyDesc}>
                Set clear savings targets, track every contribution, and get AI-powered coaching to reach your goals faster.
              </p>
            </div>

            <div className={styles.templateSection}>
              <h3 className={styles.templateHeading}>Popular Goal Templates</h3>
              <div className={styles.templateGrid}>
                {GOAL_TEMPLATES.map((template, idx) => (
                  <motion.button
                    key={template.name}
                    className={styles.templateCard}
                    onClick={() => handleTemplateClick(template)}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + idx * 0.04, type: 'spring', stiffness: 300, damping: 24 }}
                  >
                    <span className={styles.templateEmoji}>
                      {(() => {
                        const Icon = template.icon === 'Shield' ? Shield :
                                     template.icon === 'Plane' ? Plane :
                                     template.icon === 'Home' ? Home :
                                     template.icon === 'Car' ? Car :
                                     template.icon === 'GraduationCap' ? GraduationCap :
                                     template.icon === 'Heart' ? Heart :
                                     template.icon === 'TrendingUp' ? TrendingUp :
                                     template.icon === 'Laptop' ? Laptop :
                                     template.icon === 'Smartphone' ? Smartphone : Target;
                        return <Icon size={24} color="#19533B" />;
                      })()}
                    </span>
                    <div className={styles.templateInfo}>
                      <span className={styles.templateName}>{template.name}</span>
                      <span className={styles.templateAmount}>
                        {formatCurrencyRaw(template.defaultTargets[preferredCurrency] || template.defaultTargets['USD'], preferredCurrency)}
                      </span>
                    </div>
                    <ArrowRight size={14} className={styles.templateArrow} />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Goals Grid */}
        {hasGoals && (
          <motion.div 
            className={styles.grid}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {goals.map(goal => {
              const Icon = CATEGORY_ICONS[goal.category] || Target;
              const progressPercent = Math.min(100, Math.round((goal.current / goal.target) * 100));
              const goalCurrency = goal.currency || preferredCurrency;
              
              return (
                <motion.div 
                  key={goal.id} 
                  className={`${styles.goalCard} ${goal.status === 'Completed' ? styles.goalCardCompleted : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + (goals.indexOf(goal) * 0.05), ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => router.push(`/goals/${goal.id}`)}
                >
                  <div className={styles.cardHeader}>
                    <div className={styles.cardIconBox}>
                      <Icon size={20} />
                    </div>
                    <div className={`${styles.statusBadge} ${styles[goal.status.replace(/\s+/g, '')]}`}>
                      {goal.status}
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <h3 className={styles.goalName} style={{ margin: 0 }}>{goal.name}</h3>
                    {goal.priority && (
                      <span className={styles.priorityBadge} style={{ 
                        fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600,
                        backgroundColor: goal.priority === 'High' ? '#fee2e2' : goal.priority === 'Medium' ? '#fef3c7' : '#f3f4f6',
                        color: goal.priority === 'High' ? '#dc2626' : goal.priority === 'Medium' ? '#d97706' : '#6b7280'
                      }}>
                        {goal.priority}
                      </span>
                    )}
                  </div>
                  <span className={styles.deadline}>Target: {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  
                  <div className={styles.progressSection}>
                    <div className={styles.progressLabels}>
                      <span className={styles.currentAmount}>{formatCurrencyRaw(convertCurrency(goal.current, goal.currency || 'USD', goalCurrency), goalCurrency)}</span>
                      <span className={styles.targetAmount}>of {formatCurrencyRaw(convertCurrency(goal.target, goal.currency || 'USD', goalCurrency), goalCurrency)}</span>
                    </div>
                    <div className={styles.progressBar}>
                      <motion.div 
                        className={styles.progressFill} 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                    <div className={styles.progressMeta}>
                      <span className={styles.percentText}>{progressPercent}% Funded</span>
                      {goal.contributions.length > 0 && (
                        <span className={styles.contribCount}>{goal.contributions.length} contribution{goal.contributions.length !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Add Modal Overlay */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div 
              className={styles.modalOverlay} 
              onClick={() => setShowAddModal(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className={styles.modalContent} 
                onClick={e => e.stopPropagation()}
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 20 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className={styles.modalHeader}>
                  <h2 className={styles.modalTitle}>New Financial Goal</h2>
                  <p className={styles.modalSubtitle}>Define your milestone and target date.</p>
                </div>
                
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
                  <label>Target Amount ({currencySymbol})</label>
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
                  <DatePicker
                    date={newGoal.deadline ? new Date(newGoal.deadline) : undefined}
                    onDateChange={(date) => setNewGoal({...newGoal, deadline: date ? date.toISOString() : ''})}
                    className={`${styles.input} w-full flex gap-2 justify-start items-center text-left font-normal hover:bg-[var(--color-primary-bg)] ${!newGoal.deadline ? '!text-gray-400' : ''}`}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Category</label>
                  <div className={styles.categoryDropdownWrap}>
                    <button
                      type="button"
                      className={styles.categoryTriggerBtn}
                      onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                    >
                      <div className={styles.categorySelectedValue}>
                        {(() => {
                          const selected = CATEGORY_OPTIONS.find(opt => opt.value === newGoal.category) || CATEGORY_OPTIONS[0];
                          const IconComp = selected.icon;
                          return (
                            <>
                              <div className={styles.categoryIconBox}>
                                <IconComp size={16} />
                              </div>
                              <span>{selected.label}</span>
                            </>
                          );
                        })()}
                      </div>
                      <ChevronDown size={18} color="#6B7280" style={{ transform: isCategoryOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                    </button>

                    <AnimatePresence>
                      {isCategoryOpen && (
                        <motion.div
                          className={styles.categoryMenu}
                          initial={{ opacity: 0, y: -10, scale: 0.98 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.98 }}
                          transition={{ duration: 0.15 }}
                        >
                          {CATEGORY_OPTIONS.map(opt => {
                            const Icon = opt.icon;
                            const isSelected = newGoal.category === opt.value;
                            return (
                              <button
                                key={opt.value}
                                type="button"
                                className={`${styles.categoryMenuItem} ${isSelected ? styles.categoryMenuItemActive : ''}`}
                                onClick={() => {
                                  setNewGoal({ ...newGoal, category: opt.value });
                                  setIsCategoryOpen(false);
                                }}
                              >
                                <div className={styles.categoryMenuLabel}>
                                  <div className={styles.categoryIconBox}>
                                    <Icon size={16} />
                                  </div>
                                  <span>{opt.label}</span>
                                </div>
                                {isSelected && <Check size={16} color="#19533B" />}
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className={styles.formGroup}>
                    <label>Priority</label>
                    <select 
                      className={styles.select}
                      value={newGoal.priority}
                      onChange={e => setNewGoal({...newGoal, priority: e.target.value as any})}
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  {goals.length > 0 && (
                    <div className={styles.formGroup}>
                      <label>Depends On (Optional)</label>
                      <select 
                        className={styles.select}
                        value={newGoal.dependsOn}
                        onChange={e => setNewGoal({...newGoal, dependsOn: e.target.value})}
                      >
                        <option value="">None</option>
                        {goals.map(g => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div style={{display: 'flex', gap: '1rem', marginTop: '2.5rem'}}>
                  <button className={styles.addGoalBtn} style={{flex: 1, justifyContent: 'center', backgroundColor: '#F3F4F6', color: '#6B7280', boxShadow: 'none'}} onClick={() => setShowAddModal(false)}>Cancel</button>
                  <button className={styles.addGoalBtn} style={{flex: 1, justifyContent: 'center', backgroundColor: '#19533B', color: 'white', boxShadow: '0 8px 20px rgba(25, 83, 59, 0.25)'}} onClick={handleSaveGoal}>Create Goal</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
