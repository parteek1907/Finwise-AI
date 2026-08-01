"use client";

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Award, Zap, ShieldCheck, Flame, TrendingUp, Star, Lock } from 'lucide-react';
import styles from './Achievements.module.css';
import { useAppStore } from '@/store/useAppStore';

const BADGES = [
  { id: 1, name: 'First Steps', desc: 'Completed the onboarding.', icon: Star, color: '#eab308', unlocked: true },
  { id: 2, name: 'Avid Saver', desc: 'Reached 25% of an emergency fund goal.', icon: ShieldCheck, color: '#22c55e', unlocked: true },
  { id: 3, name: '7-Day Streak', desc: 'Logged in for 7 consecutive days.', icon: Flame, color: '#f97316', unlocked: true },
  { id: 4, name: 'Market Scholar', desc: 'Completed 5 investing modules.', icon: Award, color: '#3b82f6', unlocked: false },
  { id: 5, name: 'Scam Buster', desc: 'Correctly identified 3 scams.', icon: Zap, color: '#8b5cf6', unlocked: false },
  { id: 6, name: 'Bull Run', desc: 'Made a profitable simulated trade.', icon: TrendingUp, color: '#ec4899', unlocked: false },
];

const LEADERBOARD = [
  { rank: 1, name: 'Sarah J.', xp: 3450, avatar: 'https://i.pravatar.cc/150?img=1' },
  { rank: 2, name: 'David M.', xp: 2900, avatar: 'https://i.pravatar.cc/150?img=2' },
  { rank: 3, name: 'Alex Studio', xp: 1250, avatar: 'https://i.pravatar.cc/150?img=11', isUser: true },
  { rank: 4, name: 'Jessica T.', xp: 1100, avatar: 'https://i.pravatar.cc/150?img=4' },
  { rank: 5, name: 'Michael R.', xp: 850, avatar: 'https://i.pravatar.cc/150?img=5' },
];

export default function AchievementsPage() {
  const user = useAppStore(state => state.user);
  
  // Current Level Calculation (Every 1000 XP = 1 Level)
  const currentLevel = Math.floor(user.xp / 1000) + 1;
  const xpForNextLevel = currentLevel * 1000;
  const xpProgress = user.xp % 1000;
  const progressPercent = (xpProgress / 1000) * 100;

  return (
    <AppLayout>
      <div className={styles.workspace}>
        <header className={styles.header}>
          <div className={styles.titleWrap}>
            <div className={styles.iconBox}><Award size={28} color="#eab308" /></div>
            <div>
              <h1 className={styles.title}>Achievements & Rankings</h1>
              <p className={styles.subtitle}>Track your progress and compete on the global leaderboard.</p>
            </div>
          </div>
        </header>

        <div className={styles.layout}>
          
          <main className={styles.mainCol}>
            {/* Level Card */}
            <div className={styles.levelCard}>
              <div className={styles.levelHeader}>
                <div>
                  <span className={styles.label}>Current Rank</span>
                  <h2 className={styles.levelText}>Level {currentLevel}</h2>
                </div>
                <div className={styles.streakBadge}>
                  <Flame size={18} /> {user.streak} Day Streak
                </div>
              </div>

              <div className={styles.xpSection}>
                <div className={styles.xpLabels}>
                  <span>{user.xp.toLocaleString()} XP</span>
                  <span>{xpForNextLevel.toLocaleString()} XP</span>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{width: `${progressPercent}%`}}></div>
                </div>
                <span className={styles.xpSub}>{1000 - xpProgress} XP until Level {currentLevel + 1}</span>
              </div>
            </div>

            {/* Badges Grid */}
            <div className={styles.badgesSection}>
              <h3>Earned Badges</h3>
              <div className={styles.badgesGrid}>
                {BADGES.map(badge => (
                  <div key={badge.id} className={`${styles.badgeCard} ${!badge.unlocked ? styles.lockedCard : ''}`}>
                    <div className={styles.badgeIconBox} style={{
                      backgroundColor: badge.unlocked ? `${badge.color}20` : 'var(--color-surface-bg)',
                      color: badge.unlocked ? badge.color : 'var(--color-text-secondary)'
                    }}>
                      {badge.unlocked ? <badge.icon size={24} /> : <Lock size={24} />}
                    </div>
                    <h4>{badge.name}</h4>
                    <p>{badge.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </main>

          <aside className={styles.sideCol}>
            <div className={styles.leaderboardCard}>
              <h3>Global Leaderboard</h3>
              <p className={styles.leaderboardSub}>Compete with other learners to build the best financial habits.</p>
              
              <div className={styles.list}>
                {LEADERBOARD.map(player => (
                  <div key={player.rank} className={`${styles.playerRow} ${player.isUser ? styles.currentUser : ''}`}>
                    <div className={styles.rank}>{player.rank}</div>
                    <div className={styles.avatar}>
                      <img src={player.avatar} alt={player.name} />
                    </div>
                    <div className={styles.playerName}>{player.name}</div>
                    <div className={styles.playerXp}>{player.xp} XP</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}
