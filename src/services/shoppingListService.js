import api from './api';

/** Shopping list service methods for CRUD and item toggle operations */
const shoppingListService = {
  getAll: () => api.get('/api/shopping-lists'),
  getById: (id) => api.get(`/api/shopping-lists/${id}`),
  create: (list) => api.post('/api/shopping-lists', list),
  update: (id, list) => api.put(`/api/shopping-lists/${id}`, list),
  delete: (id) => api.delete(`/api/shopping-lists/${id}`),
  toggleItem: (itemId) => api.patch(`/api/shopping-lists/items/${itemId}/toggle`),
};

export default shoppingListService;
