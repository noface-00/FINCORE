// src/pages/banco/Banco.tsx
import React, { useState, useEffect } from 'react';
import { DataTable } from '../../components/shared/DataTable';
import { Transaccion } from '../../types';
import { StatusBadge } from '../../components/shared/StatusBadge';
import { ArrowUpRight, ArrowDownLeft, Search, RefreshCw, Layers, Trash2, Check, Plus } from 'lucide-react';
import { getBancoTransactions, deleteBancoTransaction, updateBancoTransactionStatus, createBancoTransaction } from '../../api/banco.api';

const mockBancoTransacciones: Transaccion[] = [
  {
    id: 1,
    cuenta_id: 1,
    tipo: 'Deposito',
    monto: 500000,
    fecha: '2025-05-16T10:30:00',
    descripcion: 'Depósito cliente #1001',
    estado: 'completada',
  },
  {
    id: 2,
    cuenta_id: 2,
    tipo: 'Retiro',
    monto: 250000,
    fecha: '2025-05-16T09:15:00',
    descripcion: 'Retiro en cajero automático',
    estado: 'completada',
  },
  {
    id: 3,
    cuenta_id: 3,
    tipo: 'Transferencia',
    monto: 100000,
    fecha: '2025-05-15T14:45:00',
    descripcion: 'Transferencia a otro banco',
    estado: 'completada',
  },
];

