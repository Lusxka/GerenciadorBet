import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Shield, 
  Database,
  Bell,
  Globe,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [settings, setSettings] = useState({
    systemName: 'BetFinance',
    maintenanceMode: false,
    allowRegistration: true,
    maxUsersPerDay: 100,
    defaultStopLoss: 300,
    defaultStopWin: 500,
    defaultInitialBalance: 1000,
    emailNotifications: true,
    systemNotifications: true,
    dataRetentionDays: 365,
    backupFrequency: 'daily',
    logLevel: 'info',
  });

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
      setSettings({
        systemName: 'BetFinance',
        maintenanceMode: false,
        allowRegistration: true,
        maxUsersPerDay: 100,
        defaultStopLoss: 300,
        defaultStopWin: 500,
        defaultInitialBalance: 1000,
        emailNotifications: true,
        systemNotifications: true,
        dataRetentionDays: 365,
        backupFrequency: 'daily',
        logLevel: 'info',
      });
      setMessage({ type: 'success', text: 'Configurações restauradas para o padrão' });
    }
  };

  const settingSections = [
    {
      title: 'Configurações Gerais',
      icon: Settings,
      color: 'primary',
      settings: [
        {
          key: 'systemName',
          label: 'Nome do Sistema',
          type: 'text',
          description: 'Nome exibido no sistema',
        },
        {
          key: 'maintenanceMode',
          label: 'Modo Manutenção',
          type: 'toggle',
          description: 'Ativar modo de manutenção (bloqueia acesso de usuários)',
        },
        {
          key: 'allowRegistration',
          label: 'Permitir Registro',
          type: 'toggle',
          description: 'Permitir que novos usuários se registrem',
        },
        {
          key: 'maxUsersPerDay',
          label: 'Máximo de Usuários por Dia',
          type: 'number',
          description: 'Limite de novos registros por dia',
          min: 1,
        },
      ],
    },
    {
      title: 'Configurações Padrão',
      icon: Shield,
      color: 'secondary',
      settings: [
        {
          key: 'defaultInitialBalance',
          label: 'Saldo Inicial Padrão',
          type: 'number',
          description: 'Saldo inicial para novos usuários',
          min: 1,
        },
        {
          key: 'defaultStopLoss',
          label: 'Stop Loss Padrão',
          type: 'number',
          description: 'Limite de perda padrão para novos usuários',
          min: 1,
        },
        {
          key: 'defaultStopWin',
          label: 'Stop Win Padrão',
          type: 'number',
          description: 'Meta de ganho padrão para novos usuários',
          min: 1,
        },
      ],
    },
    {
      title: 'Notificações',
      icon: Bell,
      color: 'accent',
      settings: [
        {
          key: 'emailNotifications',
          label: 'Notificações por Email',
          type: 'toggle',
          description: 'Enviar notificações importantes por email',
        },
        {
          key: 'systemNotifications',
          label: 'Notificações do Sistema',
          type: 'toggle',
          description: 'Exibir notificações no sistema',
        },
      ],
    },
    {
      title: 'Sistema e Dados',
      icon: Database,
      color: 'warning',
      settings: [
        {
          key: 'dataRetentionDays',
          label: 'Retenção de Dados (dias)',
          type: 'number',
          description: 'Quantos dias manter dados antigos',
          min: 30,
        },
        {
          key: 'backupFrequency',
          label: 'Frequência de Backup',
          type: 'select',
          description: 'Com que frequência fazer backup dos dados',
          options: [
            { value: 'hourly', label: 'A cada hora' },
            { value: 'daily', label: 'Diariamente' },
            { value: 'weekly', label: 'Semanalmente' },
          ],
        },
        {
          key: 'logLevel',
          label: 'Nível de Log',
          type: 'select',
          description: 'Nível de detalhamento dos logs',
          options: [
            { value: 'error', label: 'Apenas Erros' },
            { value: 'warn', label: 'Avisos e Erros' },
            { value: 'info', label: 'Informações' },
            { value: 'debug', label: 'Debug (Detalhado)' },
          ],
        },
      ],
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Configurações do Sistema
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gerencie configurações globais e preferências do sistema
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Restaurar Padrão
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg transition-colors text-sm"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar Alterações
          </button>
        </div>
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800'
              : 'bg-error-50 dark:bg-error-900/20 border-error-200 dark:border-error-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-error-600 dark:text-error-400" />
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

      {/* Settings Sections */}
      {settingSections.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionIndex * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className={`p-2 rounded-lg bg-${section.color}-100 dark:bg-${section.color}-900/20`}>
              <section.icon className={`h-5 w-5 text-${section.color}-600 dark:text-${section.color}-400`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {section.title}
            </h3>
          </div>

          <div className="space-y-6">
            {section.settings.map((setting) => (
              <div key={setting.key} className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {setting.label}
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {setting.description}
                  </p>
                </div>
                
                <div className="sm:ml-6">
                  {setting.type === 'text' && (
                    <input
                      type="text"
                      value={settings[setting.key as keyof typeof settings] as string}
                      onChange={(e) => setSettings({
                        ...settings,
                        [setting.key]: e.target.value
                      })}
                      className="w-full sm:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-primary-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  )}
                  
                  {setting.type === 'number' && (
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <input
                        type="number"
                        value={settings[setting.key as keyof typeof settings] as number}
                        onChange={(e) => setSettings({
                          ...settings,
                          [setting.key]: Number(e.target.value)
                        })}
                        min={setting.min}
                        className="w-full sm:w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                 focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                      {(setting.key.includes('Balance') || setting.key.includes('Loss') || setting.key.includes('Win')) && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatCurrency(settings[setting.key as keyof typeof settings] as number)}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {setting.type === 'toggle' && (
                    <button
                      onClick={() => setSettings({
                        ...settings,
                        [setting.key]: !settings[setting.key as keyof typeof settings]
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings[setting.key as keyof typeof settings] 
                          ? 'bg-primary-600' 
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings[setting.key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  )}
                  
                  {setting.type === 'select' && (
                    <select
                      value={settings[setting.key as keyof typeof settings] as string}
                      onChange={(e) => setSettings({
                        ...settings,
                        [setting.key]: e.target.value
                      })}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-primary-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      {setting.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-lg bg-success-100 dark:bg-success-900/20">
            <Globe className="h-5 w-5 text-success-600 dark:text-success-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Status do Sistema
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-success-50 dark:bg-success-900/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400" />
              <span className="text-sm font-medium text-success-900 dark:text-success-100">
                Sistema Online
              </span>
            </div>
            <p className="text-xs text-success-700 dark:text-success-300 mt-1">
              Funcionando normalmente
            </p>
          </div>

          <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-medium text-primary-900 dark:text-primary-100">
                Banco de Dados
              </span>
            </div>
            <p className="text-xs text-primary-700 dark:text-primary-300 mt-1">
              Conectado e operacional
            </p>
          </div>

          <div className="p-4 bg-secondary-50 dark:bg-secondary-900/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
              <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                Segurança
              </span>
            </div>
            <p className="text-xs text-secondary-700 dark:text-secondary-300 mt-1">
              Todos os sistemas seguros
            </p>
          </div>

          <div className="p-4 bg-accent-50 dark:bg-accent-900/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-accent-600 dark:text-accent-400" />
              <span className="text-sm font-medium text-accent-900 dark:text-accent-100">
                Notificações
              </span>
            </div>
            <p className="text-xs text-accent-700 dark:text-accent-300 mt-1">
              Serviço ativo
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};