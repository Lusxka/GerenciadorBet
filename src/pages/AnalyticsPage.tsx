import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Calendar,
  Filter,
  Download
} from 'lucide-react';
import { BalanceChart } from '../components/analytics/BalanceChart';
import { CategoryChart } from '../components/analytics/CategoryChart';
import { PeriodChart } from '../components/analytics/PeriodChart';
import { useBettingStore } from '../store/bettingStore';
import { useAuthStore } from '../store/authStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';

export const AnalyticsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { bets, withdrawals, categories } = useBettingStore();
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [exportLoading, setExportLoading] = useState(false);

  const userBets = bets.filter(bet => bet.userId === user?.id);
  const userWithdrawals = withdrawals.filter(w => w.userId === user?.id);
  const userCategories = categories.filter(cat => cat.userId === user?.id);

  // Filter bets and withdrawals by selected period
  const getFilteredData = () => {
    if (selectedPeriod === 'all') {
      return { filteredBets: userBets, filteredWithdrawals: userWithdrawals };
    }
    
    const now = new Date();
    let startDate: Date;
    
    switch (selectedPeriod) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return { filteredBets: userBets, filteredWithdrawals: userWithdrawals };
    }

    const filteredBets = userBets.filter(bet => new Date(bet.date) >= startDate);
    const filteredWithdrawals = userWithdrawals.filter(w => new Date(w.date) >= startDate);
    
    return { filteredBets, filteredWithdrawals };
  };

  const { filteredBets, filteredWithdrawals } = getFilteredData();

  const totalBets = filteredBets.length;
  const totalWins = filteredBets.filter(bet => bet.result === 'win').length;
  const totalLosses = filteredBets.filter(bet => bet.result === 'loss').length;
  const winRate = totalBets > 0 ? (totalWins / totalBets) * 100 : 0;
  const totalProfit = filteredBets.reduce((sum, bet) => sum + bet.profit, 0);
  const totalAmount = filteredBets.reduce((sum, bet) => sum + bet.amount, 0);
  const totalWithdrawals = filteredWithdrawals.reduce((sum, w) => sum + w.amount, 0);
  const roi = totalAmount > 0 ? (totalProfit / totalAmount) * 100 : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const exportAnalyticsToPDF = async () => {
    setExportLoading(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Relatório de Analytics', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Usuário: ${user?.name}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 5;
      const periodLabel = selectedPeriod === 'all' ? 'Todos os dados' : 
                         selectedPeriod === 'today' ? 'Hoje' : 
                         selectedPeriod === 'week' ? 'Últimos 7 dias' : 
                         'Últimos 30 dias';
      pdf.text(`Período: ${periodLabel}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 5;
      pdf.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 20;

      // Performance Summary
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Resumo de Performance', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const performanceData = [
        `Total de Apostas: ${totalBets}`,
        `Vitórias: ${totalWins} | Derrotas: ${totalLosses}`,
        `Taxa de Vitória: ${winRate.toFixed(1)}%`,
        `Total Apostado: ${formatCurrency(totalAmount)}`,
        `Lucro/Prejuízo Total: ${formatCurrency(totalProfit)}`,
        `ROI (Retorno sobre Investimento): ${roi.toFixed(1)}%`,
        `Total de Saques: ${formatCurrency(totalWithdrawals)}`,
      ];

      performanceData.forEach(line => {
        pdf.text(line, 20, yPosition);
        yPosition += 6;
      });

      yPosition += 15;

      // Category Analysis
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Análise por Categoria', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');

      if (userCategories.length === 0) {
        pdf.text('Nenhuma categoria criada', 20, yPosition);
        yPosition += 10;
      } else {
        userCategories.forEach(category => {
          const categoryBets = filteredBets.filter(bet => bet.categoryId === category.id);
          if (categoryBets.length > 0) {
            const categoryProfit = categoryBets.reduce((sum, bet) => sum + bet.profit, 0);
            const categoryAmount = categoryBets.reduce((sum, bet) => sum + bet.amount, 0);
            const categoryWins = categoryBets.filter(bet => bet.result === 'win').length;
            const categoryWinRate = (categoryWins / categoryBets.length) * 100;
            const categoryROI = categoryAmount > 0 ? (categoryProfit / categoryAmount) * 100 : 0;
            
            if (yPosition > pageHeight - 40) {
              pdf.addPage();
              yPosition = 20;
            }
            
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${category.icon} ${category.name}:`, 20, yPosition);
            yPosition += 6;
            
            pdf.setFont('helvetica', 'normal');
            pdf.text(`  • Apostas: ${categoryBets.length}`, 25, yPosition);
            yPosition += 5;
            pdf.text(`  • Valor apostado: ${formatCurrency(categoryAmount)}`, 25, yPosition);
            yPosition += 5;
            pdf.text(`  • Lucro/Prejuízo: ${formatCurrency(categoryProfit)}`, 25, yPosition);
            yPosition += 5;
            pdf.text(`  • Taxa de vitória: ${categoryWinRate.toFixed(1)}%`, 25, yPosition);
            yPosition += 5;
            pdf.text(`  • ROI: ${categoryROI.toFixed(1)}%`, 25, yPosition);
            yPosition += 10;
          }
        });
      }

      // Period Analysis
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = 20;
      }

      yPosition += 10;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Análise por Período do Dia', 20, yPosition);
      yPosition += 10;

      const periods = [
        { key: 'morning', label: 'Manhã', icon: '🌅' },
        { key: 'afternoon', label: 'Tarde', icon: '☀️' },
        { key: 'night', label: 'Noite', icon: '🌙' },
        { key: 'late-night', label: 'Madrugada', icon: '🌃' },
      ];

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');

      let hasAnyPeriodData = false;
      periods.forEach(period => {
        const periodBets = filteredBets.filter(bet => bet.period === period.key);
        if (periodBets.length > 0) {
          hasAnyPeriodData = true;
          const periodProfit = periodBets.reduce((sum, bet) => sum + bet.profit, 0);
          const periodWins = periodBets.filter(bet => bet.result === 'win').length;
          const periodWinRate = (periodWins / periodBets.length) * 100;
          
          pdf.setFont('helvetica', 'bold');
          pdf.text(`${period.icon} ${period.label}:`, 20, yPosition);
          yPosition += 6;
          
          pdf.setFont('helvetica', 'normal');
          pdf.text(`  • Apostas: ${periodBets.length}`, 25, yPosition);
          yPosition += 5;
          pdf.text(`  • Lucro/Prejuízo: ${formatCurrency(periodProfit)}`, 25, yPosition);
          yPosition += 5;
          pdf.text(`  • Taxa de vitória: ${periodWinRate.toFixed(1)}%`, 25, yPosition);
          yPosition += 10;
        }
      });

      if (!hasAnyPeriodData) {
        pdf.text('Nenhum dado de período disponível', 20, yPosition);
        yPosition += 10;
      }

      // Insights Section
      if (yPosition > pageHeight - 60) {
        pdf.addPage();
        yPosition = 20;
      }

      yPosition += 10;
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Insights e Análises', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');

      // Best performing category
      let bestCategory = '';
      let bestCategoryProfit = -Infinity;
      userCategories.forEach(category => {
        const categoryBets = filteredBets.filter(bet => bet.categoryId === category.id);
        const profit = categoryBets.reduce((sum, bet) => sum + bet.profit, 0);
        if (profit > bestCategoryProfit && categoryBets.length > 0) {
          bestCategoryProfit = profit;
          bestCategory = category.name;
        }
      });

      // Best performing period
      let bestPeriod = '';
      let bestPeriodWinRate = 0;
      periods.forEach(period => {
        const periodBets = filteredBets.filter(bet => bet.period === period.key);
        if (periodBets.length > 0) {
          const winRate = (periodBets.filter(bet => bet.result === 'win').length / periodBets.length) * 100;
          if (winRate > bestPeriodWinRate) {
            bestPeriodWinRate = winRate;
            bestPeriod = period.label;
          }
        }
      });

      const insights = [
        `• Categoria mais lucrativa: ${bestCategory || 'N/A'} (${formatCurrency(bestCategoryProfit)})`,
        `• Melhor período: ${bestPeriod || 'N/A'} (${bestPeriodWinRate.toFixed(1)}% de vitórias)`,
        `• Média de lucro por aposta: ${totalBets > 0 ? formatCurrency(totalProfit / totalBets) : 'R$ 0,00'}`,
        `• Valor médio por aposta: ${totalBets > 0 ? formatCurrency(totalAmount / totalBets) : 'R$ 0,00'}`,
      ];

      insights.forEach(insight => {
        pdf.text(insight, 20, yPosition);
        yPosition += 6;
      });

      // Save PDF
      pdf.save(`analytics_${selectedPeriod}_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setExportLoading(false);
    }
  };

  const stats = [
    {
      title: 'Total de Apostas',
      value: totalBets.toString(),
      change: `${totalWins}W / ${totalLosses}L`,
      changeType: 'neutral' as const,
      icon: BarChart3,
      color: 'primary'
    },
    {
      title: 'Taxa de Vitória',
      value: `${winRate.toFixed(1)}%`,
      change: winRate >= 50 ? 'Acima da média' : 'Abaixo da média',
      changeType: winRate >= 50 ? 'positive' : 'negative',
      icon: TrendingUp,
      color: 'secondary'
    },
    {
      title: 'Lucro Total',
      value: formatCurrency(totalProfit),
      change: `ROI: ${roi.toFixed(1)}%`,
      changeType: totalProfit >= 0 ? 'positive' : 'negative',
      icon: PieChart,
      color: totalProfit >= 0 ? 'success' : 'error'
    },
    {
      title: 'Total Saques',
      value: formatCurrency(totalWithdrawals),
      change: `${filteredWithdrawals.length} saques`,
      changeType: 'neutral' as const,
      icon: Calendar,
      color: 'accent'
    },
  ];

  const periods = [
    { value: 'all', label: 'Todos' },
    { value: 'today', label: 'Hoje' },
    { value: 'week', label: '7 dias' },
    { value: 'month', label: '30 dias' },
  ];

  return (
    <div className="space-y-6 px-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Análise detalhada do seu desempenho
          </p>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                     focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            {periods.map((period) => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
          <button 
            onClick={exportAnalyticsToPDF}
            disabled={exportLoading}
            className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors text-sm"
          >
            {exportLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Exportar Analytics
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Evolução do Saldo
          </h3>
          <BalanceChart filteredBets={filteredBets} filteredWithdrawals={filteredWithdrawals} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Distribuição por Categoria
          </h3>
          <CategoryChart />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Performance por Período
        </h3>
        <PeriodChart />
      </motion.div>

      {/* Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <h4 className="text-sm font-medium text-primary-900 dark:text-primary-100 mb-2">
              Melhor Período
            </h4>
            <p className="text-sm text-primary-700 dark:text-primary-300">
              {(() => {
                const periods = ['morning', 'afternoon', 'night', 'late-night'];
                const periodLabels = ['Manhã', 'Tarde', 'Noite', 'Madrugada'];
                let bestPeriod = '';
                let bestWinRate = 0;
                
                periods.forEach((period, index) => {
                  const periodBets = filteredBets.filter(bet => bet.period === period);
                  if (periodBets.length > 0) {
                    const winRate = (periodBets.filter(bet => bet.result === 'win').length / periodBets.length) * 100;
                    if (winRate > bestWinRate) {
                      bestWinRate = winRate;
                      bestPeriod = periodLabels[index];
                    }
                  }
                });
                
                return bestPeriod ? `${bestPeriod} (${bestWinRate.toFixed(1)}%)` : 'N/A';
              })()}
            </p>
          </div>

          <div className="p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
            <h4 className="text-sm font-medium text-success-900 dark:text-success-100 mb-2">
              Categoria Mais Lucrativa
            </h4>
            <p className="text-sm text-success-700 dark:text-success-300">
              {(() => {
                let bestCategory = '';
                let bestProfit = -Infinity;
                
                userCategories.forEach(category => {
                  const categoryBets = filteredBets.filter(bet => bet.categoryId === category.id);
                  const profit = categoryBets.reduce((sum, bet) => sum + bet.profit, 0);
                  if (profit > bestProfit && categoryBets.length > 0) {
                    bestProfit = profit;
                    bestCategory = category.name;
                  }
                });
                
                return bestCategory ? `${bestCategory} (${formatCurrency(bestProfit)})` : 'N/A';
              })()}
            </p>
          </div>

          <div className="p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
            <h4 className="text-sm font-medium text-warning-900 dark:text-warning-100 mb-2">
              Total Sacado
            </h4>
            <p className="text-sm text-warning-700 dark:text-warning-300">
              {formatCurrency(totalWithdrawals)} em {filteredWithdrawals.length} saques
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};