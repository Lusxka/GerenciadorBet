import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, Save, AlertTriangle, CheckCircle } from 'lucide-react';
import { useBettingStore } from '../../store/bettingStore';

export const InitialBalanceForm: React.FC = () => {
  const { userSettings, updateSettings } = useBettingStore();
  const [newBalance, setNewBalance] = useState(userSettings?.initialBalance || 0);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleSave = async () => {
    if (!userSettings) return;
    
    setLoading(true);
    setMessage(null);
    
    try {
      // Calculate the difference to adjust current balance
      const difference = newBalance - userSettings.initialBalance;
      const newCurrentBalance = userSettings.currentBalance + difference;
      
      updateSettings({
        initialBalance: newBalance,
        currentBalance: newCurrentBalance,
      });
      
      setShowConfirm(false);
      setMessage({ type: 'success', text: 'Saldo inicial atualizado com sucesso!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Erro ao atualizar saldo inicial:', error);
      setMessage({ type: 'error', text: 'Erro ao atualizar saldo inicial' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const balanceDifference = newBalance - (userSettings?.initialBalance || 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900/20">
          <DollarSign className="h-5 w-5 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Configurar Saldo Inicial
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Defina ou ajuste seu saldo inicial da banca
          </p>
        </div>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 p-3 rounded-lg border ${
            message.type === 'success'
              ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800'
              : 'bg-error-50 dark:bg-error-900/20 border-error-200 dark:border-error-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-success-600 dark:text-success-400" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-error-600 dark:text-error-400" />
            )}
            <p className={`text-sm ${
              message.type === 'success'
                ? 'text-success-600 dark:text-success-400'
                : 'text-error-600 dark:text-error-400'
            }`}>
              {message.text}
            </p>
          </div>
        </motion.div>
      )}

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Saldo Inicial Atual
            </label>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {formatCurrency(userSettings?.initialBalance || 0)}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Saldo Atual
            </label>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className={`text-lg font-semibold ${
                (userSettings?.currentBalance || 0) >= (userSettings?.initialBalance || 0)
                  ? 'text-success-600 dark:text-success-400'
                  : 'text-error-600 dark:text-error-400'
              }`}>
                {formatCurrency(userSettings?.currentBalance || 0)}
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Novo Saldo Inicial
          </label>
          <div className="flex space-x-3">
            <div className="flex-1">
              <input
                type="number"
                value={newBalance}
                onChange={(e) => setNewBalance(Number(e.target.value))}
                min="0"
                step="1"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
              />
            </div>
            <div className="flex items-center px-3 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg min-w-[120px]">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {formatCurrency(newBalance)}
              </span>
            </div>
          </div>
        </div>

        {balanceDifference !== 0 && (
          <div className={`p-4 rounded-lg border ${
            balanceDifference > 0
              ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800'
              : 'bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800'
          }`}>
            <div className="flex items-start space-x-3">
              <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                balanceDifference > 0
                  ? 'text-success-600 dark:text-success-400'
                  : 'text-warning-600 dark:text-warning-400'
              }`} />
              <div>
                <h4 className={`text-sm font-medium ${
                  balanceDifference > 0
                    ? 'text-success-800 dark:text-success-200'
                    : 'text-warning-800 dark:text-warning-200'
                }`}>
                  Impacto da Alteração
                </h4>
                <p className={`text-sm mt-1 ${
                  balanceDifference > 0
                    ? 'text-success-600 dark:text-success-400'
                    : 'text-warning-600 dark:text-warning-400'
                }`}>
                  Seu saldo atual será {balanceDifference > 0 ? 'aumentado' : 'reduzido'} em{' '}
                  <strong>{formatCurrency(Math.abs(balanceDifference))}</strong>
                </p>
                <p className={`text-xs mt-1 ${
                  balanceDifference > 0
                    ? 'text-success-500 dark:text-success-400'
                    : 'text-warning-500 dark:text-warning-400'
                }`}>
                  Novo saldo atual: {formatCurrency((userSettings?.currentBalance || 0) + balanceDifference)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-3">
          {balanceDifference !== 0 && !showConfirm && (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex-1 flex items-center justify-center px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              Atualizar Saldo Inicial
            </button>
          )}

          {showConfirm && (
            <>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Confirmar Alteração
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};