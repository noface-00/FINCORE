// src/api/transacciones.api.ts
import api from "./axios";
import { Transaccion } from "../types";

const getToken = () => localStorage.getItem("accessToken") || "";

// ─── Mock store ───────────────────────────────────────────────────────────────
let mockTransacciones: Transaccion[] = [
  { id: 1, cuenta_id: 1, tipo: "Deposito",      monto: 500,  fecha: "2026-05-16", descripcion: "Deposito inicial",      estado: "completada" },
  { id: 2, cuenta_id: 1, tipo: "Retiro",        monto: 200,  fecha: "2026-05-16", descripcion: "Retiro cajero",         estado: "completada" },
  { id: 3, cuenta_id: 1, tipo: "Transferencia", monto: 300,  fecha: "2026-05-15", descripcion: "Transferencia interna", estado: "completada" },
  { id: 4, cuenta_id: 2, tipo: "Deposito",      monto: 1000, fecha: "2026-05-14", descripcion: "Deposito en línea",     estado: "completada" },
  { id: 5, cuenta_id: 2, tipo: "Retiro",        monto: 150,  fecha: "2026-05-13", descripcion: "Retiro ATM",            estado: "completada" },
];

// ─── Mapper ───────────────────────────────────────────────────────────────────
const mapToFrontend = (t: any): Transaccion => {
  const rawTipo = String(t.tipo || "DEPOSITO").toUpperCase();
  const tipo =
    rawTipo === "RETIRO"         ? "Retiro" :
    rawTipo === "TRANSFERENCIA"  ? "Transferencia" :
    "Deposito";

  return {
    id: t.transaccion_id || t.id,
    tipo,
    cuenta_id: t.cuenta_id || t.cuenta_origen_id || 1,
    monto: Number(t.monto || 0),
    fecha: t.fecha_registro || t.fecha || new Date().toISOString().split("T")[0],
    descripcion: t.descripcion || "",
    estado: String(t.estado || "completada").toLowerCase(),
  };
};

/**
 * Safely extract an array from any ORDS response shape:
 *   • direct array    → [{ ... }, ...]
 *   • ORDS auto-REST  → { items: [...], hasMore, count }
 *   • custom PL/SQL   → { status, total, data: [...] }
 *   • custom PL/SQL   → { status, total, transacciones: [...] }
 *   • any other shape → []
 */
const extractList = (d: any): any[] => {
  if (Array.isArray(d))              return d;
  if (Array.isArray(d?.data))        return d.data;
  if (Array.isArray(d?.items))       return d.items;
  if (Array.isArray(d?.transacciones)) return d.transacciones;
  if (Array.isArray(d?.movimientos)) return d.movimientos;
  return [];
};

// ─── READ — ALL ───────────────────────────────────────────────────────────────
export const getTransactions = async (daysBack = 90): Promise<Transaccion[]> => {
  // Build dynamic date range so ORDS returns results
  const now = new Date();
  const fechaFin   = now.toISOString().split("T")[0];
  const fechaInicio = new Date(now.setDate(now.getDate() - daysBack))
    .toISOString().split("T")[0];

  try {
    const response = await api.post<any>("/transacciones/listar", {
      access_token: getToken(),
      page: 1,
      limit: 200,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
    });

    const rawList = extractList(response.data);

    if (rawList.length === 0) {
      console.info("[FinCore] /transacciones/listar → 0 rows, using mock");
      return [...mockTransacciones];
    }
    console.info(`[FinCore] /transacciones/listar → ${rawList.length} transacciones`);
    return rawList.map(mapToFrontend);
  } catch (err: any) {
    console.warn("[FinCore] getTransactions ORDS error, using mock:", err?.message);
    return [...mockTransacciones];
  }
};

// ─── READ — BY ACCOUNT ───────────────────────────────────────────────────────
export const getAccountTransactions = async (
  idCuenta: number,
  page = 1,
  limit = 50
): Promise<Transaccion[]> => {
  try {
    const response = await api.post<any>(`/transacciones/cuenta/${idCuenta}`, {
      access_token: getToken(),
      page,
      limit,
    });

    const rawList = extractList(response.data);

    if (rawList.length === 0) {
      return mockTransacciones.filter((t) => t.cuenta_id === idCuenta);
    }
    console.info(`[FinCore] /transacciones/cuenta/${idCuenta} → ${rawList.length} movimientos`);
    return rawList.map(mapToFrontend);
  } catch (err: any) {
    console.warn(`[FinCore] getAccountTransactions(${idCuenta}) ORDS error, using mock:`, err?.message);
    return mockTransacciones.filter((t) => t.cuenta_id === idCuenta);
  }
};

