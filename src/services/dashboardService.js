import api from './api';

/** Dashboard service for fetching summary statistics and analytics data */
const dashboardService = {
  getDashboard: () => api.get('/api/dashboard'),
};

export default dashboardService;
