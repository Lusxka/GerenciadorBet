import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, X, Calendar, DollarSign, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBettingStore } from '../../store/bettingStore';
import { useAuthStore } from '../../store/authStore';

const withdrawalSchema = z.object({
  amount: z.number().min(0.01, 'Valor deve ser maior que 0'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  date: z.string().min(1, 'Data é obrigatória'),
});

type WithdrawalFormData = z.infer<typeof withdrawalSchema>;

interface WithdrawalFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WithdrawalForm: React.FC<WithdrawalFormProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const { addWithdrawal, userSettings } = useBettingStore();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<WithdrawalFormData>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
    },
  });

  const amount = watch('amount');
  const currentBalance = userSettings?.currentBalance || 0;

  const onSubmit = async (data: WithdrawalFormData) => {
    if (!user) return;
    
    if (data.amount > currentBalance) {
      alert('Valor de saque maior que o saldo disponível');
      return;
    }
    
    setLoading(true);
    try {
      addWithdrawal({
        ...data,
        userId: user.id,
        date: new Date(data.date),
        previousBalance: currentBalance,
      });
      reset();
      onClose();
    } catch (error) {
      console.error('Erro ao adicionar saque:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

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
            Novo Saque
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Saldo Disponível:
              </span>
              <span className="text-lg font-bold text-blue-900 dark:text-blue-100">
                {formatCurrency(currentBalance)}
              </span>
            </div>
          </div>

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
              Valor do Saque
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                step="0.01"
                max={currentBalance}
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
            {amount > currentBalance && (
              <p className="mt-1 text-sm text-error-600">
                Valor maior que o saldo disponível
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descrição
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <textarea
                {...register('description')}
                rows={3}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                placeholder="Ex: Saque para conta bancária, pagamento de conta..."
              />
            </div>
            {errors.description && (
              <p className="mt-1 text-sm text-error-600">{errors.description.message}</p>
            )}
          </div>

          {amount && amount <= currentBalance && (
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Saldo após saque:
                </span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(currentBalance - amount)}
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
              disabled={loading || amount > currentBalance}
              className="flex-1 px-4 py-3 bg-error-600 hover:bg-error-700 disabled:bg-error-400 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Minus className="h-5 w-5 mr-2" />
                  Sacar
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};