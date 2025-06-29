import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Download, 
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Filter
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useBettingStore } from '../../store/bettingStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const AdminReportsPage: React.FC = () => {
  const { getAllUsers } = useAuthStore();
  const { bets, withdrawals } = useBettingStore();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('profit');

  const users = getAllUsers();
  const clientUsers = users.filter(user => user.role === 'client');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Generate chart data based on selected period
  const getChartData = () => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    let dateFormat: string;

    switch (selectedPeriod) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = now;
        dateFormat = 'dd/MM';
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        dateFormat = 'dd/MM';
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        dateFormat = 'MMM';
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        dateFormat = 'dd/MM';
    }

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    return days.map(day => {
      const dayBets = bets.filter(bet => {
        const betDate = new Date(bet.date);
        return betDate.toDateString() === day.toDateString();
      });

      const dayWithdrawals = withdrawals.filter(w => {
        const withdrawalDate = new Date(w.date);
        return withdrawalDate.toDateString() === day.toDateString();
      });

      const profit = dayBets.reduce((sum, bet) => sum + bet.profit, 0);
      const volume = dayBets.reduce((sum, bet) => sum + bet.amount, 0);
      const withdrawalAmount = dayWithdrawals.reduce((sum, w) => sum + w.amount, 0);
      const betsCount = dayBets.length;
      const wins = dayBets.filter(bet => bet.result === 'win').length;
      const losses = dayBets.filter(bet => bet.result === 'loss').length;

      return {
        date: format(day, dateFormat, { locale: ptBR }),
        profit,
        volume,
        withdrawals: withdrawalAmount,
        betsCount,
        wins,
        losses,
        winRate: betsCount > 0 ? (wins / betsCount) * 100 : 0,
      };
    });
  };

  const chartData = getChartData();

  // Calculate totals
  const totalProfit = bets.reduce((sum, bet) => sum + bet.profit, 0);
  const totalVolume = bets.reduce((sum, bet) => sum + bet.amount, 0);
  const totalWithdrawals = withdrawals.reduce((sum, w) => sum + w.amount, 0);
  const totalBets = bets.length;
  const totalWins = bets.filter(bet => bet.result === 'win').length;
  const overallWinRate = totalBets > 0 ? (totalWins / totalBets) * 100 : 0;

  // User statistics
  const userStats = clientUsers.map(user => {
    const userBets = bets.filter(bet => bet.userId === user.id);
    const userWithdrawals = withdrawals.filter(w => w.userId === user.id);
    const userProfit = userBets.reduce((sum, bet) => sum + bet.profit, 0);
    const userVolume = userBets.reduce((sum, bet) => sum + bet.amount, 0);
    const userWithdrawalTotal = userWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    const userWins = userBets.filter(bet => bet.result === 'win').length;
    const userWinRate = userBets.length > 0 ? (userWins / userBets.length) * 100 : 0;

    return {
      user,
      betsCount: userBets.length,
      profit: userProfit,
      volume: userVolume,
      withdrawals: userWithdrawalTotal,
      winRate: userWinRate,
    };
  }).sort((a, b) => b.profit - a.profit);

  const exportReport = () => {
    const reportData = {
      period: selectedPeriod,
      generatedAt: new Date().toISOString(),
      summary: {
        totalUsers: clientUsers.length,
        totalBets,
        totalProfit,
        totalVolume,
        totalWithdrawals,
        overallWinRate,
      },
      chartData,
      userStats,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_${selectedPeriod}_${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const stats = [
    {
      title: 'Lucro Total',
      value: formatCurrency(totalProfit),
      change: overallWinRate.toFixed(1) + '% win rate',
      changeType: totalProfit >= 0 ? 'positive' : 'negative',
      icon: TrendingUp,
      color: totalProfit >= 0 ? 'success' : 'error'
    },
    {
      title: 'Volume Total',
      value: formatCurrency(totalVolume),
      change: `${totalBets} apostas`,
      changeType: 'neutral' as const,
      icon: BarChart3,
      color: 'primary'
    },
    {
      title: 'Total Saques',
      value: formatCurrency(totalWithdrawals),
      change: `${withdrawals.length} transações`,
      changeType: 'neutral' as const,
      icon: DollarSign,
      color: 'warning'
    },
    {
      title: 'Usuários Ativos',
      value: userStats.filter(u => u.betsCount > 0).length.toString(),
      change: `de ${clientUsers.length} total`,
      changeType: 'neutral' as const,
      icon: Users,
      color: 'secondary'
    },
  ];

  const periods = [
    { value: 'week', label: 'Última Semana' },
    { value: 'month', label: 'Este Mês' },
    { value: 'year', label: 'Este Ano' },
  ];

  const metrics = [
    { value: 'profit', label: 'Lucro/Prejuízo' },
    { value: 'volume', label: 'Volume de Apostas' },
    { value: 'betsCount', label: 'Número de Apostas' },
    { value: 'winRate', label: 'Taxa de Vitória' },
  ];

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Relatórios e Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Análise detalhada de performance e estatísticas do sistema
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            {periods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
          <button
            onClick={exportReport}
            className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1 truncate">
                  {stat.value}
                </p>
                <p className={`text-sm mt-1 truncate ${
                  stat.changeType === 'positive' 
                    ? 'text-success-600 dark:text-success-400'
                    : stat.changeType === 'negative'
                    ? 'text-error-600 dark:text-error-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900/20 flex-shrink-0`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-2 sm:space-y-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Análise Temporal
          </h3>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            {metrics.map((metric) => (
              <option key={metric.value} value={metric.value}>
                {metric.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {selectedMetric === 'winRate' ? (
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 12 }} />
                <YAxis className="text-xs" tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: any) => [`${value.toFixed(1)}%`, 'Taxa de Vitória']}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="winRate" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            ) : (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" className="text-xs" tick={{ fontSize: 12 }} />
                <YAxis 
                  className="text-xs" 
                  tick={{ fontSize: 12 }}
                  tickFormatter={selectedMetric === 'profit' || selectedMetric === 'volume' ? formatCurrency : undefined}
                />
                <Tooltip 
                  formatter={(value: any) => [
                    selectedMetric === 'profit' || selectedMetric === 'volume' 
                      ? formatCurrency(value) 
                      : value,
                    metrics.find(m => m.value === selectedMetric)?.label
                  ]}
                  labelFormatter={(label) => `Data: ${label}`}
                />
                <Bar 
                  dataKey={selectedMetric} 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* User Performance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Performance Detalhada por Usuário
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">
                  Usuário
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">
                  Apostas
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">
                  Volume
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">
                  Lucro/Prejuízo
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">
                  Taxa Vitória
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">
                  Saques
                </th>
              </tr>
            </thead>
            <tbody>
              {userStats.map((item, index) => (
                <tr key={item.user.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mr-3">
                        <span className="text-primary-600 dark:text-primary-400 font-semibold text-xs">
                          {item.user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                          {item.user.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {item.user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {item.betsCount}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {formatCurrency(item.volume)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-sm font-medium ${
                      item.profit >= 0 
                        ? 'text-success-600 dark:text-success-400' 
                        : 'text-error-600 dark:text-error-400'
                    }`}>
                      {item.profit >= 0 ? '+' : ''}{formatCurrency(item.profit)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-sm font-medium ${
                      item.winRate >= 50 
                        ? 'text-success-600 dark:text-success-400' 
                        : 'text-error-600 dark:text-error-400'
                    }`}>
                      {item.winRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {formatCurrency(item.withdrawals)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};