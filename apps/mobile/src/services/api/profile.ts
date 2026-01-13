import apiClient from './client';

export type UploadImage = {
  uri: string;
  name: string;
  type: string;
};

export type UpdateAvatarResponse = {
  avatar_photo_id?: string | null;
  avatar_url?: string | null;
};

export const profileService = {
  async updateAvatar(avatar: UploadImage): Promise<UpdateAvatarResponse> {
    const form = new FormData();
    form.append('avatar', avatar as any);
    return await apiClient.post<UpdateAvatarResponse>('/api/profile/avatar', form);
  },
};
