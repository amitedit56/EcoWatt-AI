import React from 'react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { FileText, Download, Calendar, CheckCircle2 } from 'lucide-react';

const reportsList = [
  { id: 1, title: 'June 2026 Monthly Energy Audit', date: '01 Jul 2026', size: '2.4 MB', type: 'PDF' },
  { id: 2, title: 'May 2026 Consumption Summary', date: '01 Jun 2026', size: '1.8 MB', type: 'PDF' },
  { id: 3, title: 'Q1 2026 Comprehensive Analytics', date: '01 Apr 2026', size: '5.1 MB', type: 'PDF' },
];

const Reports = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Energy Reports" 
        subtitle="Download comprehensive monthly and quarterly power audit reports for your records." 
      />

      {/* Action Banner */}
      <Card className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-100 text-base mb-1">Generate Custom Report</h3>
          <p className="text-xs text-slate-400">Export detailed analytics including anomaly logs and appliance breakdowns.</p>
        </div>
        <Button variant="primary">
          <Download className="w-4 h-4" /> Download Latest PDF Report
        </Button>
      </Card>

      {/* Reports List Card */}
      <Card>
        <h3 className="font-bold text-slate-100 text-base mb-4">Available Audit Reports</h3>
        <div className="space-y-3">
          {reportsList.map((report) => (
            <div key={report.id} className="flex items-center justify-between p-4 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{report.title}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" /> {report.date} &bull; {report.size}
                  </p>
                </div>
              </div>
              <Button variant="secondary" className="text-xs py-1.5 px-3">
                <Download className="w-3.5 h-3.5" /> Download
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Reports;