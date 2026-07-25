import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import { AlertTriangle, ShieldAlert, CheckCircle2, Zap, Send } from 'lucide-react';
import { checkEnergyAnomaly, fetchAnomaliesData, updateAnomalyStatus } from '../services/api';

const Anomaly = () => {
  const [energyInput, setEnergyInput] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [loadingTest, setLoadingTest] = useState(false);

  const [anomalyData, setAnomalyData] = useState({
    total_anomalies: 0,
    high_severity: 0,
    resolved_issues: 0,
    anomalies_list: []
  });
  const [loadingData, setLoadingData] = useState(true);

  const loadAnomalies = async () => {
    setLoadingData(true);
    const data = await fetchAnomaliesData();
    if (data) {
      setAnomalyData(data);
    }
    setLoadingData(false);
  };

  useEffect(() => {
    loadAnomalies();
  }, []);

  const handleTestAnomaly = async (e) => {
    e.preventDefault();
    if (!energyInput) return;

    setLoadingTest(true);
    const response = await checkEnergyAnomaly(parseFloat(energyInput));
    if (response) {
      setTestResult(response);
      await loadAnomalies();
    }
    setLoadingTest(false);
  };

  // Status ko toggle/resolve karne ka function
  const handleResolveStatus = async (id, currentStatus) => {
    if (currentStatus === 'Resolved') return;
    const res = await updateAnomalyStatus(id, 'Resolved');
    if (res) {
      await loadAnomalies(); // Data refresh karo taaki count update ho jaye
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Anomaly Detection" 
        subtitle="AI monitoring system tracking abnormal spikes and energy waste in real-time." 
      />

      <Card className="border-emerald-500/30 bg-slate-900/80">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-400" /> Test Live Anomaly Model
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Enter energy usage value (kWh) to test against the trained Isolation Forest backend model.
            </p>
          </div>
          <form onSubmit={handleTestAnomaly} className="flex items-center gap-2 w-full md:w-auto">
            <input 
              type="number" 
              step="0.1"
              value={energyInput}
              onChange={(e) => setEnergyInput(e.target.value)}
              placeholder="e.g. 5.5" 
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 w-full md:w-40"
            />
            <button 
              type="submit" 
              disabled={loadingTest}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              {loadingTest ? 'Checking...' : <>Test <Send className="w-3 h-3" /></>}
            </button>
          </form>
        </div>

        {testResult && (
          <div className={`mt-4 p-3 rounded-xl text-xs flex items-center justify-between border ${testResult.is_anomaly ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
            <span><strong>Status:</strong> {testResult.message}</span>
            <span className="font-bold uppercase">Anomaly: {testResult.is_anomaly ? 'True (Spike)' : 'False (Normal)'}</span>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium mb-1">Total Anomalies This Month</p>
            <h3 className="text-2xl font-extrabold text-slate-100">
              {loadingData ? '...' : `0${anomalyData.total_anomalies}`}
            </h3>
            <p className="text-xs text-red-400 font-medium mt-1">Requires attention</p>
          </div>
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium mb-1">High Severity Spikes</p>
            <h3 className="text-2xl font-extrabold text-slate-100">
              {loadingData ? '...' : `0${anomalyData.high_severity}`}
            </h3>
            <p className="text-xs text-amber-400 font-medium mt-1">Cost impact detected</p>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </Card>

        <Card className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium mb-1">Resolved Issues</p>
            <h3 className="text-2xl font-extrabold text-slate-100">
              {loadingData ? '...' : `0${anomalyData.resolved_issues}`}
            </h3>
            <p className="text-xs text-emerald-400 font-medium mt-1">Optimized successfully</p>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-bold text-slate-100 text-base mb-2">Detailed Anomaly Log</h3>
        <p className="text-xs text-slate-400 mb-4">Click on 'Unresolved' or status text to mark any anomaly as Resolved.</p>
        <div className="overflow-x-auto">
          {loadingData ? (
            <div className="text-center py-6 text-xs text-slate-400">Loading live anomaly logs...</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Spike Usage</th>
                  <th className="pb-3">Severity</th>
                  <th className="pb-3">Detected Reason</th>
                  <th className="pb-3">Status (Click to Resolve)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {anomalyData.anomalies_list && anomalyData.anomalies_list.map((item) => (
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
                      <button 
                        onClick={() => handleResolveStatus(item.id, item.status)}
                        className={`font-semibold px-2.5 py-1 rounded-lg transition-all ${
                          item.status === 'Resolved' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default' 
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 cursor-pointer'
                        }`}
                      >
                        {item.status} {item.status !== 'Resolved' && '✓'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Anomaly;