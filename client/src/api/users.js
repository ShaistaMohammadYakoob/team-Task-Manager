import api from './client.js';

export const usersApi = {
  list: () => api.get('/users').then((res) => res.data),
  get: (id) => api.get(`/users/${id}`).then((res) => res.data),
  update: (id, payload) => api.patch(`/users/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/users/${id}`).then((res) => res.data)
};
