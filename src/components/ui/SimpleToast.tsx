'use client';

import React from 'react';

interface SimpleToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
}

export const SimpleToast: React.FC<SimpleToastProps> = ({ message, type, onClose }) => {
  const variants = {
    success: {
      bg: 'bg-green-500/10 border-green-500/30',
      text: 'text-green-300',
      icon: '✅',
    },
    error: {
      bg: 'bg-red-500/10 border-red-500/30',
      text: 'text-red-300',
      icon: '❌',
    },
    warning: {
      bg: 'bg-yellow-500/10 border-yellow-500/30',
      text: 'text-yellow-300',
      icon: '⚠️',
    },
    info: {
      bg: 'bg-blue-500/10 border-blue-500/30',
      text: 'text-blue-300',
      icon: '💡',
    },
  };

  const variant = variants[type];

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div
        className={`glass-card border rounded-lg p-4 shadow-lg max-w-sm ${variant.bg} ${variant.text}`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 text-lg">
            {variant.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              {message}
            </p>
          </div>

          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
          >
            <span className="text-sm">✕</span>
          </button>
        </div>
      </div>
    </div>
  );
};