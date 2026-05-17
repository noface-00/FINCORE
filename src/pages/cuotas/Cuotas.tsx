// src/pages/cuotas/Cuotas.tsx
import React, { useState, useEffect } from 'react';
import { Cuota } from '../../types';
import { DataTable } from '../../components/shared/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Modal } from '../../components/shared/Modal';
import { Plus, Search, RefreshCw, Key, Landmark, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import {
  getInstallmentsForLoan,
  createInstallment,
  updateInstallment,
  deleteInstallment,
} from '../../api/cuotas.api';

const initialMockCuotas: Cuota[] = [
  {
    id: 1,
    prestamo_id: 1,
    numero_cuota: 1,
    monto: 250,
    fecha_vencimiento: '2026-06-01',
    estado: 'Pendiente',
  },
  {
    id: 2,
    prestamo_id: 1,
    numero_cuota: 2,
    monto: 250,
    fecha_vencimiento: '2026-07-01',
    estado: 'Pendiente',
  },
  {
    id: 3,
    prestamo_id: 2,
    numero_cuota: 1,
    monto: 500,
    fecha_vencimiento: '2026-05-15',
    estado: 'Vencida',
  },
];

export function CuotasPage() {
  const [loanId, setLoanId] = useState<string>('1');
  const [cuotas, setCuotas] = useState<Cuota[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPrestamoId, setNewPrestamoId] = useState<string>('1');
  const [newNumero, setNewNumero] = useState<string>('1');
  const [newMonto, setNewMonto] = useState<string>('250');
  const [newVencimiento, setNewVencimiento] = useState<string>('2026-06-01');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchCuotas = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInstallmentsForLoan(id);
      setCuotas(data);
    } catch (err: any) {
      setError(err?.message || 'Error al obtener cuotas del préstamo');
      setCuotas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const parsed = parseInt(loanId);
    if (!isNaN(parsed)) {
      fetchCuotas(parsed);
    } else {
      setCuotas([]);
    }
  }, [loanId]);

  const handleQuery = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(loanId);
    if (!isNaN(parsed)) {
      fetchCuotas(parsed);
    }
  };

  const handleCreateInstallment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSaving(true);
    try {
      const parsedLoanId = parseInt(newPrestamoId);
      const parsedNum = parseInt(newNumero);
      const parsedMonto = parseFloat(newMonto);

      if (isNaN(parsedLoanId) || isNaN(parsedNum) || isNaN(parsedMonto)) {
        throw new Error('Todos los campos numéricos son obligatorios');
      }

      await createInstallment({
        prestamo_id: parsedLoanId,
        numero_cuota: parsedNum,
        monto: parsedMonto,
        fecha_vencimiento: newVencimiento,
        estado: 'Pendiente',
      });

      setIsModalOpen(false);
      // Refresh current list if loanId matches
      if (parseInt(loanId) === parsedLoanId) {
        fetchCuotas(parsedLoanId);
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'Error al registrar la cuota');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAsPaid = async (cuota: Cuota) => {
    if (!cuota.id) return;
    try {
      await updateInstallment(cuota.id, { estado: 'PAGADA' });
      // Refresh list
      const parsed = parseInt(loanId);
      if (!isNaN(parsed)) fetchCuotas(parsed);
    } catch (err: any) {
      alert(err?.message || 'Error al marcar cuota como pagada');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta cuota?')) {
      try {
        await deleteInstallment(id);
        const parsed = parseInt(loanId);
        if (!isNaN(parsed)) fetchCuotas(parsed);
      } catch (err: any) {
        alert(err?.message || 'Error al eliminar la cuota');
      }
    }
  };

  const pagadas = cuotas.filter((c) => c.estado === 'Pagada').length;
  const pendientes = cuotas.filter((c) => c.estado === 'Pendiente').length;
  const vencidas = cuotas.filter((c) => c.estado === 'Vencida').length;
  const totalMonto = cuotas.reduce((sum, c) => sum + c.monto, 0);
  const totalPagado = cuotas.filter((c) => c.estado === 'Pagada').reduce((sum, c) => sum + c.monto, 0);
  const totalPendiente = totalMonto - totalPagado;

  const columns = [
    { key: 'numero_cuota' as const, header: 'Cuota #' },
    { key: 'prestamo_id' as const, header: 'ID Préstamo' },
    {
      key: 'monto' as const,
      header: 'Monto de Pago',
      render: (val: number) => `$${val.toLocaleString()}`,
    },
    {
      key: 'fecha_vencimiento' as const,
      header: 'Vencimiento',
    },
    {
      key: 'estado' as const,
      header: 'Estado de Pago',
      render: (val: string) => (
        <StatusBadge status={val} />
      ),
    },
    {
      key: 'id' as const,
      header: 'Acciones de Ventanilla',
      render: (_val: any, row: Cuota) => (
        <div className="flex gap-2">
          {row.estado !== 'Pagada' && (
            <button
              onClick={() => handleMarkAsPaid(row)}
              className="px-3 py-1 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded border border-green-500/30 text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <CheckCircle size={12} />
              Registrar Pago
            </button>
          )}
          <button
            onClick={() => row.id && handleDelete(row.id)}
            className="p-1.5 hover:bg-red-500/20 rounded border border-transparent hover:border-red-500/30 transition-all text-red-400"
            title="Eliminar Cuota"
          >
            <Trash2 size={14} />
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
          <h1 className="text-3xl font-bold text-[#F8FAFC]">Cronograma de Pagos</h1>
          <p className="text-[#94A3B8] mt-2">Gestión y Conciliación de Cuotas de Préstamos</p>
        </div>
        
        <button
          onClick={() => {
            setSubmitError(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg font-semibold shadow-lg shadow-[#3B82F6]/20 transition-all"
        >
          <Plus size={20} />
          Crear Nueva Cuota
        </button>
      </div>

      {/* Lookup Loan ID */}
      <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
        <h3 className="text-base font-semibold text-[#F8FAFC] mb-4 flex items-center gap-2">
          <Landmark size={18} className="text-[#3B82F6]" />
          Filtrar Cuotas por ID del Préstamo
        </h3>
        
        <form onSubmit={handleQuery} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">ID Préstamo</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-[#64748B]" size={18} />
              <input
                type="text"
                placeholder="Ingrese ID del préstamo (Ej. 1, 2, 3...) y presione Enter"
                value={loanId}
                onChange={(e) => setLoanId(e.target.value)}
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
              'Refrescar Cuotas'
            )}
          </button>
        </form>

        {error && (
          <div className="p-3 mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg font-mono">
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1E293B] rounded-lg p-4 border border-[#334155]">
          <p className="text-[#94A3B8] text-sm mb-1">Total Cuotas</p>
          <p className="text-[#F8FAFC] text-2xl font-bold">{cuotas.length}</p>
        </div>
        <div className="bg-[#1E293B] rounded-lg p-4 border border-[#334155]">
          <p className="text-[#10B981] text-sm mb-1">Pagadas</p>
          <p className="text-[#F8FAFC] text-2xl font-bold">{pagadas}</p>
        </div>
        <div className="bg-[#1E293B] rounded-lg p-4 border border-[#334155]">
          <p className="text-[#F59E0B] text-sm mb-1">Pendientes</p>
          <p className="text-[#F8FAFC] text-2xl font-bold">{pendientes}</p>
        </div>
        <div className="bg-[#1E293B] rounded-lg p-4 border border-[#334155]">
          <p className="text-[#EF4444] text-sm mb-1">Vencidas</p>
          <p className="text-[#F8FAFC] text-2xl font-bold">{vencidas}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1E293B] rounded-lg border border-[#334155] overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16 text-[#94A3B8]">
            <RefreshCw className="animate-spin mr-2 text-[#3B82F6]" />
            Cargando cuotas de ORDS...
          </div>
        ) : (
          <DataTable columns={columns} data={cuotas} />
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4">Próximas Fechas Críticas</h3>
          <div className="space-y-3">
            {cuotas.filter(c => c.estado !== 'Pagada').slice(0, 2).map((c) => (
              <div key={c.id} className="flex justify-between items-center p-3 bg-[#0F172A] rounded-lg">
                <span className="text-[#F8FAFC] font-medium">Cuota #{c.numero_cuota} - Préstamo #{c.prestamo_id}</span>
                <span className={`text-xs px-2 py-1 rounded font-mono ${
                  c.estado === 'Vencida' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {c.estado === 'Vencida' ? 'Vencida / Reclamación' : `Vence el ${c.fecha_vencimiento}`}
                </span>
              </div>
            ))}
            {cuotas.filter(c => c.estado !== 'Pagada').length === 0 && (
              <div className="p-4 bg-[#0F172A] text-center text-[#94A3B8] rounded-lg">
                🎉 No hay cuotas pendientes para este préstamo. ¡Todo al día!
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4">Resumen Financiero</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Total Cartera Proyectada</span>
              <span className="text-[#F8FAFC] font-medium">${totalMonto.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Monto Recaudado</span>
              <span className="text-[#10B981] font-medium">${totalPagado.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#94A3B8]">Pendiente de Cobro</span>
              <span className="text-[#F59E0B] font-medium">${totalPendiente.toLocaleString()}</span>
            </div>
            <div className="flex justify-between pt-3 border-t border-[#334155]">
              <span className="text-[#94A3B8]">Efectividad de Recaudo</span>
              <span className="text-[#3B82F6] font-bold">
                {totalMonto > 0 ? ((totalPagado / totalMonto) * 100).toFixed(1) : '0.0'}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Create Installment Modal */}
      <Modal
        isOpen={isModalOpen}
        title="Crear Nueva Cuota de Pago"
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
              onClick={handleCreateInstallment}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-[#3B82F6]/50 text-white rounded-lg transition-colors font-semibold flex items-center justify-center"
            >
              {saving ? <RefreshCw className="animate-spin" size={16} /> : 'Registrar Cuota'}
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
            <label className="block text-sm font-medium text-[#F8FAFC] mb-1">ID Préstamo Asociado</label>
            <input
              type="text"
              required
              value={newPrestamoId}
              onChange={(e) => setNewPrestamoId(e.target.value)}
              className="w-full px-3 py-2 bg-[#0F172A] border border-[#334155] rounded-lg text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#F8FAFC] mb-1">Número de Cuota</label>
            <input
              type="text"
              required
              placeholder="Ej. 1"
              value={newNumero}
              onChange={(e) => setNewNumero(e.target.value)}
              className="w-full px-3 py-2 bg-[#0F172A] border border-[#334155] rounded-lg text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#F8FAFC] mb-1">Monto de Cuota ($)</label>
            <input
              type="text"
              required
              placeholder="Ej. 250"
              value={newMonto}
              onChange={(e) => setNewMonto(e.target.value)}
              className="w-full px-3 py-2 bg-[#0F172A] border border-[#334155] rounded-lg text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#F8FAFC] mb-1">Fecha de Vencimiento</label>
            <input
              type="date"
              required
              value={newVencimiento}
              onChange={(e) => setNewVencimiento(e.target.value)}
              className="w-full px-3 py-2 bg-[#0F172A] border border-[#334155] rounded-lg text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
