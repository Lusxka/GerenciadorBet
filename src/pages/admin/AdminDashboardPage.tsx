import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity,
  Calendar,
  BarChart3,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useBettingStore } from '../../store/bettingStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const AdminDashboardPage: React.FC = () => {
  const { getAllUsers } = useAuthStore();
  const { bets, withdrawals, categories, goals } = useBettingStore();
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const users = getAllUsers();
  const clientUsers = users.filter(user => user.role === 'client');

  // Filter data by period
  const getFilteredData = () => {
    if (selectedPeriod === 'all') {
      return { filteredBets: bets, filteredWithdrawals: withdrawals };
    }
    
    const now = new Date();
    let startDate: Date;
    
    switch (selectedPeriod) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return { filteredBets: bets, filteredWithdrawals: withdrawals };
    }

    const filteredBets = bets.filter(bet => new Date(bet.date) >= startDate);
    const filteredWithdrawals = withdrawals.filter(w => new Date(w.date) >= startDate);
    
    return { filteredBets, filteredWithdrawals };
  };

  const { filteredBets, filteredWithdrawals } = getFilteredData();

  // Calculate statistics
  const totalBets = filteredBets.length;
  const totalWins = filteredBets.filter(bet => bet.result === 'win').length;
  const totalLosses = filteredBets.filter(bet => bet.result === 'loss').length;
  const winRate = totalBets > 0 ? (totalWins / totalBets) * 100 : 0;
  
  const totalProfit = filteredBets.reduce((sum, bet) => sum + bet.profit, 0);
  const totalAmount = filteredBets.reduce((sum, bet) => sum + bet.amount, 0);
  const totalWithdrawals = filteredWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  
  const activeUsers = clientUsers.filter(user => {
    const userBets = filteredBets.filter(bet => bet.userId === user.id);
    return userBets.length > 0;
  }).length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const stats = [
    {
      title: 'Total de Usuários',
      value: clientUsers.length.toString(),
      change: `${activeUsers} ativos`,
      changeType: 'neutral' as const,
      icon: Users,
      color: 'primary'
    },
    {
      title: 'Total de Apostas',
      value: totalBets.toString(),
      change: `${winRate.toFixed(1)}% vitórias`,
      changeType: winRate >= 50 ? 'positive' : 'negative',
      icon: TrendingUp,
      color: 'secondary'
    },
    {
      title: 'Volume Total',
      value: formatCurrency(totalAmount),
      change: `Lucro: ${formatCurrency(totalProfit)}`,
      changeType: totalProfit >= 0 ? 'positive' : 'negative',
      icon: DollarSign,
      color: 'accent'
    },
    {
      title: 'Total Saques',
      value: formatCurrency(totalWithdrawals),
      change: `${filteredWithdrawals.length} transações`,
      changeType: 'neutral' as const,
      icon: Activity,
      color: 'warning'
    },
  ];

  // Recent activity
  const recentBets = filteredBets
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const recentWithdrawals = filteredWithdrawals
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // User performance
  const userPerformance = clientUsers.map(user => {
    const userBets = filteredBets.filter(bet => bet.userId === user.id);
    const userWithdrawals = filteredWithdrawals.filter(w => w.userId === user.id);
    const userProfit = userBets.reduce((sum, bet) => sum + bet.profit, 0);
    const userWithdrawalTotal = userWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    
    return {
      user,
      betsCount: userBets.length,
      profit: userProfit,
      withdrawals: userWithdrawalTotal,
      winRate: userBets.length > 0 ? (userBets.filter(bet => bet.result === 'win').length / userBets.length) * 100 : 0,
    };
  }).sort((a, b) => b.profit - a.profit);

  const periods = [
    { value: 'all', label: 'Todos' },
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: '7 dias' },
    { value: 'month', label: '30 dias' },
  ];

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Administrativo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Visão geral do sistema e performance dos usuários
          </p>
        </div>
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
      </div>

      {/* Stats Grid */}
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

      {/* User Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Performance dos Usuários
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
                  Taxa Vitória
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">
                  Lucro/Prejuízo
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white text-sm">
                  Saques
                </th>
              </tr>
            </thead>
            <tbody>
              {userPerformance.slice(0, 10).map((item, index) => (
                <tr key={item.user.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {item.user.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {item.user.email}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900 dark:text-white">
                    {item.betsCount}
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
                  <td className="py-3 px-4">
                    <span className={`text-sm font-medium ${
                      item.profit >= 0 
                        ? 'text-success-600 dark:text-success-400' 
                        : 'text-error-600 dark:text-error-400'
                    }`}>
                      {item.profit >= 0 ? '+' : ''}{formatCurrency(item.profit)}
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

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Apostas Recentes
          </h3>
          <div className="space-y-3">
            {recentBets.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm">
                Nenhuma aposta no período
              </p>
            ) : (
              recentBets.map((bet) => {
                const user = users.find(u => u.id === bet.userId);
                return (
                  <div key={bet.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        bet.result === 'win' ? 'bg-success-500' : 'bg-error-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user?.name || 'Usuário'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(bet.date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${
                        bet.profit >= 0 
                          ? 'text-success-600 dark:text-success-400' 
                          : 'text-error-600 dark:text-error-400'
                      }`}>
                        {bet.profit >= 0 ? '+' : ''}{formatCurrency(bet.profit)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatCurrency(bet.amount)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Saques Recentes
          </h3>
          <div className="space-y-3">
            {recentWithdrawals.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm">
                Nenhum saque no período
              </p>
            ) : (
              recentWithdrawals.map((withdrawal) => {
                const user = users.find(u => u.id === withdrawal.userId);
                return (
                  <div key={withdrawal.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-warning-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user?.name || 'Usuário'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {format(new Date(withdrawal.date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-warning-600 dark:text-warning-400">
                        -{formatCurrency(withdrawal.amount)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[100px]">
                        {withdrawal.description}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* System Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Status do Sistema
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-success-50 dark:bg-success-900/20 rounded-lg">
            <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400" />
            <div>
              <p className="text-sm font-medium text-success-900 dark:text-success-100">
                Sistema Online
              </p>
              <p className="text-xs text-success-700 dark:text-success-300">
                Funcionando normalmente
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <Users className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            <div>
              <p className="text-sm font-medium text-primary-900 dark:text-primary-100">
                {clientUsers.length} Usuários
              </p>
              <p className="text-xs text-primary-700 dark:text-primary-300">
                {activeUsers} ativos hoje
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-secondary-50 dark:bg-secondary-900/20 rounded-lg">
            <BarChart3 className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
            <div>
              <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                {categories.length} Categorias
              </p>
              <p className="text-xs text-secondary-700 dark:text-secondary-300">
                Configuradas
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-accent-50 dark:bg-accent-900/20 rounded-lg">
            <Calendar className="h-5 w-5 text-accent-600 dark:text-accent-400" />
            <div>
              <p className="text-sm font-medium text-accent-900 dark:text-accent-100">
                {goals.length} Metas
              </p>
              <p className="text-xs text-accent-700 dark:text-accent-300">
                Criadas pelos usuários
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};