// src/api/cuotas.api.ts
import api from "./axios";
import { Cuota } from "../types";

const getToken = () => localStorage.getItem("accessToken") || "";
const isDemoMode = (): boolean => {
  const token = getToken();
  const demoTokens = [btoa("sub=1,rol=ADMIN"), btoa("sub=1,rol=CAJERO"), "demo-mode-token-fincore", "fake-jwt-token-fincore-2025"];
  return !token || demoTokens.includes(token);
};

let mockCuotas: Cuota[] = [
  { id: 1, prestamo_id: 1, numero_cuota: 1, monto: 250, fecha_vencimiento: "2026-06-01", estado: "Pendiente" },
  { id: 2, prestamo_id: 1, numero_cuota: 2, monto: 250, fecha_vencimiento: "2026-07-01", estado: "Pendiente" },
  { id: 3, prestamo_id: 2, numero_cuota: 1, monto: 500, fecha_vencimiento: "2026-05-15", estado: "Vencida" },
];
let _nextId = 100;

const mapToFrontend = (c: any): Cuota => {
  const rawEstado = String(c.estado || "PENDIENTE").toUpperCase();
  let mappedEstado: "Pagada" | "Pendiente" | "Vencida" | "Mora" = "Pendiente";
  if (rawEstado === "PAGADA") mappedEstado = "Pagada";
  else if (rawEstado === "VENCIDA") mappedEstado = "Vencida";
  else if (rawEstado === "MORA" || rawEstado === "EN_MORA") mappedEstado = "Mora";
  return {
    id: c.cuota_id || c.id,
    prestamo_id: c.prestamo_id,
    numero_cuota: c.numero || c.numero_cuota || 1,
    monto: Number(c.monto || 0),
    fecha_vencimiento: c.fecha_vencimiento || new Date().toISOString().split("T")[0],
    estado: mappedEstado,
  };
};

const mapEstadoFrontend = (rawEstado: string): "Pagada" | "Pendiente" | "Vencida" | "Mora" => {
  const up = rawEstado.toUpperCase();
  if (up === "PAGADA") return "Pagada";
  if (up === "VENCIDA") return "Vencida";
  if (up === "MORA" || up === "EN_MORA") return "Mora";
  return "Pendiente";
};
// ── READ ──────────────────────────────────────────────────────────────────────
export const getInstallmentsForLoan = async (prestamoId: number): Promise<Cuota[]> => {
  try {
    const response = await api.get<any>(`/cuotas/listar/${prestamoId}`);
    const rawList = Array.isArray(response.data) ? response.data : response.data?.data || response.data?.items || [];
    if (rawList.length === 0) return mockCuotas.filter((c) => c.prestamo_id === prestamoId);
    const mapped = rawList.map(mapToFrontend);
    // Merge into mockCuotas for consistency
    mapped.forEach((c: Cuota) => {
      const idx = mockCuotas.findIndex(m => m.id === c.id);
      if (idx !== -1) mockCuotas[idx] = c; else mockCuotas.push(c);
    });
    return mapped;
  } catch {
    return mockCuotas.filter((c) => c.prestamo_id === prestamoId);
  }
};
// ── CREATE ────────────────────────────────────────────────────────────────────
export const createInstallment = async (cuota: Cuota): Promise<Cuota> => {
  if (isDemoMode()) {
    const newCuota: Cuota = { ...cuota, id: _nextId++, estado: "Pendiente" };
    mockCuotas.push(newCuota);
    return newCuota;
  }
  try {
    const payload = { access_token: getToken(), prestamo_id: cuota.prestamo_id, numero: cuota.numero_cuota, monto: Number(cuota.monto), fecha_vencimiento: cuota.fecha_vencimiento };
    const response = await api.post<any>("/cuotas/crear", payload);
    const rawData = response.data?.data || response.data || {};
    if (!rawData || Object.keys(rawData).length === 0) {
      const newCuota: Cuota = { ...cuota, id: _nextId++, estado: "Pendiente" };
      mockCuotas.push(newCuota);
      return newCuota;
    }
    const mapped = mapToFrontend(rawData);
    mockCuotas.push(mapped);
    return mapped;
  } catch (err: any) {
    console.warn(`[FinCore] createInstallment ORDS error (${err?.response?.status ?? "net"}):`, err?.response?.data?.message ?? err?.message);
    const newCuota: Cuota = { ...cuota, id: _nextId++, estado: "Pendiente" };
    mockCuotas.push(newCuota);
    return newCuota;
  }
};
// ── UPDATE ────────────────────────────────────────────────────────────────────
export const updateInstallment = async (id: number, payload: { estado: string; mora_dias?: number }): Promise<void> => {
  // Optimistic local update
  const idx = mockCuotas.findIndex((c) => c.id === id);
  if (idx !== -1) mockCuotas[idx].estado = mapEstadoFrontend(payload.estado);

  if (isDemoMode()) return;

  try {
    await api.put(`/cuotas/actualizar/${id}`, { access_token: getToken(), estado: payload.estado.toUpperCase(), mora_dias: payload.mora_dias ?? 0 });
  } catch (err: any) {
    console.warn(`[FinCore] updateInstallment ORDS error (${err?.response?.status ?? "net"}):`, err?.response?.data?.message ?? err?.message);
  }
};

// ── DELETE ────────────────────────────────────────────────────────────────────
export const deleteInstallment = async (id: number): Promise<void> => {
  const idx = mockCuotas.findIndex((c) => c.id === id);
  if (idx !== -1) mockCuotas.splice(idx, 1);

  if (isDemoMode()) return;

  try {
    await api.delete(`/cuotas/eliminar/${id}`);
  } catch (err: any) {
    console.warn(`[FinCore] deleteInstallment ORDS error (${err?.response?.status ?? "net"}):`, err?.response?.data?.message ?? err?.message);
  }
};
