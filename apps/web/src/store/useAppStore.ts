import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { syncUserXp } from '../services/leaderboard';
import {
  calculateGoalStatus,
  type Contribution,
} from '../utils/goalCalculations';

// Types
export interface User {
  id?: string;
  name: string;
  email: string;
  avatar: string;
  archetype: string;
  healthScore: number;
  xp: number;
  streak: number;
  lastCourseDate?: string;
}

export interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  deadline: string;
  status: 'On Track' | 'Ahead' | 'Behind' | 'Planning' | 'Completed';
  category: 'Emergency' | 'Housing' | 'Vehicle' | 'Travel' | 'Retirement' | 'Other';
  currency: string;
  contributions: Contribution[];
  createdAt: string;
  completedAt?: string;
  priority?: 'High' | 'Medium' | 'Low';
  dependsOn?: string;
  notes: string[];
  aiInsights: string[];
}

export interface Lesson {
  id: string;
  title: string;
  category: string;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'Completed' | 'In Progress' | 'Locked';
  xp: number;
}

export interface MentorMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actionRequired?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: MentorMessage[];
  updatedAt: string;
}

export interface CourseProgress {
  lessonId: string;
  currentChapterIdx: number;
  miniQuizAnswers: Record<number, number>; // chapterIdx -> optionIdx
  status: 'In Progress' | 'Completed';
  lastAccessed: string;
}

export interface ExamAttempt {
  score: number; // Percentage
  date: string;
  passed: boolean;
}

export interface FinalExamState {
  activeExamId?: string | null;
  answers: Record<number, number>;
  flagged: number[];
  visited: number[];
  timeRemaining: number | null;
  warnings: number;
  attempts: ExamAttempt[];
  status: 'Locked' | 'Available' | 'In Progress' | 'Passed';
}

export interface AppState {
  user: User;
  goals: Goal[];
  lessons: Lesson[];
  chats: ChatSession[];
  activeChatId: string | null;
  
  // Learning Engine State
  courseProgress: Record<string, CourseProgress>;
  finalExamState: FinalExamState;
  lessonChats: Record<string, { id: string; sender: 'user' | 'ai'; text: string }[]>;
  
  // Actions
  addXP: (amount: number) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'current' | 'status' | 'contributions' | 'createdAt' | 'notes' | 'aiInsights'> & { currency?: string }) => void;
  updateGoal: (id: string, amount: number) => void;
  updateGoalDetails: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  addContribution: (goalId: string, amount: number, note?: string) => void;
  editContribution: (goalId: string, contributionId: string, updates: Partial<Contribution>) => void;
  deleteContribution: (goalId: string, contributionId: string) => void;
  updateGoalInsights: (goalId: string, insights: string[]) => void;
  completeGoalTarget: (goalId: string) => void;
  updateCourseProgress: (lessonId: string, data: Partial<CourseProgress>) => void;
  updateFinalExamState: (data: Partial<FinalExamState>) => void;
  updateLessonChat: (lessonId: string, messages: { id: string; sender: 'user' | 'ai'; text: string }[]) => void;
  clearLessonChat: (lessonId: string) => void;
  completeLesson: (id: string) => void;
  addMessage: (chatId: string, message: Omit<MentorMessage, 'id' | 'timestamp'>) => void;
  createNewChat: (title?: string) => string;
  setActiveChat: (id: string) => void;
  updateChatTitle: (id: string, title: string) => void;
  updateUser: (data: Partial<User>) => void;
  updateUserFromCloud: (data: Partial<User>) => void; // Update without syncing back
  resetUser: () => void;
  resetStore: () => void;
  seedDemoData: () => void;
}

const INITIAL_USER: User = {
  name: '',
  email: '',
  avatar: '',
  archetype: 'The Guardian',
  healthScore: 85,
  xp: 0,
  streak: 0,
};

// Empty initial goals — users will see the empty state with templates
const INITIAL_GOALS: Goal[] = [];

