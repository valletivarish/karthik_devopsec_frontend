import api from './api';

/** Authentication service methods for login and registration API calls */
const authService = {
  /* POST /api/auth/login - authenticate user and get JWT token */
  login: (credentials) => api.post('/api/auth/login', credentials),

  /* POST /api/auth/register - create new user account and get JWT token */
  register: (userData) => api.post('/api/auth/register', userData),
};

export default authService;