// ─── DEPÓSITO ─────────────────────────────────────────────────────────────────
export const deposit = async (payload: {
  cuenta_id: number;
  monto: number;
  descripcion?: string;
}): Promise<Transaccion> => {
  try {
    const response = await api.post<any>("/transacciones/deposito", {
      access_token: getToken(),
      tipo: "DEPOSITO",
      monto: Number(payload.monto),
      descripcion: payload.descripcion || "Deposito ventanilla",
      cuenta_id: payload.cuenta_id,
    });
    const raw = extractList(response.data)[0] || response.data?.data || {};
    if (raw && raw.id) return mapToFrontend(raw);
  } catch (err: any) {
    console.warn("[FinCore] deposit ORDS error:", err?.message);
  }
  const newTx: Transaccion = {
    id: Date.now(),
    cuenta_id: payload.cuenta_id,
    tipo: "Deposito",
    monto: payload.monto,
    descripcion: payload.descripcion || "Deposito ventanilla",
    fecha: new Date().toISOString().split("T")[0],
    estado: "completada",
  };
  mockTransacciones.push(newTx);
  return newTx;
};

// ─── RETIRO ───────────────────────────────────────────────────────────────────
export const withdraw = async (payload: {
  cuenta_id: number;
  monto: number;
  descripcion?: string;
}): Promise<Transaccion> => {
  try {
    const response = await api.post<any>("/transacciones/deposito", {
      access_token: getToken(),
      tipo: "RETIRO",
      monto: Number(payload.monto),
      descripcion: payload.descripcion || "Retiro cajero",
      cuenta_id: payload.cuenta_id,
    });
    const raw = extractList(response.data)[0] || response.data?.data || {};
    if (raw && raw.id) return mapToFrontend(raw);
  } catch (err: any) {
    console.warn("[FinCore] withdraw ORDS error:", err?.message);
  }
  const newTx: Transaccion = {
    id: Date.now(),
    cuenta_id: payload.cuenta_id,
    tipo: "Retiro",
    monto: payload.monto,
    descripcion: payload.descripcion || "Retiro cajero",
    fecha: new Date().toISOString().split("T")[0],
    estado: "completada",
  };
  mockTransacciones.push(newTx);
  return newTx;
};

// ─── TRANSFERENCIA ────────────────────────────────────────────────────────────
export const transfer = async (payload: {
  cuenta_origen_id: number;
  cuenta_destino_id: number;
  monto: number;
  descripcion?: string;
}): Promise<Transaccion> => {
  try {
    const response = await api.post<any>("/transacciones/deposito", {
      access_token: getToken(),
      tipo: "TRANSFERENCIA",
      monto: Number(payload.monto),
      descripcion: payload.descripcion || "Transferencia interna",
      cuenta_origen_id: payload.cuenta_origen_id,
      cuenta_destino_id: payload.cuenta_destino_id,
    });
    const raw = extractList(response.data)[0] || response.data?.data || {};
    if (raw && raw.id) return mapToFrontend(raw);
  } catch (err: any) {
    console.warn("[FinCore] transfer ORDS error:", err?.message);
  }
  const newTx: Transaccion = {
    id: Date.now(),
    cuenta_id: payload.cuenta_origen_id,
    tipo: "Transferencia",
    monto: payload.monto,
    descripcion: payload.descripcion || "Transferencia interna",
    fecha: new Date().toISOString().split("T")[0],
    estado: "completada",
  };
  mockTransacciones.push(newTx);
  return newTx;
};

// ─── UPDATE DESCRIPCIÓN ───────────────────────────────────────────────────────
export const updateTransactionDescription = async (
  id: number,
  descripcion: string
): Promise<void> => {
  try {
    await api.put(`/transacciones/${id}`, {
      access_token: getToken(),
      descripcion,
    });
  } catch (err: any) {
    console.warn(`[FinCore] updateTransactionDescription(${id}) ORDS error:`, err?.message);
  }
  // Always update local cache
  const idx = mockTransacciones.findIndex((t) => t.id === id);
  if (idx !== -1) mockTransacciones[idx].descripcion = descripcion;
};
