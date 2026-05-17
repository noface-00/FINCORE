import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Wallet, TrendingUp, Layers, RefreshCw } from 'lucide-react';
import { Cuenta } from '../../types';
import { DataTable } from '../../components/shared/DataTable';
import { Modal } from '../../components/shared/Modal';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { KPIWidget } from '../../components/widgets/KPIWidget';
import { useAccounts } from '../../hooks/useAccounts';

interface FormData {
  numero_cuenta: string;
  cliente_id: string;
  tipo: 'Ahorro' | 'Corriente';
  saldo: string;
  estado: 'activa' | 'inactiva' | 'congelada';
}

const initialForm: FormData = {
  numero_cuenta: '',
  cliente_id: '1',
  tipo: 'Ahorro',
  saldo: '0',
  estado: 'activa',
};

const inputCls = "fc-input text-sm";
const labelCls = "fc-label";

export function CuentasPage() {
  const { cuentas, loading, error, addAccount, editAccount, removeAccount, refetch } = useAccounts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const totalSaldo = cuentas.reduce((s, c) => s + c.saldo, 0);
  const activas = cuentas.filter(c => c.estado?.toLowerCase() === 'activa').length;

  const openCreate = () => {
    setSubmitError(null);
    setEditingId(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEdit = (c: Cuenta) => {
    setSubmitError(null);
    setEditingId(c.id ?? null);
    setFormData({
      numero_cuenta: c.numero_cuenta,
      cliente_id: String(c.cliente_id),
      tipo: c.tipo,
      saldo: String(c.saldo),
      estado: c.estado as any,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData(initialForm);
    setSubmitError(null);
  };

  const update = (field: keyof FormData, val: string) => setFormData(f => ({ ...f, [field]: val }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSubmitError(null);
    try {
      if (!formData.numero_cuenta) throw new Error('El número de cuenta es obligatorio.');
      const payload: Cuenta = {
        numero_cuenta: formData.numero_cuenta,
        cliente_id: parseInt(formData.cliente_id) || 1,
        tipo: formData.tipo,
        saldo: parseFloat(formData.saldo) || 0,
        estado: formData.estado,
      };
      if (editingId) {
        await editAccount(editingId, { ...payload, id: editingId });
      } else {
        await addAccount(payload);
      }
      closeModal();
    } catch (err: any) {
      setSubmitError(err.message || 'Error al guardar la cuenta.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Confirmas la eliminación de esta cuenta bancaria?')) return;
    setDeleting(id);
    try {
      await removeAccount(id);
    } catch (err: any) {
      alert(err.message || 'Error al eliminar la cuenta.');
    } finally {
      setDeleting(null);
    }
  };

  const tipoColor = (tipo: string) =>
    tipo === 'Ahorro' ? { bg: 'rgba(16,185,129,0.12)', color: '#34d399' } : { bg: 'rgba(139,92,246,0.12)', color: '#a78bfa' };

  const columns = [
    { key: 'numero_cuenta' as const, header: 'Número de Cuenta' },
    {
      key: 'tipo' as const,
      header: 'Tipo',
      render: (val: string) => {
        const s = tipoColor(val);
        return (
          <span className="fc-badge text-xs" style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}30` }}>
            {val}
          </span>
        );
      },
    },
    {
      key: 'saldo' as const,
      header: 'Saldo Disponible',
      render: (val: number) => (
        <span className="font-mono font-bold text-sm" style={{ color: 'var(--fc-text)' }}>
          ${val.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'estado' as const,
      header: 'Estado',
      render: (val: string) => <StatusBadge status={val} />,
    },
    {
      key: 'id' as const,
      header: 'Acciones',
      render: (_: any, row: Cuenta) => (
        <div className="flex gap-1.5">
          <button onClick={() => openEdit(row)} className="fc-btn-ghost !px-2.5 !py-1.5 text-xs" title="Editar">
            <Pencil size={13} />
          </button>
          <button
            onClick={() => row.id != null && handleDelete(row.id)}
            disabled={deleting === row.id}
            className="fc-btn-danger !px-2.5 !py-1.5 text-xs"
            title="Eliminar"
          >
            {deleting === row.id ? <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full fc-spinner" /> : <Trash2 size={13} />}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--fc-text)' }}>Gestión de Cuentas</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--fc-text-muted)' }}>Cuentas de ahorro y corriente vinculadas a clientes</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={refetch} className="fc-btn-ghost" title="Sincronizar">
            <RefreshCw size={15} className={loading ? 'fc-spinner' : ''} />
          </button>
          <button onClick={openCreate} className="fc-btn-primary">
            <Plus size={16} /> Nueva Cuenta
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPIWidget label="Total Cuentas" value={loading ? '—' : cuentas.length} icon={<Layers size={20} />} color="primary" />
        <KPIWidget label="Saldo Total" value={loading ? '—' : `$${(totalSaldo).toLocaleString('es-EC')}`} icon={<TrendingUp size={20} />} color="success" />
        <KPIWidget label="Cuentas Activas" value={loading ? '—' : activas} icon={<Wallet size={20} />} color="purple" />
      </div>

      {error && <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>{error}</div>}

      {/* Table */}
      <div className="fc-card overflow-hidden">
        <DataTable columns={columns} data={cuentas} isLoading={loading} />
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingId ? 'Editar Cuenta Bancaria' : 'Apertura de Nueva Cuenta'}
        subtitle="Vincular cuenta a un cliente existente en el sistema"
        onClose={closeModal}
        actions={
          <>
            <button onClick={closeModal} className="fc-btn-ghost flex-1">Cancelar</button>
            <button onClick={handleSave} disabled={saving} className="fc-btn-primary flex-1">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full fc-spinner" /> : (editingId ? 'Guardar Cambios' : 'Crear Cuenta')}
            </button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          {submitError && (
            <div className="px-4 py-3 rounded-xl text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              {submitError}
            </div>
          )}
          <div>
            <label className={labelCls}>ID Cliente *</label>
            <input type="text" value={formData.cliente_id} onChange={e => update('cliente_id', e.target.value)} className={inputCls} placeholder="1" />
          </div>
          <div>
            <label className={labelCls}>Número de Cuenta *</label>
            <input type="text" required value={formData.numero_cuenta} onChange={e => update('numero_cuenta', e.target.value)} className={inputCls} placeholder="2200123456" />
          </div>
          <div>
            <label className={labelCls}>Tipo de Cuenta</label>
            <select value={formData.tipo} onChange={e => update('tipo', e.target.value)} className="fc-select text-sm">
              <option value="Ahorro">Cuenta de Ahorros</option>
              <option value="Corriente">Cuenta Corriente</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>Saldo Inicial ($)</label>
            <input type="number" min="0" step="0.01" value={formData.saldo} onChange={e => update('saldo', e.target.value)} className={inputCls} placeholder="0.00" />
          </div>
          <div>
            <label className={labelCls}>Estado de la Cuenta</label>
            <select value={formData.estado} onChange={e => update('estado', e.target.value)} className="fc-select text-sm">
              <option value="activa">Activa</option>
              <option value="inactiva">Inactiva</option>
              <option value="congelada">Congelada</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
