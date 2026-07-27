import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { AuthProvider, useAuth } from './context/AuthContext';

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
import Login from './pages/Login';
import Register from './pages/Register';

// Re-export useAuth from here too, so any existing pages that still do
// `import { useAuth } from '../App'` keep working without extra edits.
export { useAuth };

function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // Still checking localStorage for an existing session — render nothing
    // briefly rather than flashing the login page for logged-in users.
    return null;
  }

  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
      />
      <Route
        path="/register"
        element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />}
      />

      {/* Protected Dashboard Routes */}
      <Route
        path="/*"
        element={
          isAuthenticated ? (
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
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </MainLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
