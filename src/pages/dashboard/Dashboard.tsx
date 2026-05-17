import React, { useMemo } from 'react';
import {
  Users,
  TrendingUp,
  Zap,
  CreditCard,
  AlertCircle,
  ActivitySquare,
  BarChart3,
  Wallet,
} from 'lucide-react';
import { KPIWidget } from '../../components/widgets/KPIWidget';
import {
  LineChartComponent,
  AreaChartComponent,
  BarChartComponent,
  PieChartComponent,
} from '../../components/charts/Charts';

// Mock data
const mockKPIs = {
  clientesRegistrados: 1250,
  capitalColocado: 5750000,
  liquidezGlobal: 2340000,
  totalPrestamos: 340,
  moraPromedio: 2.5,
  transaccionesDelDia: 128,
  balanceFinanciero: 8090000,
  flujoMensual: 1250000,
};

const flujoMensualData = [
  { name: 'Ene', value: 850000 },
  { name: 'Feb', value: 920000 },
  { name: 'Mar', value: 1100000 },
  { name: 'Abr', value: 980000 },
  { name: 'May', value: 1250000 },
];

const carteraData = [
  { name: 'Ahorros', value: 2100000 },
  { name: 'Corriente', value: 3200000 },
  { name: 'Inversión', value: 2790000 },
];

const prestamosPorTipo = [
  { name: 'Vivienda', value: 150 },
  { name: 'Vehículo', value: 120 },
  { name: 'Educación', value: 45 },
  { name: 'Comercial', value: 25 },
];

const transaccionesUltimos7Dias = [
  { name: 'Lun', value: 145 },
  { name: 'Mar', value: 120 },
  { name: 'Mié', value: 165 },
  { name: 'Jue', value: 112 },
  { name: 'Vie', value: 198 },
  { name: 'Sab', value: 89 },
  { name: 'Dom', value: 45 },
];

export function DashboardPage() {
  const user = React.useMemo(() => {
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return null;
      }
    }
    return null;
  }, []);

  const formattedData = useMemo(() => ({
    clientesRegistrados: mockKPIs.clientesRegistrados.toLocaleString(),
    capitalColocado: `$${(mockKPIs.capitalColocado / 1000000).toFixed(1)}M`,
    liquidezGlobal: `$${(mockKPIs.liquidezGlobal / 1000000).toFixed(2)}M`,
    totalPrestamos: mockKPIs.totalPrestamos.toLocaleString(),
    moraPromedio: `${mockKPIs.moraPromedio}%`,
    transaccionesDelDia: mockKPIs.transaccionesDelDia.toLocaleString(),
    balanceFinanciero: `$${(mockKPIs.balanceFinanciero / 1000000).toFixed(2)}M`,
    flujoMensual: `$${(mockKPIs.flujoMensual / 1000000).toFixed(2)}M`,
  }), []);

  return (
    <div className="space-y-6 font-sans">
      {/* Page Title & Account Owner Info banner */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-900/30 to-slate-800/40 rounded-xl border border-blue-500/20 backdrop-blur-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#F8FAFC]">
            ¡Hola de nuevo, {user ? `${user.nombre || user.nombres || ''} ${user.apellido || user.apellidos || ''}` : 'Usuario FinCore'}!
          </h1>
          <p className="text-[#94A3B8] mt-2 font-mono text-sm">
            {user?.email || 'admin@fincore.com'} • Nivel de Acceso: <span className="text-[#3B82F6] font-bold uppercase">{user?.rol || 'ADMINISTRADOR'}</span>
          </p>
        </div>
        {user && (
          <div className="flex gap-4 items-center">
            <div className="px-4 py-2 bg-slate-900/60 rounded-lg border border-slate-700/60 text-right">
              <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider">Sucursal</p>
              <p className="text-base font-bold text-[#10B981]">ID {user.sucursal_id || '1'}</p>
            </div>
            <div className="px-4 py-2 bg-slate-900/60 rounded-lg border border-slate-700/60 text-right">
              <p className="text-[10px] text-[#94A3B8] uppercase tracking-wider">Colaborador ID</p>
              <p className="text-base font-bold text-[#3B82F6]">{user.empleado_id || user.id || 'N/A'}</p>
            </div>
          </div>
        )}
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPIWidget
          label="Clientes Registrados"
          value={formattedData.clientesRegistrados}
          icon={<Users size={24} />}
          color="primary"
          change={{ value: 8, isPositive: true }}
        />
        <KPIWidget
          label="Capital Colocado"
          value={formattedData.capitalColocado}
          icon={<Wallet size={24} />}
          color="success"
          change={{ value: 12, isPositive: true }}
        />
        <KPIWidget
          label="Liquidez Global"
          value={formattedData.liquidezGlobal}
          icon={<Zap size={24} />}
          color="warning"
          change={{ value: 3, isPositive: false }}
        />
        <KPIWidget
          label="Total Préstamos"
          value={formattedData.totalPrestamos}
          icon={<CreditCard size={24} />}
          color="primary"
          change={{ value: 5, isPositive: true }}
        />
        <KPIWidget
          label="Mora Promedio"
          value={formattedData.moraPromedio}
          icon={<AlertCircle size={24} />}
          color="danger"
          change={{ value: 0.5, isPositive: false }}
        />
        <KPIWidget
          label="Transacciones Hoy"
          value={formattedData.transaccionesDelDia}
          icon={<ActivitySquare size={24} />}
          color="primary"
          change={{ value: 15, isPositive: true }}
        />
        <KPIWidget
          label="Balance Financiero"
          value={formattedData.balanceFinanciero}
          icon={<TrendingUp size={24} />}
          color="success"
          change={{ value: 7, isPositive: true }}
        />
        <KPIWidget
          label="Flujo Mensual"
          value={formattedData.flujoMensual}
          icon={<BarChart3 size={24} />}
          color="primary"
          change={{ value: 18, isPositive: true }}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LineChartComponent
          title="Flujo Mensual"
          data={flujoMensualData}
          height={300}
        />
        <AreaChartComponent
          title="Movimientos Últimos 7 Días"
          data={transaccionesUltimos7Dias}
          height={300}
        />
        <PieChartComponent
          title="Cartera por Tipo de Cuenta"
          data={carteraData}
          height={300}
        />
        <BarChartComponent
          title="Préstamos por Tipo"
          data={prestamosPorTipo}
          height={300}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Users className="text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-[#94A3B8] text-sm">Clientes Activos</p>
              <p className="text-[#F8FAFC] text-2xl font-bold">1,150</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-green-400" size={24} />
            </div>
            <div>
              <p className="text-[#94A3B8] text-sm">Crecimiento Mensual</p>
              <p className="text-[#F8FAFC] text-2xl font-bold">+12.5%</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-yellow-400" size={24} />
            </div>
            <div>
              <p className="text-[#94A3B8] text-sm">Cuentas en Alerta</p>
              <p className="text-[#F8FAFC] text-2xl font-bold">23</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
