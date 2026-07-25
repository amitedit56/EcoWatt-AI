import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const energyData = [
  { time: '12 AM', actual: 3.2, predicted: 3.0 },
  { time: '3 AM', actual: 2.8, predicted: 2.9 },
  { time: '6 AM', actual: 6.1, predicted: 5.8 },
  { time: '9 AM', actual: 4.5, predicted: 4.8 },
  { time: '12 PM', actual: 7.2, predicted: 7.0 },
  { time: '3 PM', actual: 8.5, predicted: 8.2 },
  { time: '6 PM', actual: 6.2, predicted: 6.5 },
  { time: '9 PM', actual: 8.1, predicted: 8.4 },
  { time: '12 AM', actual: 5.0, predicted: 5.2 },
];

const EnergyChart = () => {
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-100">Energy Consumption</h2>
          <p className="text-xs text-slate-400">Hourly tracking analysis</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-emerald-500 rounded-full" />
            <span className="text-slate-300">Actual Usage</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-blue-500 rounded-full border border-dashed" />
            <span className="text-slate-300">Predicted Usage</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={energyData}>
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 12 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }} />
            <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} dot={false} />
            <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EnergyChart;