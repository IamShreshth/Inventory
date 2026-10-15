import { createContext, useState, useCallback, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

const ToastItem = ({ toast, onClose }: ToastItemProps) => {
  const icons = {
    success: <CheckCircle size={20} strokeWidth={1.5} />,
    error: <AlertCircle size={20} strokeWidth={1.5} />,
    warning: <AlertTriangle size={20} strokeWidth={1.5} />,
    info: <Info size={20} strokeWidth={1.5} />,
  };

  const colors = {
    success: 'bg-success/10 text-success border-success',
    error: 'bg-error/10 text-error border-error',
    warning: 'bg-warning/10 text-warning border-warning',
    info: 'bg-neutral/10 text-neutral border-neutral',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded border bg-background shadow-lg',
        'animate-in slide-in-from-right duration-200',
        colors[toast.type]
      )}
      role="alert"
    >
      <span className="flex-shrink-0 mt-0.5">{icons[toast.type]}</span>
      <p className="flex-1 text-sm text-text">{toast.message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 p-1 rounded hover:bg-surface transition-colors"
        aria-label="Close notification"
      >
        <X size={16} strokeWidth={1.5} />
      </button>
    </div>
  );
};

