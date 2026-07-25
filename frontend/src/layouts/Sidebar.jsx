import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  AlertTriangle, 
  Bot, 
  PieChart, 
  Lightbulb, 
  FileText, 
  UploadCloud, 
  Settings, 
  LogOut,
  Zap 
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/forecast', label: 'Forecast', icon: TrendingUp },
    { path: '/anomaly', label: 'Anomaly Detection', icon: AlertTriangle },
    { path: '/assistant', label: 'AI Assistant', icon: Bot },
    { path: '/appliance', label: 'Appliance Breakdown', icon: PieChart },
    { path: '/savings', label: 'Savings & Tips', icon: Lightbulb },
    { path: '/reports', label: 'Reports', icon: FileText },
    { path: '/upload', label: 'Data Upload', icon: UploadCloud },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0b1315] border-r border-slate-800/60 flex flex-col h-screen select-none">
      <div className="p-4 border-b border-slate-800/60 flex items-center gap-3">
        <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
          <Zap className="w-6 h-6 fill-emerald-400/20" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-wide text-slate-100">EcoWatt <span className="text-emerald-400">AI</span></h1>
          <p className="text-xs text-slate-400">Smart Energy. Better Tomorrow.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800/60">
        <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 mb-3">
          <p className="text-xs text-slate-400 font-medium">Plan</p>
          <p className="text-sm font-bold text-slate-200 mb-2">Free Plan</p>
          <button className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors">
            Upgrade
          </button>
        </div>
        <button className="flex items-center gap-3 px-3.5 py-2 w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl text-sm font-medium transition-colors">
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;