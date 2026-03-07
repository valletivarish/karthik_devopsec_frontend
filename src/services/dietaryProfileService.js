import api from './api';

/** Dietary profile service methods for CRUD operations */
const dietaryProfileService = {
  getByUserId: (userId) => api.get(`/api/dietary-profiles/user/${userId}`),
  getById: (id) => api.get(`/api/dietary-profiles/${id}`),
  create: (profile) => api.post('/api/dietary-profiles', profile),
  update: (id, profile) => api.put(`/api/dietary-profiles/${id}`, profile),
  delete: (id) => api.delete(`/api/dietary-profiles/${id}`),
};

export default dietaryProfileService;
