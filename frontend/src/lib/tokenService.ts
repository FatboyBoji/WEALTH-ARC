import { jwtDecode } from 'jwt-decode';
import api from './api';

interface DecodedToken {
  exp: number;
  userId: number;
  username: string;
  role: string;
  sessionId?: string;
  tokenVersion: number;
}

export const getAccessToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem('refreshToken');
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
};

export const clearTokens = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  delete api.defaults.headers.common['Authorization'];
};

export const isAccessTokenExpiring = (withinSeconds = 120): boolean => {
  const token = getAccessToken();
  if (!token) return true;
  
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp - currentTime < withinSeconds;
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

export const isTokenValid = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.exp > Date.now() / 1000;
  } catch (error) {
    return false;
  }
};

export const checkAndRefreshToken = async (): Promise<boolean> => {
  try {
    // If access token is valid and not expiring soon, no need to refresh
    if (getAccessToken() && !isAccessTokenExpiring()) {
      return true;
    }
    
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;
    
    // Try to refresh the token
    const response = await api.post('/auth/refresh', { refreshToken });
    
    if (response.data.success) {
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      setTokens(accessToken, newRefreshToken);
      return true;    }
    
    return false;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    clearTokens();
    return false;
  }
};

export default {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  isAccessTokenExpiring,
  isTokenValid,
  checkAndRefreshToken,
}; 