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
  CheckCircle,
  Users,
  Lock
} from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';

export const AdminSettingsPage: React.FC = () => {
  const { settings, updateSettings, resetSettings, getSystemStatus } = useAdminStore();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState(settings);

  const systemStatus = getSystemStatus();

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      updateSettings(formData);
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
      resetSettings();
      setFormData(settings);
      setMessage({ type: 'success', text: 'Configurações restauradas para o padrão' });
      setTimeout(() => setMessage(null), 3000);
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
          description: 'Ativar modo de manutenção (bloqueia acesso de usuários regulares)',
        },
        {
          key: 'maintenanceMessage',
          label: 'Mensagem de Manutenção',
          type: 'textarea',
          description: 'Mensagem exibida durante a manutenção',
        },
      ],
    },
    {
      title: 'Controle de Registros',
      icon: Users,
      color: 'secondary',
      settings: [
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
        {
          key: 'registrationMessage',
          label: 'Mensagem de Registro Bloqueado',
          type: 'textarea',
          description: 'Mensagem exibida quando registros estão bloqueados',
        },
      ],
    },
    {
      title: 'Configurações Padrão para Novos Usuários',
      icon: Shield,
      color: 'accent',
      settings: [
        {
          key: 'defaultInitialBalance',
          label: 'Saldo Inicial Padrão',
          type: 'number',
          description: 'Saldo inicial para novos usuários',
          min: 0,
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
      color: 'warning',
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
          description: 'Exibir notificações no sistema para novos usuários',
        },
      ],
    },
    {
      title: 'Sistema e Dados',
      icon: Database,
      color: 'error',
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
            Gerencie configurações globais, modo manutenção e preferências do sistema
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

      {/* System Status Alert */}
      {(formData.maintenanceMode || !formData.allowRegistration) && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg"
        >
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-warning-600 dark:text-warning-400 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-warning-800 dark:text-warning-200">
                Atenção: Restrições Ativas
              </h4>
              <div className="text-sm text-warning-700 dark:text-warning-300 mt-1 space-y-1">
                {formData.maintenanceMode && (
                  <p>• Modo manutenção ativo - usuários regulares não podem acessar o sistema</p>
                )}
                {!formData.allowRegistration && (
                  <p>• Registros bloqueados - novos usuários não podem se cadastrar</p>
                )}
              </div>
            </div>
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
              <div key={setting.key} className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {setting.label}
                  </label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {setting.description}
                  </p>
                </div>
                
                <div className="sm:ml-6 sm:w-64">
                  {setting.type === 'text' && (
                    <input
                      type="text"
                      value={formData[setting.key as keyof typeof formData] as string}
                      onChange={(e) => setFormData({
                        ...formData,
                        [setting.key]: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-primary-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  )}

                  {setting.type === 'textarea' && (
                    <textarea
                      value={formData[setting.key as keyof typeof formData] as string}
                      onChange={(e) => setFormData({
                        ...formData,
                        [setting.key]: e.target.value
                      })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                               focus:ring-2 focus:ring-primary-500 focus:border-transparent
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm resize-none"
                    />
                  )}
                  
                  {setting.type === 'number' && (
                    <div className="space-y-2">
                      <input
                        type="number"
                        value={formData[setting.key as keyof typeof formData] as number}
                        onChange={(e) => setFormData({
                          ...formData,
                          [setting.key]: Number(e.target.value)
                        })}
                        min={setting.min}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                 focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                      {(setting.key.includes('Balance') || setting.key.includes('Loss') || setting.key.includes('Win')) && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatCurrency(formData[setting.key as keyof typeof formData] as number)}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {setting.type === 'toggle' && (
                    <button
                      onClick={() => setFormData({
                        ...formData,
                        [setting.key]: !formData[setting.key as keyof typeof formData]
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        formData[setting.key as keyof typeof formData] 
                          ? 'bg-primary-600' 
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          formData[setting.key as keyof typeof formData] ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  )}
                  
                  {setting.type === 'select' && (
                    <select
                      value={formData[setting.key as keyof typeof formData] as string}
                      onChange={(e) => setFormData({
                        ...formData,
                        [setting.key]: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
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
        transition={{ delay: 0.5 }}
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
          <div className={`p-4 rounded-lg ${
            systemStatus.isOnline 
              ? 'bg-success-50 dark:bg-success-900/20' 
              : 'bg-error-50 dark:bg-error-900/20'
          }`}>
            <div className="flex items-center space-x-2">
              {systemStatus.isOnline ? (
                <CheckCircle className="h-5 w-5 text-success-600 dark:text-success-400" />
              ) : (
                <Lock className="h-5 w-5 text-error-600 dark:text-error-400" />
              )}
              <span className={`text-sm font-medium ${
                systemStatus.isOnline 
                  ? 'text-success-900 dark:text-success-100'
                  : 'text-error-900 dark:text-error-100'
              }`}>
                {systemStatus.isOnline ? 'Sistema Online' : 'Modo Manutenção'}
              </span>
            </div>
            <p className={`text-xs mt-1 ${
              systemStatus.isOnline 
                ? 'text-success-700 dark:text-success-300'
                : 'text-error-700 dark:text-error-300'
            }`}>
              {systemStatus.isOnline ? 'Funcionando normalmente' : 'Acesso restrito'}
            </p>
          </div>

          <div className={`p-4 rounded-lg ${
            systemStatus.allowRegistration 
              ? 'bg-primary-50 dark:bg-primary-900/20' 
              : 'bg-warning-50 dark:bg-warning-900/20'
          }`}>
            <div className="flex items-center space-x-2">
              <Users className={`h-5 w-5 ${
                systemStatus.allowRegistration 
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-warning-600 dark:text-warning-400'
              }`} />
              <span className={`text-sm font-medium ${
                systemStatus.allowRegistration 
                  ? 'text-primary-900 dark:text-primary-100'
                  : 'text-warning-900 dark:text-warning-100'
              }`}>
                Registros
              </span>
            </div>
            <p className={`text-xs mt-1 ${
              systemStatus.allowRegistration 
                ? 'text-primary-700 dark:text-primary-300'
                : 'text-warning-700 dark:text-warning-300'
            }`}>
              {systemStatus.allowRegistration ? 'Permitidos' : 'Bloqueados'}
            </p>
          </div>
          
          <div className="p-4 bg-secondary-50 dark:bg-secondary-900/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Database className="h-5 w-5 text-secondary-600 dark:text-secondary-400" />
              <span className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                Registros Hoje
              </span>
            </div>
            <p className="text-xs text-secondary-700 dark:text-secondary-300 mt-1">
              {systemStatus.dailyRegistrationsUsed} / {systemStatus.dailyRegistrationsLimit}
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
              {formData.systemNotifications ? 'Ativas' : 'Desativadas'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};