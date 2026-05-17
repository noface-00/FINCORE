import React from 'react';

interface StatusBadgeProps {
  status: string;
}

const STATUS_MAP: Record<string, string> = {
  // Generic positive
  activo: 'fc-badge-success',
  activa: 'fc-badge-success',
  aprobado: 'fc-badge-success',
  aprobada: 'fc-badge-success',
  pagado: 'fc-badge-success',
  pagada: 'fc-badge-success',
  pagada_cuota: 'fc-badge-success',
  completada: 'fc-badge-success',
  success: 'fc-badge-success',
  // Warnings
  pendiente: 'fc-badge-warning',
  pendiente_cuota: 'fc-badge-warning',
  mora: 'fc-badge-warning',
  // Danger
  inactivo: 'fc-badge-danger',
  inactiva: 'fc-badge-danger',
  vencido: 'fc-badge-danger',
  vencida: 'fc-badge-danger',
  rechazado: 'fc-badge-danger',
  rechazada: 'fc-badge-danger',
  eliminado: 'fc-badge-danger',
  congelada: 'fc-badge-danger',
  en_mora: 'fc-badge-danger',
  // Info / neutral
  info: 'fc-badge-info',
  default: 'fc-badge-muted',
};

const LABELS: Record<string, string> = {
  activo: 'Activo',
  activa: 'Activa',
  inactivo: 'Inactivo',
  inactiva: 'Inactiva',
  aprobado: 'Aprobado',
  aprobada: 'Aprobada',
  pendiente: 'Pendiente',
  pagado: 'Pagado',
  pagada: 'Pagada',
  vencido: 'Vencido',
  vencida: 'Vencida',
  rechazado: 'Rechazado',
  rechazada: 'Rechazada',
  completada: 'Completada',
  mora: 'En Mora',
  en_mora: 'En Mora',
  congelada: 'Congelada',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const key = String(status).toLowerCase().trim();
  const cls = STATUS_MAP[key] || 'fc-badge-muted';
  const label = LABELS[key] || status;
  return <span className={cls}>{label}</span>;
}
