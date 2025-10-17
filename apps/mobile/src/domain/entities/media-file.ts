export type MediaFile = {
  id: string;
  postId?: string;
  filePath: string;
  remoteUrl?: string;
  fileType: "image" | "video" | "audio" | "file";
  fileSize?: number;
  mimeType?: string;
  syncStatus: "pending" | "synced";
  createdAt: string;
};
