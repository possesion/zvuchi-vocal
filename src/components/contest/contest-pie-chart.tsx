'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ChartData {
  name: string;
  value: number;
  percentage: string;
  [key: string]: string | number;
}

interface ContestPieChartProps {
  data: ChartData[];
  height?: number;
}

const COLORS = [
  '#8b5cf6', // фиолетовый
  '#ec4899', // розовый
  '#06b6d4', // голубой
  '#10b981', // зеленый
  '#f59e0b', // оранжевый
  '#ef4444', // красный
  '#3b82f6', // синий
  '#14b8a6', // бирюзовый
  '#f97316', // темно-оранжевый
  '#a855f7', // пурпурный
  '#22c55e', // лайм
  '#eab308', // желтый
  '#6366f1', // индиго
  '#84cc16', // лайм-зеленый
  '#f43f5e', // малиновый
  '#0ea5e9', // небесно-голубой
  '#d946ef', // фуксия
  '#64748b', // серо-синий
  '#fb923c', // светло-оранжевый
  '#4ade80', // светло-зеленый
  '#facc15', // янтарный
  '#c084fc', // светло-фиолетовый
  '#38bdf8', // светло-синий
  '#fb7185'  // светло-розовый
];

export function ContestPieChart({ data, height = 400 }: ContestPieChartProps) {
  if (data.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-2 backdrop-blur-md md:p-6">
      <h2 className="mb-6 text-center text-2xl font-bold text-white">
        Распределение голосов
      </h2>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart responsive>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => `${((entry.percent || 0) * 100).toFixed(1)}%`}
            outerRadius={height === 500 ? 120 : 100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid rgba(171, 21, 21, 0.3)',
              borderRadius: '8px',
              color: '#1a1a1a',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            itemStyle={{ color: '#1a1a1a' }}
            formatter={(value: number) => [`${value} голосов`, 'Голоса']}
          />
          <Legend 
            wrapperStyle={{ color: 'white', paddingTop: '20px' }}
            formatter={(value) => <span style={{ color: 'white' }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
