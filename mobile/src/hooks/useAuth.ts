import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'https://campus-posgrado-v2-api.railway.app/api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'instructor' | 'admin';
}

const api = axios.create({ baseURL: API_URL });

// Add token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const useAuth = {
  async register(email: string, name: string, password: string) {
    try {
      const response = await api.post('/auth/register', {
        email,
        name,
        password
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async login(email: string, password: string) {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      const { accessToken, refreshToken, user } = response.data;
      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    try {
      await AsyncStorage.removeItem('accessToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');
    } catch (error) {
      throw error;
    }
  },

  async getMe() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getStoredUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem('user');
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      return null;
    }
  }
};

export default api;
