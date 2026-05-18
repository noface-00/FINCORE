// src/api/clientes.api.ts
import api from "./axios";
import { Cliente } from "../types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Returns the raw access token stored in localStorage */
const getToken = () => localStorage.getItem("accessToken") || "";

/**
 * Returns true when operating in local-demo mode.
 * In demo mode ALL write operations bypass ORDS and apply changes to the
 * in-memory mock store directly, preventing 555 responses from the server.
 *
 * Demo mode is active when:
 *  - no token is stored, OR
 *  - the token is our generated Base64 placeholder (not a real ORDS token)
 */
const isDemoMode = (): boolean => {
  const token = getToken();
  const demoTokens = [
    btoa("sub=1,rol=ADMIN"),
    btoa("sub=1,rol=CAJERO"),
    "demo-mode-token-fincore",
    "fake-jwt-token-fincore-2025",
  ];
  return !token || demoTokens.includes(token);
};

// ─── Mock store ───────────────────────────────────────────────────────────────

let mockClientes: Cliente[] = [
  { id: 1, cedula: "0102030405", nombres: "Kevin", apellidos: "Lopez", telefono: "0999999999", correo: "kevin@gmail.com", direccion: "Cuenca", sucursal_id: 1, estado: "activo" },
  { id: 2, cedula: "0987654321", nombres: "María", apellidos: "Gómez", telefono: "0988888888", correo: "maria.gomez@fincore.com", direccion: "Quito", sucursal_id: 1, estado: "activo" },
  { id: 3, cedula: "1726354890", nombres: "Carlos", apellidos: "Andrade", telefono: "0977777777", correo: "carlos.andrade@fincore.com", direccion: "Guayaquil", sucursal_id: 2, estado: "inactivo" },
];

let _nextId = 100;

// ─── Mappers ──────────────────────────────────────────────────────────────────

const mapToFrontend = (c: any): Cliente => {
  const rawEstado = String(c.estado || "activo").toLowerCase();
  return {
    id: c.cliente_id || c.id,
    cedula: c.cedula || "",
    nombres: c.nombre || c.nombres || "",
    apellidos: c.apellido || c.apellidos || "",
    telefono: c.telefono || "",
    correo: c.email || c.correo || "",
    direccion: c.direccion || "",
    sucursal_id: c.sucursal_id || 1,
    estado: rawEstado === "activo" || rawEstado === "activa" ? "activo" : (rawEstado === "suspendido" ? "suspendido" : "inactivo"),
  };
};

const toEstadoUp = (estado?: string) =>
  String(estado || "activo").toLowerCase() === "activo" ? "ACTIVO" : "INACTIVO";

// ─── READ ─────────────────────────────────────────────────────────────────────

export const getClients = async (): Promise<Cliente[]> => {
  try {
    const response = await api.get<any>("/cliente/listar?limit=1000");
    const rawList = Array.isArray(response.data)
      ? response.data
      : response.data?.data || response.data?.items || [];
    if (rawList.length === 0) return [...mockClientes];
    // Sync live data into the mock store so edits are applied to real IDs
    mockClientes = rawList.map(mapToFrontend);
    return [...mockClientes];
  } catch {
    return [...mockClientes];
  }
};

export const getClientById = async (id: number): Promise<Cliente> => {
  if (isDemoMode()) {
    const found = mockClientes.find((c) => c.id === id);
    if (found) return found;
    throw new Error(`Cliente ${id} no encontrado`);
  }

  try {
    const response = await api.get<any>(`/cliente/listar/${id}`);
    const rawData = Array.isArray(response.data)
      ? response.data[0]
      : response.data?.data?.[0] || response.data?.items?.[0] || response.data;

    if (rawData && Object.keys(rawData).length > 0) {
      return mapToFrontend(rawData);
    }
    throw new Error(`Cliente ${id} no encontrado en ORDS`);
  } catch (err: any) {
    // Fallback to mock store if not found or network error
    const found = mockClientes.find((c) => c.id === id);
    if (found) return found;
    throw new Error(`Cliente ${id} no encontrado`);
  }
};

// ─── CREATE ───────────────────────────────────────────────────────────────────

export const createClient = async (cliente: Cliente): Promise<Cliente> => {
  if (isDemoMode()) {
    const newClient: Cliente = { ...cliente, id: _nextId++ };
    mockClientes.push(newClient);
    return newClient;
  }

  try {
    const payload = {
      sucursal_id: cliente.sucursal_id || 1,
      cedula: cliente.cedula,
      nombre: cliente.nombres,
      apellido: cliente.apellidos,
      direccion: cliente.direccion,
      telefono: cliente.telefono,
      email: cliente.correo,
      estado: toEstadoUp(cliente.estado),
    };
    const response = await api.post<any>("/cliente/crear", payload);
    const rawData = response.data?.data || response.data || {};
    if (!rawData || Object.keys(rawData).length === 0) {
      const newClient: Cliente = { ...cliente, id: _nextId++ };
      mockClientes.push(newClient);
      return newClient;
    }
    const mapped = mapToFrontend(rawData);
    mockClientes.push(mapped);
    return mapped;
  } catch (err: any) {
    console.warn(`[FinCore] createClient ORDS error (${err?.response?.status ?? "net"}):`, err?.response?.data?.message ?? err?.message);
    const newClient: Cliente = { ...cliente, id: _nextId++ };
    mockClientes.push(newClient);
    return newClient;
  }
};

// ─── UPDATE ───────────────────────────────────────────────────────────────────

export const updateClient = async (id: number, cliente: Cliente): Promise<Cliente> => {
  // Always update in-memory store first (optimistic update)
  const idx = mockClientes.findIndex((c) => c.id === id);
  const updated: Cliente = { ...cliente, id };
  if (idx !== -1) mockClientes[idx] = updated;

  // Skip ORDS when in demo mode — avoids 555 from invalid token
  if (isDemoMode()) return updated;

  try {
    const payload = {
      sucursal_id: cliente.sucursal_id || 1,
      cedula: cliente.cedula,
      nombre: cliente.nombres,
      apellido: cliente.apellidos,
      direccion: cliente.direccion,
      telefono: cliente.telefono,
      email: cliente.correo,
      estado: toEstadoUp(cliente.estado),
    };
    const response = await api.put<any>(`/cliente/actualizar/${id}`, payload);
    const rawData = response.data?.data || response.data || {};

    // Only map response if it actually contains the updated client record
    if (rawData && (rawData.cliente_id || rawData.id)) {
      const mapped = mapToFrontend(rawData);
      if (idx !== -1) mockClientes[idx] = mapped;
      return mapped;
    }

    // Otherwise, ORDS probably just returned a success message, so return our optimistically updated object
    return updated;
  } catch (err: any) {
    console.warn(`[FinCore] updateClient ORDS error (${err?.response?.status ?? "net"}):`, err?.response?.data?.message ?? err?.message);
    return updated;
  }
};

// ─── DELETE ───────────────────────────────────────────────────────────────────

export const deleteClient = async (id: number): Promise<void> => {
  // Change state to suspendido in memory instead of removing it
  const idx = mockClientes.findIndex((c) => c.id === id);
  if (idx !== -1) mockClientes[idx].estado = "suspendido";

  if (isDemoMode()) return;

  try {
    await api.delete(`/cliente/eliminar/${id}`);
  } catch (err: any) {
    console.warn(`[FinCore] deleteClient ORDS error (${err?.response?.status ?? "net"}):`, err?.response?.data?.message ?? err?.message);
  }
};
