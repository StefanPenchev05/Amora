export type Post = {
  id: string;
  authorId: string;
  relationshipId?: string;
  content?: string;
  privacyLevel: "private" | "couple" | "public";
  postType: "text" | "image" | "video" | "audio";
  createdAt: string;
  updatedAt: string;
  syncStatus: "pending" | "synced";
  lastSyncedAt?: string;
};