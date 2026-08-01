import React from 'react';
import { User } from '@/store/useAppStore';
import { getLevelData } from '@/services/progressionEngine';
import { Award, Zap, Coins, Flame, Star, Trophy, Target, Sparkles } from 'lucide-react';
import styles from './Progression.module.css';

interface ProfilePrestigeProps {
  user: any;
}

export const ProfilePrestige: React.FC<ProfilePrestigeProps> = ({ user }) => {
  const { current, next } = getLevelData(user.xp || 0);
  const xpIntoLevel = (user.xp || 0) - current.xp;
  const xpNeeded = next.xp - current.xp;
  const progressPercent = xpNeeded > 0 ? (xpIntoLevel / xpNeeded) * 100 : 100;

  return (
    <div className={styles.prestigeCard}>
      <div className={styles.prestigeHeader}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarWrap}>
            <img 
              src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=303A3C&color=fff`} 
              alt="Avatar" 
              className={styles.avatar}
            />
            <div className={styles.levelBadge}>{current.level}</div>
          </div>
          <div className={styles.userInfo}>
            <h2>{user.name}</h2>
            <div className={styles.titleBadge}>
              <Award size={14} className={styles.titleIcon} />
              {current.title}
            </div>
          </div>
        </div>

        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <Zap size={20} className={styles.xpIcon} />
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{user.xp.toLocaleString()}</span>
              <span className={styles.statLabel}>Total XP</span>
            </div>
          </div>
          <div className={styles.statItem}>
            <Coins size={20} className={styles.coinIcon} />
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{(user.coins || 0).toLocaleString()}</span>
              <span className={styles.statLabel}>FinCoins</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.xpBarSection}>
        <div className={styles.xpBarHeader}>
          <span>Level {current.level}</span>
          <span>Level {next.level}</span>
        </div>
        <div className={styles.xpBarBg}>
          <div className={styles.xpBarFill} style={{ width: `${progressPercent}%` }} />
        </div>
        <div className={styles.xpBarFooter}>
          <span>{xpIntoLevel.toLocaleString()} XP</span>
          <span>{xpNeeded > 0 ? `${xpNeeded.toLocaleString()} XP needed` : 'MAX LEVEL'}</span>
        </div>
      </div>
      
      <div className={styles.prestigeFooter}>
        <div className={styles.footerItem}>
          <Trophy size={16} />
          <span>Top Badge: <strong>{user.topBadge || 'Novice'}</strong></span>
        </div>
        <div className={styles.footerItem}>
          <Flame size={16} color="#f97316" />
          <span>Best Streak: <strong>{Math.max(...Object.values(user.progression?.streaks || {}).map((s: any) => s.best || 0), 0)} Days</strong></span>
        </div>
      </div>
    </div>
  );
};
