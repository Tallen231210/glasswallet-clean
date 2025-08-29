'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface Toast {
  id: string;
  title?: string;
  message: string;
  variant: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2);
    const newToast: Toast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto-hide toast after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        hideToast(id);
      }, toast.duration || 5000);
    }
  };

  const hideToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
      {children}
      <ToastContainer toasts={toasts} onHide={hideToast} />
    </ToastContext.Provider>
  );
};

interface ToastItemProps {
  toast: Toast;
  onHide: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onHide }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onHide(toast.id), 300);
  };

  const variants = {
    info: {
      bg: 'bg-blue-500/10 border-blue-500/30',
      text: 'text-blue-300',
      icon: '💡',
    },
    success: {
      bg: 'bg-green-500/10 border-green-500/30',
      text: 'text-green-300',
      icon: '✓',
    },
    warning: {
      bg: 'bg-yellow-500/10 border-yellow-500/30',
      text: 'text-yellow-300',
      icon: '⚠',
    },
    error: {
      bg: 'bg-red-500/10 border-red-500/30',
      text: 'text-red-300',
      icon: '✕',
    },
  };

  const variant = variants[toast.variant];

  return (
    <div
      className={cn(
        'transform transition-all duration-300 ease-in-out mb-4 last:mb-0',
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100'
          : 'translate-x-full opacity-0'
      )}
    >
      <div
        className={cn(
          'glass-card border rounded-lg p-4 shadow-lg max-w-sm',
          variant.bg,
          variant.text
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-lg">
            {variant.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            {toast.title && (
              <h4 className="font-semibold text-sm mb-1">
                {toast.title}
              </h4>
            )}
            <p className="text-sm opacity-90">
              {toast.message}
            </p>
            
            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="mt-2 text-xs font-medium hover:underline"
              >
                {toast.action.label}
              </button>
            )}
          </div>

          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
          >
            <span className="text-sm">✕</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onHide: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onHide }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <div className="pointer-events-auto space-y-4">
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onHide={onHide}
          />
        ))}
      </div>
    </div>
  );
};export default Toast;
