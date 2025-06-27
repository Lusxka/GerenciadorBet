import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useBettingStore } from '../../store/bettingStore';
import { useAuthStore } from '../../store/authStore';

export const PeriodChart: React.FC = () => {
  const { user } = useAuthStore();
  const { bets } = useBettingStore();

  const userBets = bets.filter(bet => bet.userId === user?.id);

  const periods = [
    { key: 'morning', label: 'Manhã', icon: '🌅' },
    { key: 'afternoon', label: 'Tarde', icon: '☀️' },
    { key: 'night', label: 'Noite', icon: '🌙' },
    { key: 'late-night', label: 'Madrugada', icon: '🌃' },
  ];

  const periodData = periods.map(period => {
    const periodBets = userBets.filter(bet => bet.period === period.key);
    const wins = periodBets.filter(bet => bet.result === 'win').length;
    const losses = periodBets.filter(bet => bet.result === 'loss').length;
    const totalProfit = periodBets.reduce((sum, bet) => sum + bet.profit, 0);
    
    return {
      period: period.label,
      wins,
      losses,
      profit: totalProfit,
      total: periodBets.length,
      winRate: periodBets.length > 0 ? (wins / periodBets.length) * 100 : 0,
    };
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {label}
          </p>
          <p className="text-sm text-success-600 dark:text-success-400">
            Vitórias: {data.wins}
          </p>
          <p className="text-sm text-error-600 dark:text-error-400">
            Derrotas: {data.losses}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Taxa: {data.winRate.toFixed(1)}%
          </p>
          <p className={`text-sm ${
            data.profit >= 0 
              ? 'text-success-600 dark:text-success-400' 
              : 'text-error-600 dark:text-error-400'
          }`}>
            Lucro: {data.profit >= 0 ? '+' : ''}{formatCurrency(data.profit)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={periodData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="period" 
            className="text-xs"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            className="text-xs"
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="wins" fill="#22c55e" name="Vitórias" />
          <Bar dataKey="losses" fill="#ef4444" name="Derrotas" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};