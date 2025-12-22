import { create } from 'zustand';
import { User } from '@/types';
import api from '@/lib/axios';
import socketService from '@/lib/socket';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: null,

  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data;
      
      set({ user, isAuthenticated: true, token });
      
      // Connect socket with token from response
      console.log('Login: Connecting socket with token from response');
      if (token) {
        socketService.connect(token);
      } else {
        console.error('No token in login response!');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { user, token } = response.data;
      
      set({ user, isAuthenticated: true, token });
      
      // Connect socket with token from response
      console.log('Register: Connecting socket with token from response');
      if (token) {
        socketService.connect(token);
      } else {
        console.error('No token in register response!');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
      set({ user: null, isAuthenticated: false, token: null });
      socketService.disconnect();
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  checkAuth: async () => {
    try {
      const response = await api.get('/auth/me');
      const { user, token } = response.data;
      
      set({ user, isAuthenticated: true, isLoading: false, token });
      
      // Connect socket if we have token
      if (token) {
        console.log('CheckAuth: Connecting socket with token');
        socketService.connect(token);
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false, token: null });
      socketService.disconnect();
    }
  },
}));
