import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, Calendar, TrendingUp, CheckCircle, Clock, Filter } from 'lucide-react';
import { GoalForm } from '../components/goals/GoalForm';
import { useBettingStore } from '../store/bettingStore';
import { useAuthStore } from '../store/authStore';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const GoalsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { goals, bets, updateGoal } = useBettingStore();
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');

  const userGoals = goals.filter(goal => goal.userId === user?.id);
  const userBets = bets.filter(bet => bet.userId === user?.id);

  // Update goal progress
  useEffect(() => {
    userGoals.forEach(goal => {
      let relevantBets: typeof userBets = [];
      const goalDate = new Date(goal.period);

      switch (goal.type) {
        case 'daily':
          relevantBets = userBets.filter(bet => {
            const betDate = new Date(bet.date);
            return betDate.toDateString() === goalDate.toDateString();
          });
          break;
        case 'weekly':
          const weekStart = startOfWeek(goalDate, { weekStartsOn: 1 });
          const weekEnd = endOfWeek(goalDate, { weekStartsOn: 1 });
          relevantBets = userBets.filter(bet => {
            const betDate = new Date(bet.date);
            return betDate >= weekStart && betDate <= weekEnd;
          });
          break;
        case 'monthly':
          const monthStart = startOfMonth(goalDate);
          const monthEnd = endOfMonth(goalDate);
          relevantBets = userBets.filter(bet => {
            const betDate = new Date(bet.date);
            return betDate >= monthStart && betDate <= monthEnd;
          });
          break;
      }

      const currentValue = relevantBets.reduce((sum, bet) => sum + bet.profit, 0);
      const completed = currentValue >= goal.targetValue;

      if (goal.currentValue !== currentValue || goal.completed !== completed) {
        updateGoal(goal.id, { currentValue, completed });
      }
    });
  }, [userGoals, userBets, updateGoal]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getGoalTypeLabel = (type: string) => {
    const types = {
      daily: 'Diária',
      weekly: 'Semanal',
      monthly: 'Mensal',
    };
    return types[type as keyof typeof types] || type;
  };

  const getGoalPeriodLabel = (type: string, period: string) => {
    const date = new Date(period);
    
    switch (type) {
      case 'daily':
        return format(date, 'dd/MM/yyyy', { locale: ptBR });
      case 'weekly':
        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
        return `${format(weekStart, 'dd/MM', { locale: ptBR })} - ${format(weekEnd, 'dd/MM/yyyy', { locale: ptBR })}`;
      case 'monthly':
        return format(date, 'MMMM yyyy', { locale: ptBR });
      default:
        return period;
    }
  };

  // Filter goals by date - Fixed logic
  const getFilteredGoals = (goalsList: typeof userGoals) => {
    if (dateFilter === 'all') return goalsList;

    const now = new Date();
    return goalsList.filter(goal => {
      if (!goal.completed || !goal.completedAt) return false;
      
      const completedDate = new Date(goal.completedAt);
      
      switch (dateFilter) {
        case 'today':
          const todayStart = startOfDay(now);
          const todayEnd = endOfDay(now);
          return completedDate >= todayStart && completedDate <= todayEnd;
        case 'this-month':
          const thisMonthStart = startOfMonth(now);
          const thisMonthEnd = endOfMonth(now);
          return completedDate >= thisMonthStart && completedDate <= thisMonthEnd;
        case 'last-month':
          const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastMonthStart = startOfMonth(lastMonthDate);
          const lastMonthEnd = endOfMonth(lastMonthDate);
          return completedDate >= lastMonthStart && completedDate <= lastMonthEnd;
        case 'this-year':
          const thisYearStart = startOfYear(now);
          const thisYearEnd = endOfYear(now);
          return completedDate >= thisYearStart && completedDate <= thisYearEnd;
        case 'last-year':
          const lastYearDate = new Date(now.getFullYear() - 1, 0, 1);
          const lastYearStart = startOfYear(lastYearDate);
          const lastYearEnd = endOfYear(lastYearDate);
          return completedDate >= lastYearStart && completedDate <= lastYearEnd;
        default:
          return true;
      }
    });
  };

  const activeGoals = userGoals.filter(goal => !goal.completed);
  const completedGoals = getFilteredGoals(userGoals.filter(goal => goal.completed));

  const totalGoals = userGoals.length;
  const completedCount = userGoals.filter(goal => goal.completed).length;
  const completionRate = totalGoals > 0 ? (completedCount / totalGoals) * 100 : 0;

  const stats = [
    {
      title: 'Metas Ativas',
      value: activeGoals.length.toString(),
      change: `${totalGoals} total`,
      changeType: 'neutral' as const,
      icon: Target,
      color: 'primary'
    },
    {
      title: 'Metas Concluídas',
      value: completedCount.toString(),
      change: `${completionRate.toFixed(1)}% taxa`,
      changeType: 'positive' as const,
      icon: CheckCircle,
      color: 'success'
    },
    {
      title: 'Progresso Médio',
      value: `${activeGoals.length > 0 ? 
        (activeGoals.reduce((sum, goal) => sum + (goal.currentValue / goal.targetValue), 0) / activeGoals.length * 100).toFixed(1) 
        : 0}%`,
      change: 'das metas ativas',
      changeType: 'neutral' as const,
      icon: TrendingUp,
      color: 'secondary'
    },
  ];

  const filterOptions = [
    { value: 'all', label: 'Todas' },
    { value: 'today', label: 'Hoje' },
    { value: 'this-month', label: 'Este Mês' },
    { value: 'last-month', label: 'Mês Passado' },
    { value: 'this-year', label: 'Este Ano' },
    { value: 'last-year', label: 'Ano Passado' },
  ];

  return (
    <div className="space-y-6 px-6">
      <div className="flex flex-col space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Metas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Defina e acompanhe suas metas financeiras
          </p>
        </div>
        <button
          onClick={() => setShowGoalForm(true)}
          className="self-start flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Meta
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Metas Ativas
          </h3>
          <div className="space-y-4">
            {activeGoals.map((goal, index) => {
              const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
              const isOverdue = new Date(goal.period) < new Date() && !goal.completed;
              
              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        isOverdue 
                          ? 'bg-error-100 dark:bg-error-900/20' 
                          : 'bg-primary-100 dark:bg-primary-900/20'
                      }`}>
                        {isOverdue ? (
                          <Clock className="h-5 w-5 text-error-600 dark:text-error-400" />
                        ) : (
                          <Target className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-base font-medium text-gray-900 dark:text-white">
                          Meta {getGoalTypeLabel(goal.type)}
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {getGoalPeriodLabel(goal.type, goal.period)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(goal.currentValue)} / {formatCurrency(goal.targetValue)}
                      </p>
                      <p className={`text-xs ${
                        progress >= 100 
                          ? 'text-success-600 dark:text-success-400'
                          : progress >= 50
                          ? 'text-warning-600 dark:text-warning-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {progress.toFixed(1)}% concluído
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        progress >= 100 
                          ? 'bg-success-500'
                          : progress >= 50
                          ? 'bg-warning-500'
                          : 'bg-primary-500'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  
                  {isOverdue && (
                    <p className="text-xs text-error-600 dark:text-error-400 mt-2">
                      Meta vencida
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Completed Goals */}
      {userGoals.filter(goal => goal.completed).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-2 sm:space-y-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Metas Concluídas
            </h3>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {completedGoals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedGoals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-medium text-success-900 dark:text-success-100 truncate">
                        Meta {getGoalTypeLabel(goal.type)}
                      </h4>
                      <p className="text-sm text-success-700 dark:text-success-300 truncate">
                        {getGoalPeriodLabel(goal.type, goal.period)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-success-900 dark:text-success-100">
                      {formatCurrency(goal.currentValue)} / {formatCurrency(goal.targetValue)}
                    </p>
                    <p className="text-xs text-success-700 dark:text-success-300">
                      {((goal.currentValue / goal.targetValue) * 100).toFixed(1)}% concluído
                    </p>
                    {goal.completedAt && (
                      <p className="text-xs text-success-600 dark:text-success-400 mt-1">
                        Concluída em {format(new Date(goal.completedAt), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              Nenhuma meta concluída no período selecionado
            </p>
          )}
        </motion.div>
      )}

      {/* Empty State */}
      {userGoals.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center"
        >
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Nenhuma meta definida
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Comece definindo suas primeiras metas financeiras
          </p>
          <button
            onClick={() => setShowGoalForm(true)}
            className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Criar Primeira Meta
          </button>
        </motion.div>
      )}

      <GoalForm isOpen={showGoalForm} onClose={() => setShowGoalForm(false)} />
    </div>
  );
};