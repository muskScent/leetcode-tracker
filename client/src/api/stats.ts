import apiClient from './client';
import { StatsOverview } from '../types';

export const statsApi = {
  getOverview: (tagIds?: string[]) =>
    apiClient
      .get<StatsOverview>('/stats/overview', {
        params: tagIds && tagIds.length > 0 ? { tagIds: tagIds.join(',') } : undefined,
      })
      .then((r) => r.data),
};
