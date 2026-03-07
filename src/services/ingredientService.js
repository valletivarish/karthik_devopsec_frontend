import api from './api';

/** Ingredient service methods for CRUD and search operations */
const ingredientService = {
  getAll: () => api.get('/api/ingredients'),
  getById: (id) => api.get(`/api/ingredients/${id}`),
  search: (keyword) => api.get(`/api/ingredients/search?keyword=${keyword}`),
  create: (ingredient) => api.post('/api/ingredients', ingredient),
  update: (id, ingredient) => api.put(`/api/ingredients/${id}`, ingredient),
  delete: (id) => api.delete(`/api/ingredients/${id}`),
};

export default ingredientService;
