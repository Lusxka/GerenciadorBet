import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Calendar, DollarSign, Target, Clock, Zap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBettingStore } from '../../store/bettingStore';
import { useAuthStore } from '../../store/authStore';

const betSchema = z.object({
  categoryId: z.string().min(1, 'Selecione uma categoria'),
  amount: z.number().min(0.01, 'Valor deve ser maior que 0'),
  result: z.enum(['win', 'loss']),
  period: z.enum(['morning', 'afternoon', 'night', 'late-night']),
  multiplier: z.number().min(0.01, 'Multiplicador deve ser maior que 0'),
  mg: z.boolean(),
  date: z.string().min(1, 'Data é obrigatória'),
});

type BetFormData = z.infer<typeof betSchema>;

interface BetFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BetForm: React.FC<BetFormProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const { categories, addBet } = useBettingStore();
  const [loading, setLoading] = useState(false);

  const userCategories = categories.filter(cat => cat.userId === user?.id);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<BetFormData>({
    resolver: zodResolver(betSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      multiplier: 1,
      mg: false,
    },
  });

  const result = watch('result');
  const amount = watch('amount');
  const multiplier = watch('multiplier');

  const calculateProfit = () => {
    if (!amount || !multiplier) return 0;
    return result === 'win' ? amount * multiplier - amount : -amount;
  };

  const onSubmit = async (data: BetFormData) => {
    if (!user) return;
    
    setLoading(true);
    try {
      addBet({
        ...data,
        userId: user.id,
        date: new Date(data.date),
      });
      reset();
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar aposta:', error);
    } finally {
      setLoading(false);
    }
  };

  const periods = [
    { value: 'morning', label: 'Manhã', icon: '🌅' },
    { value: 'afternoon', label: 'Tarde', icon: '☀️' },
    { value: 'night', label: 'Noite', icon: '🌙' },
    { value: 'late-night', label: 'Madrugada', icon: '🌃' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Nova Aposta
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="date"
                {...register('date')}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            {errors.date && (
              <p className="mt-1 text-sm text-error-600">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoria
            </label>
            <select
              {...register('categoryId')}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Selecione uma categoria</option>
              {userCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-sm text-error-600">{errors.categoryId.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valor da Aposta
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0.00"
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-error-600">{errors.amount.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Resultado
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  value="win"
                  {...register('result')}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  result === 'win' 
                    ? 'bg-success-500 border-success-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`} />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Vitória
                </span>
              </label>
              <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                <input
                  type="radio"
                  value="loss"
                  {...register('result')}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  result === 'loss' 
                    ? 'bg-error-500 border-error-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`} />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  Derrota
                </span>
              </label>
            </div>
            {errors.result && (
              <p className="mt-1 text-sm text-error-600">{errors.result.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Período
            </label>
            <div className="grid grid-cols-2 gap-2">
              {periods.map((period) => (
                <label key={period.value} className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    value={period.value}
                    {...register('period')}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{period.icon}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {period.label}
                    </span>
                  </div>
                </label>
              ))}
            </div>
            {errors.period && (
              <p className="mt-1 text-sm text-error-600">{errors.period.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Multiplicador
            </label>
            <div className="relative">
              <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                {...register('multiplier', { valueAsNumber: true })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="1.00"
              />
            </div>
            {errors.multiplier && (
              <p className="mt-1 text-sm text-error-600">{errors.multiplier.message}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              {...register('mg')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900 dark:text-white">
              MG (Martingale)
            </label>
          </div>

          {amount && multiplier && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Lucro/Prejuízo:
                </span>
                <span className={`text-lg font-bold ${
                  calculateProfit() >= 0 
                    ? 'text-success-600 dark:text-success-400' 
                    : 'text-error-600 dark:text-error-400'
                }`}>
                  {calculateProfit() >= 0 ? '+' : ''}
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(calculateProfit())}
                </span>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Adicionar
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};