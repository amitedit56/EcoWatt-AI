import React from 'react';
import { Zap } from 'lucide-react';

const Logo = () => {
  return (
    <div className="flex items-center gap-3 px-2 py-4">
      <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
        <Zap className="w-6 h-6 fill-emerald-400/20" />
      </div>
      <div>
        <h1 className="font-bold text-lg tracking-wide text-slate-100">EcoWatt <span className="text-emerald-400">AI</span></h1>
        <p className="text-xs text-slate-400">Smart Energy. Better Tomorrow.</p>
      </div>
    </div>
  );
};

export default Logo;