const INITIAL_LESSONS: Lesson[] = [
  { id: 'l1', title: 'The Psychology of Spending', category: 'Behavior', duration: '5 min', difficulty: 'Easy', status: 'In Progress', xp: 50 },
  { id: 'l2', title: 'The Delay Discounting Trap', category: 'Behavior', duration: '8 min', difficulty: 'Easy', status: 'Locked', xp: 50 },
  { id: 'l4', title: 'Index Funds 101', category: 'Investing', duration: '15 min', difficulty: 'Easy', status: 'Locked', xp: 50 },
  { id: 'l5', title: 'Emergency Fund Basics', category: 'Saving', duration: '6 min', difficulty: 'Easy', status: 'Locked', xp: 50 },
  
  { id: 'l3', title: 'Lifestyle Creep', category: 'Behavior', duration: '10 min', difficulty: 'Medium', status: 'Locked', xp: 100 },
  { id: 'l6', title: 'Debt Snowball vs Avalanche', category: 'Credit', duration: '12 min', difficulty: 'Medium', status: 'Locked', xp: 100 },
  { id: 'l7', title: 'Asset Allocation Strategies', category: 'Investing', duration: '14 min', difficulty: 'Medium', status: 'Locked', xp: 100 },
  
  { id: 'l8', title: 'Tax-Advantaged Accounts', category: 'Taxes', duration: '15 min', difficulty: 'Hard', status: 'Locked', xp: 150 },
  { id: 'l9', title: 'Options Trading Basics', category: 'Investing', duration: '20 min', difficulty: 'Hard', status: 'Locked', xp: 150 },
  { id: 'l10', title: 'Retirement Drawdown', category: 'Retirement', duration: '18 min', difficulty: 'Hard', status: 'Locked', xp: 150 },
];

// Helper to recalculate which lessons are locked
const recalculateLocks = (lessons: Lesson[]): Lesson[] => {
  const easyCompleted = lessons.filter(l => l.difficulty === 'Easy').every(l => l.status === 'Completed');
  const mediumCompleted = lessons.filter(l => l.difficulty === 'Medium').every(l => l.status === 'Completed');

  return lessons.map(lesson => {
    if (lesson.status === 'Completed') return lesson;

    if (lesson.difficulty === 'Easy') {
      return { ...lesson, status: 'In Progress' };
    }
    
    if (lesson.difficulty === 'Medium') {
      return { ...lesson, status: easyCompleted ? 'In Progress' : 'Locked' };
    }

    if (lesson.difficulty === 'Hard') {
      return { ...lesson, status: mediumCompleted ? 'In Progress' : 'Locked' };
    }

    return lesson;
  });
};

const INITIAL_MESSAGES: MentorMessage[] = [];

const INITIAL_CHATS: ChatSession[] = [];

// Helper: recalculate goal status and detect completion
function recalcGoalAfterContribution(goal: Goal): Goal {
  const updated = { ...goal };
  updated.status = calculateGoalStatus({
    target: updated.target,
    current: updated.current,
    deadline: updated.deadline,
    createdAt: updated.createdAt,
    contributions: updated.contributions,
    completedAt: updated.completedAt,
  });

  // Auto-complete detection
  if (updated.current >= updated.target && !updated.completedAt) {
    updated.completedAt = new Date().toISOString();
    updated.status = 'Completed';
  }

  return updated;
}

