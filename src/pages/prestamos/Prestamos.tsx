// src/pages/prestamos/Prestamos.tsx
import React, { useState, useEffect } from 'react';
import { Prestamo } from '../../types';
import { DataTable } from '../../components/shared/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { KPIWidget } from '../../components/widgets/KPIWidget';
import { Modal } from '../../components/shared/Modal';
import {
  Plus,
  TrendingUp,
  AlertTriangle,
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Trash2,
  Users,
} from 'lucide-react';
import {
  getLoansByClient,
  createLoan,
  updateLoan,
  deleteLoan,
} from '../../api/prestamos.api';

export function PrestamosPage() {
  const [clientId, setClientId] = useState<string>('1');
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newClientId, setNewClientId] = useState<string>('1');
  const [newMonto, setNewMonto] = useState<string>('5000');
  const [newTasa, setNewTasa] = useState<string>('12');
  const [newPlazo, setNewPlazo] = useState<string>('24');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchLoans = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getLoansByClient(id);
      setPrestamos(data);
    } catch (err: any) {
      setError(err?.message || 'Error al obtener préstamos del cliente');
      setPrestamos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const parsed = parseInt(clientId);
    if (!isNaN(parsed)) {
      fetchLoans(parsed);
    } else {
      setPrestamos([]);
    }
  }, [clientId]);

  const handleQuery = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(clientId);
    if (!isNaN(parsed)) {
      fetchLoans(parsed);
    }
  };

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSaving(true);
    try {
      const parsedClientId = parseInt(newClientId);
      const parsedMonto = parseFloat(newMonto);
      const parsedTasa = parseFloat(newTasa);
      const parsedPlazo = parseInt(newPlazo);

      if (isNaN(parsedClientId) || isNaN(parsedMonto) || isNaN(parsedTasa) || isNaN(parsedPlazo)) {
        throw new Error('Todos los campos numéricos son obligatorios');
      }

      await createLoan({
        cliente_id: parsedClientId,
        monto: parsedMonto,
        tasa_interes: parsedTasa,
        plazo: parsedPlazo,
        estado: 'Pendiente',
      });

      setIsModalOpen(false);
      // Refresh current list if clientId matches
      if (parseInt(clientId) === parsedClientId) {
        fetchLoans(parsedClientId);
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'Error al registrar el préstamo');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: 'APROBADO' | 'RECHAZADO' | 'PAGADO' | 'VENCIDO') => {
    try {
      await updateLoan(id, { estado: status });
      const parsed = parseInt(clientId);
      if (!isNaN(parsed)) fetchLoans(parsed);
    } catch (err: any) {
      alert(err?.message || 'Error al actualizar el estado del préstamo');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar este préstamo?')) {
      try {
        await deleteLoan(id);
        const parsed = parseInt(clientId);
        if (!isNaN(parsed)) fetchLoans(parsed);
      } catch (err: any) {
        alert(err?.message || 'Error al eliminar el préstamo');
      }
    }
  };

  const totalMonto = prestamos.reduce((sum, p) => sum + p.monto, 0);
  const enMora = prestamos.filter((p) => p.estado === 'Vencido').length;
  const promTasa = prestamos.length > 0
    ? (prestamos.reduce((sum, p) => sum + p.tasa_interes, 0) / prestamos.length).toFixed(2)
    : '0.00';

  const columns = [
    {
      key: 'id' as const,
      header: 'ID Préstamo',
      render: (val: number) => (
        <span className="font-mono text-sm font-bold" style={{ color: 'var(--fc-text)' }}>
          #{val}
        </span>
      ),
    },
    {
      key: 'monto' as const,
      header: 'Monto Colocado',
      render: (val: number) => (
        <span className="font-mono font-bold" style={{ color: 'var(--fc-text)' }}>
          ${val.toLocaleString('es-EC', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      key: 'tasa_interes' as const,
      header: 'Tasa Anual',
      render: (val: number) => `${val}%`,
    },
    {
      key: 'plazo' as const,
      header: 'Plazo (Meses)',
    },
    {
      key: 'estado' as const,
      header: 'Estado',
      render: (val: string) => <StatusBadge status={val} />,
    },
    {
      // Use 'cliente_id' as the column key discriminator to avoid duplicate 'id' keys.
      // We access the loan's actual id via the `row` parameter in the render function.
      key: 'cliente_id' as const,
      header: 'Acciones',
      render: (_: number, row: Prestamo) => (
        <div className="flex gap-1.5 flex-wrap">
          {row.estado === 'Pendiente' && row.id && (
            <>
              <button
                onClick={() => handleUpdateStatus(row.id!, 'APROBADO')}
                className="fc-btn-success !px-2.5 !py-1 text-xs"
              >
                <CheckCircle size={12} /> Aprobar
              </button>
              <button
                onClick={() => handleUpdateStatus(row.id!, 'RECHAZADO')}
                className="fc-btn-danger !px-2.5 !py-1 text-xs"
              >
                <XCircle size={12} /> Rechazar
              </button>
            </>
          )}
          {row.estado === 'Aprobado' && row.id && (
            <button
              onClick={() => handleUpdateStatus(row.id!, 'PAGADO')}
              className="fc-btn-ghost !px-2.5 !py-1 text-xs"
            >
              <CheckCircle size={12} /> Liquidar
            </button>
          )}
          <button
            onClick={() => row.id && handleDelete(row.id)}
            className="fc-btn-danger !px-2 !py-1 text-xs"
            title="Eliminar"
          >
            <Trash2 size={12} />
          </button>
        </div>
      ),
    },
  ];


  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F8FAFC]">Gestión de Préstamos</h1>
          <p className="text-[#94A3B8] mt-2">Colocación, Análisis de Riesgo y Aprobaciones de Crédito</p>
        </div>
        
        <button
          onClick={() => {
            setSubmitError(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg font-semibold shadow-lg shadow-[#3B82F6]/20 transition-all"
        >
          <Plus size={20} />
          Solicitar Préstamo
        </button>
      </div>

      {/* Lookup Client ID */}
      <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
        <h3 className="text-base font-semibold text-[#F8FAFC] mb-4 flex items-center gap-2">
          <Users size={18} className="text-[#3B82F6]" />
          Filtrar Préstamos por ID del Cliente
        </h3>
        
        <form onSubmit={handleQuery} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">ID Cliente</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-[#64748B]" size={18} />
              <input
                type="text"
                placeholder="Ingrese ID del cliente (Ej. 1, 2, 3...) y presione Enter"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0F172A] border border-[#334155] rounded-lg text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-all"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-[#3B82F6]/50 text-white rounded-lg font-semibold shadow-lg shadow-[#3B82F6]/20 transition-all flex items-center gap-2"
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={18} />
            ) : (
              'Refrescar Cartera'
            )}
          </button>
        </form>

        {error && (
          <div className="p-3 mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg font-mono">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPIWidget
          label="Total Cartera"
          value={loading ? "..." : `$${(totalMonto).toLocaleString()}`}
          icon={<TrendingUp size={24} />}
          color="primary"
        />
        <KPIWidget
          label="Créditos Solicitados"
          value={loading ? "..." : prestamos.length}
          icon={<TrendingUp size={24} />}
          color="success"
        />
        <KPIWidget
          label="Créditos Vencidos"
          value={loading ? "..." : enMora}
          icon={<AlertTriangle size={24} />}
          color="danger"
          change={{ value: enMora, isPositive: false }}
        />
        <KPIWidget
          label="Tasa Promedio"
          value={loading ? "..." : `${promTasa}%`}
          icon={<TrendingUp size={24} />}
          color="warning"
        />
      </div>

      {/* Alert Box */}
      {enMora > 0 && !loading && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="text-red-400" size={24} />
          <div>
            <p className="text-red-400 font-medium">Atención: {enMora} crédito(s) en estado VENCIDO</p>
            <p className="text-red-300 text-sm">El cliente registra mora en sus obligaciones. Requiere revisión y seguimiento legal inmediato.</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#1E293B] rounded-lg border border-[#334155] overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16 text-[#94A3B8]">
            <RefreshCw className="animate-spin mr-2 text-[#3B82F6]" />
            Cargando cartera de préstamos desde ORDS...
          </div>
        ) : (
          <DataTable columns={columns} data={prestamos} />
        )}
      </div>

      {/* Financial Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4">Riesgo de Cartera</h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#94A3B8] text-sm">Riesgo Bajo (Al día / Aprobados)</span>
                <span className="text-[#10B981] font-medium">
                  {prestamos.length > 0 ? ((prestamos.filter(p => p.estado === 'Aprobado' || p.estado === 'Pagado').length / prestamos.length) * 100).toFixed(1) : '100'}%
                </span>
              </div>
              <div className="h-2 bg-[#0F172A] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#10B981] transition-all duration-500"
                  style={{ width: `${prestamos.length > 0 ? (prestamos.filter(p => p.estado === 'Aprobado' || p.estado === 'Pagado').length / prestamos.length) * 100 : 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#94A3B8] text-sm">Riesgo Medio (En Estudio / Pendientes)</span>
                <span className="text-[#F59E0B] font-medium">
                  {prestamos.length > 0 ? ((prestamos.filter(p => p.estado === 'Pendiente').length / prestamos.length) * 100).toFixed(1) : '0'}%
                </span>
              </div>
              <div className="h-2 bg-[#0F172A] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#F59E0B] transition-all duration-500"
                  style={{ width: `${prestamos.length > 0 ? (prestamos.filter(p => p.estado === 'Pendiente').length / prestamos.length) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-[#94A3B8] text-sm">Riesgo Alto (Vencidos / Incobrables)</span>
                <span className="text-[#EF4444] font-medium">
                  {prestamos.length > 0 ? ((prestamos.filter(p => p.estado === 'Vencido').length / prestamos.length) * 100).toFixed(1) : '0'}%
                </span>
              </div>
              <div className="h-2 bg-[#0F172A] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#EF4444] transition-all duration-500"
                  style={{ width: `${prestamos.length > 0 ? (prestamos.filter(p => p.estado === 'Vencido').length / prestamos.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4">Métricas Operativas</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="text-[#3B82F6]">→</span>
              <span className="text-[#94A3B8]">Capital Colocado: ${(totalMonto).toLocaleString()} USD</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#3B82F6]">→</span>
              <span className="text-[#94A3B8]">Número de Colocaciones: {prestamos.length} operaciones</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#3B82F6]">→</span>
              <span className="text-[#94A3B8]">Tasa Promedio Anual: {promTasa}%</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[#3B82F6]">→</span>
              <span className="text-[#94A3B8]">Indicador de Morosidad: {prestamos.length > 0 ? ((enMora / prestamos.length) * 100).toFixed(1) : '0.0'}%</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Solicitar Prestamo Modal */}
      <Modal
        isOpen={isModalOpen}
        title="Nueva Solicitud de Préstamo"
        onClose={() => setIsModalOpen(false)}
        actions={
          <>
            <button
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 bg-[#334155] hover:bg-[#475569] text-[#F8FAFC] rounded-lg transition-colors font-semibold"
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateLoan}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-[#3B82F6]/50 text-white rounded-lg transition-colors font-semibold flex items-center justify-center"
            >
              {saving ? <RefreshCw className="animate-spin" size={16} /> : 'Registrar Solicitud'}
            </button>
          </>
        }
      >
        {submitError && (
          <div className="p-3 mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg font-mono">
            ❌ {submitError}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#F8FAFC] mb-1">ID Cliente Solicitante</label>
            <input
              type="text"
              required
              value={newClientId}
              onChange={(e) => setNewClientId(e.target.value)}
              className="w-full px-3 py-2 bg-[#0F172A] border border-[#334155] rounded-lg text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#F8FAFC] mb-1">Monto del Préstamo ($)</label>
            <input
              type="text"
              required
              placeholder="Ej. 5000"
              value={newMonto}
              onChange={(e) => setNewMonto(e.target.value)}
              className="w-full px-3 py-2 bg-[#0F172A] border border-[#334155] rounded-lg text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#F8FAFC] mb-1">Tasa de Interés Anual (%)</label>
            <input
              type="text"
              required
              placeholder="Ej. 12"
              value={newTasa}
              onChange={(e) => setNewTasa(e.target.value)}
              className="w-full px-3 py-2 bg-[#0F172A] border border-[#334155] rounded-lg text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#F8FAFC] mb-1">Plazo de Pago (Meses)</label>
            <input
              type="text"
              required
              placeholder="Ej. 24"
              value={newPlazo}
              onChange={(e) => setNewPlazo(e.target.value)}
              className="w-full px-3 py-2 bg-[#0F172A] border border-[#334155] rounded-lg text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
