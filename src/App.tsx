import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useBettingStore } from './store/bettingStore';
import { AuthPage } from './pages/AuthPage';
import { Layout } from './components/common/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { BetsPage } from './pages/BetsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { GoalsPage } from './pages/GoalsPage';
import { ProgressPage } from './pages/ProgressPage';
import { StrategiesPage } from './pages/StrategiesPage';
import { SettingsPage } from './pages/SettingsPage';

// Placeholder components for admin pages
const AdminDashboardPage = () => <div className="p-8 text-center">Dashboard Admin em desenvolvimento</div>;
const AdminUsersPage = () => <div className="p-8 text-center">Gerenciamento de Usuários em desenvolvimento</div>;
const AdminReportsPage = () => <div className="p-8 text-center">Relatórios Admin em desenvolvimento</div>;
const AdminSettingsPage = () => <div className="p-8 text-center">Configurações Admin em desenvolvimento</div>;

function App() {
  const { isAuthenticated, user } = useAuthStore();
  const { userSettings } = useBettingStore();

  useEffect(() => {
    // Apply theme on app load
    const theme = userSettings?.theme || 'light';
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [userSettings?.theme]);

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          {/* Client Routes */}
          {user?.role === 'client' && (
            <>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/bets" element={<BetsPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/strategies" element={<StrategiesPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </>
          )}
          
          {/* Admin Routes */}
          {user?.role === 'admin' && (
            <>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/reports" element={<AdminReportsPage />} />
              <Route path="/admin/settings" element={<AdminSettingsPage />} />
            </>
          )}
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;