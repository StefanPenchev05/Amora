import apiClient from './client';

export interface Event {
  user_id: string;
  id: string;
  title: string;
  description: string;
  category: 'date' | 'fun' | 'milestone' | 'task' | 'activity';
  event_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  category: string;
  event_date: string;
}

export interface UpdateEventRequest {
  title: string;
  description: string;
  category: string;
  event_date: string;
}

export const eventService = {
  async getAll(startDate?: string, endDate?: string): Promise<Event[]> {
    let endpoint = '/api/events';
    if (startDate && endDate) {
      endpoint += `?start_date=${startDate}&end_date=${endDate}`;
    }
    return apiClient.get<Event[]>(endpoint);
  },

  async create(data: CreateEventRequest): Promise<Event> {
    return apiClient.post<Event>('/api/events', data);
  },

  async update(id: string, data: UpdateEventRequest): Promise<Event> {
    return apiClient.put<Event>(`/api/events/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/events/${id}`);
  },
};
