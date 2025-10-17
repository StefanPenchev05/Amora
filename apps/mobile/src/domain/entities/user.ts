export type User = {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  syncStatus: "pending" | "synced";
  lastSyncedAt?: string;
};
