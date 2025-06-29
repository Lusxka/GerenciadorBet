import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download, FileText, FileSpreadsheet, Calendar, BarChart3 } from 'lucide-react';
import { useBettingStore } from '../../store/bettingStore';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const { bets, withdrawals, categories, userSettings } = useBettingStore();
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'excel'>('pdf');
  const [loading, setLoading] = useState(false);

  const userBets = bets.filter(bet => bet.userId === user?.id);
  const userWithdrawals = withdrawals.filter(w => w.userId === user?.id);
  const userCategories = categories.filter(cat => cat.userId === user?.id);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const generatePDF = async () => {
    setLoading(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Header
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Relatório de Apostas', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 10;
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Usuário: ${user?.name}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 5;
      pdf.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 15;

      // Summary
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Resumo Financeiro', 20, yPosition);
      yPosition += 10;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const totalProfit = userBets.reduce((sum, bet) => sum + bet.profit, 0);
      const totalAmount = userBets.reduce((sum, bet) => sum + bet.amount, 0);
      const totalWithdrawals = userWithdrawals.reduce((sum, w) => sum + w.amount, 0);
      const winRate = userBets.length > 0 ? (userBets.filter(bet => bet.result === 'win').length / userBets.length) * 100 : 0;

      const summaryData = [
        `Saldo Inicial: ${formatCurrency(userSettings?.initialBalance || 0)}`,
        `Saldo Atual: ${formatCurrency(userSettings?.currentBalance || 0)}`,
        `Total Apostado: ${formatCurrency(totalAmount)}`,
        `Lucro/Prejuízo: ${formatCurrency(totalProfit)}`,
        `Total Saques: ${formatCurrency(totalWithdrawals)}`,
        `Taxa de Vitória: ${winRate.toFixed(1)}%`,
        `Total de Apostas: ${userBets.length}`,
      ];

      summaryData.forEach(line => {
        pdf.text(line, 20, yPosition);
        yPosition += 6;
      });

      yPosition += 10;

      // Betting History
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Histórico de Apostas', 20, yPosition);
      yPosition += 10;

      // Table headers
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      const headers = ['Data', 'Categoria', 'Valor', 'Resultado', 'Lucro/Prejuízo'];
      const colWidths = [25, 40, 25, 25, 30];
      let xPosition = 20;

      headers.forEach((header, index) => {
        pdf.text(header, xPosition, yPosition);
        xPosition += colWidths[index];
      });

      yPosition += 8;
      pdf.setFont('helvetica', 'normal');

      // Table data - Show all bets
      userBets.forEach(bet => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }

        const category = userCategories.find(cat => cat.id === bet.categoryId);
        xPosition = 20;

        const rowData = [
          format(new Date(bet.date), 'dd/MM/yyyy'),
          category?.name || 'N/A',
          formatCurrency(bet.amount),
          bet.result === 'win' ? 'Vitória' : 'Derrota',
          formatCurrency(bet.profit),
        ];

        rowData.forEach((data, index) => {
          pdf.text(data, xPosition, yPosition);
          xPosition += colWidths[index];
        });

        yPosition += 6;
      });

      // Add new page for charts if needed
      if (yPosition > pageHeight - 100) {
        pdf.addPage();
        yPosition = 20;
      }

      yPosition += 15;

      // Charts section
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Gráficos e Análises', 20, yPosition);
      yPosition += 10;

      // Category analysis
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Análise por Categoria:', 20, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      userCategories.forEach(category => {
        const categoryBets = userBets.filter(bet => bet.categoryId === category.id);
        if (categoryBets.length > 0) {
          const categoryProfit = categoryBets.reduce((sum, bet) => sum + bet.profit, 0);
          const categoryWinRate = (categoryBets.filter(bet => bet.result === 'win').length / categoryBets.length) * 100;
          
          pdf.text(`• ${category.name}: ${categoryBets.length} apostas, ${formatCurrency(categoryProfit)}, ${categoryWinRate.toFixed(1)}% vitórias`, 25, yPosition);
          yPosition += 5;
        }
      });

      // Save PDF
      pdf.save(`relatorio_apostas_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const generateExcel = () => {
    setLoading(true);
    try {
      // Create CSV data (Excel-compatible)
      const headers = [
        'Data',
        'Categoria',
        'Valor',
        'Resultado',
        'Período',
        'Multiplicador',
        'Lucro/Prejuízo',
        'Saldo Anterior',
        'Saldo Atual',
        'MG'
      ];

      const csvData = userBets.map(bet => {
        const category = userCategories.find(cat => cat.id === bet.categoryId);
        return [
          format(new Date(bet.date), 'dd/MM/yyyy', { locale: ptBR }),
          category?.name || 'N/A',
          formatCurrency(bet.amount),
          bet.result === 'win' ? 'Vitória' : 'Derrota',
          bet.period === 'morning' ? 'Manhã' : 
          bet.period === 'afternoon' ? 'Tarde' : 
          bet.period === 'night' ? 'Noite' : 'Madrugada',
          bet.multiplier.toFixed(2) + 'x',
          formatCurrency(bet.profit),
          formatCurrency(bet.previousBalance),
          formatCurrency(bet.currentBalance),
          bet.mg ? 'Sim' : 'Não'
        ];
      });

      // Add withdrawals
      const withdrawalHeaders = [
        'Data',
        'Tipo',
        'Descrição',
        'Valor',
        'Saldo Anterior',
        'Saldo Atual'
      ];

      const withdrawalData = userWithdrawals.map(w => [
        format(new Date(w.date), 'dd/MM/yyyy', { locale: ptBR }),
        'Saque',
        w.description,
        formatCurrency(w.amount),
        formatCurrency(w.previousBalance),
        formatCurrency(w.currentBalance)
      ]);

      // Create summary data
      const totalProfit = userBets.reduce((sum, bet) => sum + bet.profit, 0);
      const totalAmount = userBets.reduce((sum, bet) => sum + bet.amount, 0);
      const totalWithdrawals = userWithdrawals.reduce((sum, w) => sum + w.amount, 0);
      const winRate = userBets.length > 0 ? (userBets.filter(bet => bet.result === 'win').length / userBets.length) * 100 : 0;

      const summaryData = [
        ['RESUMO FINANCEIRO', ''],
        ['Usuário', user?.name || ''],
        ['Data do Relatório', format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })],
        ['', ''],
        ['Saldo Inicial', formatCurrency(userSettings?.initialBalance || 0)],
        ['Saldo Atual', formatCurrency(userSettings?.currentBalance || 0)],
        ['Total Apostado', formatCurrency(totalAmount)],
        ['Lucro/Prejuízo', formatCurrency(totalProfit)],
        ['Total Saques', formatCurrency(totalWithdrawals)],
        ['Taxa de Vitória', winRate.toFixed(1) + '%'],
        ['Total de Apostas', userBets.length.toString()],
        ['', ''],
        ['ANÁLISE POR CATEGORIA', ''],
      ];

      // Add category analysis
      userCategories.forEach(category => {
        const categoryBets = userBets.filter(bet => bet.categoryId === category.id);
        if (categoryBets.length > 0) {
          const categoryProfit = categoryBets.reduce((sum, bet) => sum + bet.profit, 0);
          const categoryWinRate = (categoryBets.filter(bet => bet.result === 'win').length / categoryBets.length) * 100;
          
          summaryData.push([
            category.name,
            `${categoryBets.length} apostas, ${formatCurrency(categoryProfit)}, ${categoryWinRate.toFixed(1)}% vitórias`
          ]);
        }
      });

      summaryData.push(['', '']);
      summaryData.push(['HISTÓRICO DE APOSTAS', '']);
      summaryData.push(headers);
      summaryData.push(...csvData);
      summaryData.push(['', '']);
      summaryData.push(['HISTÓRICO DE SAQUES', '']);
      summaryData.push(withdrawalHeaders);
      summaryData.push(...withdrawalData);

      // Convert to CSV
      const csvContent = summaryData
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      // Download
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio_apostas_${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erro ao gerar Excel:', error);
      alert('Erro ao gerar arquivo Excel. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (selectedFormat === 'pdf') {
      generatePDF();
    } else {
      generateExcel();
    }
    onClose();
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
            Exportar Dados
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Escolha o formato de exportação:
            </h3>
            <div className="space-y-3">
              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                selectedFormat === 'pdf'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  value="pdf"
                  checked={selectedFormat === 'pdf'}
                  onChange={(e) => setSelectedFormat(e.target.value as 'pdf')}
                  className="sr-only"
                />
                <FileText className="h-6 w-6 text-red-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">PDF</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Relatório formatado com resumo, histórico e análises
                  </div>
                </div>
              </label>

              <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                selectedFormat === 'excel'
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }`}>
                <input
                  type="radio"
                  value="excel"
                  checked={selectedFormat === 'excel'}
                  onChange={(e) => setSelectedFormat(e.target.value as 'excel')}
                  className="sr-only"
                />
                <FileSpreadsheet className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">Excel (CSV)</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Dados estruturados para análise detalhada
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
              O que será incluído:
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Histórico completo de apostas
              </li>
              <li className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Resumo de lucros e perdas
              </li>
              <li className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Histórico de saques
              </li>
              <li className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Análises por categoria
              </li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleExport}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  Exportar {selectedFormat.toUpperCase()}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};