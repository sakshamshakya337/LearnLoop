import axios from 'axios';
import { supabase } from '../lib/supabase';
import { auth } from '../lib/firebase';

// Smart URL resolution: prefer whichever env var is NOT localhost.
// This prevents the app breaking when one platform still has localhost set.
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const backendUrl = import.meta.env.VITE_BACKEND_URL;

function resolveBackendUrl() {
  const isLocalhost = (url) => !url || url.includes('localhost') || url.includes('127.0.0.1');
  // Use VITE_API_BASE_URL if it's a real URL
  if (apiUrl && !isLocalhost(apiUrl)) return apiUrl;
  // Fall back to VITE_BACKEND_URL if it's a real URL
  if (backendUrl && !isLocalhost(backendUrl)) return backendUrl;
  // Last resort: local dev
  return 'http://localhost:3001';
}

const envBase = resolveBackendUrl();
const baseURL = envBase.endsWith('/api') ? envBase : `${envBase}/api`;

const api = axios.create({ baseURL });

// Request interceptor to automatically add auth tokens/IDs
api.interceptors.request.use(async (config) => {
  let userId = null;

  // Firebase currentUser ID
  if (auth.currentUser) {
    userId = auth.currentUser.uid;
  }

  if (userId) {
    config.headers['x-user-id'] = userId;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
