import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const pieData = [
  { name: 'AC', value: 38, color: '#10b981' },
  { name: 'Fridge', value: 22, color: '#3b82f6' },
  { name: 'Lights', value: 16, color: '#f59e0b' },
  { name: 'TV', value: 8, color: '#8b5cf6' },
  { name: 'Others', value: 16, color: '#64748b' },
];

const PieChartCard = () => {
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-slate-100 text-base">Appliance Breakdown</h3>
        <span className="text-xs text-slate-400 bg-slate-800/80 px-2 py-1 rounded-lg">This Month</span>
      </div>
      <div className="h-40 flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={pieData} innerRadius={50} outerRadius={70} dataKey="value">
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-slate-400">Total</span>
          <span className="text-sm font-extrabold text-slate-100">245 kWh</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60 text-xs">
        {pieData.map((item) => (
          <div key={item.name} className="flex items-center justify-between text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}
            </span>
            <span className="font-semibold">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChartCard;