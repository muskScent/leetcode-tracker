import apiClient from './client';
import { Performance, Problem } from '../types';

export interface ReviewSnapshot {
  performance: Performance | null;
  timesAttempted: number;
  nextReviewAt: string | null;
  lastReviewedAt: string | null;
  reviewInterval: number;
}

export const reviewsApi = {
  getDue: () =>
    apiClient.get<Problem[]>('/reviews/due').then((r) => r.data),
  markReviewed: (id: string, performance: Performance) =>
    apiClient
      .post<Problem>(`/reviews/${id}`, { performance })
      .then((r) => r.data),
  undo: (id: string, snapshot: ReviewSnapshot) =>
    apiClient
      .post<Problem>(`/reviews/${id}/undo`, snapshot)
      .then((r) => r.data),
};
