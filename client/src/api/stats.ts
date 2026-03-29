import apiClient from './client';
import { StatsOverview } from '../types';

export const statsApi = {
  getOverview: () =>
    apiClient.get<StatsOverview>('/stats/overview').then((r) => r.data),
};
