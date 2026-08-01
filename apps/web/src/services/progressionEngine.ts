import { useAppStore } from '../store/useAppStore';

// Level Data
export const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: 'Financial Explorer' },
  { level: 2, xp: 100, title: 'Novice Saver' },
  { level: 3, xp: 300, title: 'Budget Apprentice' },
  { level: 5, xp: 800, title: 'Smart Saver' },
  { level: 10, xp: 2500, title: 'Disciplined Investor' },
  { level: 20, xp: 8000, title: 'Market Analyst' },
  { level: 35, xp: 20000, title: 'Portfolio Builder' },
  { level: 50, xp: 50000, title: 'Financial Strategist' },
  { level: 75, xp: 120000, title: 'Wealth Architect' },
  { level: 100, xp: 250000, title: 'FinWise Master' }
];

export function getLevelData(xp: number) {
  let current = LEVEL_THRESHOLDS[0];
  let next = LEVEL_THRESHOLDS[1];
  
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      current = LEVEL_THRESHOLDS[i];
      next = LEVEL_THRESHOLDS[i + 1] || LEVEL_THRESHOLDS[i];
    } else {
      break;
    }
  }
  
  return { current, next };
}

// Action XP Map
export const XP_REWARDS: Record<string, { xp: number; coins: number; label: string }> = {
  COMPLETE_LESSON: { xp: 20, coins: 5, label: 'Lesson Completed' },
  PASS_QUIZ: { xp: 50, coins: 15, label: 'Quiz Passed' },
  PERFECT_QUIZ: { xp: 80, coins: 25, label: 'Perfect Quiz' },
  COMPLETE_COURSE: { xp: 250, coins: 100, label: 'Course Completed' },
  CREATE_GOAL: { xp: 40, coins: 10, label: 'Goal Created' },
  ADD_FUNDS: { xp: 25, coins: 5, label: 'Funds Added' },
  COMPLETE_GOAL: { xp: 400, coins: 200, label: 'Goal Completed' },
  REFLECTION_COMPLETED: { xp: 15, coins: 5, label: 'Reflection Completed' },
  EMOTION_CHECK: { xp: 15, coins: 5, label: 'Emotion Check' },
  TRADE_NO_WARNING: { xp: 30, coins: 10, label: 'Disciplined Trade' },
  DIAMOND_HANDS: { xp: 100, coins: 50, label: 'Long-term Hold' },
  MENTOR_QUESTION: { xp: 10, coins: 2, label: 'Asked AI Mentor' },
  STREAK_BONUS: { xp: 50, coins: 20, label: 'Streak Bonus' },
  SCAM_DETECTED: { xp: 30, coins: 10, label: 'Scam Detected' },
  MYTH_BUSTED: { xp: 15, coins: 5, label: 'Myth Busted' }
};

type ActionType = keyof typeof XP_REWARDS;

// Trigger Action
export function triggerProgression(actionType: ActionType, category: 'learning' | 'saving' | 'reflection' | 'login', silent: boolean = false, customReward?: { xp: number, coins: number, label?: string }) {
  const defaultReward = XP_REWARDS[actionType];
  if (!defaultReward && !customReward) return;
  
  const reward = {
    xp: customReward?.xp ?? defaultReward?.xp ?? 0,
    coins: customReward?.coins ?? defaultReward?.coins ?? 0,
    label: customReward?.label ?? defaultReward?.label ?? 'Reward'
  };

  const store = useAppStore.getState();
  const user = store.user;
  
  // Need a safe fallback for progression if legacy user
  const progression = user.progression || {
    streaks: {
      login: { current: 0, best: 0 },
      learning: { current: 0, best: 0 },
      saving: { current: 0, best: 0 },
      reflection: { current: 0, best: 0 },
    },
    badges: {},
    activityGraph: {},
    recentMilestones: [],
  };

  const newXp = user.xp + reward.xp;
  const newCoins = (user.coins || 0) + reward.coins;
  
  // Check level up
  const oldLevel = getLevelData(user.xp).current;
  const newLevelData = getLevelData(newXp).current;
  let milestones = [...progression.recentMilestones];

  if (newLevelData.level > oldLevel.level) {
    // LEVEL UP!
    milestones.unshift({
      id: `lvl_${newLevelData.level}_${Date.now()}`,
      title: `Reached Level ${newLevelData.level}: ${newLevelData.title}`,
      date: new Date().toISOString(),
      type: 'level'
    });
    // Truncate milestones to keep state small
    if (milestones.length > 20) milestones.pop();
  }

  // Update Activity Graph
  const today = new Date().toISOString().split('T')[0];
  const graph = { ...progression.activityGraph };
  if (!graph[today]) {
    graph[today] = { xp: 0, types: [] };
  } else {
    graph[today] = { ...graph[today], types: [...graph[today].types] };
  }
  graph[today].xp += reward.xp;
  if (!graph[today].types.includes(category)) {
    graph[today].types.push(category);
  }

  // Handle Streaks
  const streaks = { ...progression.streaks };
  // Deep clone the specific category streak
  const targetStreak = streaks[category] ? { ...streaks[category] } : { current: 0, best: 0, lastDate: '' };
  
  if (targetStreak) {
    const lastDate = targetStreak.lastDate;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastDate === yesterdayStr) {
      targetStreak.current += 1;
      targetStreak.best = Math.max(targetStreak.best, targetStreak.current);
    } else if (lastDate !== today) {
      targetStreak.current = 1;
      targetStreak.best = Math.max(targetStreak.best, 1);
    }
    targetStreak.lastDate = today;
  }
  streaks[category] = targetStreak;

  // Update store
  store.updateUser({
    xp: newXp,
    coins: newCoins,
    level: newLevelData.level,
    title: newLevelData.title,
    progression: {
      ...progression,
      streaks,
      activityGraph: graph,
      recentMilestones: milestones
    }
  });

  // Re-evaluate badges instantly based on latest store state
  store.syncLegacyProgress();
  
  
  // Fire global event for Toast Animation if not silent
  if (typeof window !== 'undefined' && !silent) {
    window.dispatchEvent(new CustomEvent('FINWISE_XP_GAINED', {
      detail: {
        xp: reward.xp,
        coins: reward.coins,
        label: reward.label,
        levelUp: newLevelData.level > oldLevel.level ? newLevelData : null
      }
    }));
  }
}
