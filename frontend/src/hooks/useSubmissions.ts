import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export interface Submission {
  id: string;
  resourceId: string;
  courseId: string;
  studentId: string;
  studentName: string;
  content: string;
  status: 'draft' | 'submitted' | 'graded';
  submittedAt: string;
  grade?: number;
  feedback?: string;
  gradedAt?: string;
  gradedBy?: string;
}

export const useSubmissions = (filters?: { status?: string; courseId?: string }) => {
  return useQuery<Submission[]>({
    queryKey: ['submissions', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.courseId) params.append('courseId', filters.courseId);
      const response = await api.get<Submission[]>(`/submissions?${params.toString()}`);
      return response.data;
    }
  });
};

export const useCourseSubmissions = (courseId: string) => {
  return useQuery<Submission[]>({
    queryKey: ['submissions', 'course', courseId],
    queryFn: async () => {
      const response = await api.get<Submission[]>(`/courses/${courseId}/submissions`);
      return response.data;
    }
  });
};

export const useCreateSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { resourceId: string; courseId: string; content: string }) => {
      const response = await api.post('/submissions', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    }
  });
};

export const useGradeSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ submissionId, grade, feedback }: { submissionId: string; grade: number; feedback: string }) => {
      const response = await api.put(`/submissions/${submissionId}/grade`, { grade, feedback });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
    }
  });
};
