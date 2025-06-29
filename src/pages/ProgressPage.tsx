import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, TrendingDown, Target, Filter } from 'lucide-react';
import { useBettingStore } from '../store/bettingStore';
import { useAuthStore } from '../store/authStore';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  isBefore,
  startOfDay
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const ProgressPage: React.FC = () => {
  const { user } = useAuthStore();
  const { bets, withdrawals, dayStatuses } = useBettingStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const userBets = bets.filter(bet => bet.userId === user?.id);
  const userWithdrawals = withdrawals.filter(w => w.userId === user?.id);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDayStatus = (date: Date) => {
    // Only show status for today and past days
    if (!isToday(date) && !isBefore(date, startOfDay(new Date()))) {
      return 'neutral';
    }

    const dateStr = format(date, 'yyyy-MM-dd');
    const dayStatus = dayStatuses.find(ds => ds.date === dateStr);
    
    if (dayStatus) {
      return dayStatus.status;
    }

    // Calculate from bets if no explicit status
    const dayBets = userBets.filter(bet => isSameDay(new Date(bet.date), date));
    if (dayBets.length === 0) return 'neutral';

    const dayProfit = dayBets.reduce((sum, bet) => sum + bet.profit, 0);
    
    if (dayProfit > 0) return 'positive';
    if (dayProfit < 0) return 'negative';
    return 'neutral';
  };

  const getDayProfit = (date: Date) => {
    // Only calculate profit for today and past days
    if (!isToday(date) && !isBefore(date, startOfDay(new Date()))) {
      return 0;
    }

    const dayBets = userBets.filter(bet => isSameDay(new Date(bet.date), date));
    const dayWithdrawals = userWithdrawals.filter(w => isSameDay(new Date(w.date), date));
    
    const betsProfit = dayBets.reduce((sum, bet) => sum + bet.profit, 0);
    const withdrawalsAmount = dayWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    
    return betsProfit - withdrawalsAmount;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'positive':
        return 'bg-success-500 text-white';
      case 'negative':
        return 'bg-error-500 text-white';
      case 'stop-win':
        return 'bg-success-600 text-white ring-2 ring-success-300';
      case 'stop-loss':
        return 'bg-error-600 text-white ring-2 ring-error-300';
      default:
        return 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'positive':
      case 'stop-win':
        return '✅';
      case 'negative':
      case 'stop-loss':
        return '❌';
      default:
        return '';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Calculate monthly stats - only for past days and today
  const monthlyBets = userBets.filter(bet => {
    const betDate = new Date(bet.date);
    return betDate >= monthStart && betDate <= monthEnd && 
           (isToday(betDate) || isBefore(betDate, startOfDay(new Date())));
  });

  const monthlyWithdrawals = userWithdrawals.filter(w => {
    const withdrawalDate = new Date(w.date);
    return withdrawalDate >= monthStart && withdrawalDate <= monthEnd &&
           (isToday(withdrawalDate) || isBefore(withdrawalDate, startOfDay(new Date())));
  });

  const positiveDays = daysInMonth.filter(day => {
    if (!isToday(day) && !isBefore(day, startOfDay(new Date()))) return false;
    const status = getDayStatus(day);
    return status === 'positive' || status === 'stop-win';
  }).length;

  const negativeDays = daysInMonth.filter(day => {
    if (!isToday(day) && !isBefore(day, startOfDay(new Date()))) return false;
    const status = getDayStatus(day);
    return status === 'negative' || status === 'stop-loss';
  }).length;

  const activeDays = daysInMonth.filter(day => 
    isToday(day) || isBefore(day, startOfDay(new Date()))
  ).length;

  const neutralDays = activeDays - positiveDays - negativeDays;

  const stopWinDays = daysInMonth.filter(day => {
    if (!isToday(day) && !isBefore(day, startOfDay(new Date()))) return false;
    return getDayStatus(day) === 'stop-win';
  }).length;

  const stopLossDays = daysInMonth.filter(day => {
    if (!isToday(day) && !isBefore(day, startOfDay(new Date()))) return false;
    return getDayStatus(day) === 'stop-loss';
  }).length;

  const monthlyProfit = monthlyBets.reduce((sum, bet) => sum + bet.profit, 0);
  const monthlyWithdrawalsTotal = monthlyWithdrawals.reduce((sum, w) => sum + w.amount, 0);

  // Calculate streak
  const currentStreak = (() => {
    const today = new Date();
    let streak = 0;
    let streakType = '';
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      
      // Only check past days and today
      if (!isToday(checkDate) && !isBefore(checkDate, startOfDay(new Date()))) {
        continue;
      }
      
      const status = getDayStatus(checkDate);
      
      if (i === 0) {
        if (status === 'positive' || status === 'stop-win') {
          streak = 1;
          streakType = 'positive';
        } else if (status === 'negative' || status === 'stop-loss') {
          streak = 1;
          streakType = 'negative';
        } else {
          break;
        }
      } else {
        if (
          (streakType === 'positive' && (status === 'positive' || status === 'stop-win')) ||
          (streakType === 'negative' && (status === 'negative' || status === 'stop-loss'))
        ) {
          streak++;
        } else {
          break;
        }
      }
    }
    
    return { streak, type: streakType };
  })();

  const stats = [
    {
      title: 'Dias Positivos',
      value: positiveDays.toString(),
      change: `${stopWinDays} stop wins`,
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'success'
    },
    {
      title: 'Dias Negativos',
      value: negativeDays.toString(),
      change: `${stopLossDays} stop loss`,
      changeType: 'negative' as const,
      icon: TrendingDown,
      color: 'error'
    },
    {
      title: 'Lucro do Mês',
      value: formatCurrency(monthlyProfit),
      change: `${monthlyBets.length} apostas`,
      changeType: monthlyProfit >= 0 ? 'positive' : 'negative',
      icon: Target,
      color: monthlyProfit >= 0 ? 'success' : 'error'
    },
    {
      title: 'Sequência Atual',
      value: `${currentStreak.streak} dias`,
      change: currentStreak.type === 'positive' ? 'Positivos' : currentStreak.type === 'negative' ? 'Negativos' : 'Neutros',
      changeType: currentStreak.type === 'positive' ? 'positive' : currentStreak.type === 'negative' ? 'negative' : 'neutral',
      icon: Calendar,
      color: currentStreak.type === 'positive' ? 'success' : currentStreak.type === 'negative' ? 'error' : 'secondary'
    },
  ];

  return (
    <div className="space-y-6 px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Progresso
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Acompanhe seu progresso diário e mensal
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            ←
          </button>
          <span className="text-lg font-medium text-gray-900 dark:text-white min-w-[120px] text-center">
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            →
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

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Calendário de Progresso
        </h3>

        {/* Calendar Header */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty cells for days before month start */}
          {Array.from({ length: monthStart.getDay() }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}
          
          {/* Days of the month */}
          {daysInMonth.map((day, index) => {
            const status = getDayStatus(day);
            const profit = getDayProfit(day);
            const isTodayDate = isToday(day);
            const isFutureDate = !isTodayDate && !isBefore(day, startOfDay(new Date()));
            
            return (
              <motion.div
                key={day.toISOString()}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                className={`
                  aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium cursor-pointer
                  transition-all duration-200 hover:scale-105 relative
                  ${isFutureDate 
                    ? 'bg-gray-100 dark:bg-gray-600 text-gray-400 dark:text-gray-500 opacity-50' 
                    : getStatusColor(status)
                  }
                  ${isTodayDate ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-gray-800' : ''}
                `}
                title={isFutureDate 
                  ? `${format(day, 'dd/MM/yyyy', { locale: ptBR })} - Futuro` 
                  : `${format(day, 'dd/MM/yyyy', { locale: ptBR })} - ${formatCurrency(profit)}`
                }
              >
                <span className="text-xs">{format(day, 'd')}</span>
                {!isFutureDate && (
                  <>
                    <span className="text-xs">{getStatusIcon(status)}</span>
                    {profit !== 0 && (
                      <span className="text-xs font-bold">
                        {profit > 0 ? '+' : ''}{Math.abs(profit).toFixed(0)}
                      </span>
                    )}
                  </>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-success-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Dia Positivo</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-error-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Dia Negativo</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-success-600 rounded ring-2 ring-success-300"></div>
            <span className="text-gray-600 dark:text-gray-400">Stop Win</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-error-600 rounded ring-2 ring-error-300"></div>
            <span className="text-gray-600 dark:text-gray-400">Stop Loss</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Sem Atividade</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-100 dark:bg-gray-600 rounded opacity-50"></div>
            <span className="text-gray-600 dark:text-gray-400">Futuro</span>
          </div>
        </div>
      </motion.div>

      {/* Monthly Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Resumo do Mês
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-success-600 dark:text-success-400 mb-2">
              {positiveDays}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Dias Positivos
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {activeDays > 0 ? ((positiveDays / activeDays) * 100).toFixed(1) : 0}% dos dias ativos
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-error-600 dark:text-error-400 mb-2">
              {negativeDays}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Dias Negativos
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {activeDays > 0 ? ((negativeDays / activeDays) * 100).toFixed(1) : 0}% dos dias ativos
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-2">
              {neutralDays}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Dias Neutros
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {activeDays > 0 ? ((neutralDays / activeDays) * 100).toFixed(1) : 0}% dos dias ativos
            </div>
          </div>

          <div className="text-center">
            <div className="text-3xl font-bold text-warning-600 dark:text-warning-400 mb-2">
              {formatCurrency(monthlyWithdrawalsTotal)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Sacado
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {monthlyWithdrawals.length} saques
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};