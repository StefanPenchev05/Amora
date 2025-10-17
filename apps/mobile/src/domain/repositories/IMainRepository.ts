import type { User } from "@domain/entities/user";
import type { Post } from "@domain/entities/post";
import type { MediaFile } from "@domain/entities/media-file";

export interface IMainRepository {
  upsertUser(user: User): Promise<void>;
  upsertPost(post: Post): Promise<void>;
  upsertMediaFile(media: MediaFile): Promise<void>;
  listPosts(limit?: number, cursor?: string): Promise<Post[]>;
  deletePost(id: string): Promise<void>;
  purgeAll(): Promise<void>;
}