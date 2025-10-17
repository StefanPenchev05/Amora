import type { IMainRepository } from "@domain/repositories/IMainRepository"
import type { User } from "@domain/entities/user";
import type { Post } from "@domain/entities/post";
import type { MediaFile } from "@domain/entities/media-file";
import { MainDAO } from "@infrastructure/db/main.dao"

export class SqliteMainRepository implements IMainRepository {
  async upsertUser(user: User) { MainDAO.upsertUser(user); }
  async upsertPost(post: Post) { MainDAO.upsertPost(post); }
  async upsertMediaFile(media: MediaFile) { MainDAO.upsertMediaFile(media); }
  async listPosts(limit?: number, cursor?: string) { return MainDAO.listPosts(limit, cursor); }
  async deletePost(id: string) { MainDAO.deletePost(id); }
  async purgeAll() { MainDAO.purgeAll(); }
}