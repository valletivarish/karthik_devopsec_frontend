import api from './api';

/** MealPlan service methods for CRUD operations */
const mealPlanService = {
  getAll: () => api.get('/api/meal-plans'),
  getById: (id) => api.get(`/api/meal-plans/${id}`),
  create: (mealPlan) => api.post('/api/meal-plans', mealPlan),
  update: (id, mealPlan) => api.put(`/api/meal-plans/${id}`, mealPlan),
  delete: (id) => api.delete(`/api/meal-plans/${id}`),
};

export default mealPlanService;
