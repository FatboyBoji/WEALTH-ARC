import axios from 'axios';
import tokenService from './tokenService';

// Create a base API instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('accessToken');
    
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Ignore aborted requests during navigation
    if (error.code === 'ECONNABORTED' || axios.isCancel(error)) {
      console.log('Request aborted or canceled, likely due to navigation');
      return Promise.reject(error);
    }
    
    const originalRequest = error.config;
    
    // Handle both 401 and 403 for token issues
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Check the error message to see if it's related to token expiration
      const isTokenError = error.response?.data?.message?.includes('token') || 
                          error.response?.data?.message?.includes('expired') ||
                          error.response?.data?.message?.includes('invalid');
      
      // Only handle token-related errors
      if (isTokenError) {
        try {
          // Use our token service to refresh the token
          const success = await tokenService.checkAndRefreshToken();
          
          if (success) {
            // Update header for the original request
            originalRequest.headers.Authorization = `Bearer ${tokenService.getAccessToken()}`;
            
            // Retry the original request
            return axios(originalRequest);
          } else {
            throw new Error('Failed to refresh token');
          }
        } catch (refreshError) {
          // If refresh fails, log out
          console.error('Error refreshing token:', refreshError);
          tokenService.clearTokens();
          window.location.href = '/auth/login?session=expired';
          return Promise.reject(error);
        }
      } else {
        // For non-token related 401/403 errors, just reject
        return Promise.reject(error);
      }
    }
    
    return Promise.reject(error);
  }
);

// Add these functions to make API calls to our new endpoints
export const changeEmail = async (newEmail: string, password: string) => {
  try {
    const response = await api.post('/auth/change-email', { 
      newEmail, 
      password 
    });
    return response.data;
  } catch (error) {
    console.error('Error changing email:', error);
    throw error;
  }
};

export const changePassword = async (currentPassword: string, newPassword: string) => {
  try {
    const response = await api.post('/auth/change-password', { 
      currentPassword, 
      newPassword 
    });
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

export const changeUsername = async (newUsername: string) => {
  try {
    const response = await api.post('/auth/change-username', { 
      newUsername 
    });
    return response.data;
  } catch (error) {
    console.error('Error changing username:', error);
    throw error;
  }
};

// Add a function to get user profile data
export const getUserProfile = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export default api; 