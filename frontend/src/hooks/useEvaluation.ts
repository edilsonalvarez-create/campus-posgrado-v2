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

// ---------- TFM (4 hitos) ----------
export interface TfmMilestone {
  slug: string;
  title: string;
  description: string;
  weight: number;
  requiresVideo: boolean;
  templateUrl: string | null;
  rubricSlug: string;
  submission: {
    id: string;
    reviewId: string;
    content: string;
    repoUrl: string | null;
    files: Array<{ label: string; type: string; url: string }>;
    defenseVideoUrl: string | null;
    status: 'submitted' | 'changes_requested' | 'approved';
    directorNote: string | null;
    grade: number | null;
    feedback: string | null;
    rubric: any;
  } | null;
}
export interface TfmState {
  enrollment: { id: string; title: string | null; status: string; directorName: string | null; directorId: string | null } | null;
  weightedScore: number;
  milestones: TfmMilestone[];
}

export const useTfm = (userId?: string) =>
  useQuery({
    queryKey: ['tfm', userId || 'me'],
    queryFn: async () => (await api.get<TfmState>(`/tfm${userId ? `?userId=${userId}` : ''}`)).data,
  });

export const useTfmEnroll = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => (await api.post('/tfm/enroll', {})).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tfm'] }),
  });
};

export const useSubmitMilestone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: {
      slug: string;
      content: string;
      repoUrl?: string;
      files?: Array<{ label: string; type: string; url: string }>;
      defenseVideoUrl?: string;
    }) => (await api.post(`/tfm/milestones/${v.slug}`, v)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tfm'] });
      qc.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
};

export const useReviewMilestone = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: {
      reviewId: string;
      decision: 'approve' | 'changes';
      criteria?: Array<{ key: string; levelPoints: number; comment?: string }>;
      feedback?: string;
      note?: string;
    }) => (await api.put(`/tfm/milestones/${v.reviewId}/review`, v)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tfm'] });
      qc.invalidateQueries({ queryKey: ['certificates'] });
    },
  });
};

// ---------- Tutor socrático por lección ----------
export interface TutorMessage {
  role: 'user' | 'assistant' | 'system-refusal';
  content: string;
  flagged?: boolean;
}
export const useTutor = (resourceId?: string) =>
  useQuery({
    queryKey: ['tutor', resourceId],
    queryFn: async () => (await api.get<{ enabled: boolean; messages: TutorMessage[] }>(`/tutor/${resourceId}`)).data,
    enabled: !!resourceId,
  });

export const useAskTutor = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { resourceId: string; question: string }) =>
      (await api.post<{ answer: string; refused: boolean; disabled?: boolean }>(`/tutor/${v.resourceId}`, { question: v.question })).data,
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['tutor', v.resourceId] }),
  });
};

// ---------- Asistencia de nota por IA (instructor) ----------
export const useGradeSuggestion = () =>
  useMutation({
    mutationFn: async (v: { submissionId: string; rubricSlug: string }) =>
      (await api.post<{ suggestion: any }>(`/submissions/${v.submissionId}/grade-suggestion`, { rubricSlug: v.rubricSlug })).data,
  });
