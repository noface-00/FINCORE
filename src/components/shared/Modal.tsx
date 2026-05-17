import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export function Modal({ isOpen, title, subtitle, onClose, children, actions, size = 'md' }: ModalProps) {
  if (!isOpen) return null;

  const sizeMap = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl' };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(6,12,26,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`relative w-full ${sizeMap[size]} max-h-[90vh] flex flex-col rounded-2xl fc-slideup`}
        style={{ background: 'var(--fc-card)', border: '1px solid var(--fc-border-strong)' }}
      >
        {/* Accent line top */}
        <div className="absolute top-0 left-8 right-8 h-[1px] rounded-full" style={{ background: 'linear-gradient(90deg, transparent, var(--fc-primary), transparent)' }} />

        {/* Header */}
        <div className="flex items-start justify-between p-6" style={{ borderBottom: '1px solid var(--fc-border)' }}>
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--fc-text)' }}>{title}</h2>
            {subtitle && <p className="text-xs mt-1" style={{ color: 'var(--fc-text-muted)' }}>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors ml-4"
            style={{ color: 'var(--fc-text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--fc-text)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--fc-text-muted)')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer */}
        {actions && (
          <div className="flex gap-3 p-6" style={{ borderTop: '1px solid var(--fc-border)' }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
