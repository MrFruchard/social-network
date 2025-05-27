import { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

function ToastComponent({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className={`max-w-sm w-full shadow-lg rounded-lg pointer-events-auto border ${getStyles()}`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none"
              onClick={() => onClose(toast.id)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Exposer la fonction addToast globalement
  useEffect(() => {
    (window as any).showToast = addToast;
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastComponent
          key={toast.id}
          toast={toast}
          onClose={removeToast}
        />
      ))}
    </div>
  );
}

// Helper function to show toasts
export const showToast = (message: string, type: ToastType = 'info') => {
  if (typeof window !== 'undefined' && (window as any).showToast) {
    (window as any).showToast(message, type);
  }
};