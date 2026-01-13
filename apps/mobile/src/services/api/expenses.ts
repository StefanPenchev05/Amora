import apiClient from './client';

export interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  paid_by: string;
  is_settled: boolean;
  expense_date: string;
  created_at: string;
  updated_at: string;
}

export interface CreateExpenseRequest {
  amount: number;
  description: string;
  category: string;
  paid_by: string;
  expense_date: string;
}

export interface UpdateExpenseRequest {
  amount: number;
  description: string;
  category: string;
  paid_by: string;
  expense_date: string;
}

export const expenseService = {
  async getAll(startDate?: string, endDate?: string): Promise<Expense[]> {
    let endpoint = '/api/expenses';
    if (startDate && endDate) {
      endpoint += `?start_date=${startDate}&end_date=${endDate}`;
    }
    return apiClient.get<Expense[]>(endpoint);
  },

  async create(data: CreateExpenseRequest): Promise<Expense> {
    return apiClient.post<Expense>('/api/expenses', data);
  },

  async update(id: string, data: UpdateExpenseRequest): Promise<Expense> {
    return apiClient.put<Expense>(`/api/expenses/${id}`, data);
  },

  async settle(id: string): Promise<Expense> {
    return apiClient.post<Expense>(`/api/expenses/${id}/settle`);
  },

  async delete(id: string): Promise<void> {
    return apiClient.delete(`/api/expenses/${id}`);
  },
};
