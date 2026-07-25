import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const StatsCard = ({ title, value, unit, change, icon: Icon, colorTheme = 'emerald' }) => {
  const themes = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/25',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-400 font-medium">{title}</span>
        <div className={`p-2.5 rounded-xl border ${themes[colorTheme] || themes.emerald}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-extrabold text-slate-100">{value}</span>
        {unit && <span className="text-sm font-semibold text-slate-400">{unit}</span>}
      </div>
      {change && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
          <ArrowUpRight className="w-4 h-4" />
          <span>{change}</span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;