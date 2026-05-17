// src/pages/reportes/Reportes.tsx
import React, { useState, useEffect } from 'react';
import {
  MorosidadReportItem,
  SaldosPorTipoItem,
  RankingClienteItem,
  CaptacionesColocacionesItem,
  RiesgoMoraItem,
  getMorosidadReport,
  getSaldosPorTipoReport,
  getRankingClientesReport,
  getCaptacionesColocacionesReport,
  getRiesgoMoraReport,
} from '../../api/reportes.api';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DataTable } from '../../components/shared/DataTable';
import { StatusBadge } from '../../components/shared/StatusBadge';
import {
  TrendingUp,
  Landmark,
  Award,
  AlertTriangle,
  Download,
  Printer,
  RefreshCw,
} from 'lucide-react';

export function ReportesPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // States
  const [morosidad, setMorosidad] = useState<MorosidadReportItem[]>([]);
  const [saldosPorTipo, setSaldosPorTipo] = useState<SaldosPorTipoItem[]>([]);
  const [rankingClientes, setRankingClientes] = useState<RankingClienteItem[]>([]);
  const [captacionesColocaciones, setCaptacionesColocaciones] = useState<CaptacionesColocacionesItem[]>([]);
  const [riesgoMora, setRiesgoMora] = useState<RiesgoMoraItem[]>([]);

  const fetchAllReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const [dataMora, dataSaldos, dataRank, dataCapt, dataRiesgo] = await Promise.all([
        getMorosidadReport(),
        getSaldosPorTipoReport(),
        getRankingClientesReport(),
        getCaptacionesColocacionesReport(),
        getRiesgoMoraReport(),
      ]);

      setMorosidad(dataMora);
      setSaldosPorTipo(dataSaldos);
      setRankingClientes(dataRank);
      setCaptacionesColocaciones(dataCapt);
      setRiesgoMora(dataRiesgo);
    } catch (err: any) {
      setError(err?.message || 'Error al cargar reportes financieros');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllReports();
  }, []);

  // Formatters & Aggregations
  const latestMorosidad = morosidad[morosidad.length - 1]?.tasa_morosidad || 0;
  const totalCaptaciones = captacionesColocaciones.reduce((sum, item) => sum + item.captaciones, 0);
  const totalColocaciones = captacionesColocaciones.reduce((sum, item) => sum + item.colocaciones, 0);
  
  // Custom Color Palettes
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const columnsRanking = [
    {
      key: 'cliente_id' as const,
      header: 'ID Cliente',
      render: (val: number) => `#${val}`,
    },
    {
      key: 'nombre' as const,
      header: 'Nombres',
      render: (_val: any, row: RankingClienteItem) => (
        <span className="capitalize font-semibold text-[#F8FAFC]">
          {row.nombre} {row.apellido}
        </span>
      ),
    },
    {
      key: 'saldo_total' as const,
      header: 'Saldo Acumulado',
      render: (val: number) => (
        <span className="font-mono text-[#10B981] font-bold">
          ${val.toLocaleString()}
        </span>
      ),
    },
  ];

  const columnsRiesgo = [
    {
      key: 'cliente_id' as const,
      header: 'Cliente',
      render: (_val: any, row: RiesgoMoraItem) => (
        <span className="capitalize text-[#F8FAFC]">
          {row.nombre} {row.apellido}
        </span>
      ),
    },
    {
      key: 'prestamo_id' as const,
      header: 'ID Préstamo',
      render: (val: number) => `#${val}`,
    },
    {
      key: 'monto' as const,
      header: 'Monto Cuota',
      render: (val: number) => `$${val.toLocaleString()}`,
    },
    {
      key: 'fecha_vencimiento' as const,
      header: 'Vencimiento',
      render: (val: string) => (
        <span className="text-red-400 font-semibold font-mono">
          {val}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#F8FAFC]">Reportes BI & Analytics</h1>
          <p className="text-[#94A3B8] mt-2">Inteligencia de Negocio y Análisis de Cartera en Tiempo Real</p>
        </div>
        
        <button
          onClick={fetchAllReports}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-[#F8FAFC] rounded-lg transition-colors font-semibold disabled:opacity-50"
        >
          <RefreshCw className={loading ? 'animate-spin' : ''} size={18} />
          Sincronizar
        </button>
      </div>

      {error && (
        <div className="p-4 text-center text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg font-mono">
          ⚠️ {error}
        </div>
      )}

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#1E293B] rounded-lg p-4 border border-[#334155]">
          <div className="flex items-center justify-between">
            <p className="text-[#94A3B8] text-sm">Índice Morosidad</p>
            <TrendingUp size={18} className="text-red-400" />
          </div>
          <p className="text-[#F8FAFC] text-2xl font-bold mt-2">{loading ? "..." : `${latestMorosidad}%`}</p>
          <p className="text-red-400 text-xs mt-2">Mes actual</p>
        </div>
        
        <div className="bg-[#1E293B] rounded-lg p-4 border border-[#334155]">
          <div className="flex items-center justify-between">
            <p className="text-[#94A3B8] text-sm">Total Captaciones</p>
            <Landmark size={18} className="text-[#10B981]" />
          </div>
          <p className="text-[#F8FAFC] text-2xl font-bold mt-2">{loading ? "..." : `$${(totalCaptaciones).toLocaleString()}`}</p>
          <p className="text-[#10B981] text-xs mt-2">Ahorro y corriente</p>
        </div>

        <div className="bg-[#1E293B] rounded-lg p-4 border border-[#334155]">
          <div className="flex items-center justify-between">
            <p className="text-[#94A3B8] text-sm">Total Colocaciones</p>
            <TrendingUp size={18} className="text-[#3B82F6]" />
          </div>
          <p className="text-[#F8FAFC] text-2xl font-bold mt-2">{loading ? "..." : `$${(totalColocaciones).toLocaleString()}`}</p>
          <p className="text-[#3B82F6] text-xs mt-2">Préstamos desembolsados</p>
        </div>

        <div className="bg-[#1E293B] rounded-lg p-4 border border-[#334155]">
          <div className="flex items-center justify-between">
            <p className="text-[#94A3B8] text-sm">Riesgo Inmediato</p>
            <AlertTriangle size={18} className="text-[#F59E0B]" />
          </div>
          <p className="text-[#F8FAFC] text-2xl font-bold mt-2">{loading ? "..." : riesgoMora.length}</p>
          <p className="text-[#F59E0B] text-xs mt-2">Cuotas vencerán {"<"} 7 días</p>
        </div>
      </div>

      {/* Main Business Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Captaciones vs Colocaciones chart */}
        <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4">Captaciones vs Colocaciones por Mes</h3>
          <div className="h-[300px]">
            {loading ? (
              <div className="h-full flex items-center justify-center text-[#94A3B8]">Cargando gráfica...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={captacionesColocaciones}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="mes" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
                    labelStyle={{ color: '#F8FAFC' }}
                  />
                  <Legend />
                  <Bar name="Captaciones (Depósitos)" dataKey="captaciones" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar name="Colocaciones (Préstamos)" dataKey="colocaciones" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Morosidad Trend */}
        <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4">Tendencia de Morosidad (%)</h3>
          <div className="h-[300px]">
            {loading ? (
              <div className="h-full flex items-center justify-center text-[#94A3B8]">Cargando gráfica...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={morosidad}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="periodo" stroke="#94A3B8" />
                  <YAxis stroke="#94A3B8" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
                    labelStyle={{ color: '#F8FAFC' }}
                  />
                  <Legend />
                  <Line
                    name="Tasa de Morosidad"
                    type="monotone"
                    dataKey="tasa_morosidad"
                    stroke="#EF4444"
                    strokeWidth={3}
                    dot={{ fill: '#EF4444', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Saldos por Tipo de Cuenta */}
        <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4">Distribución de Saldos por Tipo de Cuenta</h3>
          <div className="h-[300px] flex flex-col md:flex-row items-center justify-around">
            {loading ? (
              <div className="text-[#94A3B8]">Cargando gráfica...</div>
            ) : (
              <>
                <div className="w-full md:w-1/2 h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={saldosPorTipo}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="saldo_total"
                        nameKey="producto"
                      >
                        {saldosPorTipo.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
                        labelStyle={{ color: '#F8FAFC' }}
                        formatter={(val: number) => `$${val.toLocaleString()}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4 md:mt-0">
                  {saldosPorTipo.map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <div className="text-sm">
                        <span className="text-[#94A3B8] font-medium">{item.producto}</span>
                        <span className="text-[#F8FAFC] font-semibold ml-2">${item.saldo_total.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Risk Assessment Summary */}
        <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
          <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4">Evaluación de Riesgo Operacional</h3>
          <div className="space-y-4">
            <div className="p-4 bg-[#0F172A] rounded-lg border border-[#334155] flex items-start gap-3">
              <AlertTriangle className="text-[#F59E0B] shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-semibold text-[#F8FAFC]">Cobros Inmediatos Requeridos</h4>
                <p className="text-[#94A3B8] text-xs mt-1">
                  Se registran {riesgoMora.length} cuotas próximas a vencer en los siguientes 7 días. Se recomienda enviar alertas preventivas automatizadas vía correo electrónico.
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-[#0F172A] rounded-lg border border-[#334155] flex items-start gap-3">
              <Award className="text-[#10B981] shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-semibold text-[#F8FAFC]">Líderes de Captación</h4>
                <p className="text-[#94A3B8] text-xs mt-1">
                  El cliente {rankingClientes[0]?.nombre} {rankingClientes[0]?.apellido} encabeza el ranking bancario con un saldo consolidado de ${rankingClientes[0]?.saldo_total.toLocaleString()} USD.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Analytics Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients Table */}
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] overflow-hidden">
          <div className="p-6 border-b border-[#334155]">
            <h3 className="text-lg font-semibold text-[#F8FAFC]">Ranking de Clientes (Mayores Saldos)</h3>
          </div>
          {loading ? (
            <div className="py-12 text-center text-[#94A3B8]">Cargando clientes...</div>
          ) : (
            <DataTable columns={columnsRanking} data={rankingClientes} />
          )}
        </div>

        {/* Impending Overdue installments table */}
        <div className="bg-[#1E293B] rounded-lg border border-[#334155] overflow-hidden">
          <div className="p-6 border-b border-[#334155]">
            <h3 className="text-lg font-semibold text-[#F8FAFC]">Reporte de Riesgo (Vencimientos en 7 Días)</h3>
          </div>
          {loading ? (
            <div className="py-12 text-center text-[#94A3B8]">Cargando riesgos...</div>
          ) : (
            <DataTable columns={columnsRiesgo} data={riesgoMora} />
          )}
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
        <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4">Exportar Data BI</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => window.print()}
            className="px-5 py-2.5 bg-[#3B82F6]/20 hover:bg-[#3B82F6]/30 text-[#3B82F6] rounded-lg border border-[#3B82F6]/30 transition-colors font-semibold flex items-center gap-2"
          >
            <Printer size={18} />
            Imprimir Reporte Ejecutivo
          </button>
          
          <button
            onClick={() => alert('Descargando archivo Excel en formato comprimido (.xlsx)...')}
            className="px-5 py-2.5 bg-[#10B981]/20 hover:bg-[#10B981]/30 text-[#10B981] rounded-lg border border-[#10B981]/30 transition-colors font-semibold flex items-center gap-2"
          >
            <Download size={18} />
            Exportar Hoja de Cálculo
          </button>
        </div>
      </div>
    </div>
  );
}
