import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { FileText, Download, Calendar, Loader2 } from 'lucide-react';
import { fetchReportsData } from '../services/api';

const Reports = () => {
  const [reportsList, setReportsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    fetchReportsData().then((data) => {
      if (data && data.length > 0) {
        setReportsList(data);
      }
      setLoading(false);
    });
  }, []);

  const handleDownload = async (reportId, filename) => {
    try {
      setDownloadingId(reportId);
      const response = await fetch(`http://localhost:8000/api/reports/download/${reportId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'ecowatt_audit_report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
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
        <Button 
          variant="primary" 
          onClick={() => handleDownload(1, 'latest_energy_audit.pdf')}
        >
          <Download className="w-4 h-4" /> Download Latest PDF Report
        </Button>
      </Card>

      {/* Reports List Card */}
      <Card>
        <h3 className="font-bold text-slate-100 text-base mb-4">Available Audit Reports</h3>
        {loading ? (
          <div className="text-center py-8 text-slate-400 text-xs">Loading audit reports...</div>
        ) : (
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
                <Button 
                  variant="secondary" 
                  className="text-xs py-1.5 px-3 flex items-center gap-1.5"
                  onClick={() => handleDownload(report.id, report.filename)}
                  disabled={downloadingId === report.id}
                >
                  {downloadingId === report.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  {downloadingId === report.id ? 'Downloading...' : 'Download'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Reports;