import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Response interceptor for clean global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Standardize error message
    let message = 'An unexpected connection error occurred.';
    if (error.response) {
      message = error.response.data?.detail || error.response.data?.message || message;
    } else if (error.request) {
      message = 'Could not connect to the backend server. Make sure it is running.';
    }
    
    // We reject with the standardized string so the callers (React Query) can display it easily
    return Promise.reject(new Error(message));
  }
);

export default api;
