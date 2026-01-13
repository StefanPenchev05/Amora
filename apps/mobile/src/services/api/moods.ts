import apiClient from './client';

export interface Mood {
  id: string;
  level: number;
  note: string;
  mood_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMoodRequest {
  level: number;
  note: string;
  mood_date: string;
}

export interface UpdateMoodRequest {
  level: number;
  note: string;
  mood_date: string;
}

export const moodService = {
  async getAll(startDate?: string, endDate?: string): Promise<Mood[]> {
    let endpoint = '/api/moods';
    if (startDate && endDate) {
      endpoint += `?start_date=${startDate}&end_date=${endDate}`;
    }
    return apiClient.get<Mood[]>(endpoint);
  },

  async create(data: CreateMoodRequest): Promise<Mood> {
    return apiClient.post<Mood>('/api/moods', data);
  },

  async update(id: string, data: UpdateMoodRequest): Promise<Mood> {
    return apiClient.put<Mood>(`/api/moods/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/moods/${id}`);
  },
};
