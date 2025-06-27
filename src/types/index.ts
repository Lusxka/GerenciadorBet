export interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface BettingCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  userId: string;
}

export interface Bet {
  id: string;
  userId: string;
  date: Date;
  categoryId: string;
  amount: number;
  result: 'win' | 'loss';
  period: 'morning' | 'afternoon' | 'night' | 'late-night';
  multiplier: number;
  mg: boolean;
  profit: number;
  previousBalance: number;
  currentBalance: number;
}

export interface Goal {
  id: string;
  userId: string;
  type: 'daily' | 'weekly' | 'monthly';
  targetValue: number;
  currentValue: number;
  period: string;
  completed: boolean;
}

export interface Strategy {
  id: string;
  name: string;
  winTarget: number; // percentage
  lossLimit: number; // percentage
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'very-high';
}

export interface UserSettings {
  userId: string;
  initialBalance: number;
  currentBalance: number;
  stopLoss: number;
  stopWin: number;
  notifications: boolean;
  theme: 'light' | 'dark';
}

export interface DayStatus {
  date: string;
  status: 'positive' | 'negative' | 'neutral' | 'stop-win' | 'stop-loss';
  profit: number;
}