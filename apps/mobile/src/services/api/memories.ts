import apiClient from './client';

export interface Memory {
  id: string;
  title: string;
  description: string;
  category: string;
  photo_url: string;
  memory_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateMemoryRequest {
  title: string;
  description: string;
  category: string;
  photo_url: string;
  memory_date: string;
}

export interface UpdateMemoryRequest {
  title: string;
  description: string;
  category: string;
  photo_url: string;
  memory_date: string;
}

export const memoryService = {
  async getAll(category?: string): Promise<Memory[]> {
    let endpoint = '/api/memories';
    if (category) {
      endpoint += `?category=${category}`;
    }
    return apiClient.get<Memory[]>(endpoint);
  },

  async create(data: CreateMemoryRequest): Promise<Memory> {
    return apiClient.post<Memory>('/api/memories', data);
  },

  async update(id: string, data: UpdateMemoryRequest): Promise<Memory> {
    return apiClient.put<Memory>(`/api/memories/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/memories/${id}`);
  },
};
