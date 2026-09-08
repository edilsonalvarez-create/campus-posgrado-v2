import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

// ---------- Plan de repaso dirigido ----------
export interface ReviewItem {
  skillTag: string;
  courseSlug: string;
  courseTitle: string;
  ratio: number | null;
  correct: number;
  total: number;
  lesson: { resourceId: string; title: string } | null;
}
export const useReviewPlan = () =>
  useQuery({
    queryKey: ['reviewPlan'],
    queryFn: async () => (await api.get<{ items: ReviewItem[] }>('/me/review-plan')).data.items,
  });

// ---------- Foro ----------
export interface ForumThreadSummary {
  id: string;
  title: string;
  body: string;
  authorName: string;
  pinned: boolean;
  locked: boolean;
  anchor: boolean;
  replies: number;
  createdAt: string;
  lastReplyAt: string;
}
export interface ForumThreadDetail extends Omit<ForumThreadSummary, 'replies' | 'lastReplyAt'> {
  courseId: string;
  posts: Array<{ id: string; authorName: string; body: string; parentPostId: string | null; createdAt: string }>;
}

export const useForum = (courseId?: string) =>
  useQuery({
    queryKey: ['forum', courseId],
    queryFn: async () => (await api.get<ForumThreadSummary[]>(`/courses/${courseId}/forum`)).data,
    enabled: !!courseId,
  });

export const useForumThread = (threadId?: string) =>
  useQuery({
    queryKey: ['forumThread', threadId],
    queryFn: async () => (await api.get<ForumThreadDetail>(`/forum/threads/${threadId}`)).data,
    enabled: !!threadId,
  });

export const useCreateThread = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { courseId: string; title: string; body: string }) =>
      (await api.post<{ id: string }>(`/courses/${v.courseId}/forum`, { title: v.title, body: v.body })).data,
    onSuccess: (_d, v) => qc.invalidateQueries({ queryKey: ['forum', v.courseId] }),
  });
};

export const useReplyThread = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { threadId: string; body: string; parentPostId?: string }) =>
      (await api.post(`/forum/threads/${v.threadId}/posts`, { body: v.body, parentPostId: v.parentPostId })).data,
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ['forumThread', v.threadId] });
      qc.invalidateQueries({ queryKey: ['forum'] });
    },
  });
};

export const useModerateThread = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { threadId: string; pinned?: boolean; locked?: boolean }) =>
      (await api.put(`/forum/threads/${v.threadId}`, v)).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forum'] });
      qc.invalidateQueries({ queryKey: ['forumThread'] });
    },
  });
};

// ---------- Revisión por pares ----------
export interface PeerReviewTask {
  id: string;
  submissionId: string;
  rubricSlug: string;
  status: 'assigned' | 'submitted';
  content: string;
  repoUrl: string | null;
  files: Array<{ label: string; type: string; url: string }>;
  resourceTitle: string;
  courseTitle: string;
  scores: any[];
  comment: string;
}

export const useMyPeerReviews = () =>
  useQuery({
    queryKey: ['peerReviews', 'mine'],
    queryFn: async () => (await api.get<PeerReviewTask[]>('/me/peer-reviews')).data,
  });

export const useReceivedPeerReviews = (submissionId?: string) =>
  useQuery({
    queryKey: ['peerReviews', 'received', submissionId],
    queryFn: async () =>
      (await api.get<Array<{ scores: any[]; comment: string; submittedAt: string }>>(`/submissions/${submissionId}/peer-reviews`)).data,
    enabled: !!submissionId,
  });

export const useRequestPeerReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (submissionId: string) =>
      (await api.post<{ assigned: number; pending: boolean }>(`/submissions/${submissionId}/request-peer-review`, {})).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['peerReviews'] }),
  });
};

export const useSubmitPeerReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { submissionId: string; scores: Array<{ key: string; levelPoints: number; comment?: string }>; comment: string }) =>
      (await api.post(`/submissions/${v.submissionId}/peer-reviews`, { scores: v.scores, comment: v.comment })).data,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['peerReviews'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
