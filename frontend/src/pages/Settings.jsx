import React from 'react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Settings as SettingsIcon, User, Bell, Lock, Shield } from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Account Settings" 
        subtitle="Manage your profile information, notification preferences, and system security." 
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-semibold text-sm flex items-center gap-3">
            <User className="w-4 h-4" /> Profile Details
          </div>
          <div className="p-3 bg-slate-900/40 text-slate-400 hover:text-slate-200 rounded-xl font-medium text-sm flex items-center gap-3 cursor-pointer">
            <Bell className="w-4 h-4" /> Notifications
          </div>
          <div className="p-3 bg-slate-900/40 text-slate-400 hover:text-slate-200 rounded-xl font-medium text-sm flex items-center gap-3 cursor-pointer">
            <Shield className="w-4 h-4" /> Security & Privacy
          </div>
        </div>

        <Card className="md:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-100 text-base mb-4">Profile Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">Full Name</label>
              <input 
                type="text" 
                defaultValue="Amit Bind" 
                className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 font-medium mb-1">Email Address</label>
              <input 
                type="email" 
                defaultValue="amit.bind@example.com" 
                className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-400 font-medium mb-1">Role / Designation</label>
            <input 
              type="text" 
              defaultValue="AI Engineer" 
              className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="pt-4 flex justify-end">
            <Button variant="primary">Save Changes</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Settings;