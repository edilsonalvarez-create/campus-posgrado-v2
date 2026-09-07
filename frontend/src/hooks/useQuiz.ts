import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export interface QuizQuestion {
  id: string;
  text: string;
  type: 'multiple-choice';
  options: Array<{ id: string; text: string }>;
}

export interface Quiz {
  id: string;
  resourceId: string;
  courseId: string;
  title: string;
  questions: QuizQuestion[];
}

export interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  kind: 'asignatura' | 'tramo' | 'programa';
  requirements: Record<string, unknown>;
  issuedAt: string;
  expiresAt: string | null;
}

export const useQuiz = (quizId: string) => {
  return useQuery({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      const response = await api.get<Quiz>(`/quizzes/${quizId}`);
      return response.data;
    },
    enabled: !!quizId
  });
};

export const useSubmitQuiz = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { quizId: string; answers: Array<{ questionId: string; answer: string }> }) => {
      const response = await api.post('/quiz-responses', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      // El examen puede completar recursos y mover el progreso del curso/programa.
      queryClient.invalidateQueries({ queryKey: ['course'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
      queryClient.invalidateQueries({ queryKey: ['program'] });
    }
  });
};

export const useCertificates = () => {
  return useQuery({
    queryKey: ['certificates'],
    queryFn: async () => {
      const response = await api.get<Certificate[]>('/certificates');
      return response.data;
    }
  });
};
