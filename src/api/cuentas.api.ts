// src/api/cuentas.api.ts
import api from "./axios";
import { Cuenta } from "../types";

const getToken = () => localStorage.getItem("accessToken") || "";

const isDemoMode = (): boolean => {
  const token = getToken();
  const demoTokens = [btoa("sub=1,rol=ADMIN"), btoa("sub=1,rol=CAJERO"), "demo-mode-token-fincore", "fake-jwt-token-fincore-2025"];
  return !token || demoTokens.includes(token);
};

let mockCuentas: Cuenta[] = [
  { id: 1, numero_cuenta: "2200123456", cliente_id: 1, tipo: "Ahorro",    saldo: 15400.50, estado: "activa" },
  { id: 2, numero_cuenta: "2200987654", cliente_id: 2, tipo: "Corriente", saldo: 8900.00,  estado: "activa" },
  { id: 3, numero_cuenta: "1100456123", cliente_id: 3, tipo: "Ahorro",    saldo: 2350.00,  estado: "inactiva" },
];
let _nextId = 100;

const mapToFrontend = (c: any): Cuenta => {
  // Normalize estado — ORDS may return ACTIVA, activa, ACTIVE, 1, etc.
  const rawEstado = String(c.estado || c.status || "activa").toLowerCase();
  const isActiva = rawEstado === "activa" || rawEstado === "active" || rawEstado === "1" || rawEstado === "true";

  // Normalize tipo — ORDS may use tipo, tipo_cuenta, producto_id, nombre_producto
  let tipo: "Ahorro" | "Corriente" = "Ahorro";
  const tipoCuenta = String(c.tipo || c.tipo_cuenta || c.nombre_producto || "").toLowerCase();
  const prodId = Number(c.producto_id || 0);
  if (tipoCuenta.includes("corriente") || prodId === 2) tipo = "Corriente";

  return {
    id: c.cuenta_id || c.id_cuenta || c.id,
    numero_cuenta: c.numero_cuenta || c.numero || c.nro_cuenta || "",
    cliente_id: c.cliente_id || c.id_cliente || 1,
    tipo,
    saldo: Number(c.saldo || c.saldo_disponible || c.saldo_actual || 0),
    estado: isActiva ? "activa" : "inactiva",
  };
};

const toEstadoUp = (estado?: string) =>
  String(estado || "activa").toLowerCase() === "activa" ? "ACTIVA" : "INACTIVA";

// ── READ ──────────────────────────────────────────────────────────────────────
export const getAccounts = async (): Promise<Cuenta[]> => {
  try {
    const response = await api.get<any>("/cuenta/listar");
    const d = response.data;

    // ORDS can return accounts in many shapes — handle all of them
    let rawList: any[] = [];

    if (Array.isArray(d)) {
      // Shape: direct array  →  [{ cuenta_id, ... }, ...]
      rawList = d;
    } else if (d && Array.isArray(d.items)) {
      // Shape: ORDS auto-REST  →  { items: [...], hasMore: bool, count: n }
      rawList = d.items;
    } else if (d && Array.isArray(d.data)) {
      // Shape: custom handler  →  { status: "success", data: [...] }
      rawList = d.data;
    } else if (d && Array.isArray(d.cuentas)) {
      // Shape: custom handler  →  { cuentas: [...] }
      rawList = d.cuentas;
    }

    if (rawList.length === 0) {
      console.info("[FinCore] /cuenta/listar returned 0 rows — using local mock data");
      return [...mockCuentas];
    }

    console.info(`[FinCore] /cuenta/listar → ${rawList.length} cuentas cargadas desde ORDS`);
    mockCuentas = rawList.map(mapToFrontend); // sync into local cache
    return [...mockCuentas];
  } catch (err: any) {
    console.warn("[FinCore] getAccounts ORDS error — using mock data:", err?.message);
    return [...mockCuentas];
  }
};

export const getAccountById = async (id: number): Promise<Cuenta> => {
  const found = mockCuentas.find((c) => c.id === id);
  if (found) return found;
  throw new Error(`Cuenta ${id} no encontrada`);
};


// ── CREATE ────────────────────────────────────────────────────────────────────
export const createAccount = async (cuenta: Cuenta): Promise<Cuenta> => {
  if (isDemoMode()) {
    const newAccount: Cuenta = { ...cuenta, id: _nextId++ };
    mockCuentas.push(newAccount);
    return newAccount;
  }
  try {
    const prodId = String(cuenta.tipo || "").toLowerCase() === "corriente" ? 2 : 1;
    const payload = { access_token: getToken(), cliente_id: cuenta.cliente_id || 1, producto_id: prodId, sucursal_id: 1, numero_cuenta: cuenta.numero_cuenta, saldo: Number(cuenta.saldo) };
    const response = await api.post<any>("/cuenta/crear", payload);
    const rawData = response.data?.data || response.data || {};
    if (!rawData || Object.keys(rawData).length === 0) {
      const newAccount: Cuenta = { ...cuenta, id: _nextId++ };
      mockCuentas.push(newAccount);
      return newAccount;
    }
    const mapped = mapToFrontend(rawData);
    mockCuentas.push(mapped);
    return mapped;
  } catch (err: any) {
    console.warn(`[FinCore] createAccount ORDS error (${err?.response?.status ?? "net"}):`, err?.response?.data?.message ?? err?.message);
    const newAccount: Cuenta = { ...cuenta, id: _nextId++ };
    mockCuentas.push(newAccount);
    return newAccount;
  }
};

// ── UPDATE ────────────────────────────────────────────────────────────────────
export const updateAccount = async (id: number, cuenta: Cuenta): Promise<Cuenta> => {
  const idx = mockCuentas.findIndex((c) => c.id === id);
  const updated: Cuenta = { ...cuenta, id };
  if (idx !== -1) mockCuentas[idx] = updated;

  if (isDemoMode()) return updated;

  try {
    const payload = { access_token: getToken(), saldo: Number(cuenta.saldo), estado: toEstadoUp(cuenta.estado) };
    const response = await api.put<any>(`/cuenta/actualizar/${id}`, payload);
    const rawData = response.data?.data || response.data || {};
    if (rawData && Object.keys(rawData).length > 0) {
      const mapped = mapToFrontend(rawData);
      if (idx !== -1) mockCuentas[idx] = mapped;
      return mapped;
    }
    return updated;
  } catch (err: any) {
    console.warn(`[FinCore] updateAccount ORDS error (${err?.response?.status ?? "net"}):`, err?.response?.data?.message ?? err?.message);
    return updated;
  }
};

// ── DELETE ────────────────────────────────────────────────────────────────────
export const deleteAccount = async (id: number): Promise<void> => {
  const idx = mockCuentas.findIndex((c) => c.id === id);
  if (idx !== -1) mockCuentas.splice(idx, 1);

  if (isDemoMode()) return;

  try {
    await api.delete(`/cuenta/eliminar/${id}`);
  } catch (err: any) {
    console.warn(`[FinCore] deleteAccount ORDS error (${err?.response?.status ?? "net"}):`, err?.response?.data?.message ?? err?.message);
  }
};
