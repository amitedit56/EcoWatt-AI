import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from "../../App"; // Global Auth Context import kiya

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { logout } = useAuth(); // Auth hook
  const navigate = useNavigate();

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark', !darkMode);
  };

  const handleLogout = () => {
    logout(); // Global state clear karke app ko instant logout karega
    setShowProfileMenu(false);
    navigate('/login', { replace: true });
  };

  const userEmail = localStorage.getItem('userEmail') || 'amitbind1080k@gmail.com';
  const userName = localStorage.getItem('userName') || 'Amit Bind';

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
        <div className="relative">
          <button 
            onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
            className="p-2.5 bg-slate-950 border border-slate-800 rounded-full text-slate-300 hover:text-emerald-400 relative transition-all"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-3">
              <div className="flex items-center justify-between font-bold text-slate-200 border-b border-slate-800 pb-2">
                <span>Notifications</span>
                <span className="text-emerald-400 text-[10px]">2 new</span>
              </div>
              <div className="space-y-2">
                <div className="p-2 bg-slate-900/80 rounded-xl border border-slate-800/60">
                  <p className="font-semibold text-slate-200">Power Spike Warning</p>
                  <p className="text-slate-400 text-[10px]">Unusual activity detected in AC unit.</p>
                </div>
              </div>
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
        <div className="relative">
          <div 
            onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
            className="flex items-center gap-3 pl-3 border-l border-slate-800 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-xs">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-100">{userName}</p>
              <p className="text-[10px] text-emerald-400">AI Engineer</p>
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