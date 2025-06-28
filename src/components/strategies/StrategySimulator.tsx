import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, AlertTriangle, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Strategy {
  id: string;
  name: string;
  winTarget: number;
  lossLimit: number;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'very-high';
}

interface StrategySimulatorProps {
  strategy: Strategy;
  initialValue: number;
}

export const StrategySimulator: React.FC<StrategySimulatorProps> = ({ strategy, initialValue }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | '6months' | 'year'>('month');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const simulation = useMemo(() => {
    const periods = {
      week: 7,
      month: 30,
      '6months': 180,
      year: 365,
    };

    const days = periods[selectedPeriod];
    
    // Strategy-based daily growth rates (more realistic)
    const dailyGrowthRates = {
      low: 0.008,      // Conservative: 0.8% daily average
      medium: 0.012,   // Balanced: 1.2% daily average  
      high: 0.018,     // Aggressive: 1.8% daily average
      'very-high': 0.025 // Extreme: 2.5% daily average
    };
    
    // Win rates based on strategy risk level
    const winRates = {
      low: 0.70,      // Conservative: 70% win rate
      medium: 0.60,   // Balanced: 60% win rate  
      high: 0.55,     // Aggressive: 55% win rate
      'very-high': 0.50 // Extreme: 50% win rate
    };
    
    const dailyGrowthRate = dailyGrowthRates[strategy.riskLevel];
    const winRate = winRates[strategy.riskLevel];
    const data = [];
    
    let currentBalance = initialValue;
    let totalWins = 0;
    let totalLosses = 0;
    let maxBalance = initialValue;
    let minBalance = initialValue;
    let consecutiveLosses = 0;
    let maxConsecutiveLosses = 0;

    for (let day = 0; day <= days; day++) {
      if (day === 0) {
        data.push({
          day,
          balance: currentBalance,
          profit: 0,
          cumulative: 0,
        });
        continue;
      }

      // Calculate daily bet amount (1-2% of current balance)
      const betPercentage = 0.01 + Math.random() * 0.01; // 1-2%
      const dailyBetAmount = currentBalance * betPercentage;
      
      // Determine if it's a win or loss based on strategy win rate
      const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 to 1.1 multiplier for variance
      const adjustedWinRate = winRate * randomFactor;
      const isWin = Math.random() < adjustedWinRate;
      
      let dailyChange = 0;
      
      if (isWin) {
        // Win: apply strategy's win target percentage
        const winMultiplier = 1 + (strategy.winTarget / 100) * (0.8 + Math.random() * 0.4); // 80-120% of target
        dailyChange = dailyBetAmount * (winMultiplier - 1);
        totalWins++;
        consecutiveLosses = 0;
      } else {
        // Loss: apply strategy's loss limit percentage
        const lossMultiplier = (strategy.lossLimit / 100) * (0.6 + Math.random() * 0.8); // 60-140% of limit
        dailyChange = -dailyBetAmount * lossMultiplier;
        totalLosses++;
        consecutiveLosses++;
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, consecutiveLosses);
      }

      // Apply compound growth based on strategy
      const compoundGrowth = currentBalance * dailyGrowthRate * (isWin ? 1 : -0.5);
      dailyChange += compoundGrowth;

      currentBalance += dailyChange;
      
      // Prevent balance from going negative
      if (currentBalance < 0) {
        currentBalance = 0;
        dailyChange = -currentBalance;
      }

      maxBalance = Math.max(maxBalance, currentBalance);
      minBalance = Math.min(minBalance, currentBalance);

      data.push({
        day,
        balance: currentBalance,
        profit: dailyChange,
        cumulative: currentBalance - initialValue,
      });

      // Stop simulation if balance reaches zero
      if (currentBalance <= 0) break;
    }

    const finalProfit = currentBalance - initialValue;
    const roi = initialValue > 0 ? ((currentBalance - initialValue) / initialValue) * 100 : 0;
    const winRateActual = totalWins + totalLosses > 0 ? (totalWins / (totalWins + totalLosses)) * 100 : 0;
    const maxDrawdown = maxBalance > 0 ? ((maxBalance - minBalance) / maxBalance) * 100 : 0;

    return {
      data,
      stats: {
        finalBalance: currentBalance,
        finalProfit,
        roi,
        winRate: winRateActual,
        totalTrades: totalWins + totalLosses,
        maxBalance,
        minBalance,
        maxDrawdown,
        maxConsecutiveLosses,
      },
    };
  }, [strategy, initialValue, selectedPeriod]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Dia {label}
          </p>
          <p className="text-sm text-primary-600 dark:text-primary-400">
            Saldo: {formatCurrency(payload[0].value)}
          </p>
          {payload[0].payload.profit !== 0 && (
            <p className={`text-sm ${
              payload[0].payload.profit >= 0 
                ? 'text-success-600 dark:text-success-400' 
                : 'text-error-600 dark:text-error-400'
            }`}>
              {payload[0].payload.profit >= 0 ? '+' : ''}{formatCurrency(payload[0].payload.profit)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const periods = [
    { value: 'week', label: '1 Semana' },
    { value: 'month', label: '1 Mês' },
    { value: '6months', label: '6 Meses' },
    { value: 'year', label: '1 Ano' },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
          Simulação: {strategy.name}
        </h3>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   focus:ring-2 focus:ring-primary-500 focus:border-transparent
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          {periods.map((period) => (
            <option key={period.value} value={period.value}>
              {period.label}
            </option>
          ))}
        </select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-primary-600" />
            <span className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
              Saldo Final
            </span>
          </div>
          <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
            {formatCurrency(simulation.stats.finalBalance)}
          </p>
          <p className={`text-xs md:text-sm ${
            simulation.stats.finalProfit >= 0 
              ? 'text-success-600 dark:text-success-400' 
              : 'text-error-600 dark:text-error-400'
          }`}>
            {simulation.stats.finalProfit >= 0 ? '+' : ''}{formatCurrency(simulation.stats.finalProfit)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-secondary-600" />
            <span className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
              ROI
            </span>
          </div>
          <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
            {simulation.stats.roi.toFixed(1)}%
          </p>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
            Retorno sobre investimento
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Calculator className="h-4 w-4 md:h-5 md:w-5 text-accent-600" />
            <span className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
              Taxa de Vitória
            </span>
          </div>
          <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
            {simulation.stats.winRate.toFixed(1)}%
          </p>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
            {simulation.stats.totalTrades} operações
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-warning-600" />
            <span className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400">
              Max Drawdown
            </span>
          </div>
          <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
            {simulation.stats.maxDrawdown.toFixed(1)}%
          </p>
          <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
            Maior queda
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 md:p-6">
        <h4 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-4">
          Evolução do Saldo
        </h4>
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={simulation.data}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="day" 
                className="text-xs"
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                className="text-xs"
                tick={{ fontSize: 10 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Analysis */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 md:p-6">
        <h4 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white mb-4">
          Análise de Risco
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Cenários Possíveis
            </h5>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Melhor caso:</span>
                <span className="text-xs md:text-sm font-medium text-success-600 dark:text-success-400">
                  {formatCurrency(simulation.stats.maxBalance)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Pior caso:</span>
                <span className="text-xs md:text-sm font-medium text-error-600 dark:text-error-400">
                  {formatCurrency(simulation.stats.minBalance)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Cenário atual:</span>
                <span className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(simulation.stats.finalBalance)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Perdas consecutivas:</span>
                <span className="text-xs md:text-sm font-medium text-warning-600 dark:text-warning-400">
                  {simulation.stats.maxConsecutiveLosses} dias
                </span>
              </div>
            </div>
          </div>

          <div>
            <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Recomendações
            </h5>
            <div className="space-y-2 text-xs md:text-sm text-gray-600 dark:text-gray-400">
              {strategy.riskLevel === 'low' && (
                <p>✓ Estratégia conservadora, ideal para iniciantes</p>
              )}
              {strategy.riskLevel === 'medium' && (
                <p>⚠️ Risco moderado, monitore o drawdown</p>
              )}
              {strategy.riskLevel === 'high' && (
                <p>⚠️ Alto risco, use apenas com capital que pode perder</p>
              )}
              {strategy.riskLevel === 'very-high' && (
                <p>🚨 Risco extremo, não recomendado para a maioria</p>
              )}
              <p>• Mantenha disciplina nos limites de stop</p>
              <p>• Diversifique suas estratégias</p>
              <p>• Nunca aposte mais do que pode perder</p>
              <p>• Prepare-se para sequências de perdas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};