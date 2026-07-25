import { Routes, Route } from "react-router-dom";

import MainLayout from "@/layouts/MainLayout";

import Dashboard from "@/pages/Dashboard";
import Forecast from "@/pages/Forecast";
import Anomaly from "@/pages/Anomaly";
import AIAssistant from "@/pages/AIAssistant";
import Appliance from "@/pages/Appliance";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/forecast" element={<Forecast />} />
        <Route path="/anomaly" element={<Anomaly />} />
        <Route path="/assistant" element={<AIAssistant />} />
        <Route path="/appliance" element={<Appliance />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}