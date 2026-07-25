import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import { TrendingUp, Calendar, Zap, ArrowUpRight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchProphetForecast } from '../services/api';

const Forecast = () => {
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPredicted, setTotalPredicted] = useState(0);
  const [dailyAvg, setDailyAvg] = useState(0);
  const [peakLoad, setPeakLoad] = useState(0);

  useEffect(() => {
    const getForecast = async () => {
      setLoading(true);
      // Fetching 30 days forecast from backend Prophet model
      const data = await fetchProphetForecast(30);
      
      if (data && data.forecast_data) {
        // Map backend response for the chart
        const formattedData = data.forecast_data.map((item, index) => ({
          day: `Day ${index + 1}`,
          predicted: parseFloat(item.yhat.toFixed(2)),
          lower: parseFloat(item.yhat_lower.toFixed(2)),
          upper: parseFloat(item.yhat_upper.toFixed(2)),
          date: item.ds.split('T')[0]
        }));

        setForecastData(formattedData);

        // Calculate summary stats dynamically
        const total = formattedData.reduce((acc, curr) => acc + curr.predicted, 0);
        setTotalPredicted(total.toFixed(0));
        setDailyAvg((total / formattedData.length).toFixed(2));
        
        const maxVal = Math.max(...formattedData.map(i => i.predicted));
        setPeakLoad(maxVal.toFixed(2));
      }
      setLoading(false);
    };

    getForecast();
  }, []);

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
            <h3 className="text-2xl font-extrabold text-slate-100">
              {loading ? 'Loading...' : `${totalPredicted} kWh`}
            </h3>
            <p className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" /> Prophet AI Model Active
            </p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium mb-1">Daily Average</p>
            <h3 className="text-2xl font-extrabold text-slate-100">
              {loading ? 'Loading...' : `${dailyAvg} kWh`}
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-1">Optimal range</p>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl">
            <Zap className="w-6 h-6" />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium mb-1">Peak Load Expected</p>
            <h3 className="text-2xl font-extrabold text-slate-100">
              {loading ? 'Loading...' : `${peakLoad} kWh`}
            </h3>
            <p className="text-xs text-amber-400 font-medium mt-1">Highest predicted spike</p>
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
            <p className="text-xs text-slate-400">Powered by Facebook Prophet ML Model</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-full" />
              <span className="text-slate-300">Predicted (yhat)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-slate-300">Upper Bound</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
              Generating 30-day AI forecast...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData}>
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#f8fafc' }} />
                <Line type="monotone" dataKey="predicted" stroke="#10b981" strokeWidth={3} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="upper" stroke="#3b82f6" strokeWidth={2} strokeDasharray="3 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Forecast;