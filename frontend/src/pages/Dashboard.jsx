import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  TrendingUp, 
  DollarSign, 
  Award, 
  ArrowUpRight, 
  Sparkles, 
  Send, 
  Bot, 
  ChevronRight 
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { fetchDashboardData } from '../services/api';

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

const pieData = [
  { name: 'AC', value: 38, color: '#10b981' },
  { name: 'Fridge', value: 22, color: '#3b82f6' },
  { name: 'Lights', value: 16, color: '#f59e0b' },
  { name: 'TV', value: 8, color: '#8b5cf6' },
  { name: 'Others', value: 16, color: '#64748b' },
];

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    fetchDashboardData().then((data) => {
      if (data) {
        setDashboardData(data);
      }
    });
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-400">Welcome back! Here's your energy overview.</p>
      </div>

      {/* Top 4 Stat Cards (Connected with Backend) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-slate-400 font-medium">Current Usage</span>
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
              <Zap className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-slate-100">
              {dashboardData ? dashboardData.current_usage : 'Loading...'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <ArrowUpRight className="w-4 h-4" />
            <span>8% vs last month</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-slate-400 font-medium">Next 30 Days Forecast</span>
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 border border-blue-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-slate-100">
              {dashboardData ? dashboardData.next_forecast : 'Loading...'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-blue-400 font-medium">
            <ArrowUpRight className="w-4 h-4" />
            <span>12% vs current</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-slate-400 font-medium">Estimated Bill</span>
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-slate-100">
              {dashboardData ? dashboardData.estimated_bill : 'Loading...'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <ArrowUpRight className="w-4 h-4" />
            <span>6% vs last month</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-slate-400 font-medium">Potential Saving</span>
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/20">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-extrabold text-slate-100">
              {dashboardData ? dashboardData.potential_saving : 'Loading...'}
            </span>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            ~ $12.43 / month
          </div>
        </div>
      </div>

      {/* Main Charts & Widget Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Energy Consumption Line Chart */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
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
                <XAxis dataKey="time" stroke="#64748b" textAnchor="end" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }} 
                />
                <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Assistant Chat Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <Bot className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-200 text-sm">AI Assistant</span>
            </div>
            <span className="text-xs text-emerald-400 font-semibold cursor-pointer hover:underline">New Chat</span>
          </div>

          <div className="py-4 space-y-3 flex-1 overflow-y-auto">
            <div className="bg-slate-800/50 rounded-2xl p-3.5 max-w-[85%] text-xs text-slate-200 ml-auto border border-slate-700/50">
              Why is my electricity bill high this month?
            </div>
            <div className="bg-slate-950/60 rounded-2xl p-3.5 max-w-[90%] text-xs text-slate-300 border border-slate-800">
              <p className="font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> EcoWatt AI
              </p>
              Your electricity bill is higher mainly because of increased AC usage (38% of total consumption) and longer evening usage. Try setting AC to 24–25°C.
            </div>
          </div>

          <div className="relative mt-2">
            <input 
              type="text" 
              placeholder="Ask anything..." 
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-10 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-500 text-slate-950 rounded-lg hover:bg-emerald-400 transition-colors">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Anomalies Table & Appliance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Anomalies Table */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-100 text-base">Recent Anomalies</h3>
            <span className="text-xs text-emerald-400 font-semibold cursor-pointer hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Usage</th>
                  <th className="pb-3">Severity</th>
                  <th className="pb-3">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                <tr>
                  <td className="py-3 font-medium">14 Jun 2024, 7:00 PM</td>
                  <td className="py-3">8.3 kWh</td>
                  <td className="py-3"><span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md font-bold">High</span></td>
                  <td className="py-3 text-slate-400">AC Overuse</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">21 Jun 2024, 11:00 PM</td>
                  <td className="py-3">7.1 kWh</td>
                  <td className="py-3"><span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md font-bold">Medium</span></td>
                  <td className="py-3 text-slate-400">High Night Usage</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">02 Jun 2024, 6:00 PM</td>
                  <td className="py-3">6.2 kWh</td>
                  <td className="py-3"><span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md font-bold">Low</span></td>
                  <td className="py-3 text-slate-400">Unusual Spike</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Appliance Breakdown Donut Chart */}
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
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />{item.name}</span>
                <span className="font-semibold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;