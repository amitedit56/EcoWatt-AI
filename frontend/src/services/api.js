import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000'; // FastAPI backend URL

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Naya function status update ke liye
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