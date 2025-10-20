# Repository Pattern Documentation

## Overview

The repository pattern provides an abstraction layer between the domain layer and data access infrastructure. This ensures clean separation of concerns and makes the application more testable by allowing easy mocking and swapping of data sources.

## Architecture

```
src/domain/repositories/
├── ISecureStorageRepository.ts    # Secure storage contract
└── IMainRepository.ts             # Main data repository contract

src/infrastructure/repositories/
├── SecureStorageRepository.ts     # Expo SecureStore implementation
└── MainRepository.ts              # SQLite implementation
```

## Repository Interfaces

### `ISecureStorageRepository`

Defines a contract for secure key-value storage in the app with encryption and OS-level protection.

```typescript
export interface ISecureStorageRepository {
  setItem<T>(key: string, value: T | string, options?: SecureStoreOptions): Promise<void>;
  getItem<T>(key: string, options?: SecureStoreOptions): Promise<T | string | undefined>;
  deleteItem(key: string): Promise<void>;
  updateItem<T>(key: string, newValue: T | string): Promise<void>;
  clearAll(): Promise<void>;
}
```

#### Methods

##### `setItem<T>(key, value, options?)`

Saves a value for the given key with optional secure store configuration.

**Parameters:**
- `key: string` - Unique identifier for the stored value
- `value: T | string` - Data to store (automatically serialized if object)
- `options?: SecureStoreOptions` - Expo SecureStore configuration options

**Returns:** `Promise<void>`

**Examples:**

```typescript
// Store string value
await secureStorage.setItem("user_token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");

// Store object (automatically serialized)
await secureStorage.setItem("user_preferences", {
  theme: "dark",
  notifications: true,
  language: "en"
});

// Store with custom options
await secureStorage.setItem("sensitive_data", "secret", {
  requireAuthentication: true,
  authenticatePrompt: "Authenticate to access secure data"
});
```

##### `getItem<T>(key, options?)`

Retrieves a stored value for the given key.

**Parameters:**
- `key: string` - Unique identifier for the value to retrieve
- `options?: SecureStoreOptions` - Expo SecureStore configuration options

**Returns:** `Promise<T | string | undefined>` - The stored value or undefined if not found

**Examples:**

```typescript
// Get string value
const token = await secureStorage.getItem<string>("user_token");
if (token) {
  console.log("Token found:", token);
}

// Get typed object
interface UserPreferences {
  theme: "light" | "dark";
  notifications: boolean;
  language: string;
}

const prefs = await secureStorage.getItem<UserPreferences>("user_preferences");
if (prefs) {
  console.log("Theme:", prefs.theme);
}

// Get with authentication requirement
const sensitiveData = await secureStorage.getItem("sensitive_data", {
  requireAuthentication: true
});
```

##### `deleteItem(key)`

Removes a stored value for the given key.

**Parameters:**
- `key: string` - Unique identifier for the value to delete

**Returns:** `Promise<void>`

**Examples:**

```typescript
// Delete specific item
await secureStorage.deleteItem("user_token");

// Delete user session data
await secureStorage.deleteItem("access_token");
await secureStorage.deleteItem("refresh_token");
await secureStorage.deleteItem("user_preferences");
```

##### `updateItem<T>(key, newValue)`

Updates an existing stored value or creates a new one if the key doesn't exist.

**Parameters:**
- `key: string` - Unique identifier for the value to update
- `newValue: T | string` - New value to store

**Returns:** `Promise<void>`

**Examples:**

```typescript
// Update existing preferences
const currentPrefs = await secureStorage.getItem<UserPreferences>("user_preferences");
if (currentPrefs) {
  await secureStorage.updateItem("user_preferences", {
    ...currentPrefs,
    theme: "light"
  });
}

// Update or create new token
await secureStorage.updateItem("access_token", newToken);
```

##### `clearAll()`

Removes all stored values from secure storage.

**Returns:** `Promise<void>`

**Examples:**

```typescript
// Clear all data on logout
async function logout() {
  await secureStorage.clearAll();
  // Navigate to login screen
}

// Clear data on app reset
async function resetApp() {
  await secureStorage.clearAll();
  // Reinitialize app state
}
```

#### Common Use Cases

##### Authentication Token Storage

