import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notesApi } from '../api/notes';
import { CreateNoteDto, FilterNotesParams, UpdateNoteDto } from '../types';

export function useNotes(filters?: FilterNotesParams) {
  return useQuery({
    queryKey: ['notes', filters],
    queryFn: () => notesApi.getAll(filters),
  });
}

export function useNote(id: string | null) {
  return useQuery({
    queryKey: ['notes', id],
    queryFn: () => notesApi.getById(id!),
    enabled: !!id,
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateNoteDto) => notesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoteDto }) =>
      notesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notesApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notes'] });
    },
  });
}
