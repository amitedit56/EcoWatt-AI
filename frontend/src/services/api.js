import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // FastAPI backend URL

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the saved JWT (if any) to every request, so protected routes work
// automatically once you add auth checks to other endpoints later.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('ecowatt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API calls — these hit the FastAPI backend (port 8000), same as everything
// else in this app. There is no separate Node server; /api/auth/* is registered
// directly in backend/app/main.py via app/api/auth.py.
export const registerUser = async ({ fullName, email, password }) => {
  const response = await apiClient.post('/api/auth/register', { fullName, email, password });
  return response.data; // { token, user }
};

export const loginUser = async ({ email, password }) => {
  const response = await apiClient.post('/api/auth/login', { email, password });
  return response.data; // { token, user }
};

export const changePassword = async ({ currentPassword, newPassword }) => {
  // Throws on failure (e.g. wrong current password) — caller should catch it.
  const response = await apiClient.post('/api/auth/change-password', { currentPassword, newPassword });
  return response.data;
};

export const updateProfile = async ({ fullName, email, avatarUrl }) => {
  // Throws on failure (e.g. email already taken) — caller should catch it.
  const response = await apiClient.put('/api/auth/profile', { fullName, email, avatarUrl });
  return response.data; // { id, fullName, email, avatarUrl }
};

export const forgotPassword = async (email) => {
  const response = await apiClient.post('/api/auth/forgot-password', { email });
  return response.data; // { status, message }
};

export const resetPassword = async ({ token, newPassword }) => {
  const response = await apiClient.post('/api/auth/reset-password', { token, newPassword });
  return response.data; // { status, message }
};

export const googleAuth = async (credential) => {
  const response = await apiClient.post('/api/auth/google', { credential });
  return response.data; // { token, user }
};

// AI Assistant chat — talks to the FastAPI backend, which forwards to Groq.
// `history` is an array of { role: 'user' | 'ai', text: '...' } from prior turns.
export const sendAssistantMessage = async (message, history = []) => {
  const response = await apiClient.post('/api/assistant/chat', {
    message,
    history: history.map((m) => ({ role: m.sender === 'user' ? 'user' : 'assistant', text: m.text })),
  });
  return response.data; // { reply }
};

export const fetchDashboardData = async () => {
  try {
    const response = await apiClient.get('/api/dashboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return null;
  }
};

export const fetchForecastData = async () => {
  try {
    const response = await apiClient.get('/api/forecast');
    return response.data;
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    return null;
  }
};

export const fetchAnomaliesData = async () => {
  try {
    const response = await apiClient.get('/api/anomalies');
    return response.data;
  } catch (error) {
    console.error('Error fetching anomalies data:', error);
    return null;
  }
};

export const fetchSavingsData = async () => {
  try {
    const response = await apiClient.get('/api/savings');
    return response.data;
  } catch (error) {
    console.error('Error fetching savings data:', error);
    return null;
  }
};

export const fetchReportsData = async () => {
  try {
    const response = await apiClient.get('/api/reports');
    return response.data.reports;
  } catch (error) {
    console.error('Error fetching reports data:', error);
    return [];
  }
};

export const checkEnergyAnomaly = async (featureValues) => {
  try {
    const response = await apiClient.post('/api/detect-anomaly', { 
      features: Array.isArray(featureValues) ? featureValues : [parseFloat(featureValues)] 
    });
    return response.data;
  } catch (error) {
    console.error('Error checking anomaly:', error);
    return null;
  }
};

export const updateAnomalyStatus = async (id, status) => {
  try {
    const response = await apiClient.patch(`/api/anomalies/${id}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating anomaly status:', error);
    return null;
  }
};

export const fetchProphetForecast = async (days = 30) => {
  try {
    const response = await apiClient.post('/api/predict-forecast', { periods: days });
    return response.data;
  } catch (error) {
    console.error('Error fetching prophet forecast:', error);
    return null;
  }
};

export const fetchAppliancesData = async () => {
  try {
    const response = await apiClient.get('/api/appliances');
    return response.data;
  } catch (error) {
    console.error('Error fetching appliances data:', error);
    return null;
  }
};

// Settings API integration functions
export const fetchSettingsData = async () => {
  try {
    const response = await apiClient.get('/api/settings');
    return response.data.settings;
  } catch (error) {
    console.error('Error fetching settings data:', error);
    return null;
  }
};

export const updateSettingsData = async (settingsData) => {
  try {
    const response = await apiClient.put('/api/settings', settingsData);
    return response.data;
  } catch (error) {
    console.error('Error updating settings data:', error);
    return null;
  }
};

// Data Upload — file uploads need multipart/form-data, and the current
// user's data (dashboard metrics, anomalies, history) is auto-scoped to
// them server-side based on the auth token apiClient attaches.
export const uploadDataset = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const fetchUploadHistory = async () => {
  try {
    const response = await apiClient.get('/api/upload-history');
    return response.data.history;
  } catch (error) {
    console.error('Error fetching upload history:', error);
    return [];
  }
};

// Report PDF download — needs the auth token (apiClient attaches it
// automatically) and a blob response type to receive binary PDF data.
export const downloadReportFile = async (reportId) => {
  const response = await apiClient.get(`/api/reports/download/${reportId}`, {
    responseType: 'blob',
  });
  return response.data; // Blob
};