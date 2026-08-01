import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, CheckCircle2, Loader2, AlertCircle, Save, Camera } from 'lucide-react';
import { fetchSettingsData, updateSettingsData, changePassword, updateProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';

// ---------------------------------------------------------------------------
// Small building blocks — kept inline so this page has zero dependency on
// shared UI components that might be missing/broken elsewhere in the project.
// ---------------------------------------------------------------------------

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

const Panel = ({ children, className = '' }) => (
  <div className={`bg-slate-900/60 border border-slate-800 rounded-2xl p-5 ${className}`}>
    {children}
  </div>
);

const SaveButton = ({ onClick, saving, label = 'Save Changes' }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={saving}
    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold text-sm rounded-xl transition-all"
  >
    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
    {saving ? 'Saving...' : label}
  </button>
);

const InlineMessage = ({ type, children }) =>
  children ? (
    <div
      className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
        type === 'error'
          ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
      }`}
    >
      {type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
      {children}
    </div>
  ) : null;

const Field = ({ label, ...props }) => (
  <div>
    <label className="block text-xs text-slate-400 font-medium mb-1.5">{label}</label>
    <input
      {...props}
      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
    />
  </div>
);

const TABS = [
  { key: 'profile', label: 'Profile Details', icon: User },
  { key: 'notifications', label: 'Notifications', icon: Bell },
  { key: 'security', label: 'Security & Password', icon: Shield },
];

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const Settings = () => {
  const { user, token, login } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);

  // --- Profile tab state (real DB-backed via /api/auth/profile) ---
  const [profileForm, setProfileForm] = useState({ fullName: '', email: '', avatarUrl: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');

  // --- Notifications tab state (mock /api/settings, preferences only) ---
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    anomalyAlerts: true,
    weeklyReports: false,
  });
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState('');
  const [notifError, setNotifError] = useState('');

  // --- Security tab state (real /api/auth/change-password) ---
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Load everything once on mount
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      const data = await fetchSettingsData();
      if (cancelled) return;

      setProfileForm({
        // Real name/email/photo always come from the logged-in user (database).
        fullName: user?.fullName || data?.profile?.fullName || '',
        email: user?.email || data?.profile?.email || '',
        avatarUrl: user?.avatarUrl || '',
      });
      setAvatarPreview(user?.avatarUrl || '');
      if (data?.notifications) setNotifications(data.notifications);
      setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [user]);

  // ---- Photo picker ----
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProfileError('Please select a valid image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileError('Image must be smaller than 2MB.');
      return;
    }
    setProfileError('');
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setAvatarPreview(dataUrl);
      setProfileForm((prev) => ({ ...prev, avatarUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  };

  // ---- Profile save ----
  const handleProfileSave = async () => {
    setProfileError('');
    setProfileSuccess('');
    if (!profileForm.fullName.trim() || !profileForm.email.trim()) {
      setProfileError('Full name and email cannot be empty.');
      return;
    }
    setProfileSaving(true);
    try {
      const updatedUser = await updateProfile({
        fullName: profileForm.fullName.trim(),
        email: profileForm.email.trim(),
        avatarUrl: profileForm.avatarUrl,
      });
      // Refresh AuthContext + localStorage so the Navbar avatar/name update
      // immediately, without needing a page reload or re-login.
      login(token, updatedUser);
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      setProfileError(err.response?.data?.detail || 'Could not update profile. Please try again.');
    } finally {
      setProfileSaving(false);
    }
  };

  // ---- Notifications save ----
  const handleNotifSave = async () => {
    setNotifError('');
    setNotifSuccess('');
    setNotifSaving(true);
    try {
      const res = await updateSettingsData({ notifications });
      if (!res) throw new Error('Save failed');
      setNotifSuccess('Notification preferences saved!');
      setTimeout(() => setNotifSuccess(''), 3000);
    } catch (err) {
      setNotifError('Could not save preferences. Please check your connection and try again.');
    } finally {
      setNotifSaving(false);
    }
  };

  // ---- Password save ----
  const handlePasswordSave = async () => {
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
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Account Settings</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage your profile information, notification preferences, and account security.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Tab list */}
        <div className="md:col-span-1 space-y-2">
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
        <div className="md:col-span-3 space-y-4">
          {activeTab === 'profile' && (
            <Panel className="space-y-4">
              <h3 className="font-bold text-slate-100 text-base">Profile Information</h3>
              <InlineMessage type="error">{profileError}</InlineMessage>
              <InlineMessage type="success">{profileSuccess}</InlineMessage>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center overflow-hidden shrink-0 border-2 border-slate-800">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-bold text-slate-950 text-lg">
                      {(profileForm.fullName || 'U').substring(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <label className="flex items-center gap-2 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-medium text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 cursor-pointer transition-all w-fit">
                    <Camera className="w-3.5 h-3.5" /> Change Photo
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                  <p className="text-slate-500 text-[10px] mt-1.5">JPG or PNG, max 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Full Name"
                  type="text"
                  autoComplete="name"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                />
                <Field
                  label="Email Address"
                  type="email"
                  autoComplete="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                />
              </div>

              <div className="pt-2 flex justify-end">
                <SaveButton onClick={handleProfileSave} saving={profileSaving} />
              </div>
            </Panel>
          )}

          {activeTab === 'notifications' && (
            <Panel className="space-y-4">
              <h3 className="font-bold text-slate-100 text-base">Notification Preferences</h3>
              <InlineMessage type="error">{notifError}</InlineMessage>
              <InlineMessage type="success">{notifSuccess}</InlineMessage>

              <div className="space-y-3">
                {[
                  { key: 'emailAlerts', title: 'Email Alerts', desc: 'Receive daily energy summaries via email.' },
                  { key: 'anomalyAlerts', title: 'Anomaly Spike Warnings', desc: 'Get notified immediately when an abnormal power spike is detected.' },
                  { key: 'weeklyReports', title: 'Weekly Audit Reports', desc: 'Receive weekly PDF audit summary reports.' },
                ].map(({ key, title, desc }) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                    <div className="pr-4">
                      <p className="font-semibold text-slate-200 text-sm">{title}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
                    </div>
                    <Toggle
                      checked={notifications[key]}
                      onChange={() => setNotifications({ ...notifications, [key]: !notifications[key] })}
                    />
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <SaveButton onClick={handleNotifSave} saving={notifSaving} />
              </div>
            </Panel>
          )}

          {activeTab === 'security' && (
            <Panel className="space-y-4">
              <h3 className="font-bold text-slate-100 text-base">Change Password</h3>
              <InlineMessage type="error">{passwordError}</InlineMessage>
              <InlineMessage type="success">{passwordSuccess}</InlineMessage>

              <div className="space-y-3">
                <Field
                  label="Current Password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
                <Field
                  label="New Password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                />
                <Field
                  label="Confirm New Password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Re-enter new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                />
              </div>

              <div className="pt-2 flex justify-end">
                <SaveButton onClick={handlePasswordSave} saving={passwordSaving} label="Update Password" />
              </div>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
