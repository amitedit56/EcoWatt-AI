import React, { useState, useRef, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import { UploadCloud, FileSpreadsheet, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { uploadDataset, fetchUploadHistory } from '../services/api';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(null);

  // History now comes from the backend, scoped to the logged-in user —
  // no more localStorage (which leaked between different accounts sharing
  // the same browser).
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fileInputRef = useRef(null);

  const loadHistory = async () => {
    setLoadingHistory(true);
    const data = await fetchUploadHistory();
    setHistory(data || []);
    setLoadingHistory(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setMessage(null);
    }
  };

  const handleUploadSubmit = async () => {
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a file first!' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const data = await uploadDataset(file);
      setMessage({ type: 'success', text: data.message || 'Dataset uploaded and processed successfully!' });
      setFile(null);
      // Refresh history from the backend so it reflects the new upload
      loadHistory();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.detail || 'Error connecting to backend server.',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader 
        title="Data Upload" 
        subtitle="Upload your smart meter CSV or Excel datasets to run custom AI predictions." 
      />

      <Card 
        className="border-dashed border-2 border-slate-700/80 bg-slate-900/40 flex flex-col items-center justify-center py-12 text-center cursor-pointer hover:border-emerald-500/50 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".csv, .xls, .xlsx" 
          className="hidden" 
        />
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl mb-4">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-slate-100 text-lg mb-1">
          {file ? file.name : "Drag and drop your dataset here"}
        </h3>
        <p className="text-xs text-slate-400 max-w-sm mb-6">
          {file ? `Size: ${(file.size / (1024 * 1024)).toFixed(2)} MB - Ready to upload` : "Supports CSV, XLS, or XLSX smart meter consumption logs for automated auditing."}
        </p>
        
        <div className="flex gap-3" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm rounded-xl cursor-pointer transition-colors"
          >
            Browse Files
          </button>
          {file && (
            <button
              type="button"
              onClick={handleUploadSubmit}
              disabled={uploading}
              className="flex items-center px-5 py-2.5 bg-blue-500 hover:bg-blue-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl cursor-pointer transition-colors"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" /> Uploading...
                </>
              ) : (
                'Upload & Process'
              )}
            </button>
          )}
        </div>
      </Card>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
          <span>{message.text}</span>
        </div>
      )}

      <Card>
        <h3 className="font-bold text-slate-100 text-base mb-4">Recent Upload History</h3>
        <div className="space-y-3">
          {loadingHistory && (
            <p className="text-slate-500 text-sm text-center py-6">Loading history...</p>
          )}

          {!loadingHistory && history.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-6">
              No uploads yet. Your uploaded datasets will show up here.
            </p>
          )}

          {!loadingHistory && history.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-slate-900/80 border border-slate-800 rounded-xl hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">{item.filename}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Uploaded on {item.date} &bull; {item.size}</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> {item.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Upload;