export function BancoPage() {
  const [cuentaId, setCuentaId] = useState<string>('');
  const [transacciones, setTransacciones] = useState<Transaccion[]>(mockBancoTransacciones);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchAccountTransactions = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedId = parseInt(cuentaId.trim());
    if (isNaN(parsedId)) {
      // If empty or invalid, reset to list all
      setTransacciones(mockBancoTransacciones);
      return;
    }

    setLoading(true);
    try {
      // Call new RESTful endpoint: GET /banco/cuentas/{id_cuenta}/transacciones
      const data = await getBancoTransactions(parsedId);
      setTransacciones(data);
    } catch (err: any) {
      setError(err?.message || 'Error al obtener transacciones de la cuenta');
      setTransacciones([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('¿Seguro que desea eliminar esta transacción?')) return;
    try {
      await deleteBancoTransaction(id);
      setTransacciones(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      setError(err?.message || 'Error al eliminar la transacción');
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await updateBancoTransactionStatus(id, newStatus);
      setTransacciones(prev => prev.map(t => t.id === id ? { ...t, estado: newStatus.toLowerCase() } : t));
    } catch (err: any) {
      setError(err?.message || 'Error al actualizar el estado');
    }
  };

  const handleCreate = async (tipo: 'DEPOSITO' | 'RETIRO') => {
    const parsedId = parseInt(cuentaId.trim());
    if (isNaN(parsedId)) {
      setError('Ingrese un ID de cuenta válido para crear una transacción');
      return;
    }
    const montoStr = window.prompt(`Ingrese el monto para el ${tipo}:`);
    if (!montoStr) return;
    const monto = parseFloat(montoStr);
    if (isNaN(monto) || monto <= 0) {
      setError('Monto inválido');
      return;
    }
    
    setLoading(true);
    try {
      await createBancoTransaction(parsedId, tipo, monto);
      // Refetch
      const data = await getBancoTransactions(parsedId);
      setTransacciones(data);
    } catch (err: any) {
      setError(err?.message || 'Error al crear transacción');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'tipo' as const,
      header: 'Tipo Movimiento',
      render: (val: string) => (
        <div className="flex items-center gap-2">
          {val === 'Deposito' ? (
            <ArrowDownLeft className="text-[#10B981]" size={18} />
          ) : val === 'Retiro' ? (
            <ArrowUpRight className="text-[#EF4444]" size={18} />
          ) : (
            <span>→</span>
          )}
          <span className="capitalize">{val}</span>
        </div>
      ),
    },
    {
      key: 'monto' as const,
      header: 'Monto',
      render: (val: number, row: Transaccion) => (
        <span className={row.tipo === 'Retiro' ? 'text-[#EF4444]' : 'text-[#10B981]'}>
          {row.tipo === 'Retiro' ? '-' : '+'}${val.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'fecha' as const,
      header: 'Hora de Transacción',
      render: (val: string) => {
        const date = new Date(val || '');
        return isNaN(date.getTime()) ? (val || '') : date.toLocaleString('es-CO');
      },
    },
    {
      key: 'descripcion' as const,
      header: 'Descripción',
    },
    {
      key: 'estado' as const,
      header: 'Estado',
      render: (val: string) => (
        <StatusBadge status={val as any} />
      ),
    },
    {
      key: 'id' as const,
      header: 'Acciones',
      render: (val: number, row: Transaccion) => (
        <div className="flex items-center gap-2">
          {row.estado?.toLowerCase() !== 'completada' && (
            <button onClick={() => handleUpdateStatus(val, 'COMPLETADA')} className="p-1.5 text-[#10B981] hover:bg-[#10B981]/10 rounded-lg transition-colors" title="Marcar como Completada">
              <Check size={16} />
            </button>
          )}
          <button onClick={() => handleDelete(val)} className="p-1.5 text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors" title="Eliminar">
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#F8FAFC]">Operaciones Bancarias</h1>
        <p className="text-[#94A3B8] mt-2">Historial Centralizado de Movimientos</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1E293B] rounded-lg p-4 border border-[#334155]">
          <p className="text-[#94A3B8] text-sm mb-1">Total Transacciones</p>
          <p className="text-[#F8FAFC] text-2xl font-bold">2,341</p>
          <p className="text-[#10B981] text-xs mt-2">↑ 12% vs mes anterior</p>
        </div>
        <div className="bg-[#1E293B] rounded-lg p-4 border border-[#334155]">
          <p className="text-[#94A3B8] text-sm mb-1">Volumen Movido</p>
          <p className="text-[#F8FAFC] text-2xl font-bold">$125.5M</p>
          <p className="text-[#10B981] text-xs mt-2">↑ 8% vs mes anterior</p>
        </div>
        <div className="bg-[#1E293B] rounded-lg p-4 border border-[#334155]">
          <p className="text-[#94A3B8] text-sm mb-1">Depósitos Totales</p>
          <p className="text-[#10B981] text-2xl font-bold">$85.2M</p>
          <p className="text-[#10B981] text-xs mt-2">↑ 15% vs mes anterior</p>
        </div>
        <div className="bg-[#1E293B] rounded-lg p-4 border border-[#334155]">
          <p className="text-[#94A3B8] text-sm mb-1">Retiros Totales</p>
          <p className="text-[#EF4444] text-2xl font-bold">$40.3M</p>
          <p className="text-[#EF4444] text-xs mt-2">↓ 5% vs mes anterior</p>
        </div>
      </div>

      {/* Lookup Account filter */}
      <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
        <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4 flex items-center gap-2">
          <Layers size={18} className="text-[#3B82F6]" />
          Consulta Movimientos por Cuenta (RESTful Endpoint)
        </h3>
        
        <form onSubmit={handleFetchAccountTransactions} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider mb-2">ID de la Cuenta Bancaria</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 text-[#64748B]" size={18} />
              <input
                type="text"
                placeholder="Ingrese ID (Ej. 1, 2, 3...) o deje vacío para ver todos"
                value={cuentaId}
                onChange={(e) => setCuentaId(e.target.value)}
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
              'Consultar Movimientos'
            )}
          </button>
        </form>

        {error && (
          <div className="p-3 mt-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg font-mono">
            ⚠️ {error}
          </div>
        )}

        {/* Actions for current account */}
        {cuentaId && !isNaN(parseInt(cuentaId)) && (
          <div className="mt-4 flex items-center gap-3 pt-4 border-t border-[#334155]">
            <span className="text-sm text-[#94A3B8]">Acciones Rápidas:</span>
            <button type="button" onClick={() => handleCreate('DEPOSITO')} className="px-4 py-2 bg-[#10B981]/10 text-[#10B981] hover:bg-[#10B981]/20 border border-[#10B981]/30 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5">
              <Plus size={16} /> Depósito
            </button>
            <button type="button" onClick={() => handleCreate('RETIRO')} className="px-4 py-2 bg-[#EF4444]/10 text-[#EF4444] hover:bg-[#EF4444]/20 border border-[#EF4444]/30 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5">
              <Plus size={16} /> Retiro
            </button>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="bg-[#1E293B] rounded-lg border border-[#334155] overflow-hidden">
        <div className="p-6 border-b border-[#334155] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#F8FAFC]">Resultados de Operaciones</h2>
          <span className="text-xs font-mono text-[#94A3B8] bg-[#0F172A] px-3 py-1 rounded-full border border-[#334155]">
            {transacciones.length} Transacciones Encontradas
          </span>
        </div>
        <DataTable columns={columns} data={transacciones} />
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4">Auditoría de Transacciones</h3>
          <div className="space-y-3">
            <div className="flex justify-between p-3 bg-[#0F172A] rounded-lg">
              <span className="text-[#94A3B8]">Total Reconciliado</span>
              <span className="text-[#10B981] font-bold">100%</span>
            </div>
            <div className="flex justify-between p-3 bg-[#0F172A] rounded-lg">
              <span className="text-[#94A3B8]">Diferencias Detectadas</span>
              <span className="text-[#EF4444] font-bold">0</span>
            </div>
            <div className="flex justify-between p-3 bg-[#0F172A] rounded-lg">
              <span className="text-[#94A3B8]">Última Reconciliación</span>
              <span className="text-[#F8FAFC] font-bold">16/05/2025 23:59</span>
            </div>
            <div className="flex justify-between p-3 bg-[#0F172A] rounded-lg">
              <span className="text-[#94A3B8]">Integridad de Datos</span>
              <span className="text-[#10B981] font-bold">Verificada ✓</span>
            </div>
          </div>
        </div>

        <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4">Conformidad Regulatoria</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-[#0F172A] rounded-lg">
              <span className="text-[#10B981] text-lg">✓</span>
              <span className="text-[#94A3B8]">Cumplimiento AML (Anti Money Laundering)</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#0F172A] rounded-lg">
              <span className="text-[#10B981] text-lg">✓</span>
              <span className="text-[#94A3B8]">Cumplimiento KYC (Know Your Customer)</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#0F172A] rounded-lg">
              <span className="text-[#10B981] text-lg">✓</span>
              <span className="text-[#94A3B8]">Normativa Superintendencia Financiera</span>
            </div>
            <div className="flex items-center gap-3 p-3 bg-[#0F172A] rounded-lg">
              <span className="text-[#10B981] text-lg">✓</span>
              <span className="text-[#94A3B8]">Seguridad de Datos Verificada</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
