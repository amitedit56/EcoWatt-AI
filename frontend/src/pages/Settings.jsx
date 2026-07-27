import React, { useState, useEffect } from 'react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { User, Bell, Shield, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { fetchSettingsData, updateSettingsData, changePassword } from '../services/api';

// Small reusable toggle switch — much clearer than a native checkbox on a dark theme.
const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 cursor-pointer ${
      checked ? 'bg-emerald-500' : 'bg-slate-700'
    }`}
  >
    <span
      className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

const TABS = [
  { key: 'profile', label: 'Profile Details', icon: User },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'security', label: 'Security & Privacy', icon: Shield },
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [settings, setSettings] = useState({
    profile: { fullName: '', email: '', role: '' },
    notifications: { emailAlerts: true, anomalyAlerts: true, weeklyReports: false },
  });

  // Password change is handled separately from the profile/notifications
  // "settings" blob, since it talks to a dedicated, secure auth endpoint.
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      const data = await fetchSettingsData();
      if (data) {
        setSettings((prev) => ({
          ...prev,
          profile: data.profile || prev.profile,
          notifications: data.notifications || prev.notifications,
        }));
      }
      setLoading(false);
    };
    loadSettings();
  }, []);

  const handleProfileChange = (e) => {
    setSettings({
      ...settings,
      profile: { ...settings.profile, [e.target.name]: e.target.value },
    });
  };

  const handleNotificationToggle = (key) => {
    setSettings({
      ...settings,
      notifications: { ...settings.notifications, [key]: !settings.notifications[key] },
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage('');
    const res = await updateSettingsData(settings);
    if (res) {
      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
    setSaving(false);
  };

  const handlePasswordFieldChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError('Please fill in both password fields.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordSuccess('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.detail || 'Could not update password. Please try again.');
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400 text-sm gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-500" /> Loading account settings...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Account Settings"
        subtitle="Manage your profile information, notification preferences, and system security."
      />

      {successMessage && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tab list */}
        <div className="space-y-2">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`w-full text-left p-3 rounded-xl font-semibold text-sm flex items-center gap-3 cursor-pointer transition-all border ${
                activeTab === key
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-slate-900/40 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/70'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="md:col-span-2">
          {activeTab === 'profile' && (
            <Card className="space-y-4">
              <h3 className="font-bold text-slate-100 text-base mb-4">Profile Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    autoComplete="name"
                    value={settings.profile.fullName}
                    onChange={handleProfileChange}
                    className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={settings.profile.email}
                    onChange={handleProfileChange}
                    className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-400 font-medium mb-1">Role / Designation</label>
                <input
                  type="text"
                  name="role"
                  value={settings.profile.role}
                  onChange={handleProfileChange}
                  className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="pt-4 flex justify-end">
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card className="space-y-5">
              <h3 className="font-bold text-slate-100 text-base mb-4">Notification Preferences</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="pr-4">
                    <p className="font-semibold text-slate-200 text-sm">Email Alerts</p>
                    <p className="text-slate-400 text-xs mt-0.5">Receive daily energy summaries via email.</p>
                  </div>
                  <Toggle
                    checked={settings.notifications.emailAlerts}
                    onChange={() => handleNotificationToggle('emailAlerts')}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="pr-4">
                    <p className="font-semibold text-slate-200 text-sm">Anomaly Spike Warnings</p>
                    <p className="text-slate-400 text-xs mt-0.5">Get notified immediately when an abnormal power spike is detected.</p>
                  </div>
                  <Toggle
                    checked={settings.notifications.anomalyAlerts}
                    onChange={() => handleNotificationToggle('anomalyAlerts')}
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="pr-4">
                    <p className="font-semibold text-slate-200 text-sm">Weekly Audit Reports</p>
                    <p className="text-slate-400 text-xs mt-0.5">Receive weekly PDF audit summary reports.</p>
                  </div>
                  <Toggle
                    checked={settings.notifications.weeklyReports}
                    onChange={() => handleNotificationToggle('weeklyReports')}
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="space-y-5">
              <h3 className="font-bold text-slate-100 text-base mb-4">Change Password</h3>

              {passwordError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {passwordError}
                </div>
              )}
              {passwordSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> {passwordSuccess}
                </div>
              )}

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1">Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordFieldChange}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    autoComplete="new-password"
                    placeholder="At least 6 characters"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordFieldChange}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    autoComplete="new-password"
                    placeholder="Re-enter new password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordFieldChange}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="primary" onClick={handlePasswordSubmit} disabled={passwordSaving}>
                  {passwordSaving ? 'Updating...' : 'Update Password'}
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
