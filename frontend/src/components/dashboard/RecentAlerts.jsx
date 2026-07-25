import React from 'react';
import { ChevronRight } from 'lucide-react';

const RecentAlerts = () => {
  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
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
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentAlerts;