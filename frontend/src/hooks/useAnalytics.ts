import { useQuery } from '@tanstack/react-query';
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
  difficulty?: Array<{
    resourceId: string;
    title: string;
    type: string;
    attempts: number;
    failRate: number;
    avgScore: number | null;
  }>;
  skillGaps?: Array<{ skillTag: string; correct: number; total: number; ratio: number }>;
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
