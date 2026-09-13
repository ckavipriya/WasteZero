import api from './axios';

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

export const pickupApi = {
  getAll: (params) => api.get('/pickups', { params }),
  getById: (id) => api.get(`/pickups/${id}`),
  create: (data) => api.post('/pickups', data),
  updateStatus: (id, data) => api.put(`/pickups/${id}/status`, data),
  cancel: (id) => api.delete(`/pickups/${id}`),
};

export const opportunityApi = {
  getAll: (params) => api.get('/opportunities', { params }),
  getById: (id) => api.get(`/opportunities/${id}`),
  create: (data) => api.post('/opportunities', data),
  update: (id, data) => api.put(`/opportunities/${id}`, data),
  delete: (id) => api.delete(`/opportunities/${id}`),
};

export const applicationApi = {
  getAll: (params) => api.get('/applications', { params }),
  apply: (data) => api.post('/applications', data),
  updateStatus: (id, data) => api.put(`/applications/${id}`, data),
};

export const messageApi = {
  getConversations: () => api.get('/messages/conversations'),
  getThread: (userId) => api.get(`/messages/${userId}`),
  send: (data) => api.post('/messages', data),
};

export const notificationApi = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard'),
};

export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  toggleSuspend: (id, data) => api.put(`/admin/users/${id}/suspend`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getLogs: () => api.get('/admin/logs'),
  getReport: () => api.get('/admin/report'),
};

export const userApi = {
  getProfile: (id) => api.get(`/users/${id}`),
  listUsers: (params) => api.get('/users', { params }),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/password', data),
};
