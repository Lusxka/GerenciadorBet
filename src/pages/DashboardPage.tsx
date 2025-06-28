import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  DollarSign,
  Trophy,
  Calendar,
  Activity
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useBettingStore } from '../store/bettingStore';

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    userSettings, 
    bets, 
    withdrawals,
    goals, 
    dayStatuses, 
    initializeSettings, 
    checkStopLimits 
  } = useBettingStore();

  useEffect(() => {
    if (user) {
      initializeSettings(user.id);
    }
  }, [user, initializeSettings]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const userBets = bets.filter(bet => bet.userId === user?.id);
  const userWithdrawals = withdrawals.filter(w => w.userId === user?.id);
  const todayBets = userBets.filter(bet => {
    const today = new Date().toDateString();
    const betDate = new Date(bet.date).toDateString();
    return today === betDate;
  });

  const profit = userSettings ? userSettings.currentBalance - userSettings.initialBalance : 0;
  const profitPercentage = userSettings ? ((profit / userSettings.initialBalance) * 100) : 0;

  const todayProfit = todayBets.reduce((sum, bet) => sum + bet.profit, 0);
  const totalWithdrawals = userWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  
  const winRate = userBets.length > 0 
    ? (userBets.filter(bet => bet.result === 'win').length / userBets.length) * 100 
    : 0;

  const { stopLoss, stopWin } = checkStopLimits();

  const monthlyGoal = goals.find(goal => 
    goal.userId === user?.id && 
    goal.type === 'monthly' && 
    !goal.completed
  );

  const currentStreak = dayStatuses
    .filter(day => day.status === 'stop-win')
    .slice(-7)
    .length;

  const stats = [
    {
      title: 'Saldo Atual',
      value: formatCurrency(userSettings?.currentBalance || 0),
      change: `${profitPercentage >= 0 ? '+' : ''}${profitPercentage.toFixed(1)}%`,
      changeType: profitPercentage >= 0 ? 'positive' : 'negative',
      icon: DollarSign,
      color: 'primary'
    },
    {
      title: 'Lucro/Prejuízo',
      value: formatCurrency(profit),
      change: formatCurrency(todayProfit),
      changeType: profit >= 0 ? 'positive' : 'negative',
      icon: profit >= 0 ? TrendingUp : TrendingDown,
      color: profit >= 0 ? 'success' : 'error'
    },
    {
      title: 'Taxa de Vitória',
      value: `${winRate.toFixed(1)}%`,
      change: `${userBets.length} apostas`,
      changeType: 'neutral',
      icon: Trophy,
      color: 'secondary'
    },
    {
      title: 'Total Saques',
      value: formatCurrency(totalWithdrawals),
      change: `${userWithdrawals.length} saques`,
      changeType: 'neutral',
      icon: Calendar,
      color: 'accent'
    }
  ];

  return (
    <div className="space-y-6 px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Bem-vindo de volta, {user?.name}!
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString('pt-BR', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Alerts */}
      {(stopLoss || stopWin) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            stopWin 
              ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800'
              : 'bg-error-50 dark:bg-error-900/20 border-error-200 dark:border-error-800'
          }`}
        >
          <div className="flex items-center space-x-3">
            <AlertTriangle className={`h-6 w-6 ${
              stopWin ? 'text-success-600' : 'text-error-600'
            }`} />
            <div>
              <h3 className={`text-base font-semibold ${
                stopWin ? 'text-success-800 dark:text-success-200' : 'text-error-800 dark:text-error-200'
              }`}>
                {stopWin ? 'Parabéns! Meta Atingida!' : 'Stop Loss Atingido!'}
              </h3>
              <p className={`text-sm ${
                stopWin ? 'text-success-600 dark:text-success-400' : 'text-error-600 dark:text-error-400'
              }`}>
                {stopWin 
                  ? 'Você atingiu sua meta de ganho hoje. Considere parar por aqui.'
                  : 'Você atingiu seu limite de perda. Pare por hoje e volte amanhã.'
                }
              </p>
            </div>
          </div>
        </motion.div>
      )}

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

      {/* Goal Progress */}
      {monthlyGoal && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Meta Mensal
            </h3>
            <Target className="h-5 w-5 text-primary-600" />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Progresso
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(monthlyGoal.currentValue)} / {formatCurrency(monthlyGoal.targetValue)}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min((monthlyGoal.currentValue / monthlyGoal.targetValue) * 100, 100)}%` 
                }}
              />
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {((monthlyGoal.currentValue / monthlyGoal.targetValue) * 100).toFixed(1)}% concluído
            </p>
          </div>
        </motion.div>
      )}

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Atividade Recente
          </h3>
          <Activity className="h-5 w-5 text-primary-600" />
        </div>

        <div className="space-y-3">
          {todayBets.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4 text-sm">
              Nenhuma aposta hoje ainda
            </p>
          ) : (
            todayBets.slice(-5).reverse().map((bet, index) => (
              <div key={bet.id} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    bet.result === 'win' ? 'bg-success-500' : 'bg-error-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Aposta #{bet.id.slice(-4)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(bet.date).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
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
                    {bet.result === 'win' ? `${bet.multiplier}x` : 'Perda'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};