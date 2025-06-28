import React from 'react';
import { Bell, Moon, Sun, User, LogOut, Settings } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useBettingStore } from '../../store/bettingStore';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { userSettings, updateSettings } = useBettingStore();

  const toggleTheme = () => {
    const newTheme = userSettings?.theme === 'light' ? 'dark' : 'light';
    updateSettings({ theme: newTheme });
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
            Gestão Financeira
          </h1>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          {userSettings && (
            <div className="hidden sm:flex items-center space-x-3 md:space-x-4 text-sm">
              <div className="text-gray-600 dark:text-gray-400">
                Saldo Atual:
              </div>
              <div className={`font-semibold ${
                userSettings.currentBalance >= userSettings.initialBalance
                  ? 'text-success-600 dark:text-success-400'
                  : 'text-error-600 dark:text-error-400'
              }`}>
                {formatCurrency(userSettings.currentBalance)}
              </div>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {userSettings?.theme === 'dark' ? (
              <Sun className="h-4 w-4 md:h-5 md:w-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Moon className="h-4 w-4 md:h-5 md:w-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative">
            <Bell className="h-4 w-4 md:h-5 md:w-5 text-gray-600 dark:text-gray-400" />
            <span className="absolute -top-1 -right-1 h-2 w-2 md:h-3 md:w-3 bg-error-500 rounded-full"></span>
          </button>

          <div className="flex items-center space-x-2">
            <div className="hidden md:block text-right">
              <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                {user?.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user?.role === 'admin' ? 'Administrador' : 'Cliente'}
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <User className="h-4 w-4 md:h-5 md:w-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <button
                onClick={logout}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Sair"
              >
                <LogOut className="h-4 w-4 md:h-5 md:w-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};