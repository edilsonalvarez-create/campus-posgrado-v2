import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

// ---------- Rúbricas ----------
export interface RubricLevel {
  label: string;
  points: number;
  descriptor: string;
}
export interface RubricCriterion {
  key: string;
  title: string;
  description: string;
  weight: number;
  levels: RubricLevel[];
}
export interface Rubric {
  slug: string;
  version: number;
  title: string;
  scope: string;
  passThreshold: number;
  totalPoints: number;
  criteria: RubricCriterion[];
}

export const useRubric = (slug?: string | null) =>
  useQuery({
    queryKey: ['rubric', slug],
    queryFn: async () => (await api.get<Rubric>(`/rubrics/${slug}`)).data,
    enabled: !!slug,
    staleTime: Infinity,
  });

// ---------- Quiz formativo + actividad de lección ----------
export interface FormativeState {
  formative: { answers: any[]; score: number; maxScore: number; passed: boolean; attempts: number } | null;
  activity: { content: string; updatedAt: string } | null;
}
export interface FormativeResult {
  score: number;
  maxScore: number;
  passed: boolean;
  detail: Array<{ i: number; choice: number | null; correct: boolean; correctIndex: number; why: string[] }>;
}

export const useFormative = (resourceId?: string) =>
  useQuery({
    queryKey: ['formative', resourceId],
    queryFn: async () => (await api.get<FormativeState>(`/formative/${resourceId}`)).data,
    enabled: !!resourceId,
  });

export const useSubmitFormative = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { resourceId: string; answers: Array<{ i: number; choice: number }> }) =>
      (await api.post<FormativeResult>(`/formative/${v.resourceId}`, { answers: v.answers })).data,
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['formative', v.resourceId] });
      qc.invalidateQueries({ queryKey: ['course'] });
      qc.invalidateQueries({ queryKey: ['courses'] });
      qc.invalidateQueries({ queryKey: ['progress'] });
      qc.invalidateQueries({ queryKey: ['program'] });
      qc.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
};

export const useSubmitActivity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { resourceId: string; content: string }) =>
      (await api.post(`/activity/${v.resourceId}`, { content: v.content })).data,
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['formative', v.resourceId] });
      qc.invalidateQueries({ queryKey: ['course'] });
      qc.invalidateQueries({ queryKey: ['courses'] });
      qc.invalidateQueries({ queryKey: ['progress'] });
      qc.invalidateQueries({ queryKey: ['program'] });
      qc.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
};

// ---------- Motor de exámenes ----------
export interface ExamStatus {
  hasBank: boolean;
  attemptsUsed: number;
  maxAttempts: number;
  passThreshold: number;
  drawSize: number;
  durationMinutes: number;
  lastScore: number | null;
  passed: boolean;
  cooldownUntil: string | null;
  canStart: boolean;
  reviewItems: Array<{ resourceId: string; title: string; skillTag: string }>;
}
export interface ExamAttempt {
  attemptId: string;
  attemptNo: number;
  expiresAt: string;
  durationMinutes: number;
  questions: Array<{ id: string; stem: string; options: string[] }>;
  resumed: boolean;
}
export interface ExamResult {
  score: number;
  passed: boolean;
  correct: number;
  total: number;
  expired: boolean;
  reviewItems: Array<{ resourceId: string; title: string; skillTag: string }>;
}

export const useExamStatus = (resourceId?: string) =>
  useQuery({
    queryKey: ['examStatus', resourceId],
    queryFn: async () => (await api.get<ExamStatus>(`/exams/${resourceId}/status`)).data,
    enabled: !!resourceId,
    staleTime: 0,
  });

export const useStartAttempt = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (resourceId: string) =>
      (await api.post<ExamAttempt>(`/exams/${resourceId}/attempts`, {})).data,
    onSuccess: (_d, resourceId) => qc.invalidateQueries({ queryKey: ['examStatus', resourceId] }),
  });
};

export const useSubmitAttempt = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { attemptId: string; answers: Array<{ questionId: string; choice: number }> }) =>
      (await api.post<ExamResult>(`/exams/attempts/${v.attemptId}`, { answers: v.answers })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['examStatus'] });
      qc.invalidateQueries({ queryKey: ['course'] });
      qc.invalidateQueries({ queryKey: ['courses'] });
      qc.invalidateQueries({ queryKey: ['progress'] });
      qc.invalidateQueries({ queryKey: ['program'] });
      qc.invalidateQueries({ queryKey: ['certificates'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

// ---------- Reanudar ----------
export const useResume = (courseId?: string) =>
  useQuery({
    queryKey: ['resume', courseId],
    queryFn: async () => (await api.get<{ resourceId: string | null }>(`/courses/${courseId}/resume`)).data,
    enabled: !!courseId,
    staleTime: Infinity,
  });

export const useSaveResume = () =>
  useMutation({
    mutationFn: async (v: { courseId: string; resourceId: string }) =>
      (await api.put(`/courses/${v.courseId}/resume`, { resourceId: v.resourceId })).data,
  });

export const logEvent = (eventType: string, payload?: Record<string, unknown>, resourceId?: string) => {
  api.post('/events', { eventType, payload: payload || {}, resourceId }).catch(() => {});
};

// ---------- Asistencia de nota por IA (instructor) ----------
export const useGradeSuggestion = () =>
  useMutation({
    mutationFn: async (v: { submissionId: string; rubricSlug: string }) =>
      (await api.post<{ suggestion: any }>(`/submissions/${v.submissionId}/grade-suggestion`, { rubricSlug: v.rubricSlug })).data,
  });
