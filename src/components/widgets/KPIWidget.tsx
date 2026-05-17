import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KPIWidgetProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  change?: { value: number; isPositive: boolean };
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'purple';
  subtitle?: string;
}

export function KPIWidget({ label, value, icon, change, color = 'primary', subtitle }: KPIWidgetProps) {
  const palette = {
    primary: { accent: '#3B82F6', glow: 'rgba(59,130,246,0.15)', iconBg: 'rgba(59,130,246,0.12)' },
    success: { accent: '#10B981', glow: 'rgba(16,185,129,0.15)', iconBg: 'rgba(16,185,129,0.12)' },
    warning: { accent: '#F59E0B', glow: 'rgba(245,158,11,0.15)',  iconBg: 'rgba(245,158,11,0.12)' },
    danger:  { accent: '#EF4444', glow: 'rgba(239,68,68,0.15)',   iconBg: 'rgba(239,68,68,0.12)' },
    purple:  { accent: '#8B5CF6', glow: 'rgba(139,92,246,0.15)',  iconBg: 'rgba(139,92,246,0.12)' },
  };

  const p = palette[color];

  return (
    <div
      className="relative p-5 rounded-xl overflow-hidden group transition-all duration-300 hover:-translate-y-1"
      style={{
        background: 'var(--fc-card)',
        border: `1px solid var(--fc-border)`,
        boxShadow: `0 0 0 0 ${p.glow}`,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = p.accent + '60'; e.currentTarget.style.boxShadow = `0 8px 32px ${p.glow}`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--fc-border)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {/* Background accent blob */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 transition-opacity duration-300 group-hover:opacity-20" style={{ background: `radial-gradient(circle, ${p.accent}, transparent)` }} />

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--fc-text-muted)' }}>{label}</p>
          <p className="text-2xl font-extrabold tracking-tight" style={{ color: p.accent }}>{value}</p>
          {subtitle && <p className="text-xs mt-1.5" style={{ color: 'var(--fc-text-muted)' }}>{subtitle}</p>}
          {change && (
            <div className="flex items-center gap-1.5 mt-2">
              {change.isPositive
                ? <TrendingUp size={12} style={{ color: '#10B981' }} />
                : <TrendingDown size={12} style={{ color: '#EF4444' }} />}
              <span className="text-xs font-semibold" style={{ color: change.isPositive ? '#10B981' : '#EF4444' }}>
                {change.isPositive ? '+' : ''}{change.value}% este mes
              </span>
            </div>
          )}
        </div>
        <div className="p-3 rounded-xl ml-3 shrink-0" style={{ background: p.iconBg, color: p.accent }}>
          {icon}
        </div>
      </div>
    </div>
  );
}
