import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Gamepad2, Target, TrendingUp, TrendingDown } from 'lucide-react';
import { BetForm } from '../components/betting/BetForm';
import { CategoryForm } from '../components/betting/CategoryForm';
import { BetsList } from '../components/betting/BetsList';
import { useBettingStore } from '../store/bettingStore';
import { useAuthStore } from '../store/authStore';

export const BetsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { categories, bets } = useBettingStore();
  const [showBetForm, setShowBetForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const userCategories = categories.filter(cat => cat.userId === user?.id);
  const userBets = bets.filter(bet => bet.userId === user?.id);

  const todayBets = userBets.filter(bet => {
    const today = new Date().toDateString();
    const betDate = new Date(bet.date).toDateString();
    return today === betDate;
  });

  const totalWins = userBets.filter(bet => bet.result === 'win').length;
  const totalLosses = userBets.filter(bet => bet.result === 'loss').length;
  const winRate = userBets.length > 0 ? (totalWins / userBets.length) * 100 : 0;

  const todayProfit = todayBets.reduce((sum, bet) => sum + bet.profit, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const stats = [
    {
      title: 'Total de Apostas',
      value: userBets.length.toString(),
      change: `${todayBets.length} hoje`,
      changeType: 'neutral' as const,
      icon: Gamepad2,
      color: 'primary'
    },
    {
      title: 'Taxa de Vitória',
      value: `${winRate.toFixed(1)}%`,
      change: `${totalWins}W / ${totalLosses}L`,
      changeType: 'neutral' as const,
      icon: Target,
      color: 'secondary'
    },
    {
      title: 'Lucro Hoje',
      value: formatCurrency(todayProfit),
      change: `${todayBets.length} apostas`,
      changeType: todayProfit >= 0 ? 'positive' : 'negative',
      icon: todayProfit >= 0 ? TrendingUp : TrendingDown,
      color: todayProfit >= 0 ? 'success' : 'error'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Apostas
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie suas apostas e categorias
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <button
            onClick={() => setShowCategoryForm(true)}
            className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Categoria
          </button>
          <button
            onClick={() => setShowBetForm(true)}
            className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Aposta
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
                <p className={`text-sm mt-1 ${
                  stat.changeType === 'positive' 
                    ? 'text-success-600 dark:text-success-400'
                    : stat.changeType === 'negative'
                    ? 'text-error-600 dark:text-error-400'
                    : 'text-gray-500 dark:text-gray-400'
                }`}>
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-full bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Categories */}
      {userCategories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Categorias
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {userCategories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-xl mb-2"
                  style={{ 
                    backgroundColor: category.color + '20', 
                    color: category.color 
                  }}
                >
                  {category.icon}
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white text-center">
                  {category.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {userBets.filter(bet => bet.categoryId === category.id).length} apostas
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Bets List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <BetsList />
      </motion.div>

      {/* Forms */}
      <BetForm isOpen={showBetForm} onClose={() => setShowBetForm(false)} />
      <CategoryForm isOpen={showCategoryForm} onClose={() => setShowCategoryForm(false)} />
    </div>
  );
};