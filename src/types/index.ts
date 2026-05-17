export interface User {
  id?: number;
  empleado_id?: number;
  nombre?: string;
  apellido?: string;
  email: string;
  rol?: string;
  sucursal_id?: number;
  name?: string; // fallback
  role?: string; // fallback
}

export interface AuthResponse {
  status: string;
  message: string;
  data: {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    user: User;
  };
}

export interface Cliente {
  id?: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  correo: string;
  direccion: string;
  sucursal_id: number;
  estado: string; // e.g. 'Activo', 'Inactivo'
}

export interface Cuenta {
  id?: number;
  numero_cuenta: string;
  cliente_id: number;
  tipo: 'Ahorro' | 'Corriente';
  saldo: number;
  estado: string;
}

export interface Prestamo {
  id?: number;
  cliente_id: number;
  monto: number;
  tasa_interes: number;
  plazo: number;
  estado: string; // e.g. 'Pendiente', 'Aprobado', 'Rechazado'
}

export interface Cuota {
  id?: number;
  prestamo_id: number;
  numero_cuota: number;
  monto: number;
  fecha_vencimiento: string;
  estado: 'Pagada' | 'Pendiente' | 'Vencida' | 'Mora';
}

export interface Transaccion {
  id?: number;
  tipo: 'Deposito' | 'Retiro' | 'Transferencia';
  cuenta_id?: number;
  numero_cuenta_origen?: string;
  numero_cuenta_destino?: string;
  monto: number;
  fecha?: string;
  descripcion?: string;
  estado?: 'completada' | 'pendiente' | 'rechazada' | string;
}

export interface ReporteLiquidez {
  total_depositos: number;
  total_retiros: number;
  liquidez_neta: number;
}

export interface ReporteMorosidad {
  cartera_vencida: number;
  cartera_al_dia: number;
  indice_morosidad: number;
}

export interface ReporteRiesgo {
  nivel_riesgo: 'Bajo' | 'Medio' | 'Alto';
  exposicion_total: number;
}

export interface RankingCartera {
  cliente_id: number;
  nombre_cliente: string;
  total_prestado: number;
}
