import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Filter, 
  Download, 
  TrendingUp, 
  TrendingDown,
  Search,
  ChevronLeft,
  ChevronRight,
  Minus
} from 'lucide-react';
import { useBettingStore } from '../../store/bettingStore';
import { useAuthStore } from '../../store/authStore';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const BetsList: React.FC = () => {
  const { user } = useAuthStore();
  const { bets, withdrawals, categories } = useBettingStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterResult, setFilterResult] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, bets, withdrawals
  const itemsPerPage = 10;

  const userBets = bets.filter(bet => bet.userId === user?.id);
  const userWithdrawals = withdrawals.filter(w => w.userId === user?.id);
  const userCategories = categories.filter(cat => cat.userId === user?.id);

  // Combine bets and withdrawals into a single list
  const allTransactions = [
    ...userBets.map(bet => ({
      ...bet,
      type: 'bet' as const,
      date: new Date(bet.date),
    })),
    ...userWithdrawals.map(w => ({
      ...w,
      type: 'withdrawal' as const,
      date: new Date(w.date),
      result: 'withdrawal' as const,
      profit: -w.amount,
    })),
  ];

  const filteredTransactions = allTransactions.filter(transaction => {
    // Type filter
    if (filterType === 'bets' && transaction.type !== 'bet') return false;
    if (filterType === 'withdrawals' && transaction.type !== 'withdrawal') return false;
    
    if (transaction.type === 'bet') {
      const category = userCategories.find(cat => cat.id === transaction.categoryId);
      const matchesSearch = category?.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !filterCategory || transaction.categoryId === filterCategory;
      const matchesResult = !filterResult || transaction.result === filterResult;
      const matchesPeriod = !filterPeriod || transaction.period === filterPeriod;
      
      return matchesSearch && matchesCategory && matchesResult && matchesPeriod;
    } else {
      // Withdrawal
      const matchesSearch = transaction.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    }
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(startIndex, startIndex + itemsPerPage);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getCategoryInfo = (categoryId: string) => {
    return userCategories.find(cat => cat.id === categoryId);
  };

  const getPeriodLabel = (period: string) => {
    const periods = {
      morning: 'Manhã',
      afternoon: 'Tarde',
      night: 'Noite',
      'late-night': 'Madrugada',
    };
    return periods[period as keyof typeof periods] || period;
  };

  const exportToCSV = () => {
    const headers = [
      'Data',
      'Tipo',
      'Categoria/Descrição',
      'Valor',
      'Resultado',
      'Período',
      'Multiplicador',
      'Lucro/Prejuízo',
      'Saldo Anterior',
      'Saldo Atual',
      'MG'
    ];

    const csvData = filteredTransactions.map(transaction => {
      if (transaction.type === 'bet') {
        const category = getCategoryInfo(transaction.categoryId);
        return [
          format(transaction.date, 'dd/MM/yyyy', { locale: ptBR }),
          'Aposta',
          category?.name || 'N/A',
          formatCurrency(transaction.amount),
          transaction.result === 'win' ? 'Vitória' : 'Derrota',
          getPeriodLabel(transaction.period),
          transaction.multiplier.toFixed(2) + 'x',
          formatCurrency(transaction.profit),
          formatCurrency(transaction.previousBalance),
          formatCurrency(transaction.currentBalance),
          transaction.mg ? 'Sim' : 'Não'
        ];
      } else {
        return [
          format(transaction.date, 'dd/MM/yyyy', { locale: ptBR }),
          'Saque',
          transaction.description,
          formatCurrency(transaction.amount),
          'Saque',
          '-',
          '-',
          formatCurrency(-transaction.amount),
          formatCurrency(transaction.previousBalance),
          formatCurrency(transaction.currentBalance),
          '-'
        ];
      }
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transacoes_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
        <div className="flex flex-col space-y-4">
          {/* Type Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('bets')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filterType === 'bets'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Apostas
            </button>
            <button
              onClick={() => setFilterType('withdrawals')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filterType === 'withdrawals'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Saques
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={filterType === 'withdrawals' ? "Buscar descrição..." : "Buscar categoria..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                           focus:ring-2 focus:ring-primary-500 focus:border-transparent
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>

              {filterType !== 'withdrawals' && (
                <>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             focus:ring-2 focus:ring-primary-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="">Todas as categorias</option>
                    {userCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filterResult}
                    onChange={(e) => setFilterResult(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             focus:ring-2 focus:ring-primary-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="">Todos os resultados</option>
                    <option value="win">Vitórias</option>
                    <option value="loss">Derrotas</option>
                  </select>

                  <select
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                             focus:ring-2 focus:ring-primary-500 focus:border-transparent
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="">Todos os períodos</option>
                    <option value="morning">Manhã</option>
                    <option value="afternoon">Tarde</option>
                    <option value="night">Noite</option>
                    <option value="late-night">Madrugada</option>
                  </select>
                </>
              )}
            </div>

            <button
              onClick={exportToCSV}
              className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Categoria/Descrição
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Resultado
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Lucro/Prejuízo
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  MG
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedTransactions.map((transaction, index) => {
                if (transaction.type === 'bet') {
                  const category = getCategoryInfo(transaction.categoryId);
                  return (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {format(transaction.date, 'dd/MM/yyyy', { locale: ptBR })}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          Aposta
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          {category && (
                            <div
                              className="w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-xs md:text-sm flex-shrink-0"
                              style={{ 
                                backgroundColor: category.color + '20', 
                                color: category.color 
                              }}
                            >
                              {category.icon}
                            </div>
                          )}
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {category?.name || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {transaction.result === 'win' ? (
                            <TrendingUp className="h-4 w-4 text-success-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-error-500" />
                          )}
                          <span className={`text-sm font-medium ${
                            transaction.result === 'win' 
                              ? 'text-success-600 dark:text-success-400' 
                              : 'text-error-600 dark:text-error-400'
                          }`}>
                            {transaction.result === 'win' ? 'Vitória' : 'Derrota'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm font-medium ${
                          transaction.profit >= 0 
                            ? 'text-success-600 dark:text-success-400' 
                            : 'text-error-600 dark:text-error-400'
                        }`}>
                          {transaction.profit >= 0 ? '+' : ''}{formatCurrency(transaction.profit)}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        {transaction.mg && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-warning-100 text-warning-800 dark:bg-warning-900/20 dark:text-warning-400">
                            MG
                          </span>
                        )}
                      </td>
                    </motion.tr>
                  );
                } else {
                  // Withdrawal
                  return (
                    <motion.tr
                      key={transaction.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {format(transaction.date, 'dd/MM/yyyy', { locale: ptBR })}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                          Saque
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-xs md:text-sm bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex-shrink-0">
                            <Minus className="h-3 w-3 md:h-4 md:w-4" />
                          </div>
                          <span className="text-sm text-gray-900 dark:text-white truncate">
                            {transaction.description}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Minus className="h-4 w-4 text-error-500" />
                          <span className="text-sm font-medium text-error-600 dark:text-error-400">
                            Saque
                          </span>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-error-600 dark:text-error-400">
                          -{formatCurrency(transaction.amount)}
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        -
                      </td>
                    </motion.tr>
                  );
                }
              })}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Nenhuma transação encontrada
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 md:px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} de {filteredTransactions.length} resultados
              </div>
              <div className="flex items-center justify-center sm:justify-end space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
                  {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};