import { useQuery } from '@tanstack/react-query';
import { statsApi } from '../api/stats';

export function useStats(tagIds?: string[]) {
  return useQuery({
    queryKey: ['stats', tagIds],
    queryFn: () => statsApi.getOverview(tagIds),
  });
}
