import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './useAuth';

export interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  progress: { completed: number; total: number; percentage: number };
  modules: any[];
}

export interface Progress {
  userId: string;
  totalCourses: number;
  averageProgress: number;
  courses: { [key: string]: any };
}

const COURSES_CACHE_KEY = 'courses_cache';
const PROGRESS_CACHE_KEY = 'progress_cache';

export const useCourses = {
  async getCourses(forceRefresh = false): Promise<Course[]> {
    try {
      // Try cache first if not forcing refresh
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(COURSES_CACHE_KEY);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      const response = await api.get('/courses');
      const courses = response.data;

      // Cache locally
      await AsyncStorage.setItem(COURSES_CACHE_KEY, JSON.stringify(courses));
      return courses;
    } catch (error) {
      // Return cache if offline
      const cached = await AsyncStorage.getItem(COURSES_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
      throw error;
    }
  },

  async getCourse(courseId: string): Promise<Course> {
    try {
      const response = await api.get(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getProgress(forceRefresh = false): Promise<Progress> {
    try {
      if (!forceRefresh) {
        const cached = await AsyncStorage.getItem(PROGRESS_CACHE_KEY);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      const response = await api.get('/progress');
      const progress = response.data;

      await AsyncStorage.setItem(PROGRESS_CACHE_KEY, JSON.stringify(progress));
      return progress;
    } catch (error) {
      const cached = await AsyncStorage.getItem(PROGRESS_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
      throw error;
    }
  }
};

export default useCourses;
