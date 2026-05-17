import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
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

interface ChartProps {
  title: string;
  data: any[];
  height?: number;
}

export function LineChartComponent({ title, data, height = 300 }: ChartProps) {
  return (
    <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
      <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis stroke="#94A3B8" />
          <YAxis stroke="#94A3B8" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
            labelStyle={{ color: '#F8FAFC' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#3B82F6"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AreaChartComponent({ title, data, height = 300 }: ChartProps) {
  return (
    <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
      <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis stroke="#94A3B8" />
          <YAxis stroke="#94A3B8" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
            labelStyle={{ color: '#F8FAFC' }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#3B82F6"
            fillOpacity={1}
            fill="url(#colorValue)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BarChartComponent({ title, data, height = 300 }: ChartProps) {
  return (
    <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
      <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis stroke="#94A3B8" />
          <YAxis stroke="#94A3B8" />
          <Tooltip
            contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
            labelStyle={{ color: '#F8FAFC' }}
          />
          <Legend />
          <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PieChartComponent({ title, data, height = 300 }: ChartProps) {
  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="bg-[#1E293B] rounded-lg p-6 border border-[#334155]">
      <h3 className="text-lg font-semibold text-[#F8FAFC] mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155' }}
            labelStyle={{ color: '#F8FAFC' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
