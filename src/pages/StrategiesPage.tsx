import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, DollarSign, TrendingUp } from 'lucide-react';
import { StrategyCard } from '../components/strategies/StrategyCard';
import { StrategySimulator } from '../components/strategies/StrategySimulator';

const strategies = [
  {
    id: 'conservative',
    name: 'Conservadora',
    winTarget: 20,
    lossLimit: 10,
    description: 'Estratégia segura com baixo risco e retornos estáveis',
    riskLevel: 'low' as const,
  },
  {
    id: 'balanced',
    name: 'Equilibrada',
    winTarget: 30,
    lossLimit: 15,
    description: 'Balanço entre risco e retorno para crescimento consistente',
    riskLevel: 'medium' as const,
  },
  {
    id: 'moderate',
    name: 'Moderada',
    winTarget: 50,
    lossLimit: 20,
    description: 'Risco moderado com potencial de retorno interessante',
    riskLevel: 'medium' as const,
  },
  {
    id: 'aggressive',
    name: 'Agressiva',
    winTarget: 100,
    lossLimit: 30,
    description: 'Alta agressividade para maximizar ganhos rapidamente',
    riskLevel: 'high' as const,
  },
  {
    id: 'extreme',
    name: 'Extrema',
    winTarget: 150,
    lossLimit: 40,
    description: 'Máximo risco e retorno, apenas para especialistas',
    riskLevel: 'very-high' as const,
  },
];

export const StrategiesPage: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState(strategies[1]); // Default to balanced
  const [initialValue, setInitialValue] = useState(1000);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Estratégias
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Escolha e simule diferentes estratégias de apostas
          </p>
        </div>
      </div>

      {/* Initial Value Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-primary-600" />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Valor Inicial para Simulação:
            </label>
          </div>
          <input
            type="number"
            value={initialValue}
            onChange={(e) => setInitialValue(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-32"
            min="100"
            step="100"
          />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {formatCurrency(initialValue)}
          </span>
        </div>
      </motion.div>

      {/* Strategy Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Escolha sua Estratégia
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategies.map((strategy, index) => (
            <motion.div
              key={strategy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <StrategyCard
                strategy={strategy}
                isSelected={selectedStrategy.id === strategy.id}
                onSelect={() => setSelectedStrategy(strategy)}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Strategy Simulator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <StrategySimulator strategy={selectedStrategy} initialValue={initialValue} />
      </motion.div>

      {/* Strategy Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          Comparação de Estratégias
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Estratégia
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Meta de Ganho
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Limite de Perda
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Nível de Risco
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                  Recomendado Para
                </th>
              </tr>
            </thead>
            <tbody>
              {strategies.map((strategy) => (
                <tr 
                  key={strategy.id} 
                  className={`border-b border-gray-100 dark:border-gray-700 ${
                    selectedStrategy.id === strategy.id 
                      ? 'bg-primary-50 dark:bg-primary-900/20' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {strategy.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {strategy.description}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-success-600 dark:text-success-400 font-medium">
                    +{strategy.winTarget}%
                  </td>
                  <td className="py-3 px-4 text-error-600 dark:text-error-400 font-medium">
                    -{strategy.lossLimit}%
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      strategy.riskLevel === 'low' 
                        ? 'bg-success-100 text-success-800 dark:bg-success-900/20 dark:text-success-400'
                        : strategy.riskLevel === 'medium'
                        ? 'bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-400'
                        : strategy.riskLevel === 'high'
                        ? 'bg-error-100 text-error-800 dark:bg-error-900/20 dark:text-error-400'
                        : 'bg-error-200 text-error-900 dark:bg-error-900/30 dark:text-error-300'
                    }`}>
                      {strategy.riskLevel === 'low' && 'Baixo'}
                      {strategy.riskLevel === 'medium' && 'Moderado'}
                      {strategy.riskLevel === 'high' && 'Alto'}
                      {strategy.riskLevel === 'very-high' && 'Extremo'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {strategy.riskLevel === 'low' && 'Iniciantes'}
                    {strategy.riskLevel === 'medium' && 'Intermediários'}
                    {strategy.riskLevel === 'high' && 'Experientes'}
                    {strategy.riskLevel === 'very-high' && 'Especialistas'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Tips */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-xl border border-primary-200 dark:border-primary-800 p-6"
      >
        <div className="flex items-start space-x-3">
          <TrendingUp className="h-6 w-6 text-primary-600 dark:text-primary-400 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-primary-900 dark:text-primary-100 mb-2">
              Dicas Importantes
            </h3>
            <ul className="space-y-2 text-sm text-primary-800 dark:text-primary-200">
              <li>• <strong>Disciplina:</strong> Sempre respeite os limites de stop loss e stop win</li>
              <li>• <strong>Gestão de Risco:</strong> Nunca aposte mais do que pode perder</li>
              <li>• <strong>Diversificação:</strong> Considere usar diferentes estratégias em momentos diferentes</li>
              <li>• <strong>Análise:</strong> Revise regularmente seus resultados e ajuste conforme necessário</li>
              <li>• <strong>Paciência:</strong> Estratégias funcionam a longo prazo, não espere resultados imediatos</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};