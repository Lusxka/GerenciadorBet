import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useBettingStore } from '../../store/bettingStore';
import { useAuthStore } from '../../store/authStore';

export const CategoryChart: React.FC = () => {
  const { user } = useAuthStore();
  const { bets, categories } = useBettingStore();

  const userBets = bets.filter(bet => bet.userId === user?.id);
  const userCategories = categories.filter(cat => cat.userId === user?.id);

  const categoryData = userCategories.map(category => {
    const categoryBets = userBets.filter(bet => bet.categoryId === category.id);
    const totalAmount = categoryBets.reduce((sum, bet) => sum + bet.amount, 0);
    const totalProfit = categoryBets.reduce((sum, bet) => sum + bet.profit, 0);
    
    return {
      name: category.name,
      value: totalAmount,
      profit: totalProfit,
      count: categoryBets.length,
      color: category.color,
    };
  }).filter(item => item.value > 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {data.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Apostado: {formatCurrency(data.value)}
          </p>
          <p className={`text-sm ${
            data.profit >= 0 
              ? 'text-success-600 dark:text-success-400' 
              : 'text-error-600 dark:text-error-400'
          }`}>
            Lucro: {data.profit >= 0 ? '+' : ''}{formatCurrency(data.profit)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {data.count} apostas
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices smaller than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (categoryData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          Nenhum dado disponível
        </p>
      </div>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={36}
            formatter={(value, entry: any) => (
              <span style={{ color: entry.color }} className="text-sm">
                {value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};