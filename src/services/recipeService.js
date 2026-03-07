import api from './api';

/** Recipe service methods for all CRUD and search operations */
const recipeService = {
  getAll: () => api.get('/api/recipes'),
  getById: (id) => api.get(`/api/recipes/${id}`),
  search: (keyword) => api.get(`/api/recipes/search?keyword=${keyword}`),
  getByDifficulty: (difficulty) => api.get(`/api/recipes/difficulty/${difficulty}`),
  create: (recipe) => api.post('/api/recipes', recipe),
  update: (id, recipe) => api.put(`/api/recipes/${id}`, recipe),
  delete: (id) => api.delete(`/api/recipes/${id}`),
};

export default recipeService;
