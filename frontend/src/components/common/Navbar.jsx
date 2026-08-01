import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Sun, Moon, LogOut, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAuth } from "../../App"; // Global Auth Context import kiya

// Backend base URL - apni env file ke hisaab se badal lein agar zaroorat ho
const API_BASE_URL = "http://localhost:8000";

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const { logout, user } = useAuth(); // Auth hook
  const navigate = useNavigate();

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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark', !darkMode);
  };

  const handleLogout = () => {
    logout(); // Global state clear karke app ko instant logout karega
    setShowProfileMenu(false);
    navigate('/login', { replace: true });
  };

  const userEmail = user?.email || 'guest@ecowatt.ai';
  const userName = user?.fullName || 'Guest User';

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-slate-900/60 border-b border-slate-800/80 relative">
      {/* Search Bar */}
      <div className="flex items-center bg-slate-950 border border-slate-800 rounded-full px-4 py-2 w-72">
        <input 
          type="text" 
          placeholder="Search energy metrics..." 
          className="bg-transparent text-xs text-slate-200 focus:outline-none w-full"
          autoComplete="off"
        />
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
            <div className="absolute right-0 mt-2 w-80 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-3 max-h-96 overflow-y-auto">
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

        {/* Theme Mode Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2.5 bg-slate-950 border border-slate-800 rounded-full text-slate-300 hover:text-emerald-400 transition-all"
          title="Toggle Dark/Light Mode"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

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