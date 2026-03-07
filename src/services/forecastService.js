import api from './api';

/** Forecast service for fetching ML-based nutritional trend predictions */
const forecastService = {
  getForecast: () => api.get('/api/forecast'),
};

export default forecastService;
