// src/api/cuentas.api.ts
import api from "./axios";
import { Cuenta } from "../types";

// ── TYPES ─────────────────────────────────────────────────────────────────────
export interface CuentaDTO {
  cuenta_id?: number;
  id_cuenta?: number;
  id?: number;
  numero_cuenta?: string;
  numero?: string;
  nro_cuenta?: string;
  cliente_id?: number;
  id_cliente?: number;
  estado?: string | number | boolean;
  status?: string | number | boolean;
  tipo?: string;
  tipo_cuenta?: string;
  nombre_producto?: string;
  producto_id?: number;
  saldo?: number | string;
  saldo_disponible?: number | string;
  saldo_actual?: number | string;
}

interface ORDSResponse<T> {
  items?: T[];
  data?: T[];
}

// ── UTILS & AUTH ──────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem("accessToken") || "";

// Se precalculan los tokens codificados para evitar llamar a btoa() en cada petición
const DEMO_TOKENS = [
  btoa("sub=1,rol=ADMIN"),
  btoa("sub=1,rol=CAJERO"),
  "demo-mode-token-fincore",
  "fake-jwt-token-fincore-2025"
];

const isDemoMode = (): boolean => {
  const token = getToken();
  return !token || DEMO_TOKENS.includes(token);
};

// ── MOCK DATA (Fallback) ──────────────────────────────────────────────────────
let mockCuentas: Cuenta[] = [
  { id: 1, numero_cuenta: "2200123456", cliente_id: 1, tipo: "Ahorro", saldo: 15400.50, estado: "activa" },
  { id: 2, numero_cuenta: "2200987654", cliente_id: 2, tipo: "Corriente", saldo: 8900.00, estado: "activa" },
  { id: 3, numero_cuenta: "1100456123", cliente_id: 3, tipo: "Ahorro", saldo: 2350.00, estado: "inactiva" },
];
let _nextId = 100;

// ── NORMALIZADORES ────────────────────────────────────────────────────────────
const mapToFrontend = (c: CuentaDTO): Cuenta => {
  const rawEstado = String(c.estado ?? c.status ?? "activa").toLowerCase();
  const isActiva = rawEstado === "activa" || rawEstado === "active" || rawEstado === "1" || rawEstado === "true";

  let tipo: "Ahorro" | "Corriente" = "Ahorro";
  const tipoCuenta = String(c.tipo ?? c.tipo_cuenta ?? c.nombre_producto ?? "").toLowerCase();
  const prodId = Number(c.producto_id ?? 0);
  if (tipoCuenta.includes("corriente") || prodId === 2) tipo = "Corriente";

  return {
    id: c.cuenta_id ?? c.id_cuenta ?? c.id ?? 0,
    numero_cuenta: c.numero_cuenta ?? c.numero ?? c.nro_cuenta ?? "",
    cliente_id: c.cliente_id ?? c.id_cliente ?? 1,
    tipo,
    saldo: Number(c.saldo ?? c.saldo_disponible ?? c.saldo_actual ?? 0),
    estado: isActiva ? "activa" : "inactiva",
  };
};

const toEstadoUp = (estado?: string) =>
  String(estado || "activa").toLowerCase() === "activa" ? "ACTIVA" : "INACTIVA";

// ── API: READ ─────────────────────────────────────────────────────────────────

export const getAccounts = async (): Promise<Cuenta[]> => {
  if (isDemoMode()) return [...mockCuentas];

  try {
    const response = await api.get<ORDSResponse<CuentaDTO> | CuentaDTO[]>("/cuenta/listar");
    const d = response.data;
    let rawList: CuentaDTO[] = [];

    if (Array.isArray(d)) rawList = d;
    else if (d && Array.isArray(d.items)) rawList = d.items;
    else if (d && Array.isArray(d.data)) rawList = d.data;

    // Ya no devolvemos el mock si está vacío, devolvemos un array vacío real
    if (rawList.length === 0) return [];

    mockCuentas = rawList.map(mapToFrontend);
    return [...mockCuentas];
  } catch (err: any) {
    console.error("[FinCore] getAccounts ORDS error:", err?.message);
    // Lanzamos el error para que la interfaz sepa que falló el servidor real
    throw err;
  }
};

