import React from 'react';
import { Award, Target, Flame, Star, Zap } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import styles from './Progression.module.css';

interface Milestone {
  id: string;
  title: string;
  date: string;
  type: 'badge' | 'level' | 'streak' | 'goal';
}

interface AchievementTimelineProps {
  milestones: Milestone[];
}

export const AchievementTimeline: React.FC<AchievementTimelineProps> = ({ milestones }) => {
  if (milestones.length === 0) {
    return (
      <div className={styles.timelineCard}>
        <h3>Recent Milestones</h3>
        <p className={styles.emptyTimeline}>No milestones yet. Start learning and trading to earn some!</p>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'badge': return <Award size={16} color="#10b981" />;
      case 'level': return <Star size={16} color="#c8a56e" />;
      case 'streak': return <Flame size={16} color="#f97316" />;
      case 'goal': return <Target size={16} color="#3b82f6" />;
      default: return <Zap size={16} color="#94a3b8" />;
    }
  };

  return (
    <div className={styles.timelineCard}>
      <h3>Recent Milestones</h3>
      
      <div className={styles.timeline}>
        {milestones.map((m, i) => (
          <div key={m.id} className={styles.timelineItem}>
            <div className={styles.timelineConnector}>
              <div className={styles.timelineDot}>{getIcon(m.type)}</div>
              {i < milestones.length - 1 && <div className={styles.timelineLine} />}
            </div>
            <div className={styles.timelineContent}>
              <h4>{m.title}</h4>
              <span>{formatDate(m.date)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
