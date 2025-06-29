import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Target, Calendar, DollarSign } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBettingStore } from '../../store/bettingStore';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';

const goalSchema = z.object({
  type: z.enum(['daily', 'weekly', 'monthly']),
  targetValue: z.number().min(0.01, 'Valor deve ser maior que 0'),
  period: z.string().min(1, 'Período é obrigatório'),
});

type GoalFormData = z.infer<typeof goalSchema>;

interface GoalFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoalForm: React.FC<GoalFormProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const { addGoal } = useBettingStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      // Set today's date in the correct format for each input type
      period: format(new Date(), 'yyyy-MM-dd'), // Default to today for daily goals
    },
  });

  const goalType = watch('type');

  const onSubmit = async (data: GoalFormData) => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Parse the period correctly based on goal type
      let periodDate: Date;
      
      if (data.type === 'daily') {
        // For daily goals, use the exact date selected
        periodDate = new Date(data.period + 'T00:00:00');
      } else if (data.type === 'weekly') {
        // For weekly goals, use the start of the selected week
        periodDate = new Date(data.period + 'T00:00:00');
      } else {
        // For monthly goals, use the first day of the selected month
        const [year, month] = data.period.split('-');
        periodDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      }

      addGoal({
        ...data,
        userId: user.id,
        period: periodDate.toISOString(),
        currentValue: 0,
        completed: false,
      });
      reset();
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar meta:', error);
    } finally {
      setLoading(false);
    }
  };

  const goalTypes = [
    { value: 'daily', label: 'Diária', description: 'Meta para um dia específico' },
    { value: 'weekly', label: 'Semanal', description: 'Meta para uma semana' },
    { value: 'monthly', label: 'Mensal', description: 'Meta para um mês' },
  ];

  // Get the correct input type and default value based on goal type
  const getInputTypeAndValue = () => {
    const today = new Date();
    
    switch (goalType) {
      case 'daily':
        return {
          type: 'date',
          defaultValue: format(today, 'yyyy-MM-dd'),
        };
      case 'weekly':
        return {
          type: 'week',
          defaultValue: format(today, 'yyyy-\\WW'),
        };
      case 'monthly':
        return {
          type: 'month',
          defaultValue: format(today, 'yyyy-MM'),
        };
      default:
        return {
          type: 'date',
          defaultValue: format(today, 'yyyy-MM-dd'),
        };
    }
  };

  const inputConfig = getInputTypeAndValue();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Nova Meta
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Tipo de Meta
            </label>
            <div className="space-y-3">
              {goalTypes.map((type) => (
                <label key={type.value} className="flex items-start p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    value={type.value}
                    {...register('type')}
                    className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {type.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {type.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            {errors.type && (
              <p className="mt-1 text-sm text-error-600">{errors.type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Valor da Meta
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                {...register('targetValue', { valueAsNumber: true })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0.00"
              />
            </div>
            {errors.targetValue && (
              <p className="mt-1 text-sm text-error-600">{errors.targetValue.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {goalType === 'daily' ? 'Data' : goalType === 'weekly' ? 'Semana' : 'Mês'}
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={inputConfig.type}
                {...register('period')}
                defaultValue={inputConfig.defaultValue}
                min={format(new Date(), goalType === 'monthly' ? 'yyyy-MM' : goalType === 'weekly' ? 'yyyy-\\WW' : 'yyyy-MM-dd')}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            {errors.period && (
              <p className="mt-1 text-sm text-error-600">{errors.period.message}</p>
            )}
          </div>

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
                  Criar Meta
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};