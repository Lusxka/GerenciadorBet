import { useState } from 'react';

interface ConfirmationOptions {
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info';
  confirmText?: string;
  cancelText?: string;
}

export const useConfirmation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmationOptions>({
    title: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null);

  const confirm = (confirmOptions: ConfirmationOptions): Promise<boolean> => {
    setOptions(confirmOptions);
    setIsOpen(true);
    setLoading(false);

    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
    });
  };

  const handleConfirm = async () => {
    setLoading(true);
    if (resolvePromise) {
      resolvePromise(true);
    }
    setIsOpen(false);
    setLoading(false);
    setResolvePromise(null);
  };

  const handleCancel = () => {
    if (resolvePromise) {
      resolvePromise(false);
    }
    setIsOpen(false);
    setLoading(false);
    setResolvePromise(null);
  };

  return {
    isOpen,
    options,
    loading,
    confirm,
    handleConfirm,
    handleCancel,
  };
};