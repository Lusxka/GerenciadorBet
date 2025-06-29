import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Calendar, DollarSign, Target, Clock, Zap, AlertTriangle } from 'lucide-react';
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

// Função para obter a data de hoje no formato correto (YYYY-MM-DD)
const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Função para converter string de data para Date object no fuso horário local
const createDateFromString = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // month - 1 porque Date usa 0-indexing para meses
};

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
    setValue,
    formState: { errors },
  } = useForm<BetFormData>({
    resolver: zodResolver(betSchema),
    defaultValues: {
      date: getTodayDateString(), // Usando a função corrigida
      multiplier: 1,
      mg: false,
    },
  });

  const result = watch('result');
  const amount = watch('amount');
  const multiplier = watch('multiplier');
  const mg = watch('mg');
  const selectedPeriod = watch('period');

  const calculateProfit = () => {
    if (!amount || !multiplier) return 0;
    
    if (result === 'win') {
      return amount * multiplier - amount;
    } else {
      // Loss with MG (Martin Gale) logic
      if (mg) {
        return -amount * 3; // Triple the loss if MG is selected
      } else {
        return -amount;
      }
    }
  };

  const onSubmit = async (data: BetFormData) => {
    if (!user) return;
    
    setLoading(true);
    try {
      addBet({
        ...data,
        userId: user.id,
        date: createDateFromString(data.date), // Usando a função corrigida
      });
      reset({
        date: getTodayDateString(), // Resetando com a data correta
        multiplier: 1,
        mg: false,
      });
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
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
            Nova Aposta
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 md:p-6 space-y-4 md:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
              <input
                type="date"
                {...register('date')}
                className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
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
              className="w-full px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
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
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                {...register('amount', { valueAsNumber: true })}
                className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
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
                <label 
                  key={period.value} 
                  className={`flex items-center p-2.5 md:p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedPeriod === period.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <input
                    type="radio"
                    value={period.value}
                    {...register('period')}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-base md:text-lg">{period.icon}</span>
                    <span className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">
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
              <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                {...register('multiplier', { valueAsNumber: true })}
                className="w-full pl-9 md:pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                placeholder="1.00"
              />
            </div>
            {errors.multiplier && (
              <p className="mt-1 text-sm text-error-600">{errors.multiplier.message}</p>
            )}
          </div>

          <div>
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('mg')}
                className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  MG (Martin Gale)
                </span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Se marcado e a aposta for uma derrota, a perda será multiplicada por 3x
                </p>
                {mg && result === 'loss' && (
                  <div className="mt-2 p-2 bg-warning-50 dark:bg-warning-900/20 rounded-lg border border-warning-200 dark:border-warning-800">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-4 w-4 text-warning-600" />
                      <span className="text-xs font-medium text-warning-800 dark:text-warning-200">
                        Atenção: Perda será triplicada (3x)
                      </span>
                    </div>
                  </div>
                )}
              </div>
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
              {mg && result === 'loss' && (
                <p className="text-xs text-warning-600 dark:text-warning-400 mt-1">
                  Incluindo multiplicador MG (3x)
                </p>
              )}
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 md:py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 md:py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors flex items-center justify-center text-sm"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Plus className="h-4 w-4 md:h-5 md:w-5 mr-2" />
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