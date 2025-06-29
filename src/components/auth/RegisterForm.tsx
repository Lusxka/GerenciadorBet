import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, TrendingUp, Lock, Mail, User, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAdminStore } from '../../store/adminStore';

interface RegisterFormProps {
  onToggleMode: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleMode }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { register } = useAuthStore();
  const { getSystemStatus } = useAdminStore();

  const systemStatus = getSystemStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Client-side validations
    if (!name.trim()) {
      setMessage({ type: 'error', text: 'Nome é obrigatório' });
      setLoading(false);
      return;
    }

    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Email é obrigatório' });
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({ type: 'error', text: 'Email inválido' });
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres' });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' });
      setLoading(false);
      return;
    }

    try {
      const result = await register(name, email, password);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        // Clear form
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro inesperado. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  // Check if registration is blocked
  const registrationBlocked = !systemStatus.allowRegistration;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <div className="flex items-center justify-center mb-4">
            <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 text-primary-600" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Criar Conta
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2">
            Comece a gerenciar suas apostas hoje
          </p>
        </div>

        {/* Registration Status Alert */}
        {registrationBlocked && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-error-600 dark:text-error-400 flex-shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-medium text-error-800 dark:text-error-200">
                  Registros Temporariamente Suspensos
                </p>
                <p className="text-xs text-error-700 dark:text-error-300 mt-1">
                  Novos cadastros não estão sendo aceitos no momento
                </p>
              </div>
            </div>
          </div>
        )}

        {!registrationBlocked && systemStatus.dailyRegistrationsUsed >= systemStatus.dailyRegistrationsLimit && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-warning-600 dark:text-warning-400 flex-shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-medium text-warning-800 dark:text-warning-200">
                  Limite Diário Atingido
                </p>
                <p className="text-xs text-warning-700 dark:text-warning-300 mt-1">
                  {systemStatus.dailyRegistrationsUsed} / {systemStatus.dailyRegistrationsLimit} registros hoje
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome Completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={registrationBlocked}
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base
                         placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Seu nome completo"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={registrationBlocked}
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base
                         placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="seu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={registrationBlocked}
                className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base
                         placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={registrationBlocked}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed p-1"
              >
                {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
              </button>
            </div>
            {password && (
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {password.length < 6 ? 'Mínimo 6 caracteres' : '✓ Senha válida'}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirmar Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={registrationBlocked}
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                         focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm sm:text-base
                         placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="••••••••"
                required
              />
            </div>
            {confirmPassword && (
              <div className="mt-2 text-xs">
                {password === confirmPassword ? (
                  <span className="text-success-600 dark:text-success-400">✓ Senhas coincidem</span>
                ) : (
                  <span className="text-error-600 dark:text-error-400">✗ Senhas não coincidem</span>
                )}
              </div>
            )}
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`p-3 rounded-lg border ${
                message.type === 'success'
                  ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800'
                  : 'bg-error-50 dark:bg-error-900/20 border-error-200 dark:border-error-800'
              }`}
            >
              <div className="flex items-center space-x-2">
                {message.type === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-success-600 dark:text-success-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-error-600 dark:text-error-400 flex-shrink-0" />
                )}
                <p className={`text-sm ${
                  message.type === 'success'
                    ? 'text-success-600 dark:text-success-400'
                    : 'text-error-600 dark:text-error-400'
                }`}>
                  {message.text}
                </p>
              </div>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading || !name || !email || password.length < 6 || password !== confirmPassword || registrationBlocked}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400
                     text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium text-sm sm:text-base
                     transition-colors duration-200 flex items-center justify-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
            ) : (
              'Criar Conta'
            )}
          </button>
        </form>

        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Já tem uma conta?{' '}
              <button
                onClick={onToggleMode}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Fazer login
              </button>
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};