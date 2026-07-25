import React from 'react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { AlertTriangle, ShieldAlert, CheckCircle2 } from 'lucide-react';

const anomaliesList = [
  { id: 1, timestamp: '14 Jun 2024, 8:30 PM', usage: '8.3 kWh', severity: 'danger', reason: 'AC Overuse Spike Detected', status: 'Unresolved' },
  { id: 2, timestamp: '10 Jun 2024, 11:15 PM', usage: '7.1 kWh', severity: 'warning', reason: 'Unusual Night Activity', status: 'Reviewed' },
  { id: 3, timestamp: '05 Jun 2024, 2:00 PM', usage: '9.5 kWh', severity: 'danger', reason: 'Simultaneous Heavy Appliances Running', status: 'Resolved' },
];

const Anomaly = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Anomaly Detection" 
        subtitle="AI monitoring system tracking abnormal spikes and energy waste in real-time." 
      />

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium mb-1">Total Anomalies This Month</p>
            <h3 className="text-2xl font-extrabold text-slate-100">03</h3>
            <p className="text-xs text-red-400 font-medium mt-1">Requires attention</p>
          </div>
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium mb-1">High Severity Spikes</p>
            <h3 className="text-2xl font-extrabold text-slate-100">02</h3>
            <p className="text-xs text-amber-400 font-medium mt-1">Cost impact detected</p>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium mb-1">Resolved Issues</p>
            <h3 className="text-2xl font-extrabold text-slate-100">01</h3>
            <p className="text-xs text-emerald-400 font-medium mt-1">Optimized successfully</p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </Card>
      </div>

      {/* Anomalies Table Card */}
      <Card>
        <h3 className="font-bold text-slate-100 text-base mb-4">Detailed Anomaly Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Spike Usage</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3">Detected Reason</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300">
              {anomaliesList.map((item) => (
                <tr key={item.id}>
                  <td className="py-3.5 font-medium">{item.timestamp}</td>
                  <td className="py-3.5 font-bold text-slate-100">{item.usage}</td>
                  <td className="py-3.5">
                    <Badge variant={item.severity}>
                      {item.severity.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-3.5 text-slate-400">{item.reason}</td>
                  <td className="py-3.5">
                    <span className={`font-semibold ${item.status === 'Resolved' ? 'text-emerald-400' : item.status === 'Reviewed' ? 'text-blue-400' : 'text-amber-400'}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default Anomaly;