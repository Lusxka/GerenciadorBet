import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BettingCategory, Bet, Goal, UserSettings, DayStatus } from '../types';

interface BettingState {
  categories: BettingCategory[];
  bets: Bet[];
  goals: Goal[];
  userSettings: UserSettings | null;
  dayStatuses: DayStatus[];
  
  // Categories
  addCategory: (category: Omit<BettingCategory, 'id'>) => void;
  updateCategory: (id: string, category: Partial<BettingCategory>) => void;
  deleteCategory: (id: string) => void;
  
  // Bets
  addBet: (bet: Omit<Bet, 'id' | 'profit' | 'currentBalance'>) => void;
  updateBet: (id: string, bet: Partial<Bet>) => void;
  deleteBet: (id: string) => void;
  
  // Goals
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  
  // Settings
  updateSettings: (settings: Partial<UserSettings>) => void;
  initializeSettings: (userId: string) => void;
  
  // Day statuses
  updateDayStatus: (date: string, status: DayStatus['status'], profit: number) => void;
  
  // Calculations
  calculateBalance: () => void;
  checkStopLimits: () => { stopLoss: boolean; stopWin: boolean };
}

export const useBettingStore = create<BettingState>()(
  persist(
    (set, get) => ({
      categories: [],
      bets: [],
      goals: [],
      userSettings: null,
      dayStatuses: [],

      addCategory: (category) => {
        const newCategory: BettingCategory = {
          ...category,
          id: `category_${Date.now()}`,
        };
        set((state) => ({
          categories: [...state.categories, newCategory],
        }));
      },

      updateCategory: (id, category) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...category } : c
          ),
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
      },

      addBet: (bet) => {
        const { userSettings, bets } = get();
        const currentBalance = userSettings?.currentBalance || 0;
        
        const profit = bet.result === 'win' 
          ? bet.amount * bet.multiplier - bet.amount
          : -bet.amount;
        
        const newBalance = currentBalance + profit;
        
        const newBet: Bet = {
          ...bet,
          id: `bet_${Date.now()}`,
          profit,
          previousBalance: currentBalance,
          currentBalance: newBalance,
        };

        set((state) => ({
          bets: [...state.bets, newBet],
          userSettings: state.userSettings 
            ? { ...state.userSettings, currentBalance: newBalance }
            : null,
        }));

        // Update day status
        const dateStr = new Date(bet.date).toISOString().split('T')[0];
        get().updateDayStatus(dateStr, profit > 0 ? 'positive' : 'negative', profit);
        
        // Check stop limits
        get().checkStopLimits();
      },

      updateBet: (id, bet) => {
        set((state) => ({
          bets: state.bets.map((b) =>
            b.id === id ? { ...b, ...bet } : b
          ),
        }));
        get().calculateBalance();
      },

      deleteBet: (id) => {
        set((state) => ({
          bets: state.bets.filter((b) => b.id !== id),
        }));
        get().calculateBalance();
      },

      addGoal: (goal) => {
        const newGoal: Goal = {
          ...goal,
          id: `goal_${Date.now()}`,
        };
        set((state) => ({
          goals: [...state.goals, newGoal],
        }));
      },

      updateGoal: (id, goal) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, ...goal } : g
          ),
        }));
      },

      deleteGoal: (id) => {
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        }));
      },

      updateSettings: (settings) => {
        set((state) => ({
          userSettings: state.userSettings
            ? { ...state.userSettings, ...settings }
            : null,
        }));
      },

      initializeSettings: (userId) => {
        const { userSettings } = get();
        if (!userSettings || userSettings.userId !== userId) {
          set({
            userSettings: {
              userId,
              initialBalance: 1000,
              currentBalance: 1000,
              stopLoss: 300,
              stopWin: 500,
              notifications: true,
              theme: 'light',
            },
          });
        }
      },

      updateDayStatus: (date, status, profit) => {
        set((state) => {
          const existingIndex = state.dayStatuses.findIndex(d => d.date === date);
          if (existingIndex >= 0) {
            const updated = [...state.dayStatuses];
            updated[existingIndex] = { 
              ...updated[existingIndex], 
              status, 
              profit: updated[existingIndex].profit + profit 
            };
            return { dayStatuses: updated };
          } else {
            return {
              dayStatuses: [...state.dayStatuses, { date, status, profit }],
            };
          }
        });
      },

      calculateBalance: () => {
        const { bets, userSettings } = get();
        if (!userSettings) return;

        const sortedBets = bets
          .filter(bet => bet.userId === userSettings.userId)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        let currentBalance = userSettings.initialBalance;
        
        const updatedBets = sortedBets.map(bet => {
          const profit = bet.result === 'win' 
            ? bet.amount * bet.multiplier - bet.amount
            : -bet.amount;
          
          const previousBalance = currentBalance;
          currentBalance += profit;
          
          return {
            ...bet,
            profit,
            previousBalance,
            currentBalance,
          };
        });

        set((state) => ({
          bets: [
            ...state.bets.filter(bet => bet.userId !== userSettings.userId),
            ...updatedBets,
          ],
          userSettings: {
            ...userSettings,
            currentBalance,
          },
        }));
      },

      checkStopLimits: () => {
        const { userSettings } = get();
        if (!userSettings) return { stopLoss: false, stopWin: false };

        const { currentBalance, initialBalance, stopLoss, stopWin } = userSettings;
        const profit = currentBalance - initialBalance;
        
        const stopLossReached = profit <= -stopLoss;
        const stopWinReached = profit >= stopWin;

        if (stopLossReached || stopWinReached) {
          const today = new Date().toISOString().split('T')[0];
          get().updateDayStatus(
            today, 
            stopLossReached ? 'stop-loss' : 'stop-win', 
            profit
          );
        }

        return { 
          stopLoss: stopLossReached, 
          stopWin: stopWinReached 
        };
      },
    }),
    {
      name: 'betting-storage',
    }
  )
);