import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, Shield } from 'lucide-react';

interface Strategy {
  id: string;
  name: string;
  winTarget: number;
  lossLimit: number;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'very-high';
}

interface StrategyCardProps {
  strategy: Strategy;
  isSelected: boolean;
  onSelect: () => void;
}

export const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, isSelected, onSelect }) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-success-600 dark:text-success-400 bg-success-100 dark:bg-success-900/20';
      case 'medium':
        return 'text-warning-600 dark:text-warning-400 bg-warning-100 dark:bg-warning-900/20';
      case 'high':
        return 'text-error-600 dark:text-error-400 bg-error-100 dark:bg-error-900/20';
      case 'very-high':
        return 'text-error-700 dark:text-error-300 bg-error-200 dark:bg-error-900/30';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getRiskLabel = (level: string) => {
    switch (level) {
      case 'low':
        return 'Baixo Risco';
      case 'medium':
        return 'Risco Moderado';
      case 'high':
        return 'Alto Risco';
      case 'very-high':
        return 'Risco Extremo';
      default:
        return 'Risco Desconhecido';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'low':
        return Shield;
      case 'medium':
        return TrendingUp;
      case 'high':
        return TrendingDown;
      case 'very-high':
        return AlertTriangle;
      default:
        return Shield;
    }
  };

  const RiskIcon = getRiskIcon(strategy.riskLevel);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        p-6 rounded-xl border-2 cursor-pointer transition-all duration-200
        ${isSelected 
          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
        }
      `}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {strategy.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {strategy.description}
          </p>
        </div>
        <div className={`p-2 rounded-lg ${getRiskColor(strategy.riskLevel)}`}>
          <RiskIcon className="h-5 w-5" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Meta de Ganho:</span>
          <span className="text-sm font-medium text-success-600 dark:text-success-400">
            +{strategy.winTarget}%
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Limite de Perda:</span>
          <span className="text-sm font-medium text-error-600 dark:text-error-400">
            -{strategy.lossLimit}%
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Nível de Risco:</span>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getRiskColor(strategy.riskLevel)}`}>
            {getRiskLabel(strategy.riskLevel)}
          </span>
        </div>
      </div>

      {isSelected && (
        <div className="mt-4 p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
          <p className="text-xs text-primary-700 dark:text-primary-300">
            ✓ Estratégia selecionada para simulação
          </p>
        </div>
      )}
    </motion.div>
  );
};