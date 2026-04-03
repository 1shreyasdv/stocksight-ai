// ============================================================
// API.TS — Connects React Frontend to FastAPI Backend
// ============================================================

import axios from 'axios';

const BASE_URL = 'https://stocksight-backend-ljfa.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// ─── STOCK APIs ──────────────────────────────────────────────

export const getTrendingStocks = async () => {
  const response = await api.get('/api/stocks/trending');
  return response.data;
};

export const searchStocks = async (query: string) => {
  const response = await api.get(`/api/stocks/search?q=${query}`);
  return response.data;
};

export const getStockOverview = async (ticker: string) => {
  const response = await api.get(`/api/stocks/${ticker}/overview`);
  return response.data;
};

export const getStockHistory = async (ticker: string, period: string = '1y') => {
  const response = await api.get(`/api/stocks/${ticker}/history?period=${period}`);
  return response.data;
};

export const getStockIndicators = async (ticker: string) => {
  const response = await api.get(`/api/stocks/${ticker}/indicators`);
  return response.data;
};

// ─── PREDICTION APIs ─────────────────────────────────────────

export const getPrediction = async (ticker: string, days: number = 30) => {
  const response = await api.get(`/api/predict/${ticker}?days=${days}`);
  return response.data;
};

export const getXGBoostPrediction = async (ticker: string, days: number = 30) => {
  const response = await api.get(`/api/predict/${ticker}/xgboost?days=${days}`);
  return response.data;
};

export const getAllModelPredictions = async (ticker: string, days: number = 30) => {
  const response = await api.get(`/api/predict/${ticker}/models?days=${days}`);
  return response.data;
};

// ─── SENTIMENT APIs ──────────────────────────────────────────

export const getSentimentScore = async (ticker: string) => {
  const response = await api.get(`/api/sentiment/${ticker}/score`);
  return response.data;
};

export const getNewsSentiment = async (ticker: string) => {
  const response = await api.get(`/api/sentiment/${ticker}/news`);
  return response.data;
};

// ─── AI INSIGHTS API ─────────────────────────────────────────

export const getAIInsights = async (ticker: string) => {
  const response = await api.get(`/api/insights/${ticker}`);
  return response.data;
};

// ─── AUTH APIs ───────────────────────────────────────────────

export const registerUser = async (email: string, password: string, fullName: string) => {
  const response = await api.post('/api/auth/register', {
    email,
    password,
    full_name: fullName
  });
  return response.data;
};

export const loginUser = async (email: string, password: string) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

// ─── PORTFOLIO APIs ──────────────────────────────────────────

export const getPortfolio = async (token: string) => {
  const response = await api.get('/api/portfolio/', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const addToPortfolio = async (token: string, data: any) => {
  const response = await api.post('/api/portfolio/add', data, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const getPortfolioPerformance = async (token: string) => {
  const response = await api.get('/api/portfolio/performance', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export const removeFromPortfolio = async (token: string, id: number) => {
  const response = await api.delete(`/api/portfolio/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

export default api;