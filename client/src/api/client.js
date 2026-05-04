import axios from 'axios';

const ACCESS_KEY = 'ttm_access_token';
const REFRESH_KEY = 'ttm_refresh_token';

export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: ({ accessToken, refreshToken }) => {
    if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  }
};

const api = axios.create({
  baseURL: '/api',
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = tokenStore.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original?._retry || original?.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    const refreshToken = tokenStore.getRefresh();
    if (!refreshToken) {
      tokenStore.clear();
      window.dispatchEvent(new Event('auth:logout'));
      return Promise.reject(error);
    }

    original._retry = true;

    try {
      refreshPromise =
        refreshPromise ||
        axios.post('/api/auth/refresh', {
          refreshToken
        });
      const { data } = await refreshPromise;
      refreshPromise = null;
      tokenStore.set(data);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    } catch (refreshError) {
      refreshPromise = null;
      tokenStore.clear();
      window.dispatchEvent(new Event('auth:logout'));
      return Promise.reject(refreshError);
    }
  }
);

export default api;
