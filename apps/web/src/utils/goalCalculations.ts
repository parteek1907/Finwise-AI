/**
 * Goal Calculations Engine
 * Centralized utility for all goal-related computations:
 * status, forecasting, health scores, milestones, coaching insights, and completion analysis.
 */
import { formatDate } from './formatters';

export interface Contribution {
  id: string;
  amount: number;
  date: string;
  note?: string;
}

export interface GoalMilestone {
  id: string;
  label: string;
  icon: string;
  percent: number;
  amount: number;
  achieved: boolean;
  achievedDate?: string;
  insight?: string;
}

export interface GoalForForecast {
  target: number;
  current: number;
  deadline: string;
  createdAt: string;
  contributions: Contribution[];
  completedAt?: string;
}

// ── Status Calculation ──────────────────────────────────────────

export function calculateGoalStatus(goal: GoalForForecast): 'On Track' | 'Ahead' | 'Behind' | 'Planning' | 'Completed' {
  if (goal.current >= goal.target) return 'Completed';
  if (goal.contributions.length === 0) return 'Planning';

  const now = new Date();
  const deadline = new Date(goal.deadline);
  const created = new Date(goal.createdAt);

  const totalDays = Math.max(1, (deadline.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.max(1, (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  const expectedProgress = Math.min(1, elapsedDays / totalDays);
  const actualProgress = goal.current / goal.target;

  if (now > deadline) return 'Behind';
  if (actualProgress >= expectedProgress * 1.15) return 'Ahead';
  if (actualProgress >= expectedProgress * 0.85) return 'On Track';
  return 'Behind';
}

// ── Projected Completion ────────────────────────────────────────

export function calculateProjectedCompletion(goal: GoalForForecast): Date | null {
  const monthlyRate = calculateMonthlyContributionRate(goal);
  if (monthlyRate <= 0) return null;

  const remaining = goal.target - goal.current;
  const monthsNeeded = remaining / monthlyRate;
  const projected = new Date();
  projected.setMonth(projected.getMonth() + Math.ceil(monthsNeeded));
  return projected;
}

// ── Required Monthly Contribution ───────────────────────────────

export function calculateRequiredMonthly(goal: GoalForForecast): number {
  const now = new Date();
  const deadline = new Date(goal.deadline);
  const remaining = goal.target - goal.current;
  if (remaining <= 0) return 0;

  const monthsLeft = Math.max(1, (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  return Math.ceil(remaining / monthsLeft);
}

// ── Monthly Contribution Rate (average) ─────────────────────────

export function calculateMonthlyContributionRate(goal: GoalForForecast): number {
  if (goal.contributions.length === 0) return 0;

  const sorted = [...goal.contributions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const firstDate = new Date(sorted[0].date);
  const now = new Date();
  const monthsElapsed = Math.max(1, (now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
  const totalContributed = sorted.reduce((sum, c) => sum + c.amount, 0);

  return totalContributed / monthsElapsed;
}

// ── Success Probability ─────────────────────────────────────────

export function calculateSuccessProbability(goal: GoalForForecast): number {
  if (goal.current >= goal.target) return 100;
  if (goal.contributions.length === 0) return 20;

  const monthlyRate = calculateMonthlyContributionRate(goal);
  const requiredMonthly = calculateRequiredMonthly(goal);

  if (requiredMonthly <= 0) return 100;

  const ratio = monthlyRate / requiredMonthly;

  // Sigmoid-style mapping: ratio of 1.0 = ~75%, >1.5 = ~95%, <0.5 = ~30%
  const probability = Math.min(100, Math.max(5, Math.round(100 / (1 + Math.exp(-4 * (ratio - 0.8))))));
  return probability;
}

// ── Health Score ─────────────────────────────────────────────────

export function calculateHealthScore(goal: GoalForForecast): { score: number; label: string; reasons: string[] } {
  if (goal.contributions.length === 0) {
    return { score: 30, label: 'Needs Attention', reasons: ['No contributions yet — start saving to improve your score.'] };
  }

  let score = 50; // baseline
  const reasons: string[] = [];

  // Consistency (max +25)
  const consistency = calculateConsistencyScore(goal.contributions);
  const consistencyBonus = Math.round(consistency * 0.25);
  score += consistencyBonus;
  if (consistency >= 80) reasons.push('Excellent contribution consistency.');
  else if (consistency >= 50) reasons.push('Moderate consistency — try contributing regularly.');
  else reasons.push('Inconsistent contributions — set a recurring schedule.');

  // Pace (max +20)
  const monthlyRate = calculateMonthlyContributionRate(goal);
  const requiredMonthly = calculateRequiredMonthly(goal);
  if (requiredMonthly > 0) {
    const paceRatio = monthlyRate / requiredMonthly;
    if (paceRatio >= 1.2) { score += 20; reasons.push('Savings pace exceeds target.'); }
    else if (paceRatio >= 0.9) { score += 15; reasons.push('Savings pace is on target.'); }
    else if (paceRatio >= 0.6) { score += 8; reasons.push('Savings pace is slightly below target.'); }
    else { score += 2; reasons.push('Savings pace needs improvement to meet deadline.'); }
  } else {
    score += 20;
  }

  // Recency (max +5)
  const lastContrib = [...goal.contributions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  if (lastContrib) {
    const daysSinceLast = (Date.now() - new Date(lastContrib.date).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLast <= 7) { score += 5; }
    else if (daysSinceLast <= 14) { score += 3; }
    else if (daysSinceLast <= 30) { score += 1; reasons.push(`Last contribution was ${Math.round(daysSinceLast)} days ago.`); }
    else { reasons.push(`No contributions in ${Math.round(daysSinceLast)} days.`); }
  }

  score = Math.min(100, Math.max(0, score));

  let label: string;
  if (score >= 85) label = 'Excellent';
  else if (score >= 70) label = 'Good';
  else if (score >= 50) label = 'Fair';
  else label = 'Needs Attention';

  return { score, label, reasons };
}

// ── Consistency Score ───────────────────────────────────────────

export function calculateConsistencyScore(contributions: Contribution[]): number {
  if (contributions.length < 2) return contributions.length > 0 ? 50 : 0;

  const sorted = [...contributions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const firstDate = new Date(sorted[0].date);
  const now = new Date();
  const totalWeeks = Math.max(1, (now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 7));

  // Count unique weeks with contributions
  const weekSet = new Set<string>();
  sorted.forEach(c => {
    const d = new Date(c.date);
    const weekStart = new Date(d);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekSet.add(weekStart.toISOString().split('T')[0]);
  });

  return Math.min(100, Math.round((weekSet.size / totalWeeks) * 100));
}

// ── Intelligent Milestones ──────────────────────────────────────

export function generateMilestones(goal: GoalForForecast): GoalMilestone[] {
  const milestones: GoalMilestone[] = [
    {
      id: 'm_first',
      label: 'First Contribution',
      icon: 'Star',
      percent: 0,
      amount: 0,
      achieved: goal.contributions.length > 0,
      achievedDate: goal.contributions.length > 0
        ? [...goal.contributions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]?.date
        : undefined,
      insight: 'Every journey begins with a single step. You\'ve started building your future.',
    },
    {
      id: 'm_25',
      label: 'Quarter Way',
      icon: 'TrendingUp',
      percent: 25,
      amount: goal.target * 0.25,
      achieved: goal.current >= goal.target * 0.25,
      insight: 'You\'ve built a solid foundation. Maintaining this pace positions you well for the road ahead.',
    },
    {
      id: 'm_50',
      label: 'Halfway There',
      icon: 'Flame',
      percent: 50,
      amount: goal.target * 0.50,
      achieved: goal.current >= goal.target * 0.50,
      insight: 'You\'ve reached the halfway mark. The hardest part is behind you — momentum is on your side.',
    },
    {
      id: 'm_75',
      label: 'Almost There',
      icon: 'Rocket',
      percent: 75,
      amount: goal.target * 0.75,
      achieved: goal.current >= goal.target * 0.75,
      insight: 'Just one more push. You\'re in the final stretch — stay consistent.',
    },
    {
      id: 'm_100',
      label: 'Goal Completed',
      icon: 'Award',
      percent: 100,
      amount: goal.target,
      achieved: goal.current >= goal.target,
      insight: 'Congratulations! You\'ve achieved your financial goal. This discipline will serve you well.',
    },
  ];

  // Calculate achieved dates for percentage milestones from contribution history
  if (goal.contributions.length > 0) {
    const sorted = [...goal.contributions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let runningTotal = 0;
    for (const contrib of sorted) {
      const prevTotal = runningTotal;
      runningTotal += contrib.amount;
      for (const m of milestones) {
        if (m.percent > 0 && !m.achievedDate && prevTotal < m.amount && runningTotal >= m.amount) {
          m.achievedDate = contrib.date;
        }
      }
    }
  }

  return milestones;
}

// ── Motivational Coaching ───────────────────────────────────────

export function generateMotivationalInsight(goal: GoalForForecast): string {
  if (goal.contributions.length === 0) {
    return 'Start your journey with your first contribution. Even a small amount creates momentum and builds the savings habit.';
  }

  const monthlyRate = calculateMonthlyContributionRate(goal);
  const requiredMonthly = calculateRequiredMonthly(goal);
  const projected = calculateProjectedCompletion(goal);
  const deadline = new Date(goal.deadline);
  const consistency = calculateConsistencyScore(goal.contributions);

  // Check recent activity
  const sorted = [...goal.contributions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const daysSinceLast = (Date.now() - new Date(sorted[0].date).getTime()) / (1000 * 60 * 60 * 24);

  if (goal.current >= goal.target) {
    return 'You\'ve reached your goal! Consider redirecting your savings momentum toward your next financial milestone.';
  }

  if (daysSinceLast > 21) {
    return `You haven\'t contributed in ${Math.round(daysSinceLast)} days. Even a small deposit keeps your progress alive and maintains your savings habit.`;
  }

  if (projected && projected < deadline) {
    const daysEarly = Math.round((deadline.getTime() - projected.getTime()) / (1000 * 60 * 60 * 24));
    return `At your current pace, you\'re projected to finish ${daysEarly} days ahead of schedule. Excellent discipline — maintaining this rhythm positions you for early completion.`;
  }

  if (consistency >= 80 && monthlyRate >= requiredMonthly * 0.9) {
    return 'You\'ve been remarkably consistent. Your contribution pattern shows strong financial discipline that will serve every future goal.';
  }

  if (monthlyRate < requiredMonthly * 0.7) {
    const gap = Math.round(requiredMonthly - monthlyRate);
    return `Your current pace is slightly below target. Increasing monthly contributions by approximately ${gap.toLocaleString()} would realign with your original timeline.`;
  }

  if (goal.contributions.length >= 3 && consistency >= 60) {
    return 'Solid consistency across your recent contributions. One additional deposit this month would strengthen your completion forecast significantly.';
  }

  return 'You\'re making progress. Stay focused on consistent contributions — frequency matters more than amount.';
}

// ── Completion Analysis ─────────────────────────────────────────

export function generateCompletionAnalysis(goal: GoalForForecast): {
  completedEarly: boolean;
  daysDifference: number;
  avgMonthlyContribution: number;
  totalContributions: number;
  consistencyScore: number;
  insight: string;
} | null {
  if (goal.current < goal.target || !goal.completedAt) return null;

  const deadline = new Date(goal.deadline);
  const completedDate = new Date(goal.completedAt);
  const completedEarly = completedDate <= deadline;
  const daysDifference = Math.abs(Math.round((deadline.getTime() - completedDate.getTime()) / (1000 * 60 * 60 * 24)));

  const totalContributed = goal.contributions.reduce((sum, c) => sum + c.amount, 0);
  const totalContributions = goal.contributions.length;

  const firstContrib = [...goal.contributions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  const monthsActive = firstContrib
    ? Math.max(1, (completedDate.getTime() - new Date(firstContrib.date).getTime()) / (1000 * 60 * 60 * 24 * 30.44))
    : 1;
  const avgMonthlyContribution = Math.round(totalContributed / monthsActive);
  const consistencyScore = calculateConsistencyScore(goal.contributions);

  let insight: string;
  if (completedEarly) {
    insight = `You reached your goal ${daysDifference} days ahead of schedule. Your average monthly contribution of ${avgMonthlyContribution.toLocaleString()} exceeded the required pace. Maintaining this discipline could accelerate your next financial milestone significantly.`;
  } else if (daysDifference === 0) {
    insight = `You completed your goal right on time. Your planning and execution aligned perfectly. Channel this momentum into your next objective.`;
  } else {
    // Find months with no contributions
    const monthsWithContribs = new Set(goal.contributions.map(c => {
      const d = new Date(c.date);
      return `${d.getFullYear()}-${d.getMonth()}`;
    }));
    const gapMonths = Math.round(monthsActive) - monthsWithContribs.size;

    insight = `You reached your goal ${daysDifference} days after your original target.`;
    if (gapMonths > 0) {
      insight += ` Your contribution history shows approximately ${gapMonths} month${gapMonths > 1 ? 's' : ''} without deposits.`;
    }
    insight += ` A slightly higher monthly contribution would have kept you on schedule. The important thing is you achieved it — use this insight for your next goal.`;
  }

  return {
    completedEarly,
    daysDifference,
    avgMonthlyContribution,
    totalContributions,
    consistencyScore,
    insight,
  };
}

// ── Smart Notifications ─────────────────────────────────────────

export function generateNotifications(goal: GoalForForecast): { type: 'info' | 'warning' | 'success'; message: string }[] {
  const notifications: { type: 'info' | 'warning' | 'success'; message: string }[] = [];
  if (goal.current >= goal.target) return notifications;
  if (goal.contributions.length === 0) return notifications;

  const sorted = [...goal.contributions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const daysSinceLast = (Date.now() - new Date(sorted[0].date).getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceLast > 14) {
    notifications.push({ type: 'warning', message: `You haven't contributed in ${Math.round(daysSinceLast)} days.` });
  }

  const projected = calculateProjectedCompletion(goal);
  const deadline = new Date(goal.deadline);
  if (projected && projected < deadline) {
    notifications.push({ type: 'success', message: 'You\'re ahead of schedule at your current pace.' });
  }

  // Next milestone proximity
  const milestones = [0.25, 0.50, 0.75, 1.0];
  for (const pct of milestones) {
    const milestoneAmount = goal.target * pct;
    const remaining = milestoneAmount - goal.current;
    if (remaining > 0 && remaining <= goal.target * 0.05) {
      notifications.push({ type: 'info', message: `Only ${remaining.toLocaleString()} left to reach ${Math.round(pct * 100)}%.` });
      break;
    }
  }

  // Contribution streak
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const thisMonthContribs = goal.contributions.filter(c => {
    const d = new Date(c.date);
    return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
  });
  if (thisMonthContribs.length >= 3) {
    notifications.push({ type: 'success', message: `${thisMonthContribs.length} contributions this month — great consistency!` });
  }

  return notifications;
}

// ── Monthly Contribution Data (for charts) ──────────────────────

export function getMonthlyContributionData(contributions: Contribution[], months: number = 6): { month: string; amount: number }[] {
  const data: { month: string; amount: number }[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const target = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = formatDate(target);
    const monthAmount = contributions
      .filter(c => {
        const d = new Date(c.date);
        return d.getMonth() === target.getMonth() && d.getFullYear() === target.getFullYear();
      })
      .reduce((sum, c) => sum + c.amount, 0);

    data.push({ month: monthLabel, amount: monthAmount });
  }

  return data;
}

// ── Progress Over Time Data (for charts) ────────────────────────

export function getProgressOverTimeData(contributions: Contribution[]): { date: string; total: number }[] {
  if (contributions.length === 0) return [];

  const sorted = [...contributions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let running = 0;
  return sorted.map(c => {
    running += c.amount;
    return {
      date: formatDate(new Date(c.date)),
      total: running,
    };
  });
}

// ── Quick Amounts by Currency ───────────────────────────────────

export function getQuickAmounts(currency: string): number[] {
  switch (currency) {
    case 'INR': return [5000, 10000, 25000, 50000];
    case 'EUR': return [100, 250, 500, 1000];
    case 'GBP': return [100, 250, 500, 1000];
    case 'USD':
    default: return [100, 250, 500, 1000];
  }
}

// ── Goal Templates ──────────────────────────────────────────────

export interface GoalTemplate {
  name: string;
  category: string;
  icon: string;
  defaultTargets: Record<string, number>;
  defaultMonths: number;
  description: string;
}

export const GOAL_TEMPLATES: GoalTemplate[] = [
  { name: 'Emergency Fund', category: 'Emergency', icon: 'Shield', defaultTargets: { USD: 10000, INR: 500000, EUR: 9000, GBP: 8000 }, defaultMonths: 12, description: '3-6 months of expenses as a safety net' },
  { name: 'Vacation', category: 'Travel', icon: 'Plane', defaultTargets: { USD: 5000, INR: 200000, EUR: 4500, GBP: 4000 }, defaultMonths: 8, description: 'Dream vacation fund' },
  { name: 'House Down Payment', category: 'Housing', icon: 'Home', defaultTargets: { USD: 50000, INR: 2000000, EUR: 45000, GBP: 40000 }, defaultMonths: 36, description: 'Save for your dream home' },
  { name: 'New Car', category: 'Vehicle', icon: 'Car', defaultTargets: { USD: 25000, INR: 800000, EUR: 22000, GBP: 20000 }, defaultMonths: 24, description: 'Your next vehicle fund' },
  { name: 'Education', category: 'Other', icon: 'GraduationCap', defaultTargets: { USD: 15000, INR: 500000, EUR: 12000, GBP: 10000 }, defaultMonths: 18, description: 'Invest in your knowledge' },
  { name: 'Wedding', category: 'Other', icon: 'Heart', defaultTargets: { USD: 20000, INR: 1000000, EUR: 18000, GBP: 15000 }, defaultMonths: 18, description: 'Celebrate your special day' },
  { name: 'Investment Portfolio', category: 'Retirement', icon: 'TrendingUp', defaultTargets: { USD: 10000, INR: 500000, EUR: 9000, GBP: 8000 }, defaultMonths: 12, description: 'Build your first investment portfolio' },
  { name: 'New Laptop', category: 'Other', icon: 'Laptop', defaultTargets: { USD: 2000, INR: 100000, EUR: 1800, GBP: 1500 }, defaultMonths: 6, description: 'Upgrade your tech' },
  { name: 'New Phone', category: 'Other', icon: 'Smartphone', defaultTargets: { USD: 1200, INR: 80000, EUR: 1100, GBP: 1000 }, defaultMonths: 4, description: 'Next-gen smartphone fund' },
];

// ── Smart Recommendations ───────────────────────────────────────

export function generateSmartRecommendations(goal: GoalForForecast): string[] {
  const recommendations: string[] = [];
  const monthlyRate = calculateMonthlyContributionRate(goal);
  const requiredMonthly = calculateRequiredMonthly(goal);
  const progressPercent = (goal.current / goal.target) * 100;

  if (monthlyRate < requiredMonthly * 0.8) {
    recommendations.push('Review recurring subscriptions for potential cancellations to redirect toward this goal.');
    recommendations.push('Set up automatic transfers on payday to ensure consistent progress.');
  }

  if (progressPercent < 25) {
    recommendations.push('Consider selling unused electronics or items to boost your initial savings.');
    recommendations.push('Redirect cashback and rewards program earnings toward this goal.');
  }

  if (progressPercent >= 50 && progressPercent < 100) {
    recommendations.push('You\'re past halfway — consider slightly increasing contributions to finish early.');
    recommendations.push('Delay non-essential discretionary purchases for the next few months.');
  }

  if (goal.contributions.length >= 5) {
    recommendations.push('Your saving discipline is strong. Consider opening a high-yield savings account for this goal.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Start with a small, achievable weekly amount to build the savings habit.');
    recommendations.push('Track daily spending for one week to identify potential savings.');
  }

  return recommendations.slice(0, 4);
}
