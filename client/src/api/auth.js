import api from './client.js';

export const authApi = {
  signup: (payload) => api.post('/auth/signup', payload).then((res) => res.data),
  login: (payload) => api.post('/auth/login', payload).then((res) => res.data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }).then((res) => res.data),
  me: () => api.get('/auth/me').then((res) => res.data),
  updateProfile: (payload) => api.patch('/auth/me', payload).then((res) => res.data),
  changePassword: (payload) => api.patch('/auth/password', payload).then((res) => res.data)
};
