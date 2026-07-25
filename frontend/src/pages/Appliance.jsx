import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { Zap, RefreshCw, Cpu, IndianRupee } from 'lucide-react';
import { fetchAppliancesData } from '../services/api';

const Appliance = () => {
  const [backendData, setBackendData] = useState({
    total_daily_consumption_kwh: 0,
    total_daily_cost_inr: 0,
    appliances: []
  });
  const [loading, setLoading] = useState(true);

  const loadAppliances = async () => {
    setLoading(true);
    const result = await fetchAppliancesData();
    if (result) {
      setBackendData(result);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAppliances();
  }, []);

  // Colors mapping for charts & indicators
  const chartColors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#64748b'];

  // Format backend items for Recharts & Display
  const formattedAppliances = backendData.appliances.map((item, index) => {
    const totalCon = backendData.total_daily_consumption_kwh || 1;
    const calculatedPercentage = Math.round((item.consumption_kwh / totalCon) * 100);
    return {
      ...item,
      percentage: isNaN(calculatedPercentage) ? 0 : calculatedPercentage,
      color: chartColors[index % chartColors.length]
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Appliance Breakdown" 
          subtitle="Detailed analysis of real-time power utilization and cost in Rupees per appliance." 
        />
        <button 
          onClick={loadAppliances}
          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 border border-slate-700 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
        </button>
      </div>

      {/* Summary Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Card className="flex items-center justify-between bg-slate-900/80 border-slate-800">
          <div>
            <p className="text-xs text-slate-400 font-medium mb-1">Total Daily Consumption</p>
            <h3 className="text-2xl font-extrabold text-slate-100">
              {loading ? '...' : `${backendData.total_daily_consumption_kwh} kWh`}
            </h3>
            <p className="text-xs text-emerald-400 font-medium mt-1">Fetched live from backend</p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
            <Zap className="w-6 h-6" />
          </div>
        </Card>

        <Card className="flex items-center justify-between bg-slate-900/80 border-slate-800">
          <div>
            <p className="text-xs text-slate-400 font-medium mb-1">Total Daily Estimated Cost</p>
            <h3 className="text-2xl font-extrabold text-slate-100 flex items-center">
              {loading ? '...' : `₹${backendData.total_daily_cost_inr}`}
            </h3>
            <p className="text-xs text-amber-400 font-medium mt-1">Calculated in Indian Rupees (INR)</p>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
            <IndianRupee className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Grid Overview with Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Distribution Card */}
        <Card className="lg:col-span-1 flex flex-col justify-between bg-slate-900/80 border-slate-800">
          <h3 className="font-bold text-slate-100 text-base mb-4">Consumption Share</h3>
          <div className="h-56 flex items-center justify-center relative">
            {loading ? (
              <div className="text-xs text-slate-400">Loading chart...</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={formattedAppliances} innerRadius={60} outerRadius={85} dataKey="consumption_kwh">
                      {formattedAppliances.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs text-slate-400">Total Usage</span>
                  <span className="text-base font-extrabold text-slate-100">{backendData.total_daily_consumption_kwh} kWh</span>
                </div>
              </>
            )}
          </div>
          <p className="text-xs text-slate-400 text-center mt-2">Active heavy appliances consume the highest proportion.</p>
        </Card>

        {/* Bar Comparison Card */}
        <Card className="lg:col-span-2 flex flex-col justify-between bg-slate-900/80 border-slate-800">
          <h3 className="font-bold text-slate-100 text-base mb-4">Usage by Appliance (kWh)</h3>
          <div className="h-60 w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">Loading bar graph...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={formattedAppliances}>
                  <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc', fontSize: '12px' }} />
                  <Bar dataKey="consumption_kwh" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card className="bg-slate-900/80 border-slate-800">
        <h3 className="font-bold text-slate-100 text-base mb-4 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-emerald-400" /> Appliance Performance Summary (Rupees Billing)
        </h3>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8 text-xs text-slate-400">Fetching live appliance logs...</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-3">Appliance Name</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Daily Consumption</th>
                  <th className="pb-3">Estimated Cost (INR)</th>
                  <th className="pb-3">Share (%)</th>
                  <th className="pb-3">Status / Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {formattedAppliances.map((item) => (
                  <tr key={item.id || item.name} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 font-semibold text-slate-100 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      {item.name}
                    </td>
                    <td className="py-3.5 text-slate-400">{item.category}</td>
                    <td className="py-3.5 font-bold text-emerald-400">{item.consumption_kwh} kWh</td>
                    <td className="py-3.5 font-extrabold text-amber-400">₹{item.cost_inr}</td>
                    <td className="py-3.5 font-medium">{item.percentage}%</td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-1 rounded-lg font-semibold text-[10px] ${
                        item.status === 'Active' || item.status === 'Running' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {item.status} - {item.percentage > 25 ? 'High load detected' : 'Normal range'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Appliance;