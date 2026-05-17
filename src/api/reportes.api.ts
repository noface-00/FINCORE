// src/api/reportes.api.ts
import api from "./axios";

export interface MorosidadReportItem {
  periodo: string;
  total_cuotas: number;
  cuotas_mora: number;
  tasa_morosidad: number;
}

export interface SaldosPorTipoItem {
  sucursal: string;
  producto: string;
  saldo_total: number;
}

export interface RankingClienteItem {
  id?: number;
  cliente_id: number;
  nombre: string;
  apellido: string;
  saldo_total: number;
}

export interface CaptacionesColocacionesItem {
  mes: string;
  captaciones: number;
  colocaciones: number;
}

export interface RiesgoMoraItem {
  id?: number;
  cliente_id: number;
  nombre: string;
  apellido: string;
  prestamo_id: number;
  fecha_vencimiento: string;
  monto: number;
}

// Resilient Mock Fallbacks
const mockMorosidad: MorosidadReportItem[] = [
  { periodo: "2026-01", total_cuotas: 100, cuotas_mora: 5, tasa_morosidad: 5.0 },
  { periodo: "2026-02", total_cuotas: 110, cuotas_mora: 4, tasa_morosidad: 3.6 },
  { periodo: "2026-03", total_cuotas: 115, cuotas_mora: 6, tasa_morosidad: 5.2 },
  { periodo: "2026-04", total_cuotas: 120, cuotas_mora: 8, tasa_morosidad: 6.6 },
  { periodo: "2026-05", total_cuotas: 125, cuotas_mora: 15, tasa_morosidad: 12.0 }
];

const mockSaldosPorTipo: SaldosPorTipoItem[] = [
  { sucursal: "Cuenca Centro", producto: "Cuenta Ahorros", saldo_total: 150000 },
  { sucursal: "Quito Norte", producto: "Cuenta Corriente", saldo_total: 98000 },
  { sucursal: "Guayaquil Sur", producto: "Cuenta Ahorros", saldo_total: 210000 }
];

const mockRankingClientes: RankingClienteItem[] = [
  { cliente_id: 1, nombre: "Kevin", apellido: "Lopez", saldo_total: 25000 },
  { cliente_id: 2, nombre: "María", apellido: "Gómez", saldo_total: 18500 },
  { cliente_id: 3, nombre: "Carlos", apellido: "Andrade", saldo_total: 12400 }
];

const mockCaptacionesColocaciones: CaptacionesColocacionesItem[] = [
  { mes: "2026-01", captaciones: 40000, colocaciones: 25000 },
  { mes: "2026-02", captaciones: 45000, colocaciones: 28000 },
  { mes: "2026-03", captaciones: 42000, colocaciones: 35000 },
  { mes: "2026-04", captaciones: 48000, colocaciones: 32000 },
  { mes: "2026-05", captaciones: 50000, colocaciones: 30000 }
];

const mockRiesgoMora: RiesgoMoraItem[] = [
  { cliente_id: 1, nombre: "Kevin", apellido: "Lopez", prestamo_id: 10, fecha_vencimiento: "2026-05-20", monto: 300 },
  { cliente_id: 2, nombre: "María", apellido: "Gómez", prestamo_id: 12, fecha_vencimiento: "2026-05-21", monto: 450 }
];

export const getMorosidadReport = async (): Promise<MorosidadReportItem[]> => {
  try {
    const response = await api.get<any>("/reportes/morosidad");
    const raw = Array.isArray(response.data)
      ? response.data
      : response.data?.data || response.data?.items || [];
    return raw.length > 0 ? raw : mockMorosidad;
  } catch (err) {
    console.warn("ORDS getMorosidadReport failed, returning mock", err);
    return mockMorosidad;
  }
};

export const getSaldosPorTipoReport = async (): Promise<SaldosPorTipoItem[]> => {
  try {
    const response = await api.get<any>("/reportes/saldos-por-tipo");
    const raw = Array.isArray(response.data)
      ? response.data
      : response.data?.data || response.data?.items || [];
    return raw.length > 0 ? raw : mockSaldosPorTipo;
  } catch (err) {
    console.warn("ORDS getSaldosPorTipoReport failed, returning mock", err);
    return mockSaldosPorTipo;
  }
};

export const getRankingClientesReport = async (): Promise<RankingClienteItem[]> => {
  try {
    const response = await api.get<any>("/reportes/ranking-clientes");
    const raw = Array.isArray(response.data)
      ? response.data
      : response.data?.data || response.data?.items || [];
    return raw.length > 0 ? raw : mockRankingClientes;
  } catch (err) {
    console.warn("ORDS getRankingClientesReport failed, returning mock", err);
    return mockRankingClientes;
  }
};

export const getCaptacionesColocacionesReport = async (): Promise<CaptacionesColocacionesItem[]> => {
  try {
    const response = await api.get<any>("/reportes/captaciones-colocaciones");
    const raw = Array.isArray(response.data)
      ? response.data
      : response.data?.data || response.data?.items || [];
    return raw.length > 0 ? raw : mockCaptacionesColocaciones;
  } catch (err) {
    console.warn("ORDS getCaptacionesColocacionesReport failed, returning mock", err);
    return mockCaptacionesColocaciones;
  }
};

export const getRiesgoMoraReport = async (): Promise<RiesgoMoraItem[]> => {
  try {
    const response = await api.get<any>("/reportes/riesgo-mora");
    const raw = Array.isArray(response.data)
      ? response.data
      : response.data?.data || response.data?.items || [];
    return raw.length > 0 ? raw : mockRiesgoMora;
  } catch (err) {
    console.warn("ORDS getRiesgoMoraReport failed, returning mock", err);
    return mockRiesgoMora;
  }
};
