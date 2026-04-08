import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('crisigrid_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status, data } = error.response || {};
    
    if (status === 401) {
      // Unauthorized: Clear session and force login
      localStorage.removeItem('crisigrid_token');
      localStorage.removeItem('crisigrid_user');
      window.location.href = '/login';
    } else if (status === 403) {
      // Forbidden: Insufficient permissions
      toast.error("You don't have permission to do this", { id: 'forbidden-toast' });
    } else {
      // Other errors: Extract backend message
      const errorMsg = data?.error || data?.message || "A network error occurred";
      toast.error(errorMsg, { id: 'error-toast' });
    }
    
    return Promise.reject(error);
  }
);

export default api;
