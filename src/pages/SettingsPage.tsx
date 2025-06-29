import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  DollarSign, 
  Bell, 
  Moon, 
  Sun, 
  Shield,
  Download,
  Upload,
  Trash2,
  Save,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useBettingStore } from '../store/bettingStore';
import { useAuthStore } from '../store/authStore';
import { InitialBalanceForm } from '../components/settings/InitialBalanceForm';
import { ExportModal } from '../components/export/ExportModal';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { useConfirmation } from '../hooks/useConfirmation';

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { userSettings, updateSettings, resetAllUserData } = useBettingStore();
  const [loading, setLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const confirmation = useConfirmation();

  const [formData, setFormData] = useState({
    stopLoss: userSettings?.stopLoss || 300,
    stopWin: userSettings?.stopWin || 500,
    notifications: userSettings?.notifications || true,
    theme: userSettings?.theme || 'light',
  });

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

  const handleResetData = async () => {
    const confirmed = await confirmation.confirm({
      title: 'Resetar Todos os Dados',
      message: 'Esta ação irá apagar TODAS as suas apostas, saques, categorias, metas e progresso. Esta ação não pode ser desfeita. Recomendamos fazer um backup antes. Tem certeza que deseja continuar?',
      type: 'danger',
      confirmText: 'Sim, Resetar Tudo',
      cancelText: 'Cancelar',
    });

    if (confirmed && user) {
      // Reset all user data
      resetAllUserData(user.id);
      setFormData({
        stopLoss: 300,
        stopWin: 500,
        notifications: true,
        theme: formData.theme, // Keep current theme
      });
      setMessage({ type: 'success', text: 'Todos os dados foram resetados com sucesso!' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const settingSections = [
    {
      title: 'Configurações Financeiras',
      icon: DollarSign,
      color: 'primary',
      settings: [
        {
          key: 'stopLoss',
          label: 'Stop Loss',
          type: 'number',
          description: 'Limite máximo de perda por dia',
          min: 1,
          step: 1,
        },
        {
          key: 'stopWin',
          label: 'Stop Win',
          type: 'number',
          description: 'Meta de ganho por dia',
          min: 1,
          step: 1,
        },
      ],
    },
    {
      title: 'Preferências',
      icon: Settings,
      color: 'secondary',
      settings: [
        {
          key: 'notifications',
          label: 'Notificações',
          type: 'toggle',
          description: 'Receber alertas de stop loss e stop win',
        },
        {
          key: 'theme',
          label: 'Tema',
          type: 'select',
          description: 'Escolha entre tema claro ou escuro',
          options: [
            { value: 'light', label: 'Claro' },
            { value: 'dark', label: 'Escuro' },
          ],
        },
      ],
    },
  ];

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Configurações
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Personalize suas preferências e configurações
          </p>
        </div>
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

      {/* Initial Balance Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <InitialBalanceForm />
      </motion.div>

      {/* Settings Sections */}
      {settingSections.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (sectionIndex + 1) * 0.1 }}
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
                  {setting.type === 'number' && (
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <input
                        type="number"
                        value={formData[setting.key as keyof typeof formData] as number}
                        onChange={(e) => setFormData({
                          ...formData,
                          [setting.key]: Number(e.target.value)
                        })}
                        min={setting.min}
                        step={setting.step}
                        className="w-full sm:w-32 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                                 focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      />
                      {(setting.key.includes('Loss') || setting.key.includes('Win')) && (
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
                      onChange={(e) => {
                        const newFormData = {
                          ...formData,
                          [setting.key]: e.target.value
                        };
                        setFormData(newFormData);
                        
                        // Apply theme change immediately
                        if (setting.key === 'theme') {
                          document.documentElement.classList.toggle('dark', e.target.value === 'dark');
                        }
                      }}
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

      {/* Data Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-lg bg-warning-100 dark:bg-warning-900/20">
            <Shield className="h-5 w-5 text-warning-600 dark:text-warning-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Gerenciamento de Dados
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center justify-center px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Dados
          </button>
          
          <button
            disabled
            className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 rounded-lg cursor-not-allowed text-sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar Dados
          </button>
          
          <button
            onClick={handleResetData}
            className="flex items-center justify-center px-4 py-3 border border-error-300 dark:border-error-600 text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg transition-colors text-sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Resetar Dados
          </button>
        </div>

        <div className="mt-4 p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
          <p className="text-sm text-warning-800 dark:text-warning-200">
            <strong>Atenção:</strong> O reset de dados irá apagar <strong>TODAS</strong> as suas apostas, saques, categorias, metas e progresso.
            Esta ação não pode ser desfeita. Recomendamos fazer um backup antes.
          </p>
        </div>
      </motion.div>

      {/* Account Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Informações da Conta
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Nome
            </label>
            <p className="text-base text-gray-900 dark:text-white">{user?.name}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Email
            </label>
            <p className="text-base text-gray-900 dark:text-white">{user?.email}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Tipo de Conta
            </label>
            <p className="text-base text-gray-900 dark:text-white capitalize">
              {user?.role === 'admin' ? 'Administrador' : 'Cliente'}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Membro desde
            </label>
            <p className="text-base text-gray-900 dark:text-white">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Export Modal */}
      <ExportModal 
        isOpen={showExportModal} 
        onClose={() => setShowExportModal(false)} 
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={confirmation.handleCancel}
        onConfirm={confirmation.handleConfirm}
        title={confirmation.options.title}
        message={confirmation.options.message}
        type={confirmation.options.type}
        confirmText={confirmation.options.confirmText}
        cancelText={confirmation.options.cancelText}
        loading={confirmation.loading}
      />
    </div>
  );
};