import React from 'react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { UploadCloud, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

const Upload = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Data Upload" 
        subtitle="Upload your smart meter CSV or Excel datasets to run custom AI predictions." 
      />

      <Card className="border-dashed border-2 border-slate-700/80 bg-slate-900/40 flex flex-col items-center justify-center py-12 text-center">
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl mb-4">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-slate-100 text-lg mb-1">Drag and drop your dataset here</h3>
        <p className="text-xs text-slate-400 max-w-sm mb-6">Supports CSV, XLS, or XLSX smart meter consumption logs for automated auditing.</p>
        <Button variant="primary">
          Browse Files
        </Button>
      </Card>

      <Card>
        <h3 className="font-bold text-slate-100 text-base mb-4">Recent Upload History</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-slate-900/80 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-200">meter_data_june_2026.csv</h4>
                <p className="text-xs text-slate-400 mt-0.5">Uploaded on 24 Jun 2026 &bull; 1.2 MB</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Processed
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Upload;