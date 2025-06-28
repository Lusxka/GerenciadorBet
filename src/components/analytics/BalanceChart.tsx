import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useBettingStore } from '../../store/bettingStore';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const BalanceChart: React.FC = () => {
  const { user } = useAuthStore();
  const { bets, withdrawals, userSettings } = useBettingStore();

  const userBets = bets
    .filter(bet => bet.userId === user?.id)
    .map(bet => ({ ...bet, type: 'bet' as const, date: new Date(bet.date) }));
  
  const userWithdrawals = withdrawals
    .filter(w => w.userId === user?.id)
    .map(w => ({ ...w, type: 'withdrawal' as const, date: new Date(w.date), profit: -w.amount }));

  const allTransactions = [...userBets, ...userWithdrawals]
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const chartData = [
    {
      date: 'Inicial',
      balance: userSettings?.initialBalance || 0,
      profit: 0,
      type: 'initial',
    },
    ...allTransactions.map(transaction => ({
      date: format(transaction.date, 'dd/MM', { locale: ptBR }),
      balance: transaction.currentBalance,
      profit: transaction.profit,
      type: transaction.type,
    }))
  ];

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
          <p className="text-sm text-primary-600 dark:text-primary-400">
            Saldo: {formatCurrency(payload[0].value)}
          </p>
          {data.profit !== 0 && (
            <p className={`text-sm ${
              data.profit >= 0 
                ? 'text-success-600 dark:text-success-400' 
                : 'text-error-600 dark:text-error-400'
            }`}>
              {data.type === 'withdrawal' ? 'Saque: ' : ''}
              {data.profit >= 0 ? '+' : ''}{formatCurrency(data.profit)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            className="text-xs"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            tickFormatter={formatCurrency}
            className="text-xs"
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="balance" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};