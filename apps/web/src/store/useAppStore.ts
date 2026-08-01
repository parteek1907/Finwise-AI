import { create } from 'zustand';

// Types
export interface User {
  name: string;
  email: string;
  avatar: string;
  archetype: string;
  healthScore: number;
  xp: number;
  streak: number;
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
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
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

export interface AppState {
  user: User;
  goals: Goal[];
  lessons: Lesson[];
  mentorHistory: MentorMessage[];
  
  // Actions
  addXP: (amount: number) => void;
  updateGoal: (id: string, amount: number) => void;
  completeLesson: (id: string) => void;
  addMessage: (message: Omit<MentorMessage, 'id' | 'timestamp'>) => void;
}

// Initial Mock Data
const INITIAL_USER: User = {
  name: 'Alex Studio',
  email: 'alex@finwise.ai',
  avatar: 'https://i.pravatar.cc/150?img=11',
  archetype: 'The Guardian',
  healthScore: 85,
  xp: 1250,
  streak: 14,
};

const INITIAL_GOALS: Goal[] = [
  { id: 'g1', name: 'Emergency Fund', target: 5000, current: 2400, deadline: '2026-10-01', status: 'On Track', category: 'Emergency' },
  { id: 'g2', name: 'Credit Card Debt', target: 2000, current: 1200, deadline: '2026-08-01', status: 'Ahead', category: 'Emergency' },
  { id: 'g3', name: 'Vehicle Downpayment', target: 8000, current: 0, deadline: '2027-03-01', status: 'Planning', category: 'Vehicle' },
  { id: 'g4', name: 'Japan Trip', target: 4000, current: 1500, deadline: '2027-05-01', status: 'Behind', category: 'Travel' },
];

const INITIAL_LESSONS: Lesson[] = [
  { id: 'l1', title: 'The Psychology of Spending', category: 'Behavior', duration: '5 min', difficulty: 'Beginner', status: 'Completed', xp: 50 },
  { id: 'l2', title: 'The Delay Discounting Trap', category: 'Behavior', duration: '8 min', difficulty: 'Beginner', status: 'In Progress', xp: 50 },
  { id: 'l3', title: 'Lifestyle Creep', category: 'Behavior', duration: '10 min', difficulty: 'Intermediate', status: 'Locked', xp: 100 },
  { id: 'l4', title: 'Index Funds 101', category: 'Investing', duration: '15 min', difficulty: 'Beginner', status: 'Locked', xp: 150 },
  { id: 'l5', title: 'Emergency Fund Basics', category: 'Saving', duration: '6 min', difficulty: 'Beginner', status: 'Completed', xp: 50 },
];

const INITIAL_MESSAGES: MentorMessage[] = [
  { id: 'm1', sender: 'ai', text: 'Hello Alex! I noticed you completed the "Emergency Fund Basics" lesson today. Great job building your foundation.', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 'm2', sender: 'user', text: 'Thanks! I want to start investing now.', timestamp: new Date(Date.now() - 3000000).toISOString() },
  { id: 'm3', sender: 'ai', text: 'That is a great goal. However, based on your active goals, you still have $800 in credit card debt. Mathematically, paying off high-interest debt yields a better guaranteed return than the market.', timestamp: new Date(Date.now() - 2900000).toISOString(), actionRequired: true },
];

export const useAppStore = create<AppState>((set) => ({
  user: INITIAL_USER,
  goals: INITIAL_GOALS,
  lessons: INITIAL_LESSONS,
  mentorHistory: INITIAL_MESSAGES,

  addXP: (amount) => set((state) => ({ 
    user: { ...state.user, xp: state.user.xp + amount } 
  })),

  updateGoal: (id, amount) => set((state) => ({
    goals: state.goals.map(g => g.id === id ? { ...g, current: Math.min(g.target, g.current + amount) } : g)
  })),

  completeLesson: (id) => set((state) => {
    const lesson = state.lessons.find(l => l.id === id);
    if (!lesson || lesson.status === 'Completed') return state;
    
    return {
      lessons: state.lessons.map(l => l.id === id ? { ...l, status: 'Completed' } : l),
      user: { ...state.user, xp: state.user.xp + lesson.xp }
    };
  }),

  addMessage: (message) => set((state) => ({
    mentorHistory: [...state.mentorHistory, {
      ...message,
      id: `m${Date.now()}`,
      timestamp: new Date().toISOString()
    }]
  })),
}));
