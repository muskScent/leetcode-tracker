import apiClient from './client';
import { Note, CreateNoteDto, UpdateNoteDto, FilterNotesParams } from '../types';

export const notesApi = {
  getAll: (filters?: FilterNotesParams) =>
    apiClient.get<Note[]>('/notes', { params: filters }).then((r) => r.data),
  getById: (id: string) =>
    apiClient.get<Note>(`/notes/${id}`).then((r) => r.data),
  create: (data: CreateNoteDto) =>
    apiClient.post<Note>('/notes', data).then((r) => r.data),
  update: (id: string, data: UpdateNoteDto) =>
    apiClient.patch<Note>(`/notes/${id}`, data).then((r) => r.data),
  delete: (id: string) =>
    apiClient.delete(`/notes/${id}`).then((r) => r.data),
};
