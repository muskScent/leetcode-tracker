import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { problemsApi } from '../api/problems';
import { CreateProblemDto, FilterProblemsParams, UpdateProblemDto } from '../types';

export function useProblems(filters?: FilterProblemsParams) {
  return useQuery({
    queryKey: ['problems', filters],
    queryFn: () => problemsApi.getAll(filters),
  });
}

export function useProblem(id: string | null) {
  return useQuery({
    queryKey: ['problems', id],
    queryFn: () => problemsApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateProblem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProblemDto) => problemsApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['problems'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateProblem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProblemDto }) =>
      problemsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['problems'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useDeleteProblem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: problemsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['problems'] });
      qc.invalidateQueries({ queryKey: ['stats'] });
      qc.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}
