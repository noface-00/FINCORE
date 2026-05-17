import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SIDEBAR_ITEMS } from '../constants/navigation';

interface SidebarProps {
  onClose?: () => void;
  isOpen?: boolean;
  onLogout?: () => void;
}

export function Sidebar({ onClose, isOpen = true, onLogout }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm lg:hidden z-40" onClick={onClose} />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-64 z-40 transition-transform duration-300 lg:translate-x-0 lg:relative lg:z-0 fc-sidebar-bg flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ borderRight: '1px solid var(--fc-border)', minWidth: '256px' }}
      >
        {/* Logo */}
        <div className="px-6 py-7" style={{ borderBottom: '1px solid var(--fc-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black text-white" style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
              FC
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-gradient leading-none">FinCore</h1>
              <p className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--fc-text-muted)' }}>Banking Platform</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative"
                style={{
                  color: isActive ? '#60a5fa' : 'var(--fc-text-subtle)',
                  background: isActive ? 'rgba(59,130,246,0.12)' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--fc-card)'; e.currentTarget.style.color = 'var(--fc-text)'; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fc-text-subtle)'; } }}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full" style={{ background: '#3B82F6' }} />
                )}
                <Icon size={17} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4" style={{ borderTop: '1px solid var(--fc-border)' }}>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium"
            style={{ color: 'var(--fc-text-muted)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fc-text-muted)'; }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
