import apiClient from './client';
import { Category } from '../types';

export const categoriesApi = {
  getAll: () => apiClient.get<Category[]>('/categories').then((r) => r.data),
  create: (data: { name: string }) =>
    apiClient.post<Category>('/categories', data).then((r) => r.data),
  update: (id: string, data: { name: string }) =>
    apiClient.patch<Category>(`/categories/${id}`, data).then((r) => r.data),
  delete: (id: string) =>
    apiClient.delete(`/categories/${id}`).then((r) => r.data),
};
