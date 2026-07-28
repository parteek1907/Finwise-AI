"use client";

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Award, Zap, ShieldCheck, Flame, TrendingUp, Star, Lock } from 'lucide-react';
import styles from './Achievements.module.css';
import { useAppStore } from '@/store/useAppStore';
import { subscribeToLeaderboard, LeaderboardUser } from '@/services/leaderboard';

const getBadges = (xp: number, streak: number) => [
  { id: 1, name: 'First Steps', desc: 'Completed the onboarding.', icon: Star, color: '#eab308', unlocked: xp > 0 },
  { id: 2, name: 'Avid Saver', desc: 'Reached 25% of an emergency fund goal.', icon: ShieldCheck, color: '#22c55e', unlocked: xp >= 150 },
  { id: 3, name: '7-Day Streak', desc: 'Logged in for 7 consecutive days.', icon: Flame, color: '#f97316', unlocked: streak >= 7 },
  { id: 4, name: 'Market Scholar', desc: 'Completed 5 investing modules.', icon: Award, color: '#3b82f6', unlocked: xp >= 500 },
  { id: 5, name: 'Scam Buster', desc: 'Correctly identified 3 scams.', icon: Zap, color: '#8b5cf6', unlocked: xp >= 1000 },
  { id: 6, name: 'Bull Run', desc: 'Made a profitable simulated trade.', icon: TrendingUp, color: '#ec4899', unlocked: xp >= 1500 },
];

export default function AchievementsPage() {
  const user = useAppStore(state => state.user);
  const [liveLeaderboard, setLiveLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    let unsubscribeFn: (() => void) | null = null;

    import('@/services/leaderboard').then(({ syncUserXp, subscribeToLeaderboard }) => {
      // Sync current user to Firebase (service guards against non-auth IDs)
      const currentUser = useAppStore.getState().user;
      syncUserXp(currentUser);

      // Subscribe to live leaderboard updates
      unsubscribeFn = subscribeToLeaderboard((users) => {
        setLiveLeaderboard(users);
        setIsLoading(false);
      });
    });

    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }, []);

  // Level Calculation: Total XP = 50 * Level * (Level + 1)
  // Therefore Level = floor((-1 + sqrt(1 + 8 * Total XP / 100)) / 2)
  const currentLevel = Math.floor((-1 + Math.sqrt(1 + 8 * user.xp / 100)) / 2);
  const currentLevelBaseXp = 50 * currentLevel * (currentLevel + 1);
  const xpForNextLevel = 50 * (currentLevel + 1) * (currentLevel + 2);
  const xpNeededForNextLevel = xpForNextLevel - currentLevelBaseXp;
  
  const xpProgress = user.xp - currentLevelBaseXp;
  const progressPercent = (xpProgress / xpNeededForNextLevel) * 100;

  return (
    <AppLayout>
      <div className={styles.workspace}>
        <header className={styles.header}>
          <div className={styles.titleWrap}>
            <div className={styles.iconBox}><Award size={28} color="#19533B" /></div>
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
                  <Flame size={18} /> {user.streak > 0 ? `${user.streak} Day Streak` : 'No Streak'}
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
                <span className={styles.xpSub}>{xpNeededForNextLevel - xpProgress} XP until Level {currentLevel + 1}</span>
              </div>
            </div>

            {/* Badges Grid */}
            <div className={styles.badgesSection}>
              <h3>Earned Badges</h3>
              <div className={styles.badgesGrid}>
                {getBadges(user.xp, user.streak).map(badge => (
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
                {isLoading && <p className="text-sm text-gray-500 mt-4">Loading top learners...</p>}
                {!isLoading && liveLeaderboard.length === 0 && (
                  <p className="text-sm text-gray-500 mt-4">No top learners yet. Complete a course to be the first!</p>
                )}
                {liveLeaderboard.map(player => {
                  const isUser = player.id === user.id;
                  return (
                    <div key={player.id} className={`${styles.playerRow} ${isUser ? styles.currentUser : ''}`}>
                      <div className={styles.rank}>{player.rank}</div>
                      <div className={styles.avatar}>
                        <img src={player.avatar} alt={player.name} />
                      </div>
                      <div className={styles.playerName}>{isUser ? (user.name || 'You') : player.name}</div>
                      <div className={styles.playerXp}>{player.xp} XP</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}
