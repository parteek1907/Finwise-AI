import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { syncUserXp } from '../services/leaderboard';
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
  status: 'On Track' | 'Ahead' | 'Behind' | 'Planning';
  category: 'Emergency' | 'Housing' | 'Vehicle' | 'Travel' | 'Retirement';
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
  answers: Record<number, number>;
  flagged: number[];
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
  addGoal: (goal: Omit<Goal, 'id' | 'current' | 'status'>) => void;
  updateGoal: (id: string, amount: number) => void;
  updateGoalDetails: (id: string, updates: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
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

const INITIAL_GOALS: Goal[] = [
  { id: 'g1', name: 'Emergency Fund', target: 5000, current: 2400, deadline: '2026-10-01', status: 'On Track', category: 'Emergency' },
  { id: 'g2', name: 'Credit Card Debt', target: 2000, current: 1200, deadline: '2026-08-01', status: 'Ahead', category: 'Emergency' },
  { id: 'g3', name: 'Vehicle Downpayment', target: 8000, current: 0, deadline: '2027-03-01', status: 'Planning', category: 'Vehicle' },
  { id: 'g4', name: 'Japan Trip', target: 4000, current: 1500, deadline: '2027-05-01', status: 'Behind', category: 'Travel' },
];

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

  let hasFirstInProgress = false; // ensures only the very first uncompleted is "In Progress", rest are locked (if we want linear progression). 
  // Let's just unlock all in the current tier.
  
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
        answers: {},
        flagged: [],
        attempts: [],
        status: 'Locked'
      },
      lessonChats: {},

      addXP: (amount) => set((state) => ({ 
        user: { ...state.user, xp: state.user.xp + amount } 
      })),

      addGoal: (goalData) => set((state) => {
        const newGoal: Goal = {
          ...goalData,
          id: `g${Date.now()}`,
          current: 0,
          status: 'Planning'
        };
        return { goals: [...state.goals, newGoal] };
      }),

      updateGoal: (id, amount) => set((state) => ({
        goals: state.goals.map(g => g.id === id ? { ...g, current: Math.min(g.target, g.current + amount) } : g)
      })),

      updateGoalDetails: (id, updates) => set((state) => ({
        goals: state.goals.map(g => g.id === id ? { ...g, ...updates } : g)
      })),

      deleteGoal: (id) => set((state) => ({
        goals: state.goals.filter(g => g.id !== id)
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
      }
    }),
    {
      name: 'finwise-storage',
    }
  )
);
