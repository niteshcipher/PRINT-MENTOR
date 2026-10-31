import api from '../lib/api';
import { getOrCreateUserId, resetSession } from '../lib/session';

export { api, getOrCreateUserId, resetSession };
export const getUserId = getOrCreateUserId;
export const apiClient = api;

export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : (endpoint.startsWith('/api') ? endpoint : `/api${endpoint}`);

  try {
    const res = await api({
      url,
      method: options.method || 'GET',
      data: options.body ? JSON.parse(options.body) : undefined,
      headers: options.headers
    });
    return res.data;
  } catch (error) {
    const msg = error.response?.data?.detail || error.message;
    throw new Error(msg);
  }
}

export async function checkApiHealth() {
  try {
    const res = await api.get('/api/health');
    return res.data;
  } catch {
    try {
      const res = await api.get('/health');
      return res.data;
    } catch {
      return { status: 'offline' };
    }
  }
}
