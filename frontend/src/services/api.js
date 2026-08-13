import axios from 'axios';

// Uses VITE_API_BASE_URL in production.
// Falls back to localhost for local development.
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },

  // Don't let a stuck request keep the UI waiting forever.
  timeout: 15000,
});

// Attach JWT automatically to every request.
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ecowatt_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Handle common authentication failures.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't automatically remove the token here.
      // Some pages may handle authentication errors themselves.
      console.warn('Authentication required for:', error.config?.url);
    }

    return Promise.reject(error);
  }
);

// ===============================
// AUTH
// ===============================

export const registerUser = async ({ fullName, email, password }) => {
  const response = await apiClient.post('/api/auth/register', {
    fullName,
    email,
    password,
  });

  return response.data;
};

export const loginUser = async ({ email, password }) => {
  const response = await apiClient.post('/api/auth/login', {
    email,
    password,
  });

  return response.data;
};

export const changePassword = async ({
  currentPassword,
  newPassword,
}) => {
  const response = await apiClient.post('/api/auth/change-password', {
    currentPassword,
    newPassword,
  });

  return response.data;
};

export const updateProfile = async ({
  fullName,
  email,
  avatarUrl,
}) => {
  const response = await apiClient.put('/api/auth/profile', {
    fullName,
    email,
    avatarUrl,
  });

  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await apiClient.post('/api/auth/forgot-password', {
    email,
  });

  return response.data;
};

export const resetPassword = async ({
  token,
  newPassword,
}) => {
  const response = await apiClient.post('/api/auth/reset-password', {
    token,
    newPassword,
  });

  return response.data;
};

export const googleAuth = async (credential) => {
  const response = await apiClient.post('/api/auth/google', {
    credential,
  });

  return response.data;
};

// ===============================
// AI ASSISTANT
// ===============================

export const sendAssistantMessage = async (
  message,
  history = []
) => {
  const response = await apiClient.post('/api/assistant/chat', {
    message,
    history: history.map((m) => ({
      role:
        m.sender === 'user'
          ? 'user'
          : 'assistant',
      text: m.text,
    })),
  });

  return response.data;
};

// ===============================
// DASHBOARD
// ===============================

export const fetchDashboardData = async () => {
  try {
    const response = await apiClient.get('/api/dashboard');
    return response.data;
  } catch (error) {
    console.error(
      'Error fetching dashboard data:',
      error
    );
    return null;
  }
};

// ===============================
// FORECAST
// ===============================

export const fetchForecastData = async () => {
  try {
    const response = await apiClient.get('/api/forecast');
    return response.data;
  } catch (error) {
    console.error(
      'Error fetching forecast data:',
      error
    );
    return null;
  }
};

// ===============================
// ANOMALIES
// ===============================

export const fetchAnomaliesData = async () => {
  try {
    const response = await apiClient.get('/api/anomalies');
    return response.data;
  } catch (error) {
    console.error(
      'Error fetching anomalies data:',
      error
    );
    return null;
  }
};

export const updateAnomalyStatus = async (
  id,
  status
) => {
  try {
    const response = await apiClient.patch(
      `/api/anomalies/${id}/status`,
      { status }
    );

    return response.data;
  } catch (error) {
    console.error(
      'Error updating anomaly status:',
      error
    );
    return null;
  }
};

// ===============================
// SAVINGS
// ===============================

export const fetchSavingsData = async () => {
  try {
    const response = await apiClient.get('/api/savings');
    return response.data;
  } catch (error) {
    console.error(
      'Error fetching savings data:',
      error
    );
    return null;
  }
};

// ===============================
// REPORTS
// ===============================

export const fetchReportsData = async () => {
  try {
    const response = await apiClient.get('/api/reports');
    return response.data.reports;
  } catch (error) {
    console.error(
      'Error fetching reports data:',
      error
    );
    return [];
  }
};

export const downloadReportFile = async (
  reportId
) => {
  const response = await apiClient.get(
    `/api/reports/download/${reportId}`,
    {
      responseType: 'blob',
    }
  );

  return response.data;
};

// ===============================
// ML / ANOMALY DETECTION
// ===============================

export const checkEnergyAnomaly = async (
  featureValues
) => {
  try {
    const response = await apiClient.post(
      '/api/detect-anomaly',
      {
        features: Array.isArray(featureValues)
          ? featureValues
          : [parseFloat(featureValues)],
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      'Error checking anomaly:',
      error
    );
    return null;
  }
};

// ===============================
// PROPHET FORECAST
// ===============================

export const fetchProphetForecast = async (
  days = 30
) => {
  try {
    const response = await apiClient.post(
      '/api/predict-forecast',
      {
        periods: days,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      'Error fetching prophet forecast:',
      error
    );
    return null;
  }
};

// ===============================
// APPLIANCES
// ===============================

export const fetchAppliancesData = async () => {
  try {
    const response = await apiClient.get(
      '/api/appliances'
    );

    return response.data;
  } catch (error) {
    console.error(
      'Error fetching appliances data:',
      error
    );
    return null;
  }
};

// ===============================
// SETTINGS
// ===============================

export const fetchSettingsData = async () => {
  try {
    const response = await apiClient.get(
      '/api/settings'
    );

    return response.data.settings;
  } catch (error) {
    console.error(
      'Error fetching settings data:',
      error
    );
    return null;
  }
};

export const updateSettingsData = async (
  settingsData
) => {
  try {
    const response = await apiClient.put(
      '/api/settings',
      settingsData
    );

    return response.data;
  } catch (error) {
    console.error(
      'Error updating settings data:',
      error
    );
    return null;
  }
};

// ===============================
// DATA UPLOAD
// ===============================

export const uploadDataset = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post(
    '/api/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000,
    }
  );

  return response.data;
};

// ===============================
// UPLOAD HISTORY
// ===============================

export const fetchUploadHistory = async () => {
  try {
    const response = await apiClient.get(
      '/api/upload-history'
    );

    return response.data.history;
  } catch (error) {
    console.error(
      'Error fetching upload history:',
      error
    );
    return [];
  }
};