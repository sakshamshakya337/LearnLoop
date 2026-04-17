import axios from 'axios';
import { supabase } from '../lib/supabase';
import { auth } from '../lib/firebase';

// Safely construct the baseURL by checking if VITE_API_BASE_URL ends with /api
const envBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
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
