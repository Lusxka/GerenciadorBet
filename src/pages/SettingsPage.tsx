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
  Save
} from 'lucide-react';
import { useBettingStore } from '../store/bettingStore';
import { useAuthStore } from '../store/authStore';

export const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { userSettings, updateSettings } = useBettingStore();
  const [loading, setLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const [formData, setFormData] = useState({
    initialBalance: userSettings?.initialBalance || 1000,
    stopLoss: userSettings?.stopLoss || 300,
    stopWin: userSettings?.stopWin || 500,
    notifications: userSettings?.notifications || true,
    theme: userSettings?.theme || 'light',
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      updateSettings(formData);
      
      // Apply theme immediately
      document.documentElement.classList.toggle('dark', formData.theme === 'dark');
      
      // Show success message (you could add a toast here)
      setTimeout(() => setLoading(false), 500);
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setLoading(false);
    }
  };

  const handleExportData = () => {
    // This would export user data to JSON
    const data = {
      user,
      settings: userSettings,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    if (showResetConfirm) {
      // Reset all data
      updateSettings({
        initialBalance: 1000,
        currentBalance: 1000,
        stopLoss: 300,
        stopWin: 500,
        notifications: true,
        theme: 'light',
      });
      setFormData({
        initialBalance: 1000,
        stopLoss: 300,
        stopWin: 500,
        notifications: true,
        theme: 'light',
      });
      setShowResetConfirm(false);
    } else {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 5000);
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
          key: 'initialBalance',
          label: 'Saldo Inicial',
          type: 'number',
          description: 'Valor inicial da sua banca',
          min: 1,
          step: 1,
        },
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
    <div className="space-y-4 md:space-y-6 px-4 md:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Configurações
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
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

      {/* Settings Sections */}
      {settingSections.map((section, sectionIndex) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: sectionIndex * 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className={`p-2 rounded-lg bg-${section.color}-100 dark:bg-${section.color}-900/20`}>
              <section.icon className={`h-4 w-4 md:h-5 md:w-5 text-${section.color}-600 dark:text-${section.color}-400`} />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
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
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
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
                      {setting.key.includes('Balance') || setting.key.includes('Loss') || setting.key.includes('Win') ? (
                        <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                          {formatCurrency(formData[setting.key as keyof typeof formData] as number)}
                        </span>
                      ) : null}
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
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 rounded-lg bg-warning-100 dark:bg-warning-900/20">
            <Shield className="h-4 w-4 md:h-5 md:w-5 text-warning-600 dark:text-warning-400" />
          </div>
          <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
            Gerenciamento de Dados
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={handleExportData}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
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
            className={`flex items-center justify-center px-4 py-3 rounded-lg transition-colors text-sm ${
              showResetConfirm
                ? 'bg-error-600 hover:bg-error-700 text-white'
                : 'border border-error-300 dark:border-error-600 text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20'
            }`}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {showResetConfirm ? 'Confirmar Reset' : 'Resetar Dados'}
          </button>
        </div>

        <div className="mt-4 p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
          <p className="text-xs md:text-sm text-warning-800 dark:text-warning-200">
            <strong>Atenção:</strong> O reset de dados irá apagar todas as suas apostas, metas e configurações. 
            Esta ação não pode ser desfeita. Recomendamos fazer um backup antes.
          </p>
        </div>
      </motion.div>

      {/* Account Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6"
      >
        <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Informações da Conta
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Nome
            </label>
            <p className="text-sm md:text-base text-gray-900 dark:text-white">{user?.name}</p>
          </div>
          
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Email
            </label>
            <p className="text-sm md:text-base text-gray-900 dark:text-white">{user?.email}</p>
          </div>
          
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Tipo de Conta
            </label>
            <p className="text-sm md:text-base text-gray-900 dark:text-white capitalize">
              {user?.role === 'admin' ? 'Administrador' : 'Cliente'}
            </p>
          </div>
          
          <div>
            <label className="block text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              Membro desde
            </label>
            <p className="text-sm md:text-base text-gray-900 dark:text-white">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};