import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';

// Pages Imports
import Dashboard from './pages/Dashboard';
import Forecast from './pages/Forecast';
import Anomaly from './pages/Anomaly';
import AIAssistant from './pages/AIAssistant';
import Appliance from './pages/Appliance';
import Savings from './pages/Savings';
import Reports from './pages/Reports';
import Upload from './pages/Upload';
import Settings from './pages/Settings';

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/forecast" element={<Forecast />} />
        <Route path="/anomaly" element={<Anomaly />} />
        <Route path="/assistant" element={<AIAssistant />} />
        <Route path="/appliance" element={<Appliance />} />
        <Route path="/savings" element={<Savings />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </MainLayout>
  );
}

export default App;