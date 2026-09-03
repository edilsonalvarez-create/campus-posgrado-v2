import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth, User } from '../hooks/useAuth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const user = await useAuth.login(email, password);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  register: async (email: string, name: string, password: string) => {
    try {
      await useAuth.register(email, name, password);
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    await useAuth.logout();
    set({ user: null, isAuthenticated: false });
  },

  restoreSession: async () => {
    try {
      const user = await useAuth.getStoredUser();
      if (user) {
        set({ user, isAuthenticated: true });
      }
      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  }
}));
