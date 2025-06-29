import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, X, Trash2 } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  loading = false,
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconBg: 'bg-error-100 dark:bg-error-900/20',
          iconColor: 'text-error-600 dark:text-error-400',
          confirmBg: 'bg-error-600 hover:bg-error-700 disabled:bg-error-400',
          icon: Trash2,
        };
      case 'warning':
        return {
          iconBg: 'bg-warning-100 dark:bg-warning-900/20',
          iconColor: 'text-warning-600 dark:text-warning-400',
          confirmBg: 'bg-warning-600 hover:bg-warning-700 disabled:bg-warning-400',
          icon: AlertTriangle,
        };
      case 'info':
        return {
          iconBg: 'bg-primary-100 dark:bg-primary-900/20',
          iconColor: 'text-primary-600 dark:text-primary-400',
          confirmBg: 'bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400',
          icon: CheckCircle,
        };
      default:
        return {
          iconBg: 'bg-warning-100 dark:bg-warning-900/20',
          iconColor: 'text-warning-600 dark:text-warning-400',
          confirmBg: 'bg-warning-600 hover:bg-warning-700 disabled:bg-warning-400',
          icon: AlertTriangle,
        };
    }
  };

  const typeStyles = getTypeStyles();
  const IconComponent = typeStyles.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md"
      >
        <div className="p-6">
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-full ${typeStyles.iconBg} flex-shrink-0`}>
              <IconComponent className={`h-6 w-6 ${typeStyles.iconColor}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {message}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-2.5 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center ${typeStyles.confirmBg}`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};