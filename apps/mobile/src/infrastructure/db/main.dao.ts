import { mainDb } from ".";
import type { User } from "@/src/domain/entities/user";
import type { Post } from "@/src/domain/entities/post";
import type { MediaFile } from "@/src/domain/entities/media-file";

export const MainDAO = {
  upsertUser(u: User) {
    mainDb.runSync(
      `INSERT OR REPLACE INTO users
            (id, email, username, first_name, last_name, avatar_url, is_verified, created_at, updated_at, sync_status, last_synced_at)
            VALUES(?,?,?,?,?,?,?,?,?,?,?);`,
      u.id,
      u.email,
      u.username,
      u.firstName,
      u.lastName,
      u.avatarUrl ?? null,
      u.isVerified ? 1 : 0,
      u.createdAt,
      u.updatedAt,
      u.syncStatus,
      u.lastSyncedAt ?? null
    );
  },

  upsertPost(p: Post) {
    mainDb.runSync(
      `INSERT OR REPLACE INTO posts
       (id, author_id, relationship_id, content, privacy_level, post_type, created_at, updated_at, sync_status, last_synced_at)
       VALUES(?,?,?,?,?,?,?,?,?,?);`,
      p.id,
      p.authorId,
      p.relationshipId ?? null,
      p.content ?? null,
      p.privacyLevel,
      p.postType,
      p.createdAt,
      p.updatedAt,
      p.syncStatus,
      p.lastSyncedAt ?? null
    );
  },

  upsertMediaFile(m: MediaFile) {
    mainDb.runSync(
      `INSERT OR REPLACE INTO media_files
       (id, post_id, file_path, remote_url, file_type, file_size, mime_type, sync_status, created_at)
       VALUES(?,?,?,?,?,?,?,?,?);`,
      m.id,
      m.postId ?? null,
      m.filePath,
      m.remoteUrl ?? null,
      m.fileType,
      m.fileSize ?? null,
      m.mimeType ?? null,
      m.syncStatus,
      m.createdAt
    );
  },

  listPosts(limit = 30, cursor?: string): Post[] {
    const cur = cursor ?? new Date().toISOString();
    const rows = mainDb.getAllSync<any>(
      `SELECT * FROM posts WHERE created_at < ? ORDER BY created_at DESC LIMIT ?;`,
      cur,
      limit
    );

    return rows.map((r) => ({
      id: r.id,
      authorId: r.author_id,
      relationshipId: r.relationship_id,
      content: r.content,
      privacyLevel: r.privacy_level,
      postType: r.post_type,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      syncStatus: r.sync_status,
      lastSyncedAt: r.last_synced_at,
    }));
  },

  deletePost(id: string) {
    mainDb.runSync(`DELETE FROM posts WHERE id = ?;`, id);
  },

  purgeAll() {
    mainDb.withTransactionSync(() => {
      mainDb.execSync(`DELETE FROM media_files;`);
      mainDb.execSync(`DELETE FROM posts;`);
      mainDb.execSync(`DELETE FROM users;`);
    });
  },
};
