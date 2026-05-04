import api from './client.js';

export const projectApi = {
  list: () => api.get('/projects').then((res) => res.data),
  create: (payload) => api.post('/projects', payload).then((res) => res.data),
  get: (id) => api.get(`/projects/${id}`).then((res) => res.data),
  update: (id, payload) => api.patch(`/projects/${id}`, payload).then((res) => res.data),
  remove: (id) => api.delete(`/projects/${id}`).then((res) => res.data),
  addMember: (id, payload) => api.post(`/projects/${id}/members`, payload).then((res) => res.data),
  removeMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`).then((res) => res.data)
};
