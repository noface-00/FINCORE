import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Search, Users, UserCheck, UserX, RefreshCw } from 'lucide-react';
import { Cliente } from '../../types';
import { DataTable } from '../../components/shared/DataTable';
import { Modal } from '../../components/shared/Modal';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { KPIWidget } from '../../components/widgets/KPIWidget';
import { useClients } from '../../hooks/useClients';

interface FormData {
  cedula: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  correo: string;
  direccion: string;
  estado: 'activo' | 'inactivo' | 'suspendido';
}

const initialForm: FormData = {
  cedula: '',
  nombres: '',
  apellidos: '',
  telefono: '',
  correo: '',
  direccion: '',
  estado: 'activo',
};

const inputCls = "fc-input text-sm";
const labelCls = "fc-label";

export function ClientesPage() {
  const { clientes, loading, error, addClient, editClient, removeClient, refresh } = useClients();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<FormData>(initialForm);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  const filtered = clientes.filter((c) =>
    c.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cedula.includes(searchTerm) ||
    c.correo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activos = clientes.filter(c => c.estado?.toLowerCase() === 'activo').length;
  const inactivos = clientes.length - activos;

  const openCreate = () => {
    setSubmitError(null);
    setEditingId(null);
    setFormData(initialForm);
    setIsModalOpen(true);
  };

  const openEdit = (c: Cliente) => {
    setSubmitError(null);
    setEditingId(c.id ?? null);
    setFormData({
      cedula: c.cedula,
      nombres: c.nombres,
      apellidos: c.apellidos,
      telefono: c.telefono,
      correo: c.correo,
      direccion: c.direccion,
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
      if (!formData.cedula || !formData.nombres || !formData.apellidos) {
        throw new Error('Cédula, nombres y apellidos son obligatorios.');
      }
      if (editingId) {
        await editClient(editingId, { ...formData, id: editingId, sucursal_id: 1 });
      } else {
        await addClient({ ...formData, sucursal_id: 1 });
      }
      closeModal();
    } catch (err: any) {
      setSubmitError(err.message || 'Error al guardar el cliente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Confirmas la eliminación lógica de este cliente?')) return;
    setDeleting(id);
    try {
      await removeClient(id);
    } catch (err: any) {
      alert(err.message || 'Error al eliminar el cliente.');
    } finally {
      setDeleting(null);
    }
  };

  const columns = [
    { key: 'cedula' as const, header: 'Cédula' },
    {
      key: 'nombres' as const,
      header: 'Cliente',
      render: (_: any, row: Cliente) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)' }}>
            {row.nombres.charAt(0)}{row.apellidos.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: 'var(--fc-text)' }}>{row.nombres} {row.apellidos}</p>
            <p className="text-xs" style={{ color: 'var(--fc-text-muted)' }}>{row.correo}</p>
          </div>
        </div>
      ),
    },
    { key: 'telefono' as const, header: 'Teléfono' },
    { key: 'direccion' as const, header: 'Dirección' },
    {
      key: 'estado' as const,
      header: 'Estado',
      render: (val: string) => <StatusBadge status={val} />,
    },
    {
      key: 'id' as const,
      header: 'Acciones',
      render: (_: any, row: Cliente) => (
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
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--fc-text)' }}>Gestión de Clientes</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--fc-text-muted)' }}>Registro, edición y baja lógica de clientes bancarios</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={() => refresh?.()} className="fc-btn-ghost" title="Sincronizar">
            <RefreshCw size={15} className={loading ? 'fc-spinner' : ''} />
          </button>
          <button onClick={openCreate} className="fc-btn-primary">
            <Plus size={16} /> Nuevo Cliente
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPIWidget label="Total Registrados" value={loading ? '—' : clientes.length} icon={<Users size={20} />} color="primary" />
        <KPIWidget label="Clientes Activos" value={loading ? '—' : activos} icon={<UserCheck size={20} />} color="success" />
        <KPIWidget label="Inactivos / Suspendidos" value={loading ? '—' : inactivos} icon={<UserX size={20} />} color="warning" />
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--fc-text-muted)' }} />
        <input
          type="text"
          placeholder="Buscar por nombre, cédula o email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="fc-input pl-10"
        />
      </div>

      {/* Error */}
      {error && <div className="px-4 py-3 rounded-xl text-sm fc-badge-danger">{error}</div>}

      {/* Table */}
      <div className="fc-card overflow-hidden">
        <DataTable columns={columns} data={filtered} isLoading={loading} />
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingId ? 'Editar Cliente' : 'Registrar Nuevo Cliente'}
        subtitle="Completa todos los campos requeridos para continuar"
        onClose={closeModal}
        actions={
          <>
            <button onClick={closeModal} className="fc-btn-ghost flex-1">Cancelar</button>
            <button onClick={handleSave} disabled={saving} className="fc-btn-primary flex-1">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full fc-spinner" /> : (editingId ? 'Guardar Cambios' : 'Crear Cliente')}
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
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Cédula / RUC *</label>
              <input type="text" required value={formData.cedula} onChange={e => update('cedula', e.target.value)} className={inputCls} placeholder="0102030405" />
            </div>
            <div>
              <label className={labelCls}>Nombres *</label>
              <input type="text" required value={formData.nombres} onChange={e => update('nombres', e.target.value)} className={inputCls} placeholder="Kevin" />
            </div>
            <div>
              <label className={labelCls}>Apellidos *</label>
              <input type="text" required value={formData.apellidos} onChange={e => update('apellidos', e.target.value)} className={inputCls} placeholder="Lopez" />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" value={formData.correo} onChange={e => update('correo', e.target.value)} className={inputCls} placeholder="cliente@email.com" />
            </div>
            <div>
              <label className={labelCls}>Teléfono</label>
              <input type="tel" value={formData.telefono} onChange={e => update('telefono', e.target.value)} className={inputCls} placeholder="0999999999" />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Dirección</label>
              <input type="text" value={formData.direccion} onChange={e => update('direccion', e.target.value)} className={inputCls} placeholder="Av. Principal, Ciudad" />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Estado de la Cuenta</label>
              <select value={formData.estado} onChange={e => update('estado', e.target.value)} className="fc-select text-sm">
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="suspendido">Suspendido</option>
              </select>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
