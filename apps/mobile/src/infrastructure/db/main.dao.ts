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
};
