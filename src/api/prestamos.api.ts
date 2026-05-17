// src/api/prestamos.api.ts
import api from "./axios";
import { Prestamo } from "../types";

const getToken = () => localStorage.getItem("accessToken") || "";
const isDemoMode = (): boolean => {
  const token = getToken();
  const demoTokens = [btoa("sub=1,rol=ADMIN"), btoa("sub=1,rol=CAJERO"), "demo-mode-token-fincore", "fake-jwt-token-fincore-2025"];
  return !token || demoTokens.includes(token);
};

const getEmpleadoId = (): number => {
  try {
    const raw = localStorage.getItem("user");
    if (raw) return JSON.parse(raw)?.empleado_id || 1;
  } catch (_) {}
  return 1;
};

let mockPrestamos: Prestamo[] = [
  { id: 1, cliente_id: 1, monto: 5000,  tasa_interes: 12,   plazo: 24, estado: "Pendiente" },
  { id: 2, cliente_id: 2, monto: 10000, tasa_interes: 10.5, plazo: 36, estado: "Aprobado"  },
  { id: 3, cliente_id: 3, monto: 3000,  tasa_interes: 14,   plazo: 12, estado: "Vencido"   },
];
let _nextId = 100;

const mapToFrontend = (p: any): Prestamo => {
  const rawEstado = String(p.estado || "PENDIENTE").toUpperCase();
  let mappedEstado: "Pendiente" | "Aprobado" | "Rechazado" | "Pagado" | "Vencido" = "Pendiente";
  if (rawEstado === "APROBADO") mappedEstado = "Aprobado";
  else if (rawEstado === "RECHAZADO") mappedEstado = "Rechazado";
  else if (rawEstado === "PAGADO") mappedEstado = "Pagado";
  else if (rawEstado === "VENCIDO") mappedEstado = "Vencido";
  return {
    id: p.prestamo_id || p.id,
    cliente_id: p.cliente_id,
    monto: Number(p.monto || 0),
    tasa_interes: p.tasa_interes || 12,
    plazo: p.plazo_meses || p.plazo || 24,
    estado: mappedEstado,
  };
};

const toEstadoUp = (estado?: string): string => {
  const map: Record<string, string> = { pendiente: "PENDIENTE", aprobado: "APROBADO", rechazado: "RECHAZADO", pagado: "PAGADO", vencido: "VENCIDO" };
  return map[String(estado || "pendiente").toLowerCase()] || String(estado || "PENDIENTE").toUpperCase();
};

const mapEstadoFrontend = (s: string): "Pendiente" | "Aprobado" | "Rechazado" | "Pagado" | "Vencido" => {
  const up = s.toUpperCase();
  if (up === "APROBADO") return "Aprobado";
  if (up === "RECHAZADO") return "Rechazado";
  if (up === "PAGADO") return "Pagado";
  if (up === "VENCIDO") return "Vencido";
  return "Pendiente";
};

// ── READ ──────────────────────────────────────────────────────────────────────
export const getLoansByClient = async (clientId: number): Promise<Prestamo[]> => {
  try {
    const response = await api.get<any>(`/prestamo/cliente/${clientId}`);
    const rawList = Array.isArray(response.data) ? response.data : response.data?.data || response.data?.items || [];
    if (rawList.length === 0) return mockPrestamos.filter((p) => p.cliente_id === clientId);
    const mapped = rawList.map(mapToFrontend);
    mapped.forEach((p: Prestamo) => {
      const idx = mockPrestamos.findIndex(m => m.id === p.id);
      if (idx !== -1) mockPrestamos[idx] = p; else mockPrestamos.push(p);
    });
    return mapped;
  } catch {
    return mockPrestamos.filter((p) => p.cliente_id === clientId);
  }
};

// ── CREATE ────────────────────────────────────────────────────────────────────
export const createLoan = async (prestamo: Prestamo): Promise<Prestamo> => {
  if (isDemoMode()) {
    const newPrestamo: Prestamo = { ...prestamo, id: _nextId++, estado: "Pendiente" };
    mockPrestamos.push(newPrestamo);
    return newPrestamo;
  }
  try {
    const payload = { access_token: getToken(), cliente_id: prestamo.cliente_id, empleado_id: getEmpleadoId(), producto_id: 1, monto: Number(prestamo.monto), tasa_interes: Number(prestamo.tasa_interes || 12), plazo_meses: Number(prestamo.plazo || 24) };
    const response = await api.post<any>("/prestamo/crear", payload);
    const rawData = response.data?.data || response.data || {};
    if (!rawData || Object.keys(rawData).length === 0) {
      const newPrestamo: Prestamo = { ...prestamo, id: _nextId++, estado: "Pendiente" };
      mockPrestamos.push(newPrestamo);
      return newPrestamo;
    }
    const mapped = mapToFrontend(rawData);
    mockPrestamos.push(mapped);
    return mapped;
  } catch (err: any) {
    console.warn(`[FinCore] createLoan ORDS error (${err?.response?.status ?? "net"}):`, err?.response?.data?.message ?? err?.message);
    const newPrestamo: Prestamo = { ...prestamo, id: _nextId++, estado: "Pendiente" };
    mockPrestamos.push(newPrestamo);
    return newPrestamo;
  }
};

// ── UPDATE ────────────────────────────────────────────────────────────────────
export const updateLoan = async (id: number, payload: { estado: string }): Promise<void> => {
  const idx = mockPrestamos.findIndex((p) => p.id === id);
  if (idx !== -1) mockPrestamos[idx].estado = mapEstadoFrontend(payload.estado);

  if (isDemoMode()) return;

  try {
    await api.put(`/prestamo/actualizar/${id}`, { access_token: getToken(), estado: toEstadoUp(payload.estado) });
  } catch (err: any) {
    console.warn(`[FinCore] updateLoan ORDS error (${err?.response?.status ?? "net"}):`, err?.response?.data?.message ?? err?.message);
  }
};

// ── DELETE ────────────────────────────────────────────────────────────────────
export const deleteLoan = async (id: number): Promise<void> => {
  const idx = mockPrestamos.findIndex((p) => p.id === id);
  if (idx !== -1) mockPrestamos.splice(idx, 1);

  if (isDemoMode()) return;

  try {
    await api.delete(`/prestamo/eliminar/${id}`);
  } catch (err: any) {
    console.warn(`[FinCore] deleteLoan ORDS error (${err?.response?.status ?? "net"}):`, err?.response?.data?.message ?? err?.message);
  }
};
