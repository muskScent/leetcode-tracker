import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewsApi, ReviewSnapshot } from '../api/reviews';
import { Performance } from '../types';

export function useDueReviews() {
  return useQuery({
    queryKey: ['reviews', 'due'],
    queryFn: reviewsApi.getDue,
  });
}

export function useMarkReviewed() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, performance }: { id: string; performance: Performance }) =>
      reviewsApi.markReviewed(id, performance),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] });
      qc.invalidateQueries({ queryKey: ['problems'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}

export function useUndoReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, snapshot }: { id: string; snapshot: ReviewSnapshot }) =>
      reviewsApi.undo(id, snapshot),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] });
      qc.invalidateQueries({ queryKey: ['problems'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
