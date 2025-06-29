import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BettingCategory, Bet, Goal, UserSettings, DayStatus, Withdrawal } from '../types';
import { useAdminStore } from './adminStore';

interface BettingState {
  categories: BettingCategory[];
  bets: Bet[];
  withdrawals: Withdrawal[];
  goals: Goal[];
  userSettings: UserSettings | null;
  dayStatuses: DayStatus[];
  notifications: Array<{
    id: string;
    type: 'stop-win' | 'stop-loss' | 'goal-achieved';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
  }>;
  
  // Categories
  addCategory: (category: Omit<BettingCategory, 'id'>) => void;
  updateCategory: (id: string, category: Partial<BettingCategory>) => void;
  deleteCategory: (id: string) => void;
  
  // Bets
  addBet: (bet: Omit<Bet, 'id' | 'profit' | 'currentBalance'>) => void;
  updateBet: (id: string, bet: Partial<Bet>) => void;
  deleteBet: (id: string) => void;
  
  // Withdrawals
  addWithdrawal: (withdrawal: Omit<Withdrawal, 'id' | 'currentBalance'>) => void;
  updateWithdrawal: (id: string, withdrawal: Partial<Withdrawal>) => void;
  deleteWithdrawal: (id: string) => void;
  
  // Goals
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  updateGoal: (id: string, goal: Partial<Goal>) => void;
  deleteGoal: (id: string) => void;
  
  // Settings
  updateSettings: (settings: Partial<UserSettings>) => void;
  initializeSettings: (userId: string) => void;
  resetAllUserData: (userId: string) => void;
  
  // Day statuses
  updateDayStatus: (date: string, status: DayStatus['status'], profit: number) => void;
  