```typescript
interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

class AuthService {
  constructor(private storage: ISecureStorageRepository) {}

  async saveTokens(tokens: AuthTokens): Promise<void> {
    await this.storage.setItem("access_token", tokens.access_token);
    await this.storage.setItem("refresh_token", tokens.refresh_token);
    await this.storage.setItem("token_expires_at", tokens.expires_at.toString());
  }

  async getAccessToken(): Promise<string | undefined> {
    return this.storage.getItem<string>("access_token");
  }

  async clearTokens(): Promise<void> {
    await this.storage.deleteItem("access_token");
    await this.storage.deleteItem("refresh_token");
    await this.storage.deleteItem("token_expires_at");
  }
}
```

##### User Preferences Storage

```typescript
interface AppSettings {
  theme: "light" | "dark" | "system";
  fontSize: "small" | "medium" | "large";
  notifications: {
    push: boolean;
    email: boolean;
    marketing: boolean;
  };
  privacy: {
    analytics: boolean;
    crashReporting: boolean;
  };
}

class SettingsService {
  constructor(private storage: ISecureStorageRepository) {}

  async saveSettings(settings: AppSettings): Promise<void> {
    await this.storage.setItem("app_settings", settings);
  }

  async getSettings(): Promise<AppSettings | undefined> {
    return this.storage.getItem<AppSettings>("app_settings");
  }

  async updateTheme(theme: AppSettings["theme"]): Promise<void> {
    const settings = await this.getSettings();
    if (settings) {
      await this.storage.updateItem("app_settings", {
        ...settings,
        theme
      });
    }
  }
}
```

### `IMainRepository`

Defines a contract for main application data storage, typically implemented with SQLite for offline-first functionality.

```typescript
export interface IMainRepository {
  upsertUser(user: User): Promise<void>;
  upsertPost(post: Post): Promise<void>;
  upsertMediaFile(media: MediaFile): Promise<void>;
  listPosts(limit?: number, cursor?: string): Promise<Post[]>;
  deletePost(id: string): Promise<void>;
  purgeAll(): Promise<void>;
}
```

#### Entity Types

The repository works with domain entities:

```typescript
// User entity
interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Post entity
interface Post {
  id: string;
  userId: string;
  content: string;
  mediaFiles: string[]; // Media file IDs
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// MediaFile entity
interface MediaFile {
  id: string;
  userId: string;
  postId?: string;
  type: "image" | "video" | "audio";
  url: string;
  localPath?: string;
  size: number;
  metadata?: Record<string, any>;
  createdAt: Date;
}
```

#### Methods

##### `upsertUser(user)`

Creates a new user or updates an existing one.

**Parameters:**
- `user: User` - User entity to store

**Returns:** `Promise<void>`

**Examples:**

```typescript
// Create new user
const newUser: User = {
  id: "user_123",
  username: "johndoe",
  email: "john@example.com",
  displayName: "John Doe",
  avatarUrl: "https://example.com/avatar.jpg",
  createdAt: new Date(),
  updatedAt: new Date()
};

await mainRepository.upsertUser(newUser);

// Update existing user
const updatedUser: User = {
  ...existingUser,
  displayName: "John Smith",
  updatedAt: new Date()
};

await mainRepository.upsertUser(updatedUser);
```

##### `upsertPost(post)`

Creates a new post or updates an existing one.

**Parameters:**
- `post: Post` - Post entity to store

**Returns:** `Promise<void>`

**Examples:**

```typescript
// Create new post
const newPost: Post = {
  id: "post_456",
  userId: "user_123",
  content: "Hello, world! This is my first post.",
  mediaFiles: ["media_789"],
  likesCount: 0,
  commentsCount: 0,
  createdAt: new Date(),
  updatedAt: new Date()
};

await mainRepository.upsertPost(newPost);

// Update post with new like count
const updatedPost: Post = {
  ...existingPost,
  likesCount: existingPost.likesCount + 1,
  updatedAt: new Date()
};

await mainRepository.upsertPost(updatedPost);
```

##### `upsertMediaFile(media)`

Creates a new media file or updates an existing one.

**Parameters:**
- `media: MediaFile` - MediaFile entity to store

**Returns:** `Promise<void>`

**Examples:**

```typescript
// Store uploaded image
const imageFile: MediaFile = {
  id: "media_789",
  userId: "user_123",
  postId: "post_456",
  type: "image",
  url: "https://cdn.example.com/images/photo.jpg",
  localPath: "/local/cache/photo.jpg",
  size: 1024000,
  metadata: {
    width: 1920,
    height: 1080,
    format: "jpeg"
  },
  createdAt: new Date()
};

await mainRepository.upsertMediaFile(imageFile);

// Update with local cache path
const updatedMedia: MediaFile = {
  ...existingMedia,
  localPath: "/new/cache/path/photo.jpg"
};

await mainRepository.upsertMediaFile(updatedMedia);
```

