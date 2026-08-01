import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle2, Eye, Filter, RefreshCw } from 'lucide-react';

const API_BASE_URL = "http://localhost:8000";

const FILTERS = ["All", "Unresolved", "Reviewed", "Resolved"];

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/api/anomalies`);
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setNotifications(data.anomalies_list || []);
    } catch (err) {
      console.error(err);
      setError("Notifications load nahi ho paaye. Backend server check karein.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      const res = await fetch(`${API_BASE_URL}/api/anomalies/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Status update failed");
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: newStatus } : n))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredNotifications =
    activeFilter === "All"
      ? notifications
      : notifications.filter((n) => n.status === activeFilter);

  const unresolvedCount = notifications.filter((n) => n.status === "Unresolved").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Bell className="w-6 h-6 text-emerald-400" />
            Notifications
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Aapke energy system ke saare alerts aur anomalies yahan hain.
          </p>
        </div>
        <button
          onClick={fetchNotifications}
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 hover:text-emerald-400 hover:border-emerald-500/40 text-sm font-medium transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <p className="text-slate-400 text-xs">Total Notifications</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">{notifications.length}</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <p className="text-slate-400 text-xs">Unresolved</p>
          <p className="text-2xl font-bold text-rose-400 mt-1">{unresolvedCount}</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
          <p className="text-slate-400 text-xs">Resolved</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {notifications.filter((n) => n.status === "Resolved").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-slate-500" />
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border ${
              activeFilter === f
                ? "bg-emerald-500 text-slate-950 border-emerald-500 font-semibold"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-100"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl divide-y divide-slate-800/70">
        {loading && (
          <p className="text-slate-500 text-sm text-center py-10">Loading notifications...</p>
        )}

        {!loading && error && (
          <p className="text-rose-400 text-sm text-center py-10">{error}</p>
        )}

        {!loading && !error && filteredNotifications.length === 0 && (
          <div className="text-center py-14">
            <Bell className="w-8 h-8 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Is filter ke liye koi notification nahi hai.</p>
          </div>
        )}

        {!loading &&
          !error &&
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-4 p-4 hover:bg-slate-900/80 transition-colors"
            >
              <div
                className={`p-2 rounded-xl shrink-0 ${
                  item.severity === "danger"
                    ? "bg-rose-500/10 text-rose-400"
                    : "bg-amber-500/10 text-amber-400"
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <p className="font-semibold text-slate-200 text-sm">{item.reason}</p>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      item.status === "Resolved"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : item.status === "Reviewed"
                        ? "bg-sky-500/10 text-sky-400"
                        : "bg-rose-500/10 text-rose-400"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-1">
                  {item.usage} usage • {item.timestamp}
                </p>

                {/* Action buttons */}
                <div className="flex items-center gap-2 mt-3">
                  {item.status !== "Reviewed" && item.status !== "Resolved" && (
                    <button
                      disabled={updatingId === item.id}
                      onClick={() => updateStatus(item.id, "Reviewed")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 text-sky-400 rounded-lg text-[11px] font-medium hover:bg-sky-500/20 transition-all disabled:opacity-50"
                    >
                      <Eye className="w-3 h-3" /> Mark Reviewed
                    </button>
                  )}
                  {item.status !== "Resolved" && (
                    <button
                      disabled={updatingId === item.id}
                      onClick={() => updateStatus(item.id, "Resolved")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-[11px] font-medium hover:bg-emerald-500/20 transition-all disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Notifications;