export const getAccountByIdOrNumber = async (identifier: number | string): Promise<Cuenta> => {
  if (isDemoMode()) {
    const found = mockCuentas.find(
      (c) => c.id === Number(identifier) || c.numero_cuenta === String(identifier)
    );
    if (found) return found;
    throw new Error(`Cuenta ${identifier} no encontrada en modo demo`);
  }

  try {
    const response = await api.get<ORDSResponse<CuentaDTO> | CuentaDTO>(`/cuenta/listar/${identifier}`);
    const d = response.data;
    const rawData = (d as ORDSResponse<CuentaDTO>).items ? (d as ORDSResponse<CuentaDTO>).items![0] : (d as CuentaDTO);

    if (!rawData || Object.keys(rawData).length === 0) {
      throw new Error("No data returned");
    }
    return mapToFrontend(rawData);
  } catch (err: any) {
    console.error(`[FinCore] getAccountByIdOrNumber error:`, err.message);
    // Evitamos devolver datos mockeados si el servidor real falló
    throw new Error(`Cuenta ${identifier} no disponible en el servidor`);
  }
};

// ── API: CREATE ───────────────────────────────────────────────────────────────
export const createAccount = async (cuenta: Omit<Cuenta, "id"> | Cuenta): Promise<Cuenta> => {
  if (isDemoMode()) {
    const newAccount: Cuenta = { ...cuenta, id: (cuenta as Cuenta).id || _nextId++ } as Cuenta;
    mockCuentas.push(newAccount);
    return newAccount;
  }

  try {
    const prodId = String(cuenta.tipo || "").toLowerCase() === "corriente" ? 2 : 1;

    const payload = {
      cliente_id: cuenta.cliente_id || 1,
      producto_id: prodId,
      sucursal_id: 1,
      numero_cuenta: cuenta.numero_cuenta,
      saldo: Number(cuenta.saldo)
    };

    await api.post<any>("/cuenta/crear", payload);

    // Para evitar desincronización de IDs, forzamos la actualización de la lista
    // para obtener el ID real que asignó la base de datos a la nueva cuenta.
    try {
      const cuentasActualizadas = await getAccounts();
      const cuentaCreada = cuentasActualizadas.find(c => c.numero_cuenta === cuenta.numero_cuenta);
      if (cuentaCreada) {
        return cuentaCreada;
      }
    } catch (e) {
      console.warn("No se pudo refrescar la lista de cuentas para obtener el ID real tras la creación");
    }

    // Fallback si la búsqueda falla
    const fallbackAccount: Cuenta = { ...cuenta, id: (cuenta as Cuenta).id || 0 } as Cuenta;
    return fallbackAccount;
  } catch (err: any) {
    console.error(`[FinCore] createAccount ORDS error:`, err?.response?.data || err?.message);
    throw err;
  }
};

// ── API: UPDATE ───────────────────────────────────────────────────────────────
export const updateAccount = async (id: number, cuenta: Cuenta): Promise<Cuenta> => {
  const updated: Cuenta = { ...cuenta, id };

  if (isDemoMode()) {
    const idx = mockCuentas.findIndex((c) => c.id === id);
    if (idx !== -1) mockCuentas[idx] = updated;
    return updated;
  }

  try {
    const payload = {
      saldo: Number(cuenta.saldo),
      estado: toEstadoUp(cuenta.estado)
    };
    await api.put<any>(`/cuenta/actualizar/${id}`, payload);

    const idx = mockCuentas.findIndex((c) => c.id === id);
    if (idx !== -1) mockCuentas[idx] = updated;
    
    return updated;
  } catch (err: any) {
    console.error(`[FinCore] updateAccount ORDS error:`, err?.response?.data || err?.message);
    throw err;
  }
};

// ── API: DELETE ───────────────────────────────────────────────────────────────
export const deleteAccount = async (id: number): Promise<void> => {
  if (isDemoMode()) {
    const idx = mockCuentas.findIndex((c) => c.id === id);
    if (idx !== -1) mockCuentas.splice(idx, 1);
    return;
  }

  try {
    await api.delete(`/cuenta/eliminar/${id}`);
    
    const idx = mockCuentas.findIndex((c) => c.id === id);
    if (idx !== -1) mockCuentas.splice(idx, 1);
  } catch (err: any) {
    console.error(`[FinCore] deleteAccount ORDS error:`, err?.response?.data || err?.message);
    throw err;
  }
};