##### `listPosts(limit?, cursor?)`

Retrieves a paginated list of posts.

**Parameters:**
- `limit?: number` - Maximum number of posts to return (optional)
- `cursor?: string` - Pagination cursor for offset (optional)

**Returns:** `Promise<Post[]>` - Array of post entities

**Examples:**

```typescript
// Get all posts
const allPosts = await mainRepository.listPosts();

// Get first 20 posts
const recentPosts = await mainRepository.listPosts(20);

// Get next page of posts
const nextPage = await mainRepository.listPosts(20, "cursor_abc123");

// Implement infinite scroll
class PostsService {
  private cursor?: string;

  async loadMorePosts(): Promise<Post[]> {
    const posts = await mainRepository.listPosts(20, this.cursor);
    
    if (posts.length > 0) {
      this.cursor = posts[posts.length - 1].id;
    }
    
    return posts;
  }

  reset(): void {
    this.cursor = undefined;
  }
}
```

##### `deletePost(id)`

Removes a post from storage.

**Parameters:**
- `id: string` - Unique identifier of the post to delete

**Returns:** `Promise<void>`

**Examples:**

```typescript
// Delete specific post
await mainRepository.deletePost("post_456");

// Delete user's own posts
class PostService {
  async deleteUserPost(postId: string, userId: string): Promise<void> {
    const posts = await mainRepository.listPosts();
    const post = posts.find(p => p.id === postId && p.userId === userId);
    
    if (post) {
      await mainRepository.deletePost(postId);
      console.log("Post deleted successfully");
    } else {
      throw new Error("Post not found or permission denied");
    }
  }
}
```

##### `purgeAll()`

Removes all data from the repository (useful for logout/reset).

**Returns:** `Promise<void>`

**Examples:**

```typescript
// Clear all data on logout
async function logout() {
  await mainRepository.purgeAll();
  await secureStorage.clearAll();
  // Navigate to login
}

// Reset app data
async function resetApp() {
  const confirmed = await showConfirmDialog(
    "Are you sure you want to reset all app data?"
  );
  
  if (confirmed) {
    await mainRepository.purgeAll();
    // Restart app or navigate to onboarding
  }
}
```

## Implementation Examples

### Dependency Injection

```typescript
// Container setup
class DIContainer {
  private secureStorage: ISecureStorageRepository;
  private mainRepository: IMainRepository;

  constructor() {
    this.secureStorage = new SecureStorageRepository();
    this.mainRepository = new MainRepository();
  }

  getSecureStorage(): ISecureStorageRepository {
    return this.secureStorage;
  }

  getMainRepository(): IMainRepository {
    return this.mainRepository;
  }
}

// Service using repositories
class UserService {
  constructor(
    private secureStorage: ISecureStorageRepository,
    private mainRepository: IMainRepository
  ) {}

  async saveUserSession(user: User, tokens: AuthTokens): Promise<void> {
    // Save user data to main repository
    await this.mainRepository.upsertUser(user);
    
    // Save tokens to secure storage
    await this.secureStorage.setItem("access_token", tokens.access_token);
    await this.secureStorage.setItem("refresh_token", tokens.refresh_token);
    
    // Save user ID for quick access
    await this.secureStorage.setItem("current_user_id", user.id);
  }
}
```

### Testing with Mocks

