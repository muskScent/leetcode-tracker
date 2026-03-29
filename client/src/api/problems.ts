import apiClient from './client';
import { Problem, CreateProblemDto, UpdateProblemDto, FilterProblemsParams } from '../types';

export const problemsApi = {
  getAll: (filters?: FilterProblemsParams) =>
    apiClient.get<Problem[]>('/problems', { params: filters }).then((r) => r.data),
  getById: (id: string) =>
    apiClient.get<Problem>(`/problems/${id}`).then((r) => r.data),
  create: (data: CreateProblemDto) =>
    apiClient.post<Problem>('/problems', data).then((r) => r.data),
  update: (id: string, data: UpdateProblemDto) =>
    apiClient.patch<Problem>(`/problems/${id}`, data).then((r) => r.data),
  delete: (id: string) =>
    apiClient.delete(`/problems/${id}`).then((r) => r.data),
};
