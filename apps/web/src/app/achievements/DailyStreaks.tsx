import React from 'react';
import { Flame, BookOpen, PiggyBank, BrainCircuit, LogIn } from 'lucide-react';
import styles from './Progression.module.css';

interface DailyStreaksProps {
  streaks: {
    login: { current: number; best: number };
    learning: { current: number; best: number };
    saving: { current: number; best: number };
    reflection: { current: number; best: number };
  };
}

export const DailyStreaks: React.FC<DailyStreaksProps> = ({ streaks }) => {
  const streakConfig = [
    { id: 'login', label: 'Daily Login', icon: LogIn, data: streaks.login, color: '#3b82f6' },
    { id: 'learning', label: 'Learning', icon: BookOpen, data: streaks.learning, color: '#10b981' },
    { id: 'saving', label: 'Saving', icon: PiggyBank, data: streaks.saving, color: '#8b5cf6' },
    { id: 'reflection', label: 'Reflection', icon: BrainCircuit, data: streaks.reflection, color: '#f59e0b' },
  ];

  return (
    <div className={styles.streaksContainer}>
      {streakConfig.map(s => {
        const Icon = s.icon;
        const isActive = s.data.current > 0;
        
        return (
          <div key={s.id} className={`${styles.streakCard} ${isActive ? styles.streakActive : ''}`}>
            <div className={styles.streakHeader}>
              <div className={styles.streakIconWrap} style={{ color: s.color, backgroundColor: `${s.color}15` }}>
                <Icon size={20} />
              </div>
              <h4>{s.label}</h4>
            </div>
            
            <div className={styles.streakStats}>
              <div className={styles.streakCurrent}>
                <Flame size={24} color={isActive ? '#f97316' : '#cbd5e1'} className={isActive ? styles.flameActive : ''} />
                <span className={styles.streakNum}>{s.data.current}</span>
                <span className={styles.streakLabel}>Day Streak</span>
              </div>
              <div className={styles.streakBest}>
                <span>Best: {s.data.best}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
