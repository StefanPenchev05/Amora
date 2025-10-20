/**
 * Login command types and interfaces
 * 
 * This module defines the structure for user authentication in the domain layer.
 * Supports flexible login methods allowing users to authenticate with either
 * email address or username, following modern UX patterns.
 */

/**
 * Login identifier types - ensures user provides either email OR username
 * 
 * Using discriminated unions to enforce that exactly one identifier is provided,
 * preventing ambiguous login attempts and improving type safety.
 */
export type LoginIdentifier = 
  | { type: "email"; email: string }
  | { type: "username"; username: string };

/**
 * Authentication credentials for user login
 * 
 * Supports multiple authentication methods:
 * - Email + password authentication
 * - Username + password authentication
 * - OAuth provider authentication (Google, Apple, etc.)
 * - Optional "remember me" functionality for persistent sessions
 */
export type Credentials = {
  /** Login identifier - either email or username */
  identifier: LoginIdentifier;
  
  /** User's password (required for password-based auth) */
  password: string;
  
  /** Authentication provider (defaults to "password") */
  provider?: "password" | "google" | "apple" | "facebook";
  
  /** OAuth token from third-party provider (when using social login) */
  oauthToken?: string;
};

/**
 * Device and security information for login tracking
 * 
 * Used for security monitoring, session management, and fraud detection.
 * Helps identify suspicious login attempts and manage user sessions.
 */
export type DeviceInfo = {
  /** Unique device identifier */
  deviceId?: string;
  
  /** User-friendly device name (e.g., "John's iPhone") */
  deviceName?: string;
  
  /** Operating system platform */
  platform: "ios" | "android" | "web";
  
  /** Operating system version */
  osVersion?: string;
  
  /** Application version */
  appVersion: string;
  
  /** Device model/type */
  deviceModel?: string;
  
  /** User's IP address (for security logging) */
  ipAddress?: string;
  
  /** Browser/user agent information (for web clients) */
  userAgent?: string;
};

/**
 * Complete login command
 * 
 * This command encapsulates all information needed to authenticate a user.
 * Following the Command pattern from DDD, it represents the user's intent
 * to log into the system with comprehensive security tracking.
 * 
 * @example
 * ```typescript
 * // Login with email
 * const emailLogin: LoginCommand = {
 *   credentials: {
 *     identifier: { type: "email", email: "user@example.com" },
 *     password: "userPassword123",
 *     provider: "password"
 *   },
 *   rememberMe: true,
 *   deviceInfo: {
 *     platform: "ios",
 *     appVersion: "1.0.0"
 *   }
 * };
 * 
 * // Login with username
 * const usernameLogin: LoginCommand = {
 *   credentials: {
 *     identifier: { type: "username", username: "johndoe" },
 *     password: "userPassword123"
 *   },
 *   rememberMe: false,
 *   deviceInfo: {
 *     platform: "android",
 *     appVersion: "1.0.0"
 *   }
 * };
 * 
 * // Social login
 * const socialLogin: LoginCommand = {
 *   credentials: {
 *     identifier: { type: "email", email: "user@gmail.com" },
 *     password: "", // Not needed for OAuth
 *     provider: "google",
 *     oauthToken: "google-oauth-token-here"
 *   },
 *   rememberMe: true,
 *   deviceInfo: { ... }
 * };
 * ```
 */
export type LoginCommand = {
  /** Authentication credentials */
  credentials: Credentials;
  
  /** Whether to maintain session across app restarts */
  rememberMe: boolean;
  
  /** Device and security information */
  deviceInfo: DeviceInfo;
  
  /** 
   * Additional metadata for analytics, feature flags, etc.
   */
  metadata?: Record<string, unknown>;
};


