import apiClient from './client';
import { Tag } from '../types';

export const tagsApi = {
  getAll: () => apiClient.get<Tag[]>('/tags').then((r) => r.data),
  create: (data: { name: string }) =>
    apiClient.post<Tag>('/tags', data).then((r) => r.data),
  delete: (id: string) => apiClient.delete(`/tags/${id}`).then((r) => r.data),
};
