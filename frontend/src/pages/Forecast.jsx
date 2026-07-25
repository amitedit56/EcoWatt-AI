import React from 'react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import { TrendingUp, Calendar, Zap, ArrowUpRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const forecastTrendData = [
  { day: 'Day 1', predicted: 9.2, historical: 8.5 },
  { day: 'Day 5', predicted: 8.8, historical: 9.0 },
  { day: 'Day 10', predicted: 10.5, historical: 9.8 },
  { day: 'Day 15', predicted: 9.1, historical: 8.9 },
  { day: 'Day 20', predicted: 11.2, historical: 10.4 },
  { day: 'Day 25', predicted: 9.5, historical: 9.2 },
  { day: 'Day 30', predicted: 8.9, historical: 8.6 },
];

const Forecast = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Energy Forecast" 
        subtitle="AI-driven predictions for your next 30 days energy consumption patterns." 
      />

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium mb-1">Predicted Total (30 Days)</p>
            <h3 className="text-2xl font-extrabold text-slate-100">275 kWh</h3>
            <p className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> 12% vs current month
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium mb-1">Daily Average</p>
            <h3 className="text-2xl font-extrabold text-slate-100">9.17 kWh</h3>
            <p className="text-xs text-slate-400 font-medium mt-1">Optimal range</p>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl">
            <Zap className="w-6 h-6" />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium mb-1">Peak Load Expected</p>
            <h3 className="text-2xl font-extrabold text-slate-100">12.3 kWh</h3>
            <p className="text-xs text-amber-400 font-medium mt-1">Expected on Day 20</p>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
            <Calendar className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Main Forecast Graph */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-100 text-base">30-Day Consumption Trend</h3>
            <p className="text-xs text-slate-400">Comparing forecasted vs historical moving average</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-full" />
              <span className="text-slate-300">Predicted</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-slate-600 rounded-full" />
              <span className="text-slate-300">Historical Average</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={forecastTrendData}>
              <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }} />
              <Line type="monotone" dataKey="predicted" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="historical" stroke="#64748b" strokeWidth={2} strokeDasharray="3 3" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default Forecast;