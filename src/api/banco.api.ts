// src/api/banco.api.ts
import api from "./axios";
import { Transaccion } from "../types";

// ─── GET: Listar transacciones de una cuenta ──────────────────────────────────
export const getBancoTransactions = async (cuentaId: number): Promise<Transaccion[]> => {
  try {
    const response = await api.get(`/banco/cuentas/${cuentaId}/transacciones`);
    const rawList = response.data?.items || response.data || [];

    return rawList.map((t: any) => ({
      id: t.transaccion_id || t.id,
      cuenta_id: t.cuenta_id || cuentaId,
      tipo: t.tipo_transaccion || t.tipo || 'Deposito',
      monto: Number(t.monto || 0),
      fecha: t.fecha_creacion || t.fecha || new Date().toISOString(),
      estado: String(t.estado || "completada").toLowerCase(),
      descripcion: t.descripcion || `${t.tipo_transaccion || 'Transacción'} - Cuenta ${cuentaId}`,
    }));
  } catch (error) {
    console.error(`[FinCore] Error GET /banco/cuentas/${cuentaId}/transacciones`, error);
    throw error;
  }
};

// ─── POST: Crear transacción (Depósito / Retiro) ──────────────────────────────
export const createBancoTransaction = async (
  cuentaId: number,
  tipoTransaccion: 'DEPOSITO' | 'RETIRO',
  monto: number
): Promise<any> => {
  const response = await api.post(`/banco/cuentas/${cuentaId}/transacciones`, {
    tipo_transaccion: tipoTransaccion,
    monto: monto,
  });
  return response.data;
};

// ─── PUT: Actualizar estado de una transacción ────────────────────────────────
export const updateBancoTransactionStatus = async (
  transaccionId: number,
  estado: string
): Promise<any> => {
  const response = await api.put(`/banco/transacciones/${transaccionId}`, {
    estado: estado,
  });
  return response.data;
};

// ─── DELETE: Eliminar una transacción ─────────────────────────────────────────
export const deleteBancoTransaction = async (
  transaccionId: number
): Promise<any> => {
  const response = await api.delete(`/banco/transacciones/${transaccionId}`);
  return response.data;
};