```typescript
// Mock implementations for testing
class MockSecureStorage implements ISecureStorageRepository {
  private storage = new Map<string, any>();

  async setItem<T>(key: string, value: T | string): Promise<void> {
    this.storage.set(key, value);
  }

  async getItem<T>(key: string): Promise<T | string | undefined> {
    return this.storage.get(key);
  }

  async deleteItem(key: string): Promise<void> {
    this.storage.delete(key);
  }

  async updateItem<T>(key: string, newValue: T | string): Promise<void> {
    this.storage.set(key, newValue);
  }

  async clearAll(): Promise<void> {
    this.storage.clear();
  }
}

class MockMainRepository implements IMainRepository {
  private users: User[] = [];
  private posts: Post[] = [];
  private mediaFiles: MediaFile[] = [];

  async upsertUser(user: User): Promise<void> {
    const index = this.users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      this.users[index] = user;
    } else {
      this.users.push(user);
    }
  }

  async upsertPost(post: Post): Promise<void> {
    const index = this.posts.findIndex(p => p.id === post.id);
    if (index >= 0) {
      this.posts[index] = post;
    } else {
      this.posts.push(post);
    }
  }

  async upsertMediaFile(media: MediaFile): Promise<void> {
    const index = this.mediaFiles.findIndex(m => m.id === media.id);
    if (index >= 0) {
      this.mediaFiles[index] = media;
    } else {
      this.mediaFiles.push(media);
    }
  }

  async listPosts(limit?: number, cursor?: string): Promise<Post[]> {
    let posts = [...this.posts].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (cursor) {
      const cursorIndex = posts.findIndex(p => p.id === cursor);
      posts = posts.slice(cursorIndex + 1);
    }

    return limit ? posts.slice(0, limit) : posts;
  }

  async deletePost(id: string): Promise<void> {
    this.posts = this.posts.filter(p => p.id !== id);
  }

  async purgeAll(): Promise<void> {
    this.users = [];
    this.posts = [];
    this.mediaFiles = [];
  }
}

// Test example
describe("UserService", () => {
  let userService: UserService;
  let mockSecureStorage: MockSecureStorage;
  let mockMainRepository: MockMainRepository;

  beforeEach(() => {
    mockSecureStorage = new MockSecureStorage();
    mockMainRepository = new MockMainRepository();
    userService = new UserService(mockSecureStorage, mockMainRepository);
  });

  it("should save user session correctly", async () => {
    const user: User = { /* test user data */ };
    const tokens: AuthTokens = { /* test tokens */ };

    await userService.saveUserSession(user, tokens);

    const savedToken = await mockSecureStorage.getItem("access_token");
    expect(savedToken).toBe(tokens.access_token);
  });
});
```

## Best Practices

### 1. Interface Segregation

Keep repository interfaces focused on specific concerns:

```typescript
// ✅ Good - Focused interfaces
interface IUserRepository {
  getUser(id: string): Promise<User | undefined>;
  saveUser(user: User): Promise<void>;
  deleteUser(id: string): Promise<void>;
}

interface IPostRepository {
  getPost(id: string): Promise<Post | undefined>;
  listPosts(userId?: string): Promise<Post[]>;
  savePost(post: Post): Promise<void>;
  deletePost(id: string): Promise<void>;
}

// ❌ Avoid - Monolithic interface
interface IMegaRepository {
  // 50+ methods for different entities
}
```

### 2. Error Handling

Implement proper error handling in repository methods:

```typescript
class SecureStorageRepository implements ISecureStorageRepository {
  async getItem<T>(key: string): Promise<T | string | undefined> {
    try {
      const value = await SecureStore.getItemAsync(key);
      return value ? JSON.parse(value) : undefined;
    } catch (error) {
      console.error(`Failed to get item ${key}:`, error);
      throw new RepositoryError(`Failed to retrieve ${key}`, error);
    }
  }
}

class RepositoryError extends Error {
  constructor(message: string, public cause?: unknown) {
    super(message);
    this.name = "RepositoryError";
  }
}
```

### 3. Data Validation

Validate data before storing:

```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string(),
  username: z.string().min(3),
  email: z.string().email(),
  displayName: z.string(),
  avatarUrl: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

class ValidatingMainRepository implements IMainRepository {
  async upsertUser(user: User): Promise<void> {
    const validUser = UserSchema.parse(user);
    // Proceed with storage
    await this.storage.upsertUser(validUser);
  }
}
```

### 4. Offline-First Design

Design repositories to work offline-first:

```typescript
class OfflineFirstPostRepository implements IPostRepository {
  constructor(
    private localRepo: IMainRepository,
    private remoteRepo: IRemoteRepository,
    private syncService: ISyncService
  ) {}

  async listPosts(): Promise<Post[]> {
    // Always return local data first
    const localPosts = await this.localRepo.listPosts();
    
    // Sync in background
    this.syncService.syncPosts().catch(console.error);
    
    return localPosts;
  }

  async savePost(post: Post): Promise<void> {
    // Save locally immediately
    await this.localRepo.upsertPost(post);
    
    // Queue for remote sync
    await this.syncService.queuePostForSync(post);
  }
}
```

## Related Documentation

- [HTTP Client](./http-client.md)
- [HTTP Types](./http-types.md)
- [Directory Structure](./directory_structure.md)
- [Design System](./DESIGN_SYSTEM.md)