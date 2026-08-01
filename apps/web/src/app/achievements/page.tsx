"use client";

import React, { useEffect, useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Award } from 'lucide-react';
import styles from './Achievements.module.css';
import { useAppStore } from '@/store/useAppStore';
import { subscribeToLeaderboard, LeaderboardUser } from '@/services/leaderboard';

// Components
import { ProfilePrestige } from './ProfilePrestige';
import { ActivityGraph } from './ActivityGraph';
import { DailyStreaks } from './DailyStreaks';
import { BadgeCollections } from './BadgeCollections';
import { AchievementTimeline } from './AchievementTimeline';

export default function AchievementsPage() {
  const user = useAppStore(state => state.user);
  
  // Safe fallback for legacy users
  const progression = user.progression || {
    streaks: {
      login: { current: user.streak || 0, best: user.streak || 0 },
      learning: { current: 0, best: 0 },
      saving: { current: 0, best: 0 },
      reflection: { current: 0, best: 0 },
    },
    badges: {},
    activityGraph: {},
    recentMilestones: [],
  };

  const [liveLeaderboard, setLiveLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    let unsubscribeFn: (() => void) | null = null;

    import('@/services/leaderboard').then(({ syncUserXp, subscribeToLeaderboard }) => {
      const currentUser = useAppStore.getState().user;
      syncUserXp(currentUser);
      
      // Force sync legacy progression on mount
      useAppStore.getState().syncLegacyProgress();

      unsubscribeFn = subscribeToLeaderboard((users) => {
        setLiveLeaderboard(users);
        setIsLoading(false);
      });
    });

    return () => {
      if (unsubscribeFn) unsubscribeFn();
    };
  }, []);

  return (
    <AppLayout>
      <div className={styles.workspace}>
        <header className={styles.header}>
          <div className={styles.titleWrap}>
            <div className={styles.iconBox}><Award size={28} color="#19533B" /></div>
            <div>
              <h1 className={styles.title}>Progression Hub</h1>
              <p className={styles.subtitle}>Track your milestones, build streaks, and compete globally.</p>
            </div>
          </div>
        </header>

        <div className={styles.progressionLayout}>
          <main className={styles.mainContent}>
            <ProfilePrestige user={user} />
            <DailyStreaks streaks={progression.streaks} />
            <ActivityGraph activityData={progression.activityGraph} />
            <BadgeCollections badges={progression.badges} />
          </main>

          <aside className={styles.sideCol}>
            <AchievementTimeline milestones={progression.recentMilestones} />
            
            <div className={styles.leaderboardCard}>
              <h3>Global Leaderboard</h3>
              <p className={styles.leaderboardSub}>Compete with other learners to build the best financial habits.</p>
              
              <div className={styles.list}>
                {isLoading && <p className={styles.loadingText}>Loading top learners...</p>}
                {!isLoading && liveLeaderboard.length === 0 && (
                  <p className={styles.emptyText}>No users on the leaderboard yet.</p>
                )}
                {!isLoading && liveLeaderboard.map((u, i) => (
                  <div key={u.id || i} className={styles.leaderboardRow}>
                    <div className={styles.rankBadge}>#{i + 1}</div>
                    <div className={styles.lbUserInfo}>
                      <strong>{u.name}</strong>
                      <span>{u.xp.toLocaleString()} XP</span>
                    </div>
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
