import apiClient from './client';

export type RelationshipStatus = 'none' | 'pending' | 'active';

export type RelationshipStatusResponse = {
  relationship_id?: string;
  status: RelationshipStatus;
  invite_code?: string;
  partner?: {
    user_id: string;
    email: string;
    username: string;
    full_name: string;
  };
};

export const relationshipService = {
  async getStatus(): Promise<RelationshipStatusResponse> {
    return apiClient.get<RelationshipStatusResponse>('/api/relationship');
  },

  async createInvite(): Promise<RelationshipStatusResponse> {
    return apiClient.post<RelationshipStatusResponse>('/api/relationship/invite', {});
  },

  async acceptInvite(code: string): Promise<RelationshipStatusResponse> {
    return apiClient.post<RelationshipStatusResponse>('/api/relationship/accept', { code });
  },
};
