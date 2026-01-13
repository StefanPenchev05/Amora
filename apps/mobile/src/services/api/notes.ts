import apiClient from './client';

export interface Note {
  id: string;
  title: string;
  content: string;
  color: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteRequest {
  title: string;
  content: string;
  color: string;
}

export interface UpdateNoteRequest {
  title: string;
  content: string;
  color: string;
}

export const noteService = {
  async getAll(): Promise<Note[]> {
    return apiClient.get<Note[]>('/api/notes');
  },

  async create(data: CreateNoteRequest): Promise<Note> {
    return apiClient.post<Note>('/api/notes', data);
  },

  async update(id: string, data: UpdateNoteRequest): Promise<Note> {
    return apiClient.put<Note>(`/api/notes/${id}`, data);
  },

  async togglePin(id: string): Promise<Note> {
    return apiClient.post<Note>(`/api/notes/${id}/toggle-pin`);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/notes/${id}`);
  },
};
