import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Target, 
  BarChart3, 
  Settings, 
  Users,
  Menu,
  X,
  Gamepad2,
  Calendar,
  Calculator
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuthStore();

  const clientMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Gamepad2, label: 'Apostas', path: '/bets' },
    { icon: BarChart3, label: 'Analytics', path: '/analytics' },
    { icon: Target, label: 'Metas', path: '/goals' },
    { icon: Calendar, label: 'Progresso', path: '/progress' },
    { icon: Calculator, label: 'Estratégias', path: '/strategies' },
    { icon: Settings, label: 'Configurações', path: '/settings' },
  ];

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard Admin', path: '/admin/dashboard' },
    { icon: Users, label: 'Usuários', path: '/admin/users' },
    { icon: BarChart3, label: 'Relatórios', path: '/admin/reports' },
    { icon: Settings, label: 'Configurações', path: '/admin/settings' },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : clientMenuItems;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg"
      >
        {isCollapsed ? (
          <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        ) : (
          <X className="h-6 w-6 text-gray-600 dark:text-gray-400" />
        )}
      </button>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-50 h-full
        ${isCollapsed ? '-translate-x-full md:translate-x-0 md:w-20' : 'translate-x-0 w-64'}
        transition-all duration-300 ease-in-out
        bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700 px-4">
            <div className={`flex items-center space-x-2 ${isCollapsed ? 'md:hidden' : ''}`}>
              <TrendingUp className="h-8 w-8 text-primary-600 flex-shrink-0" />
              <span className="text-xl font-bold text-gray-900 dark:text-white truncate">
                BetFinance
              </span>
            </div>
            {isCollapsed && (
              <TrendingUp className="hidden md:block h-8 w-8 text-primary-600" />
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-3 py-3 rounded-lg transition-colors group ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`
                }
                onClick={() => setIsCollapsed(true)}
              >
                <item.icon className={`h-6 w-6 flex-shrink-0 ${
                  isCollapsed ? 'md:mx-auto' : 'mr-3'
                }`} />
                <span className={`${
                  isCollapsed ? 'md:hidden' : ''
                } font-medium text-sm truncate`}>
                  {item.label}
                </span>
              </NavLink>
            ))}
          </nav>

          {/* User info */}
          <div className={`px-4 py-4 border-t border-gray-200 dark:border-gray-700 ${
            isCollapsed ? 'md:hidden' : ''
          }`}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                  {user?.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role === 'admin' ? 'Administrador' : 'Cliente'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};