import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  TrendingUp, 
  DollarSign, 
  Award, 
  ArrowUpRight, 
  Sparkles, 
  Send, 
  Bot, 
  ChevronRight,
  Loader2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { apiClient, sendAssistantMessage } from '../services/api';

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

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#64748b'];

const Dashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mini AI Assistant widget state (separate small chat, lives only on this card)
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'ai', text: 'Ask me anything about your energy usage!' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatThinking, setChatThinking] = useState(false);
  const [chatError, setChatError] = useState('');
  const chatContainerRef = useRef(null);
  const isSendingRef = useRef(false);

  useEffect(() => {
    // Scroll only the chat box's own scroll container, never the outer page.
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [chatMessages, chatThinking]);

  const handleNewChat = () => {
    setChatMessages([{ id: 1, sender: 'ai', text: 'Ask me anything about your energy usage!' }]);
    setChatError('');
  };

  const handleChatSend = async (e) => {
    e.preventDefault();
    const trimmed = chatInput.trim();
    if (!trimmed || isSendingRef.current) return;
    isSendingRef.current = true;

    const userMessage = { id: Date.now(), sender: 'user', text: trimmed };
    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    setChatInput('');
    setChatError('');
    setChatThinking(true);

    try {
      const data = await sendAssistantMessage(trimmed, chatMessages);
      setChatMessages((prev) => [...prev, { id: Date.now() + 1, sender: 'ai', text: data.reply }]);
    } catch (err) {
      setChatError(err.response?.data?.detail || 'Could not reach the AI assistant.');
    } finally {
      setChatThinking(false);
      isSendingRef.current = false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await apiClient.get('/api/dashboard-data');
        if (response.data) {
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error('Error fetching dynamic dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const recentAnomalies = dashboardData?.recent_anomalies || [];
  const pieData = dashboardData?.appliance_breakdown || [];
  const totalKwhNum = dashboardData?.total_consumption || '245 kWh';

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
        <p className="text-sm text-slate-400">Welcome back! Here's your real-time energy overview.</p>
      </div>

      {/* Top 4 Stat Cards */}
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
              {loading ? 'Loading...' : totalKwhNum}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <ArrowUpRight className="w-4 h-4" />
            <span>Synced with upload</span>
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
              {loading ? 'Loading...' : totalKwhNum}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-blue-400 font-medium">
            <ArrowUpRight className="w-4 h-4" />
            <span>Prophet AI Model</span>
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
              {loading ? 'Loading...' : (dashboardData?.estimated_bill || '$34.56')}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <ArrowUpRight className="w-4 h-4" />
            <span>Calculated via tariff</span>
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
            <span className="text-3xl font-extrabold text-slate-100">18%</span>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Optimized via AI Tips
          </div>
        </div>
      </div>

      {/* Main Charts & Widget Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Energy Consumption Line Chart */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between h-[420px]">
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
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between h-[420px]">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <Bot className="w-5 h-5" />
              </div>
              <span className="font-bold text-slate-200 text-sm">AI Assistant</span>
            </div>
            <span onClick={handleNewChat} className="text-xs text-emerald-400 font-semibold cursor-pointer hover:underline">New Chat</span>
          </div>

          <div ref={chatContainerRef} className="py-4 space-y-3 flex-1 min-h-0 overflow-y-auto">
            {chatMessages.map((msg) => (
              msg.sender === 'user' ? (
                <div key={msg.id} className="bg-slate-800/50 rounded-2xl p-3.5 max-w-[85%] text-xs text-slate-200 ml-auto border border-slate-700/50">
                  {msg.text}
                </div>
              ) : (
                <div key={msg.id} className="bg-slate-950/60 rounded-2xl p-3.5 max-w-[90%] text-xs text-slate-300 border border-slate-800">
                  <p className="font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> EcoWatt AI
                  </p>
                  {msg.text}
                </div>
              )
            ))}

            {chatThinking && (
              <div className="bg-slate-950/60 rounded-2xl p-3.5 max-w-[90%] text-xs text-slate-400 border border-slate-800 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Thinking...
              </div>
            )}

            {chatError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs">
                {chatError}
              </div>
            )}

          </div>

          <form onSubmit={handleChatSend} className="relative mt-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask anything..."
              disabled={chatThinking}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-10 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 disabled:opacity-60"
            />
            <button type="submit" disabled={chatThinking} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-emerald-500 text-slate-950 rounded-lg hover:bg-emerald-400 transition-colors disabled:opacity-60">
              {chatThinking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Grid: Anomalies Table & Appliance Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Anomalies Table */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-100 text-base">Recent Anomalies (Live Synced)</h3>
            <span 
              onClick={() => navigate('/anomaly')}
              className="text-xs text-emerald-400 font-semibold cursor-pointer hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="overflow-x-auto">
            {recentAnomalies.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">No recent anomalies detected.</div>
            ) : (
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
                  {recentAnomalies.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 font-medium">{item.date}</td>
                      <td className="py-3">{item.usage}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-md font-bold border ${
                          item.severity === 'High' 
                            ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                            : item.severity === 'Medium' 
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                          {item.severity}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400">{item.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Appliance Breakdown Donut Chart */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-slate-100 text-base">Appliance Breakdown</h3>
            <span className="text-xs text-slate-400 bg-slate-800/80 px-2 py-1 rounded-lg">Dynamic Scale</span>
          </div>
          <div className="h-40 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={50} outerRadius={70} dataKey="percentage">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-slate-400">Total</span>
              <span className="text-sm font-extrabold text-slate-100">{totalKwhNum}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60 text-xs">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  {item.name}
                </span>
                <span className="font-semibold">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;