import React from 'react';
import { Lightbulb, TrendingUp, ChevronRight } from 'lucide-react';
import styles from './ContextPanel.module.css';

export function ContextPanel() {
  return (
    <aside className={styles.contextPanel}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Recent Insights</h3>
        
        <div className={styles.insightCard}>
          <div className={styles.insightHeader}>
            <Lightbulb size={16} className={styles.insightIcon} />
            <h4>Spending Pattern</h4>
          </div>
          <p>You've spent 15% less on dining out this week. Great discipline.</p>
        </div>
        
        <div className={styles.insightCard}>
          <div className={styles.insightHeader}>
            <TrendingUp size={16} className={styles.insightIcon} />
            <h4>Goal Projection</h4>
          </div>
          <p>At your current savings rate, you will reach your Emergency Fund goal 2 months early.</p>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Quick Actions</h3>
        <button className={styles.actionBtn}>
          Log a manual transaction <ChevronRight size={16} />
        </button>
        <button className={styles.actionBtn}>
          Talk to AI Mentor <ChevronRight size={16} />
        </button>
      </div>
    </aside>
  );
}
