import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, TrendingUp, Brain, Award, Zap, Flame, Lock, BookOpen, PiggyBank } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import styles from './Progression.module.css';
import { Tabs } from '@/components/ui/vercel-tabs';

interface BadgeCollectionsProps {
  badges: Record<string, { unlockedAt: string; progress: number; isHidden?: boolean }>;
}

const BADGE_CONFIG = [
  { id: 'first_lesson', name: 'First Lesson', desc: 'Complete your first learning module.', icon: Award, category: 'Learning' },
  { id: 'knowledge_hunter', name: 'Knowledge Hunter', desc: 'Complete 10 learning modules.', icon: BookOpen, category: 'Learning' },
  { id: 'first_goal', name: 'First Goal', desc: 'Create your first financial goal.', icon: ShieldCheck, category: 'Saving' },
  { id: 'consistent_saver', name: 'Consistent Saver', desc: 'Add funds 5 times.', icon: PiggyBank, category: 'Saving' },
  { id: 'first_trade', name: 'Market Explorer', desc: 'Execute your first simulated trade.', icon: TrendingUp, category: 'Investing' },
  { id: 'diamond_hands', name: 'Diamond Hands', desc: 'Hold a stock through a 5% drop without panic selling.', icon: Zap, category: 'Investing' },
  { id: 'emotion_master', name: 'Emotion Master', desc: 'Complete 10 emotion checks.', icon: Brain, category: 'Behavior' },
  { id: 'reflection_streak', name: 'Zen Trader', desc: 'Maintain a 7-day reflection streak.', icon: Flame, category: 'Behavior' },
  { id: 'chart_reader', name: 'Chart Reader', desc: 'Complete your first Live Trading Lab.', icon: TrendingUp, category: 'Investing' },
  { id: 'disciplined_trader', name: 'Disciplined Trader', desc: 'Successfully place a trade with a Stop Loss in a Lab.', icon: ShieldCheck, category: 'Investing' },
  { id: 'night_owl', name: 'Night Owl', desc: 'Complete a course after midnight.', icon: Award, category: 'Secret', isHidden: true },
];

export const BadgeCollections: React.FC<BadgeCollectionsProps> = ({ badges }) => {
  const [activeTab, setActiveTab] = useState('All');
  
  const categories = ['All', 'Learning', 'Saving', 'Investing', 'Behavior', 'Secret'];
  
  const filteredBadges = BADGE_CONFIG.filter(b => activeTab === 'All' || b.category === activeTab);
  
  const unlockedCount = BADGE_CONFIG.filter(b => badges[b.id]).length;
  const completionPercent = Math.round((unlockedCount / BADGE_CONFIG.length) * 100);

  return (
    <div className={styles.collectionsCard}>
      <div className={styles.collectionsHeader}>
        <div>
          <h3>Badge Collections</h3>
          <p>Complete actions to unlock unique badges.</p>
        </div>
        <div className={styles.completionStats}>
          <div className={styles.completionRing} style={{ '--progress': `${completionPercent}%` } as any}>
            <span>{completionPercent}%</span>
          </div>
          <div className={styles.completionText}>
            <strong>{unlockedCount} / {BADGE_CONFIG.length}</strong>
            <span>Unlocked</span>
          </div>
        </div>
      </div>
      
      <div className={styles.tabsContainer}>
        <Tabs 
          tabs={categories.map(c => ({ id: c, label: c }))}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>
      
      <div className={styles.badgeGrid}>
        <AnimatePresence mode="popLayout">
          {filteredBadges.map(badge => {
            const isUnlocked = !!badges[badge.id];
            const isSecret = badge.category === 'Secret';
            
            // If it's a hidden secret badge and not unlocked, obscure it
            if (isSecret && !isUnlocked && badge.isHidden) {
              return (
                <motion.div 
                  key={badge.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`${styles.badgeItem} ${styles.badgeLocked}`}
                >
                  <div className={styles.badgeIconWrap}>
                    <Lock size={24} />
                  </div>
                  <h4>Secret Achievement</h4>
                  <p>Keep playing to discover this hidden badge.</p>
                </motion.div>
              );
            }
            
            const Icon = badge.icon;
            
            return (
              <motion.div 
                key={badge.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className={`${styles.badgeItem} ${!isUnlocked ? styles.badgeLocked : ''}`}
              >
                <div className={styles.badgeIconWrap}>
                  <Icon size={28} />
                  {!isUnlocked && <div className={styles.lockedOverlay}><Lock size={12} /></div>}
                </div>
                <h4>{badge.name}</h4>
                <p>{badge.desc}</p>
                
                {isUnlocked && badges[badge.id].unlockedAt && (
                  <span className={styles.unlockedDate}>
                    Unlocked {formatDate(badges[badge.id].unlockedAt)}
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
