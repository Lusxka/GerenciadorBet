import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminSettings {
  systemName: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
  maxUsersPerDay: number;
  defaultStopLoss: number;
  defaultStopWin: number;
  defaultInitialBalance: number;
  emailNotifications: boolean;
  systemNotifications: boolean;
  dataRetentionDays: number;
  backupFrequency: 'hourly' | 'daily' | 'weekly';
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  maintenanceMessage: string;
  registrationMessage: string;
}

interface AdminState {
  settings: AdminSettings;
  dailyRegistrations: Record<string, number>; // date -> count
  updateSettings: (newSettings: Partial<AdminSettings>) => void;
  resetSettings: () => void;
  incrementDailyRegistrations: () => boolean; // returns true if allowed
  canRegisterToday: () => boolean;
  getSystemStatus: () => {
    isOnline: boolean;
    maintenanceMode: boolean;
    allowRegistration: boolean;
    dailyRegistrationsUsed: number;
    dailyRegistrationsLimit: number;
  };
}

const defaultSettings: AdminSettings = {
  systemName: 'BetFinance',
  maintenanceMode: false,
  allowRegistration: true,
  maxUsersPerDay: 100,
  defaultStopLoss: 300,
  defaultStopWin: 500,
  defaultInitialBalance: 0, // Changed to 0 as requested
  emailNotifications: true,
  systemNotifications: true,
  dataRetentionDays: 365,
  backupFrequency: 'daily',
  logLevel: 'info',
  maintenanceMessage: 'Sistema em manutenção. Tente novamente mais tarde.',
  registrationMessage: 'Registros temporariamente suspensos. Tente novamente amanhã.',
};

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      dailyRegistrations: {},

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      resetSettings: () => {
        set({
          settings: defaultSettings,
          dailyRegistrations: {},
        });
      },

      incrementDailyRegistrations: () => {
        const today = new Date().toISOString().split('T')[0];
        const { dailyRegistrations, settings } = get();
        const currentCount = dailyRegistrations[today] || 0;
        
        if (currentCount >= settings.maxUsersPerDay) {
          return false;
        }
        
        set((state) => ({
          dailyRegistrations: {
            ...state.dailyRegistrations,
            [today]: currentCount + 1,
          },
        }));
        
        return true;
      },

      canRegisterToday: () => {
        const { settings } = get();
        if (!settings.allowRegistration) return false;
        
        const today = new Date().toISOString().split('T')[0];
        const { dailyRegistrations } = get();
        const currentCount = dailyRegistrations[today] || 0;
        
        return currentCount < settings.maxUsersPerDay;
      },

      getSystemStatus: () => {
        const { settings, dailyRegistrations } = get();
        const today = new Date().toISOString().split('T')[0];
        const dailyRegistrationsUsed = dailyRegistrations[today] || 0;
        
        return {
          isOnline: !settings.maintenanceMode,
          maintenanceMode: settings.maintenanceMode,
          allowRegistration: settings.allowRegistration && dailyRegistrationsUsed < settings.maxUsersPerDay,
          dailyRegistrationsUsed,
          dailyRegistrationsLimit: settings.maxUsersPerDay,
        };
      },
    }),
    {
      name: 'admin-storage',
    }
  )
);