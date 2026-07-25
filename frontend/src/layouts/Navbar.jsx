import React from 'react';
import { Search, Bell, Sun } from 'lucide-react';

const Navbar = () => {
  return (
    <header className="h-16 border-b border-slate-800/60 bg-[#0b1315]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="relative w-96">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search anything..."
          className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-300 hover:text-slate-100 relative transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        </button>

        <button className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-slate-300 hover:text-slate-100 transition-colors">
          <Sun className="w-4 h-4" />
        </button>

        <div className="h-6 w-[1px] bg-slate-800" />

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-sm shadow-md">
            AB
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-semibold text-slate-200">Amit Bind</p>
            <p className="text-xs text-emerald-400 font-medium">AI Engineer</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;