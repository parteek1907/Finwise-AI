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

export interface ChatSession {
  id: string;
  title: string;
  messages: MentorMessage[];
  updatedAt: string;
}

export interface AppState {
  user: User;
  goals: Goal[];
  lessons: Lesson[];
  chats: ChatSession[];
  activeChatId: string;
  
  // Actions
  addXP: (amount: number) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'current' | 'status'>) => void;
  updateGoal: (id: string, amount: number) => void;
  completeLesson: (id: string) => void;
  addMessage: (chatId: string, message: Omit<MentorMessage, 'id' | 'timestamp'>) => void;
  createNewChat: (title?: string) => string;
  setActiveChat: (id: string) => void;
  updateChatTitle: (id: string, title: string) => void;
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

const INITIAL_CHATS: ChatSession[] = [
  {
    id: 'chat_live',
    title: 'Current Session',
    updatedAt: new Date().toISOString(),
    messages: INITIAL_MESSAGES
  },
  {
    id: 'chat_mock_1',
    title: 'Discussing Emergency Fund',
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    messages: [
      { id: 'm1_1', sender: 'user', text: 'How much should I really have in my emergency fund?', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: 'm1_2', sender: 'ai', text: 'A good rule of thumb is 3-6 months of essential living expenses. For your current lifestyle, that would be around $9,000 to $18,000. You currently have $2,400 saved, which is a fantastic start!', timestamp: new Date(Date.now() - 86400000 * 2 + 1000).toISOString() }
    ]
  },
  {
    id: 'chat_mock_2',
    title: 'Psychology of Debt Lesson',
    updatedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    messages: [
      { id: 'm2_1', sender: 'user', text: 'I feel stressed every time I look at my credit card balance. How do I stop this cycle?', timestamp: new Date(Date.now() - 86400000 * 4).toISOString() },
      { id: 'm2_2', sender: 'ai', text: 'It\'s completely normal to feel that way. The first step is acknowledging the emotional weight of debt. I recommend trying the "Snowball Method" to build momentum. Let\'s review your balances and pick the smallest one to attack first.', timestamp: new Date(Date.now() - 86400000 * 4 + 1000).toISOString() }
    ]
  },
  {
    id: 'chat_mock_3',
    title: 'Setting up first goals',
    updatedAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    messages: [
      { id: 'm3_1', sender: 'user', text: 'I want to buy a car next year, where do I start?', timestamp: new Date(Date.now() - 86400000 * 15).toISOString() },
      { id: 'm3_2', sender: 'ai', text: 'Let\'s set up a specific Vehicle Goal. If you want to buy a car in 12 months, we need to determine your target downpayment. Do you have a specific car in mind or a total budget?', timestamp: new Date(Date.now() - 86400000 * 15 + 1000).toISOString() },
      { id: 'm3_3', sender: 'user', text: 'I think $8,000 for a downpayment is good.', timestamp: new Date(Date.now() - 86400000 * 15 + 2000).toISOString() },
      { id: 'm3_4', sender: 'ai', text: 'Great! I\'ve created a "Vehicle Downpayment" goal for $8,000. You\'ll need to save roughly $667 per month to hit that target by next year.', timestamp: new Date(Date.now() - 86400000 * 15 + 3000).toISOString() }
    ]
  }
];

export const useAppStore = create<AppState>((set) => ({
  user: INITIAL_USER,
  goals: INITIAL_GOALS,
  lessons: INITIAL_LESSONS,
  chats: INITIAL_CHATS,
  activeChatId: 'chat_live',

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

  completeLesson: (id) => set((state) => {
    const lesson = state.lessons.find(l => l.id === id);
    if (!lesson || lesson.status === 'Completed') return state;
    
    return {
      lessons: state.lessons.map(l => l.id === id ? { ...l, status: 'Completed' } : l),
      user: { ...state.user, xp: state.user.xp + lesson.xp }
    };
  }),

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
  }))
}));
