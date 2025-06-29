import React, { useState } from 'react';
import { Bell, Moon, Sun, User, LogOut, Settings, X } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useBettingStore } from '../../store/bettingStore';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { userSettings, updateSettings, notifications, markNotificationAsRead, clearNotifications } = useBettingStore();
  const [showNotifications, setShowNotifications] = useState(false);

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

  const unreadNotifications = notifications.filter(n => !n.read);

  const handleNotificationClick = (notificationId: string) => {
    markNotificationAsRead(notificationId);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'stop-win':
        return '🎉';
      case 'stop-loss':
        return '⚠️';
      case 'goal-achieved':
      case 'daily-goal-achieved':
        return '🎯';
      default:
        return '📢';
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center space-x-4">
          <h1 className="text-base md:text-lg lg:text-xl font-semibold text-gray-900 dark:text-white truncate">
            Gestão de Apostas
          </h1>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          {userSettings && (
            <div className="hidden sm:flex items-center space-x-2 md:space-x-4 text-xs md:text-sm">
              <div className="text-gray-600 dark:text-gray-400">
                Saldo:
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
            className="p-1.5 md:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {userSettings?.theme === 'dark' ? (
              <Sun className="h-4 w-4 md:h-5 md:w-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Moon className="h-4 w-4 md:h-5 md:w-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 md:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
            >
              <Bell className="h-4 w-4 md:h-5 md:w-5 text-gray-600 dark:text-gray-400" />
              {unreadNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 h-2 w-2 md:h-3 md:w-3 bg-error-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold hidden md:block">
                    {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
                  </span>
                </span>
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                >
                  <div className="p-3 md:p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        Notificações
                      </h3>
                      <div className="flex items-center space-x-2">
                        {notifications.length > 0 && (
                          <button
                            onClick={clearNotifications}
                            className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            Limpar
                          </button>
                        )}
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          <X className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="max-h-64 md:max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                        Nenhuma notificação
                      </div>
                    ) : (
                      notifications.slice(0, 10).map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification.id)}
                          className={`p-3 md:p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                            !notification.read ? 'bg-primary-50 dark:bg-primary-900/20' : ''
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <span className="text-base md:text-lg flex-shrink-0">
                              {getNotificationIcon(notification.type)}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs md:text-sm font-medium text-gray-900 dark:text-white">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                {format(new Date(notification.timestamp), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0 mt-1"></div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center space-x-1 md:space-x-2">
            <div className="hidden lg:block text-right">
              <div className="text-xs md:text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                {user?.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user?.role === 'admin' ? 'Admin' : 'Cliente'}
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <button className="p-1.5 md:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <User className="h-4 w-4 md:h-5 md:w-5 text-gray-600 dark:text-gray-400" />
              </button>
              
              <button
                onClick={logout}
                className="p-1.5 md:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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