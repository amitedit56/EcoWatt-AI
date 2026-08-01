import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, AlertTriangle, CheckCircle2, Search, LayoutDashboard, TrendingUp, Bot, PieChart, Lightbulb, FileText, UploadCloud, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from "../../App"; // Global Auth Context import kiya

// Backend base URL - apni env file ke hisaab se badal lein agar zaroorat ho
const API_BASE_URL = "http://localhost:8000";

// Pages that the search bar can jump to directly
const SEARCHABLE_PAGES = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/forecast', label: 'Forecast', icon: TrendingUp },
  { path: '/anomaly', label: 'Anomaly Detection', icon: AlertTriangle },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/assistant', label: 'AI Assistant', icon: Bot },
  { path: '/appliance', label: 'Appliance Breakdown', icon: PieChart },
  { path: '/savings', label: 'Savings & Tips', icon: Lightbulb },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/upload', label: 'Data Upload', icon: UploadCloud },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
];

const Navbar = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const { logout, user } = useAuth(); // Auth hook
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  // Unresolved anomalies ka count - badge me yahi dikhega
  const unresolvedCount = notifications.filter(
    (n) => n.status === "Unresolved"
  ).length;

  // Backend se real anomalies fetch karna
  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const res = await fetch(`${API_BASE_URL}/api/anomalies`);
      if (!res.ok) throw new Error("Failed to fetch anomalies");
      const data = await res.json();
      setNotifications(data.anomalies_list || []);
    } catch (err) {
      console.error("Notification fetch error:", err);
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Page load hote hi ek baar fetch karo (badge count ke liye)
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Dropdown khulte waqt fresh data laao
  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications]);

  // ---- Search bar ----
  const query = searchQuery.trim().toLowerCase();
  const matchedPages = query
    ? SEARCHABLE_PAGES.filter((p) => p.label.toLowerCase().includes(query))
    : [];
  const matchedAlerts = query
    ? notifications.filter((n) => (n.reason || '').toLowerCase().includes(query)).slice(0, 4)
    : [];
  const hasSearchResults = matchedPages.length > 0 || matchedAlerts.length > 0;

  const goToPage = (path) => {
    navigate(path);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (matchedPages.length > 0) {
      goToPage(matchedPages[0].path);
    } else if (matchedAlerts.length > 0) {
      goToPage('/notifications');
    }
  };

  // Bahar click karne par dropdown band ho jaye
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfileMenu(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout(); // Global state clear karke app ko instant logout karega
    setShowProfileMenu(false);
    navigate('/login', { replace: true });
  };

  const userEmail = user?.email || 'guest@ecowatt.ai';
  const userName = user?.fullName || 'Guest User';

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-slate-900/60 border-b border-slate-800/80 relative">
      <style>{`
        .notif-scroll::-webkit-scrollbar { width: 5px; }
        .notif-scroll::-webkit-scrollbar-track { background: transparent; }
        .notif-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 9999px; }
        .notif-scroll::-webkit-scrollbar-thumb:hover { background: #475569; }
        .notif-scroll { scrollbar-width: thin; scrollbar-color: #334155 transparent; }
      `}</style>

      {/* Search Bar */}
      <div className="relative w-72" ref={searchRef}>
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center bg-slate-950 border border-slate-800 rounded-full px-4 py-2 focus-within:border-emerald-500/60 transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-slate-500 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search energy metrics..."
            className="bg-transparent text-xs text-slate-200 focus:outline-none w-full"
            autoComplete="off"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowSearchResults(true); }}
            onFocus={() => setShowSearchResults(true)}
          />
        </form>

        {showSearchResults && query && (
          <div className="absolute left-0 mt-2 w-80 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs max-h-80 overflow-y-auto">
            {!hasSearchResults && (
              <p className="text-slate-500 text-[11px] text-center py-4">
                No matches for "{searchQuery}".
              </p>
            )}

            {matchedPages.length > 0 && (
              <div className="mb-1">
                <p className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Pages</p>
                {matchedPages.map((page) => {
                  const Icon = page.icon;
                  return (
                    <button
                      key={page.path}
                      onClick={() => goToPage(page.path)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-200 hover:bg-slate-900 transition-colors text-left"
                    >
                      <Icon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      {page.label}
                    </button>
                  );
                })}
              </div>
            )}

            {matchedAlerts.length > 0 && (
              <div>
                <p className="px-2 py-1 text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Anomaly Alerts</p>
                {matchedAlerts.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => goToPage('/notifications')}
                    className="w-full flex items-start gap-2.5 px-2.5 py-2 rounded-xl hover:bg-slate-900 transition-colors text-left"
                  >
                    <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${item.severity === 'danger' ? 'text-rose-400' : 'text-amber-400'}`} />
                    <div className="min-w-0">
                      <p className="text-slate-200 font-medium truncate">{item.reason}</p>
                      <p className="text-slate-500 text-[10px]">{item.usage} • {item.timestamp}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
            className="p-2.5 bg-slate-950 border border-slate-800 rounded-full text-slate-300 hover:text-emerald-400 relative transition-all"
          >
            <Bell className="w-4 h-4" />
            {unresolvedCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            )}
          </button>

          {showNotifications && (
            <div className="notif-scroll absolute right-0 mt-2 w-80 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-3 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between font-bold text-slate-200 border-b border-slate-800 pb-2 sticky top-0 bg-slate-950">
                <span>Notifications</span>
                <span className="text-emerald-400 text-[10px]">
                  {unresolvedCount} new
                </span>
              </div>

              <div className="space-y-2">
                {loadingNotifications && (
                  <p className="text-slate-500 text-[10px] text-center py-4">Loading...</p>
                )}

                {!loadingNotifications && notifications.length === 0 && (
                  <p className="text-slate-500 text-[10px] text-center py-4">
                    No notifications yet.
                  </p>
                )}

                {!loadingNotifications && notifications.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800/60 flex items-start gap-2"
                  >
                    {item.severity === "danger" ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 mt-0.5 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-200">{item.reason}</p>
                      <p className="text-slate-400 text-[10px]">
                        {item.usage} • {item.timestamp}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 mt-1 text-[9px] px-1.5 py-0.5 rounded-full ${
                          item.status === "Resolved"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : item.status === "Reviewed"
                            ? "bg-sky-500/10 text-sky-400"
                            : "bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {item.status === "Resolved" && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {notifications.length > 0 && (
                <button
                  onClick={() => { setShowNotifications(false); navigate('/notifications'); }}
                  className="w-full text-center text-[10px] text-emerald-400 hover:text-emerald-300 pt-2 border-t border-slate-800 font-medium"
                >
                  View all in Anomaly Detection →
                </button>
              )}
            </div>
          )}
        </div>

        {/* Profile Section */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
            className="flex items-center gap-3 pl-3 border-l border-slate-800 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center overflow-hidden font-bold text-slate-950 text-xs shrink-0">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={userName} className="w-full h-full object-cover" />
              ) : (
                userName.substring(0, 2).toUpperCase()
              )}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-100">{userName}</p>
            </div>
          </div>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="font-bold text-slate-200">{userName}</p>
                <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
              </div>
              <button 
                onClick={handleLogout} 
                className="w-full text-left px-3 py-2 text-rose-400 hover:bg-slate-900 rounded-xl font-medium transition-all flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout Session
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;