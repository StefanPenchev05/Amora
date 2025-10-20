import type { User } from "@domain/entities/user";
import type { Post } from "@domain/entities/post";
import type { MediaFile } from "@domain/entities/media-file";

/**
 * Main Repository Interface for Local SQLite Database
 * 
 * This repository defines the contract for local data storage operations
 * using SQLite database on the mobile device. It provides offline-first
 * functionality by storing core application data locally for immediate
 * access and synchronization with the backend API.
 * 
 * The SQLite implementation enables:
 * - Offline data access and manipulation
 * - Fast local queries and data retrieval
 * - Data persistence across app sessions
 * - Synchronization staging for remote API calls
 * - Local caching of frequently accessed data
 * 
 * This follows the Repository pattern from Domain-Driven Design,
 * abstracting the underlying SQLite storage implementation details
 * from the domain layer business logic.
 */
export interface IMainRepository {
  /**
   * Creates or updates a user record in the local SQLite database
   * 
   * @param user - User entity to store locally
   * @returns Promise<void> - Completes when user is persisted to SQLite
   */
  upsertUser(user: User): Promise<void>;

  /**
   * Creates or updates a post record in the local SQLite database
   * 
   * @param post - Post entity to store locally
   * @returns Promise<void> - Completes when post is persisted to SQLite
   */
  upsertPost(post: Post): Promise<void>;

  /**
   * Creates or updates a media file record in the local SQLite database
   * 
   * @param media - MediaFile entity to store locally (metadata only, not the actual file)
   * @returns Promise<void> - Completes when media metadata is persisted to SQLite
   */
  upsertMediaFile(media: MediaFile): Promise<void>;

  /**
   * Retrieves posts from the local SQLite database with optional pagination
   * 
   * @param limit - Maximum number of posts to return (optional)
   * @param cursor - Pagination cursor for offset-based paging (optional)
   * @returns Promise<Post[]> - Array of posts from local SQLite storage
   */
  listPosts(limit?: number, cursor?: string): Promise<Post[]>;

  /**
   * Removes a post from the local SQLite database
   * 
   * @param id - Unique identifier of the post to delete
   * @returns Promise<void> - Completes when post is removed from SQLite
   */
  deletePost(id: string): Promise<void>;

  /**
   * Completely clears all data from the local SQLite database
   * 
   * This operation removes all users, posts, and media files from
   * the local SQLite storage. Typically used during logout or
   * app reset scenarios.
   * 
   * @returns Promise<void> - Completes when all SQLite tables are cleared
   */
  purgeAll(): Promise<void>;
}