  // Notifications
  addNotification: (notification: Omit<BettingState['notifications'][0], 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  
  // Calculations
  calculateBalance: () => void;
  checkStopLimits: () => { stopLoss: boolean; stopWin: boolean };
}

export const useBettingStore = create<BettingState>()(
  persist(
    (set, get) => ({
      categories: [],
      bets: [],
      withdrawals: [],
      goals: [],
      userSettings: null,
      dayStatuses: [],
      notifications: [],

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
        const { userSettings } = get();
        const currentBalance = userSettings?.currentBalance || 0;
        
        let profit = 0;
        if (bet.result === 'win') {
          profit = bet.amount * bet.multiplier - bet.amount;
        } else {
          // Loss logic with MG (Martin Gale)
          if (bet.mg) {
            // If MG is selected and it's a loss, multiply the loss by 3
            profit = -bet.amount * 3;
          } else {
            profit = -bet.amount;
          }
        }
        
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

        // Update day status based on bet result only (not withdrawals)
        const dateStr = new Date(bet.date).toISOString().split('T')[0];
        get().updateDayStatus(dateStr, profit > 0 ? 'positive' : 'negative', profit);
        
        // Check stop limits and add notifications
        const { stopLoss, stopWin } = get().checkStopLimits();
        
        if (stopWin) {
          get().addNotification({
            type: 'stop-win',
            title: 'Meta Atingida! 🎉',
            message: `Parabéns! Você atingiu sua meta de ganho de ${userSettings ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(userSettings.stopWin) : 'R$ 0,00'} hoje.`,
          });
        } else if (stopLoss) {
          get().addNotification({
            type: 'stop-loss',
            title: 'Stop Loss Atingido ⚠️',
            message: `Você atingiu seu limite de perda de ${userSettings ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(userSettings.stopLoss) : 'R$ 0,00'} hoje. Considere parar.`,
          });
        }
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

      addWithdrawal: (withdrawal) => {
        const { userSettings } = get();
        const currentBalance = userSettings?.currentBalance || 0;
        const newBalance = currentBalance - withdrawal.amount;
        
        const newWithdrawal: Withdrawal = {
          ...withdrawal,
          id: `withdrawal_${Date.now()}`,
          previousBalance: currentBalance,
          currentBalance: newBalance,
        };

        set((state) => ({
          withdrawals: [...state.withdrawals, newWithdrawal],
          userSettings: state.userSettings 
            ? { ...state.userSettings, currentBalance: newBalance }
            : null,
        }));

        // Withdrawals don't affect day status - they are separate from wins/losses
        // Only update balance, not day status
      },

      updateWithdrawal: (id, withdrawal) => {
        set((state) => ({
          withdrawals: state.withdrawals.map((w) =>
            w.id === id ? { ...w, ...withdrawal } : w
          ),
        }));
        get().calculateBalance();
      },

      deleteWithdrawal: (id) => {
        set((state) => ({
          withdrawals: state.withdrawals.filter((w) => w.id !== id),
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
        set((state) => {
          const updatedGoals = state.goals.map((g) => {
            if (g.id === id) {
              const updatedGoal = { 
                ...g, 
                ...goal, 
                completedAt: goal.completed && !g.completed ? new Date() : g.completedAt 
              };
              
              // Check if goal was just completed
              if (goal.completed && !g.completed) {
                get().addNotification({
                  type: 'goal-achieved',
                  title: 'Meta Concluída! 🎯',
                  message: `Parabéns! Você concluiu sua meta ${g.type === 'daily' ? 'diária' : g.type === 'weekly' ? 'semanal' : 'mensal'} de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(g.targetValue)}.`,
                });
              }
              
              return updatedGoal;
            }
            return g;
          });
          
          return { goals: updatedGoals };
        });
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
        
        // Apply theme immediately if theme is being updated
        if (settings.theme) {
          document.documentElement.classList.toggle('dark', settings.theme === 'dark');
        }
      },

      initializeSettings: (userId) => {
        const { userSettings } = get();
        if (!userSettings || userSettings.userId !== userId) {
          // Get admin default settings
          const adminStore = useAdminStore.getState();
          const adminSettings = adminStore.settings;
          
          set({
            userSettings: {
              userId,
              initialBalance: adminSettings.defaultInitialBalance,
              currentBalance: adminSettings.defaultInitialBalance,
              stopLoss: adminSettings.defaultStopLoss,
              stopWin: adminSettings.defaultStopWin,
              notifications: adminSettings.systemNotifications,
              theme: 'light',
            },
          });
        }
      },

      resetAllUserData: (userId) => {
        // Get admin default settings
        const adminStore = useAdminStore.getState();
        const adminSettings = adminStore.settings;
        
        set((state) => ({
          // Remove all user data
          categories: state.categories.filter(cat => cat.userId !== userId),
          bets: state.bets.filter(bet => bet.userId !== userId),
          withdrawals: state.withdrawals.filter(w => w.userId !== userId),
          goals: state.goals.filter(goal => goal.userId !== userId),
          dayStatuses: [], // Clear all day statuses
          notifications: [], // Clear all notifications
          // Reset user settings to admin defaults
          userSettings: {
            userId,
            initialBalance: adminSettings.defaultInitialBalance,
            currentBalance: adminSettings.defaultInitialBalance,
            stopLoss: adminSettings.defaultStopLoss,
            stopWin: adminSettings.defaultStopWin,
            notifications: adminSettings.systemNotifications,
            theme: state.userSettings?.theme || 'light', // Keep current theme
          },
        }));
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

      addNotification: (notification) => {
        const newNotification = {
          ...notification,
          id: `notification_${Date.now()}`,
          timestamp: new Date(),
          read: false,
        };
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }));
      },

      markNotificationAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map(n =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      calculateBalance: () => {
        const { bets, withdrawals, userSettings } = get();
        if (!userSettings) return;

        // Combine bets and withdrawals, sort by date
        const allTransactions = [
          ...bets.filter(bet => bet.userId === userSettings.userId).map(bet => ({
            ...bet,
            type: 'bet' as const,
            date: new Date(bet.date),
          })),
          ...withdrawals.filter(w => w.userId === userSettings.userId).map(w => ({
            ...w,
            type: 'withdrawal' as const,
            date: new Date(w.date),
            profit: -w.amount, // Withdrawals reduce balance but are not losses
          })),
        ].sort((a, b) => a.date.getTime() - b.date.getTime());

        let currentBalance = userSettings.initialBalance;
        
        const updatedBets: Bet[] = [];
        const updatedWithdrawals: Withdrawal[] = [];

        allTransactions.forEach(transaction => {
          const previousBalance = currentBalance;
          
          if (transaction.type === 'bet') {
            let profit = 0;
            if (transaction.result === 'win') {
              profit = transaction.amount * transaction.multiplier - transaction.amount;
            } else {
              if (transaction.mg) {
                profit = -transaction.amount * 3;
              } else {
                profit = -transaction.amount;
              }
            }
            
            currentBalance += profit;
            
            updatedBets.push({
              ...transaction,
              profit,
              previousBalance,
              currentBalance,
            } as Bet);
          } else {
            // Withdrawal - reduces balance but is not a loss
            currentBalance -= transaction.amount;
            
            updatedWithdrawals.push({
              ...transaction,
              previousBalance,
              currentBalance,
            } as Withdrawal);
          }
        });

        set((state) => ({
          bets: [
            ...state.bets.filter(bet => bet.userId !== userSettings.userId),
            ...updatedBets,
          ],
          withdrawals: [
            ...state.withdrawals.filter(w => w.userId !== userSettings.userId),
            ...updatedWithdrawals,
          ],
          userSettings: {
            ...userSettings,
            currentBalance,
          },
        }));
      },

      checkStopLimits: () => {
        const { userSettings, bets } = get();
        if (!userSettings) return { stopLoss: false, stopWin: false };

        // Calculate today's profit from bets only (not withdrawals)
        const today = new Date().toISOString().split('T')[0];
        const todayBets = bets.filter(bet => 
          bet.userId === userSettings.userId && 
          new Date(bet.date).toISOString().split('T')[0] === today
        );
        
        const todayProfit = todayBets.reduce((sum, bet) => sum + bet.profit, 0);
        
        const stopLossReached = todayProfit <= -userSettings.stopLoss;
        const stopWinReached = todayProfit >= userSettings.stopWin;

        if (stopLossReached || stopWinReached) {
          get().updateDayStatus(
            today, 
            stopLossReached ? 'stop-loss' : 'stop-win', 
            todayProfit
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