// Helper: migrate legacy goals that lack new fields
function migrateGoal(goal: any): Goal {
  return {
    ...goal,
    currency: goal.currency || 'USD',
    contributions: goal.contributions || [],
    createdAt: goal.createdAt || new Date().toISOString(),
    notes: goal.notes || [],
    aiInsights: goal.aiInsights || [],
    status: goal.status || 'Planning',
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: INITIAL_USER,
      goals: INITIAL_GOALS,
      lessons: recalculateLocks(INITIAL_LESSONS),
      chats: INITIAL_CHATS,
      activeChatId: null,
      courseProgress: {},
      finalExamState: {
        activeExamId: null,
        answers: {},
        flagged: [],
        visited: [],
        timeRemaining: null,
        warnings: 0,
        attempts: [],
        status: 'Locked'
      },
      lessonChats: {},

      resetStore: () => set({
        user: INITIAL_USER,
        goals: INITIAL_GOALS,
        lessons: recalculateLocks(INITIAL_LESSONS),
        chats: INITIAL_CHATS,
        activeChatId: null,
        courseProgress: {},
        lessonChats: {},
        finalExamState: {
          activeExamId: null,
          answers: {},
          flagged: [],
          visited: [],
          timeRemaining: null,
          warnings: 0,
          attempts: [],
          status: 'Locked'
        }
      }),

      addXP: (amount) => set((state) => ({ 
        user: { ...state.user, xp: state.user.xp + amount } 
      })),

      addGoal: (goalData) => set((state) => {
        const newGoal: Goal = {
          name: goalData.name,
          target: goalData.target,
          deadline: goalData.deadline,
          category: goalData.category as Goal['category'],
          currency: goalData.currency || 'USD',
          id: `g${Date.now()}`,
          current: 0,
          status: 'Planning',
          contributions: [],
          createdAt: new Date().toISOString(),
          notes: [],
          aiInsights: [],
          priority: goalData.priority,
          dependsOn: goalData.dependsOn,
        };
        return { goals: [...state.goals, newGoal] };
      }),

      updateGoal: (id, amount) => set((state) => ({
        goals: state.goals.map(g => {
          if (g.id !== id) return g;
          const updated = {
            ...g,
            current: Math.max(0, Math.min(g.target, g.current + amount)),
            contributions: [
              ...g.contributions,
              {
                id: `c${Date.now()}`,
                amount: amount,
                date: new Date().toISOString(),
                note: 'Added via AI Mentor',
              },
            ],
          };
          return recalcGoalAfterContribution(updated);
        })
      })),

      updateGoalDetails: (id, updates) => set((state) => ({
        goals: state.goals.map(g => {
          if (g.id !== id) return g;
          const updated = { ...g, ...updates };
          return recalcGoalAfterContribution(updated);
        })
      })),

      deleteGoal: (id) => set((state) => ({
        goals: state.goals.filter(g => g.id !== id)
      })),

      addContribution: (goalId, amount, note) => set((state) => ({
        goals: state.goals.map(g => {
          if (g.id !== goalId) return g;
          const newContribution: Contribution = {
            id: `c${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            amount,
            date: new Date().toISOString(),
            note,
          };
          const updated = {
            ...g,
            current: Math.min(g.target, g.current + amount),
            contributions: [...g.contributions, newContribution],
          };
          return recalcGoalAfterContribution(updated);
        })
      })),

      editContribution: (goalId, contributionId, updates) => set((state) => ({
        goals: state.goals.map(g => {
          if (g.id !== goalId) return g;
          const oldContrib = g.contributions.find(c => c.id === contributionId);
          if (!oldContrib) return g;
          
          const amountDiff = (updates.amount !== undefined ? updates.amount : oldContrib.amount) - oldContrib.amount;
          const newContributions = g.contributions.map(c =>
            c.id === contributionId ? { ...c, ...updates } : c
          );
          const updated = {
            ...g,
            current: Math.max(0, Math.min(g.target, g.current + amountDiff)),
            contributions: newContributions,
          };
          return recalcGoalAfterContribution(updated);
        })
      })),

      deleteContribution: (goalId, contributionId) => set((state) => ({
        goals: state.goals.map(g => {
          if (g.id !== goalId) return g;
          const contrib = g.contributions.find(c => c.id === contributionId);
          if (!contrib) return g;
          const updated = {
            ...g,
            current: Math.max(0, g.current - contrib.amount),
            contributions: g.contributions.filter(c => c.id !== contributionId),
            completedAt: undefined, // un-complete if deleting drops below target
          };
          return recalcGoalAfterContribution(updated);
        })
      })),

      updateGoalInsights: (goalId, insights) => set((state) => ({
        goals: state.goals.map(g =>
          g.id === goalId ? { ...g, aiInsights: insights } : g
        )
      })),

      completeGoalTarget: (goalId) => set((state) => ({
        goals: state.goals.map(g =>
          g.id === goalId ? { ...g, completedAt: new Date().toISOString(), status: 'Completed' as const } : g
        )
      })),

      updateCourseProgress: (lessonId, data) => set((state) => {
        const existing = state.courseProgress[lessonId] || {
          lessonId,
          currentChapterIdx: 0,
          miniQuizAnswers: {},
          status: 'In Progress',
          lastAccessed: new Date().toISOString()
        };
        return {
          courseProgress: {
            ...state.courseProgress,
            [lessonId]: { ...existing, ...data, lastAccessed: new Date().toISOString() }
          }
        };
      }),

      updateFinalExamState: (data) => set((state) => ({
        finalExamState: { ...state.finalExamState, ...data }
      })),

      updateLessonChat: (lessonId, messages) => set((state) => ({
        lessonChats: { ...state.lessonChats, [lessonId]: messages }
      })),

      clearLessonChat: (lessonId) => set((state) => {
        const newChats = { ...state.lessonChats };
        delete newChats[lessonId];
        return { lessonChats: newChats };
      }),

      completeLesson: (id) => {
        set((state) => {
        const lesson = state.lessons.find(l => l.id === id);
        if (!lesson || lesson.status === 'Completed') return state;
        
        const newLessons = state.lessons.map(l => l.id === id ? { ...l, status: 'Completed' } : l) as Lesson[];
        
        // Check if all lessons are completed to unlock final exam
        const allCompleted = newLessons.every(l => l.status === 'Completed');
        const currentExamStatus = state.finalExamState.status;
        
        // Streak Logic
        const today = new Date().toISOString().split('T')[0];
        let newStreak = state.user.streak;
        
        if (!state.user.lastCourseDate) {
          // First course ever
          newStreak = 1;
        } else if (state.user.lastCourseDate !== today) {
          const lastDate = new Date(state.user.lastCourseDate);
          const currentDate = new Date(today);
          const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          
          if (diffDays === 1) {
            newStreak += 1; // Completed next day
          } else if (diffDays > 1) {
            newStreak = 1; // Streak broken
          }
        }
        
        return {
          lessons: recalculateLocks(newLessons),
          user: { 
            ...state.user, 
            id: state.user.id || `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            xp: state.user.xp + lesson.xp,
            streak: newStreak,
            lastCourseDate: today
          },
          finalExamState: {
            ...state.finalExamState,
            status: (allCompleted && currentExamStatus === 'Locked') ? 'Available' : currentExamStatus
          }
        };
      });
      // Fire async sync after state update
      syncUserXp(get().user);
    },

    addMessage: (chatId, message) => set((state) => ({
        chats: state.chats.map(chat => {
          if (chat.id === chatId) {
            return {
              ...chat,
              updatedAt: new Date().toISOString(),
              messages: [...chat.messages, { ...message, id: `m${Date.now()}`, timestamp: new Date().toISOString() }]
            };
          }
          return chat;
        })
      })),

      createNewChat: (title = 'New Chat') => {
        const newChatId = `chat_${Date.now()}`;
        set((state) => ({
          chats: [
            {
              id: newChatId,
              title,
              messages: [],
              updatedAt: new Date().toISOString()
            },
            ...state.chats
          ],
          activeChatId: newChatId
        }));
        return newChatId;
      },

      setActiveChat: (id) => set({ activeChatId: id }),

      updateChatTitle: (id, title) => set((state) => ({
        chats: state.chats.map(chat => chat.id === id ? { ...chat, title } : chat)
      })),

      updateUser: (data) => {
        set((state) => ({
          user: { ...state.user, ...data }
        }));
        // Only sync to Firebase if user has a real Auth UID (not a local fallback)
        const currentUser = get().user;
        if (currentUser.id && !currentUser.id.startsWith('user_')) {
          syncUserXp(currentUser);
        }
      },

      updateUserFromCloud: (data) => {
        set((state) => ({
          user: { ...state.user, ...data }
        }));
      },

      resetUser: () => {
        set({ user: INITIAL_USER });
      },

      seedDemoData: () => {
        const demoGoals: Goal[] = [
          {
            id: 'demo-g1',
            name: 'Tesla Model 3',
            target: 45000,
            current: 12500,
            currency: 'USD',
            status: 'On Track',
            category: 'Vehicle',
            deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString(),
            contributions: [
              { id: 'c1', date: new Date().toISOString(), amount: 12500, note: 'Initial savings' }
            ],
            createdAt: new Date().toISOString(),
            notes: [],
            aiInsights: []
          },
          {
            id: 'demo-g2',
            name: 'Emergency Fund',
            target: 10000,
            current: 8500,
            currency: 'USD',
            status: 'On Track',
            category: 'Emergency',
            deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
            contributions: [
              { id: 'c2', date: new Date().toISOString(), amount: 8500, note: 'Steady savings' }
            ],
            createdAt: new Date().toISOString(),
            notes: [],
            aiInsights: []
          }
        ];

        const demoLessons = INITIAL_LESSONS.map((l, idx) => ({
          ...l,
          status: (idx < 3 ? 'Completed' : (idx === 3 ? 'In Progress' : l.status)) as any
        }));

        set((state) => ({
          user: { ...state.user, xp: 850, streak: 12, name: 'Demo User' },
          goals: demoGoals,
          lessons: recalculateLocks(demoLessons),
          courseProgress: {
            'l1': { lessonId: 'l1', currentChapterIdx: 4, miniQuizAnswers: {}, status: 'Completed', lastAccessed: new Date().toISOString() },
            'l2': { lessonId: 'l2', currentChapterIdx: 3, miniQuizAnswers: {}, status: 'Completed', lastAccessed: new Date().toISOString() }
          }
        }));
      }
    }),
    {
      name: 'finwise-storage',
      merge: (persistedState: any, currentState: AppState) => {
        if (!persistedState) return currentState;

        // Migrate lessons (existing logic)
        if (persistedState.lessons) {
          const persistedIds = new Set(persistedState.lessons.map((l: any) => l.id));
          INITIAL_LESSONS.forEach(initialLesson => {
            if (!persistedIds.has(initialLesson.id)) {
              persistedState.lessons.unshift(initialLesson);
            }
          });
          persistedState.lessons = recalculateLocks(persistedState.lessons);
        }

        // Migrate goals: ensure all goals have new fields
        if (persistedState.goals && Array.isArray(persistedState.goals)) {
          persistedState.goals = persistedState.goals.map(migrateGoal);
        }

        return { ...currentState, ...persistedState };
      }
    }
  )
);
