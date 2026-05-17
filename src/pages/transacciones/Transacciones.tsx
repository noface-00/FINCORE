// src/pages/transacciones/Transacciones.tsx
import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Search,
  RefreshCw,
  Edit2,
} from 'lucide-react';
import { Transaccion } from '../../types';
import { DataTable } from '../../components/shared/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { Modal } from '../../components/shared/Modal';
import {
  getTransactions,
  updateTransactionDescription,
} from '../../api/transacciones.api';

export function TransaccionesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'Deposito' | 'Retiro' | 'Transferencia'>('all');
  
  // Dynamic Ledger State
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTxId, setSelectedTxId] = useState<number | null>(null);
  const [newDesc, setNewDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchTransactionsList = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTransactions();
      setTransacciones(data);
    } catch (err: any) {
      setError(err?.message || 'Error al obtener el historial de transacciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionsList();
  }, []);

  const handleEditClick = (tx: Transaccion) => {
    if (tx.id) {
      setSelectedTxId(tx.id);
      setNewDesc(tx.descripcion || '');
      setModalError(null);
      setIsModalOpen(true);
    }
  };

  const handleUpdateDescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxId) return;
    setSaving(true);
    setModalError(null);
    try {
      await updateTransactionDescription(selectedTxId, newDesc);
      setIsModalOpen(false);
      fetchTransactionsList(); // Refresh list to see updated details
    } catch (err: any) {
      setModalError(err?.message || 'Error al actualizar la descripción');
    } finally {
      setSaving(false);
    }
  };

  const filteredTransacciones = transacciones.filter((t) => {
    const matchSearch = (t.descripcion || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || t.tipo === filterType;
    return matchSearch && matchType;
  });

  const totalIngresos = filteredTransacciones
    .filter((t) => t.tipo === 'Deposito')
    .reduce((sum, t) => sum + t.monto, 0);
  const totalEgresos = filteredTransacciones
    .filter((t) => t.tipo === 'Retiro')
    .reduce((sum, t) => sum + t.monto, 0);
  const balance = totalIngresos - totalEgresos;

  const getTransactionIcon = (tipo: string) => {
    switch (tipo) {
      case 'Deposito':
        return <ArrowDownLeft className="text-[#10B981]" size={18} />;
      case 'Retiro':
        return <ArrowUpRight className="text-[#EF4444]" size={18} />;
      case 'Transferencia':
        return <ArrowLeftRight className="text-[#3B82F6]" size={18} />;
      default:
        return null;
    }
  };

  const getTransactionColor = (tipo: string) => {
    switch (tipo) {
      case 'Deposito':
        return 'text-[#10B981]';
      case 'Retiro':
        return 'text-[#EF4444]';
      case 'Transferencia':
        return 'text-[#3B82F6]';
      default:
        return 'text-[#F8FAFC]';
    }
  };

  const columns = [
    {
      key: 'tipo' as const,
      header: 'Tipo',
      render: (val: string) => (
        <div className="flex items-center gap-2 font-medium">
          {getTransactionIcon(val)}
          <span className="capitalize">{val}</span>
        </div>
      ),
    },
    { key: 'descripcion' as const, header: 'Descripción' },
    {
      key: 'monto' as const,
      header: 'Monto de Operación',
      render: (val: number, row: Transaccion) => (
        <span className={`font-mono font-bold ${getTransactionColor(row.tipo)}`}>
          {row.tipo === 'Retiro' ? '-' : '+'}${val.toLocaleString()}
        </span>
      ),
    },
    { key: 'fecha' as const, header: 'Fecha Registro' },
    {
      key: 'estado' as const,
      header: 'Estado',
      render: (val: string) => (
        <StatusBadge status={val} />
      ),
    },
    {
      key: 'id' as const,
      header: 'Acciones de Auditoría',
      render: (_val: any, row: Transaccion) => (
        <button
          onClick={() => handleEditClick(row)}
          className="px-2.5 py-1 bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-[#94A3B8] hover:text-[#F8FAFC] rounded text-xs font-semibold flex items-center gap-1 transition-all"
        >
          <Edit2 size={12} />
          Corregir Glosa
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F8FAFC]">Libro Diario de Transacciones</h1>
          <p className="text-[#94A3B8] mt-2">Auditoría, Conciliación de Movimientos y Corrección de Glosas</p>
        </div>
        
        <button
          onClick={fetchTransactionsList}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-[#F8FAFC] rounded-lg transition-colors font-semibold disabled:opacity-50"
        >
          <RefreshCw className={loading ? 'animate-spin' : ''} size={18} />
          Refrescar Libro
        </button>
      </div>

      {error && (
        <div className="p-4 text-center text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg font-mono">
          ⚠️ {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#94A3B8] text-sm mb-1">Total Ingresos</p>
              <p className="text-[#10B981] text-2xl font-bold">
                {loading ? "..." : `$${totalIngresos.toLocaleString()}`}
              </p>
            </div>
            <ArrowDownLeft className="text-[#10B981] opacity-25" size={40} />
          </div>
        </div>

        <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#94A3B8] text-sm mb-1">Total Egresos</p>
              <p className="text-[#EF4444] text-2xl font-bold">
                {loading ? "..." : `$${totalEgresos.toLocaleString()}`}
              </p>
            </div>
            <ArrowUpRight className="text-[#EF4444] opacity-25" size={40} />
          </div>
        </div>

        <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[#94A3B8] text-sm mb-1">Balance Neto</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                {loading ? "..." : `$${balance.toLocaleString()}`}
              </p>
            </div>
            <ArrowLeftRight className="text-[#3B82F6] opacity-25" size={40} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 text-[#94A3B8]" size={20} />
          <input
            type="text"
            placeholder="Filtrar por glosa, beneficiario o detalles de la transacción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1E293B] border border-[#334155] rounded-lg text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#3B82F6] transition-colors"
          />
        </div>

        <div className="flex gap-2">
          {['all', 'Deposito', 'Retiro', 'Transferencia'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`px-4 py-2.5 rounded-lg transition-all capitalize font-semibold ${
                filterType === type
                  ? 'bg-[#3B82F6] text-white shadow-lg shadow-[#3B82F6]/20'
                  : 'bg-[#1E293B] text-[#94A3B8] border border-[#334155] hover:border-[#3B82F6]'
              }`}
            >
              {type === 'all' ? 'Todos' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#1E293B] rounded-lg border border-[#334155] overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-[#94A3B8] flex items-center justify-center">
            <RefreshCw className="animate-spin mr-2 text-[#3B82F6]" />
            Cargando historial desde Oracle ORDS...
          </div>
        ) : (
          <DataTable columns={columns} data={filteredTransacciones} />
        )}
      </div>

      {/* Timeline View */}
      <div className="bg-[#1E293B] rounded-lg border border-[#334155] p-6">
        <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4">Línea de Tiempo Operacional</h3>
        <div className="space-y-4">
          {filteredTransacciones.slice(0, 5).map((t) => (
            <div key={t.id} className="flex items-center gap-4 p-4 bg-[#0F172A] rounded-lg hover:bg-[#111827] transition-all border border-[#1E293B]">
              <div className="w-10 h-10 rounded-full bg-[#1E293B] flex items-center justify-center shrink-0">
                {getTransactionIcon(t.tipo)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#F8FAFC] font-semibold truncate capitalize">{t.descripcion || "Transacción de ventanilla"}</p>
                <p className="text-[#94A3B8] text-sm font-mono">{t.fecha}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`font-mono font-bold ${getTransactionColor(t.tipo)}`}>
                  {t.tipo === 'Retiro' ? '-' : '+'}${t.monto.toLocaleString()}
                </p>
                <span className="inline-block text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 mt-1 bg-green-500/10 text-green-400 rounded-full border border-green-500/10">
                  {t.estado}
                </span>
              </div>
            </div>
          ))}
          {filteredTransacciones.length === 0 && !loading && (
            <div className="py-8 text-center text-[#64748B]">
              No se encontraron registros de transacciones.
            </div>
          )}
        </div>
      </div>

      {/* Edit Description Modal */}
      <Modal
        isOpen={isModalOpen}
        title="Corregir Glosa / Descripción de Transacción"
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
              onClick={handleUpdateDescription}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-[#3B82F6]/50 text-white rounded-lg transition-colors font-semibold flex items-center justify-center"
            >
              {saving ? <RefreshCw className="animate-spin" size={16} /> : 'Guardar Glosa'}
            </button>
          </>
        }
      >
        {modalError && (
          <div className="p-3 mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg font-mono">
            ❌ {modalError}
          </div>
        )}
        <div className="space-y-4">
          <p className="text-xs text-[#94A3B8] leading-relaxed">
            ⚠️ <strong>Políticas de Auditoría:</strong> La modificación de glosas bancarias quedará registrada en el log de auditoría central de Oracle ORDS bajo tu usuario de cajero/administrador.
          </p>
          <div>
            <label className="block text-sm font-medium text-[#F8FAFC] mb-1">Nueva Descripción / Concepto</label>
            <input
              type="text"
              required
              placeholder="Ej. Depósito ventanilla corregido"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-3 py-2 bg-[#0F172A] border border-[#334155] rounded-lg text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
