import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProfileSettings {
  name: string;
  email: string;
  phone: string;
  location: string;
  avatar: string;
  archetype: string;
}

export interface AIMentorSettings {
  knowledgeLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  responseLength: 'Short' | 'Balanced' | 'Detailed';
  aiPersonality: 'Friendly' | 'Professional';
  rememberChatHistory: boolean;
}

export interface FinancialSettings {
  preferredCurrency: 'USD' | 'INR' | 'EUR' | 'GBP';
  riskTolerance: 'Low' | 'Medium' | 'High';
  budgetReminders: boolean;
  exchangeRates: Record<string, number>;
}

export interface NotificationSettings {
  goalReminders: boolean;
  scamAlerts: boolean;
  weeklySummary: boolean;
}

export interface SecuritySession {
  id: string;
  device: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface AppearanceSettings {
  theme: 'Light' | 'Dark' | 'System';
  reduceAnimations: boolean;
}

export interface SettingsState {
  profile: ProfileSettings;
  aiMentor: AIMentorSettings;
  financial: FinancialSettings;
  notifications: NotificationSettings;
  sessions: SecuritySession[];
  appearance: AppearanceSettings;

  // Actions
  updateProfile: (data: Partial<ProfileSettings>) => void;
  updateAIMentor: (data: Partial<AIMentorSettings>) => void;
  updateFinancial: (data: Partial<FinancialSettings>) => void;
  updateNotifications: (data: Partial<NotificationSettings>) => void;
  updateAppearance: (data: Partial<AppearanceSettings>) => void;
  updateExchangeRates: (rates: Record<string, number>) => void;
  terminateSession: (id: string) => void;
  terminateAllOtherSessions: () => void;
  resetAllSettings: () => void;
}

const DEFAULT_SESSIONS: SecuritySession[] = [
  {
    id: 's1',
    device: 'Chrome on Windows (Current)',
    ip: '192.168.1.1',
    location: 'New York, USA',
    lastActive: 'Active now',
    isCurrent: true,
  },
  {
    id: 's2',
    device: 'Finwise Mobile App (iOS)',
    ip: '172.56.21.4',
    location: 'New York, USA',
    lastActive: '2 hours ago',
    isCurrent: false,
  },
  {
    id: 's3',
    device: 'Safari on macOS',
    ip: '74.125.200.10',
    location: 'San Francisco, USA',
    lastActive: '3 days ago',
    isCurrent: false,
  },
];

const DEFAULT_SETTINGS = {
  profile: {
    name: '',
    email: '',
    phone: '',
    location: '',
    avatar: '',
    archetype: 'The Guardian',
  },
  aiMentor: {
    knowledgeLevel: 'Intermediate' as const,
    responseLength: 'Balanced' as const,
    aiPersonality: 'Friendly' as const,
    rememberChatHistory: true,
  },
  financial: {
    preferredCurrency: 'USD' as const,
    riskTolerance: 'Medium' as const,
    budgetReminders: true,
    exchangeRates: {
      USD: 1,
      INR: 83,
      EUR: 0.92,
      GBP: 0.79
    },
  },
  notifications: {
    goalReminders: true,
    scamAlerts: true,
    weeklySummary: true,
  },
  sessions: DEFAULT_SESSIONS,
  appearance: {
    theme: 'Light' as const,
    reduceAnimations: false,
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      updateProfile: (data) =>
        set((state) => {
          const newProfile = { ...state.profile, ...data };
          // Sync with useAppStore
          try {
            const { useAppStore } = require('./useAppStore');
            useAppStore.getState().updateUser({
              name: newProfile.name,
              email: newProfile.email,
              avatar: newProfile.avatar,
            });
          } catch (e) {
            console.error('Error syncing store user', e);
          }
          return { profile: newProfile };
        }),

      updateAIMentor: (data) =>
        set((state) => ({
          aiMentor: { ...state.aiMentor, ...data },
        })),

      updateFinancial: (data) =>
        set((state) => ({
          financial: { ...state.financial, ...data },
        })),

      updateNotifications: (data) =>
        set((state) => ({
          notifications: { ...state.notifications, ...data },
        })),

      updateAppearance: (data) =>
        set((state) => ({
          appearance: { ...state.appearance, ...data },
        })),

      updateExchangeRates: (rates) =>
        set((state) => ({
          financial: { ...state.financial, exchangeRates: { ...state.financial.exchangeRates, ...rates } },
        })),

      terminateSession: (id) =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.id !== id || s.isCurrent),
        })),

      terminateAllOtherSessions: () =>
        set((state) => ({
          sessions: state.sessions.filter((s) => s.isCurrent),
        })),

      resetAllSettings: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: 'finwise-settings-storage',
    }
  )
);
