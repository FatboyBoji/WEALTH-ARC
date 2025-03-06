import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import axios, { CancelTokenSource } from 'axios';
import { useRouter } from 'next/navigation';

// Types
interface User {
  userId: number;
  username: string;
  role: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  verifySession: () => Promise<boolean>;
  error: string | null;
  changeEmail: (newEmail: string, password: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  changeUsername: (newUsername: string) => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // Important for cookies
});

// Provider component
export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const checkSessionCancelSource = useRef<CancelTokenSource | null>(null);
  const renewSessionCancelSource = useRef<CancelTokenSource | null>(null);
  
  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        try {
          // Make sure we're getting complete user data including email
          const { data } = await api.get('/auth/me');
          
          if (data.success) {
            // Ensure email is included in the user object
            setUser({
              userId: data.data.userId,
              username: data.data.username,
              role: data.data.role,
              email: data.data.email // Make sure email is explicitly set
            });
            console.log('User data loaded with email:', data.data.email);
          } else {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);
  
  // Login function
  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Attempting login with:', { username });
      
      const { data } = await api.post('/auth/login', { username, password });
      
      console.log('Login response:', data);
      
      if (data.success) {
        // Store tokens in localStorage
        localStorage.setItem('accessToken', data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
        
        // Explicitly set user with all fields including email
        setUser({
          userId: data.data.user.userId,
          username: data.data.user.username,
          role: data.data.user.role,
          email: data.data.user.email // Make sure email is explicitly included
        });
        
        // Set auth header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${data.data.tokens.accessToken}`;
        
        // Navigate to dashboard
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      // Type guard for error object
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error.response as any;
        setError(errorResponse?.data?.message || 'Login failed');
      } else {
        setError('Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Register function
  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data } = await api.post('/auth/register', { username, email, password });
      
      if (data.success) {
        // Store tokens in localStorage
        localStorage.setItem('accessToken', data.data.tokens.accessToken);
        localStorage.setItem('refreshToken', data.data.tokens.refreshToken);
        
        // Set user from response data
        setUser(data.data.user);
        
        // Set auth header for future requests
        api.defaults.headers.common['Authorization'] = `Bearer ${data.data.tokens.accessToken}`;
        
        // Navigate to dashboard
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      // Type guard for error object
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error.response as any;
        setError(errorResponse?.data?.message || 'Registration failed');
      } else {
        setError('Registration failed');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Logout function
  const logout = async () => {
    setIsLoading(true);
    
    try {
      // Get the refresh token from local storage
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        // Send the refresh token with the logout request
        await api.post('/auth/logout', { refreshToken });
      }
      
      // Clear tokens from storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Clear user state
      setUser(null);
      
      // Redirect to login page
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add these new functions to check and renew session
  const checkSession = async (refreshToken: string): Promise<boolean> => {
    try {
      // Cancel any previous request
      if (checkSessionCancelSource.current) {
        checkSessionCancelSource.current.cancel('Operation canceled due to new request.');
      }

      // Create a new cancel token
      checkSessionCancelSource.current = axios.CancelToken.source();
      
      console.log('Checking session validity');
      const response = await api.post('/auth/check-session', 
        { refreshToken }, 
        { cancelToken: checkSessionCancelSource.current.token }
      );
      return response.data.success;
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
      } else {
        console.error('Session check failed:', error);
      }
      return false;
    }
  };

  const renewSession = async (refreshToken: string): Promise<boolean> => {
    try {
      // Cancel any previous request
      if (renewSessionCancelSource.current) {
        renewSessionCancelSource.current.cancel('Operation canceled due to new request.');
      }

      // Create a new cancel token
      renewSessionCancelSource.current = axios.CancelToken.source();
      
      console.log('Renewing session');
      const response = await api.post('/auth/renew-session', 
        { refreshToken }, 
        { cancelToken: renewSessionCancelSource.current.token }
      );
      
      if (response.data.success) {
        // Update tokens
        const newAccessToken = response.data.data.accessToken;
        const newRefreshToken = response.data.data.refreshToken;
        
        console.log('Session renewed successfully, received new tokens');
        localStorage.setItem('accessToken', newAccessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }
        
        // Update authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        
        return true;
      }
      
      return false;
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled:', error.message);
      } else {
        console.error('Session renewal failed:', error);
      }
      return false;
    }
  };

  // Replace the current verifySession with this modular approach
  const verifySession = async (): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      console.log('Starting session verification process');
      
      // Get refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        console.error('No refresh token available');
        setIsLoading(false);
        return false;
      }
      
      // First just check if session is valid
      const isValid = await checkSession(refreshToken);
      
      if (!isValid) {
        console.log('Session invalid, logging out');
        await logout();
        setIsLoading(false);
        return false;
      }
      
      // If valid, renew the session
      const renewed = await renewSession(refreshToken);
      
      if (!renewed) {
        console.log('Session renewal failed, logging out');
        await logout();
        setIsLoading(false);
        return false;
      }
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Session verification error:', error);
      setIsLoading(false);
      return false;
    }
  };

  // Change email function
  const changeEmail = async (newEmail: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data } = await api.post('/auth/change-email', { 
        newEmail, 
        password 
      });
      
      if (data.success) {
        // Update the user in state with new email
        setUser(prevUser => prevUser ? { ...prevUser, email: newEmail } : null);
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error.response as any;
        setError(errorResponse?.data?.message || 'Failed to update email');
      } else {
        setError('Failed to update email');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Change password function
  const changePassword = async (currentPassword: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data } = await api.post('/auth/change-password', { 
        currentPassword, 
        newPassword 
      });
      
      if (data.success) {
        // Logout after password change as all sessions are invalidated
        // await logout();
        setUser(prevUser => prevUser ? { ...prevUser, password: newPassword} : null);
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error.response as any;
        setError(errorResponse?.data?.message || 'Failed to update password');
      } else {
        setError('Failed to update password');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Change username function
  const changeUsername = async (newUsername: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data } = await api.post('/auth/change-username', { 
        newUsername 
      });
      
      if (data.success) {
        // Update the user in state with new username
        setUser(prevUser => prevUser ? { ...prevUser, username: newUsername } : null);
      }
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const errorResponse = error.response as any;
        setError(errorResponse?.data?.message || 'Failed to update username');
      } else {
        setError('Failed to update username');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        verifySession,
        error,
        changeEmail,
        changePassword,
        changeUsername,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}; 