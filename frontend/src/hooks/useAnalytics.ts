import { useQuery } from 'react-query';
import { api } from '../services/api';

export interface CourseAnalytics {
  courseId: string;
  totalStudents: number;
  totalSubmissions: number;
  gradedSubmissions: number;
  pendingSubmissions: number;
  averageGrade: number;
  completionRate: number;
  students: Array<{
    id: string;
    name: string;
    progress: number;
    submissions: number;
  }>;
}

export const useCourseAnalytics = (courseId: string) => {
  return useQuery({
    queryKey: ['analytics', courseId],
    queryFn: async () => {
      const response = await api.get<CourseAnalytics>(`/courses/${courseId}/analytics`);
      return response.data;
    },
    enabled: !!courseId
  });
};
