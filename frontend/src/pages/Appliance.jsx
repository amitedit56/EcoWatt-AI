import React from 'react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Zap, ShieldAlert, Cpu } from 'lucide-react';

const applianceData = [
  { name: 'Air Conditioner', usage: 93, cost: '$13.13', percentage: 38, color: '#10b981' },
  { name: 'Refrigerator', usage: 54, cost: '$7.60', percentage: 22, color: '#3b82f6' },
  { name: 'Lighting', usage: 39, cost: '$5.53', percentage: 16, color: '#f59e0b' },
  { name: 'Television & Setup', usage: 20, cost: '$2.76', percentage: 8, color: '#8b5cf6' },
  { name: 'Others / Utility', usage: 39, cost: '$5.54', percentage: 16, color: '#64748b' },
];

const Appliance = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Appliance Breakdown" 
        subtitle="Detailed analysis of power utilization per appliance to identify major energy consumers." 
      />

      {/* Grid Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Distribution Card */}
        <Card className="lg:col-span-1 flex flex-col justify-between">
          <h3 className="font-bold text-slate-100 text-base mb-4">Consumption Share</h3>
          <div className="h-56 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={applianceData} innerRadius={60} outerRadius={85} dataKey="percentage">
                  {applianceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-400">Total Usage</span>
              <span className="text-base font-extrabold text-slate-100">245 kWh</span>
            </div>
          </div>
          <p className="text-xs text-slate-400 text-center mt-2">AC consumes the highest proportion of your monthly electricity.</p>
        </Card>

        {/* Bar Comparison Card */}
        <Card className="lg:col-span-2 flex flex-col justify-between">
          <h3 className="font-bold text-slate-100 text-base mb-4">Usage by Appliance (kWh)</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={applianceData}>
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }} />
                <Bar dataKey="usage" fill="#10b981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card>
        <h3 className="font-bold text-slate-100 text-base mb-4">Appliance Performance Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3">Appliance Name</th>
                <th className="pb-3">Monthly Usage</th>
                <th className="pb-3">Estimated Cost</th>
                <th className="pb-3">Share (%)</th>
                <th className="pb-3">Status / Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {applianceData.map((item) => (
                <tr key={item.name}>
                  <td className="py-3.5 font-semibold text-slate-100 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </td>
                  <td className="py-3.5">{item.usage} kWh</td>
                  <td className="py-3.5 font-medium text-emerald-400">{item.cost}</td>
                  <td className="py-3.5">{item.percentage}%</td>
                  <td className="py-3.5 text-slate-400">
                    {item.percentage > 30 ? 'High load – consider servicing or thermostat adjustment' : 'Operating within normal range'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Appliance;