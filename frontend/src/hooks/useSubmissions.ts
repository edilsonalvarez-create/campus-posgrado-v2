import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export interface RubricSnapshot {
  rubricSlug: string;
  rubricVersion: number;
  criteria: Array<{ key: string; levelPoints: number; levelLabel: string | null; comment: string }>;
  computedScore: number;
  gradedBy: string;
}

export interface SubmissionFile {
  label: string;
  type: string;
  url: string;
}

export interface Submission {
  id: string;
  resourceId: string;
  courseId: string;
  studentId: string;
  studentName: string;
  content: string;
  kind?: 'text' | 'handson' | 'tfm';
  repoUrl?: string;
  files?: SubmissionFile[];
  status: 'draft' | 'submitted' | 'graded';
  submittedAt: string;
  grade?: number;
  feedback?: string;
  rubric?: RubricSnapshot;
  rubricSlug?: string;
  llmSuggestion?: any;
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

export interface CreateSubmissionInput {
  resourceId: string;
  courseId: string;
  content?: string;
  kind?: 'text' | 'handson' | 'tfm';
  repoUrl?: string;
  files?: Array<{ label: string; type: string; url: string }>;
}

export const useCreateSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateSubmissionInput) => {
      const response = await api.post('/submissions', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['course'] });
    },
  });
};

export interface GradePayload {
  submissionId: string;
  feedback: string;
  grade?: number;
  rubricSlug?: string;
  criteria?: Array<{ key: string; levelPoints: number; comment?: string }>;
}

export const useGradeSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ submissionId, ...body }: GradePayload) => {
      const response = await api.put(`/submissions/${submissionId}/grade`, body);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
};
