/**
 * User registration command types and interfaces
 * 
 * This module defines the structure for user registration data in the domain layer.
 * Following DDD principles, these are command objects that encapsulate all the
 * information needed to register a new user in the system.
 */

/**
 * Gender options for user profile
 * Provides inclusive gender selection following modern UX best practices
 */
export type Gender = "male" | "female" | "Something Else" | "Prefer Not To Say";

/**
 * Avatar reference types for profile images
 * 
 * Supports multiple avatar sources:
 * - uri: Local device file (React Native file picker)
 * - remote: External URL (social login avatars, CDN images)
 * - none: No avatar selected (will use default)
 */
export type AvatarRef =
  | { kind: "uri"; uri: string; mime: string; size?: number } // RN files from device
  | { kind: "remote"; url: string }                           // Remote URLs (social login)
  | { kind: "none" };                                        // No avatar (default)

/**
 * Authentication credentials for user registration
 * 
 * Supports multiple authentication providers:
 * - Traditional email/password registration
 * - OAuth providers (Google, Apple Sign-In)
 * - Third-party authentication tokens
 */
export type Credentials = {
  /** User's email address (used as primary identifier) */
  email: string;
  
  /** User's password (for email/password registration) */
  password: string;
  
  /** Authentication provider used for registration */
  provider?: "password" | "google" | "apple";
  
  /** OAuth token from third-party provider (when using social login) */
  oauthToken?: string;
};

/**
 * User profile information for registration
 * 
 * Contains personal information and profile data that will be displayed
 * to other users in the application. Most fields are optional to reduce
 * friction during registration process.
 */
export type ProfileInfo = {
  /** Unique username for the user (display handle) */
  username: string;
  
  /** User's first name */
  firstName: string;
  
  /** User's last name */
  lastName: string;
  
  /** User's gender identity (optional, inclusive options) */
  gender?: Gender;
  
  /** User's birth date in ISO format (YYYY-MM-DD) */
  birthDate: string;
  
  /** User's phone number (optional, for verification/recovery) */
  phone?: string;
  
  /** User's profile avatar/picture reference */
  avatar?: AvatarRef;
  
  /** User's biography/description (optional, for profile display) */
  bio?: string;
};

/**
 * User preferences for localization and regional settings
 * 
 * These preferences control how the app displays content and
 * formats data based on the user's location and language preferences.
 */
export type Preferences = {
  /** User's preferred language/locale (e.g., "en-US", "es-ES") */
  locale?: string;
  
  /** User's timezone for date/time display (e.g., "America/New_York") */
  timezone?: string;
};

/**
 * User's physical address information
 * 
 * Optional address data that may be used for:
 * - Shipping/delivery services
 * - Location-based features
 * - Regional content customization
 * - Legal compliance (tax, regulations)
 */
export type Address = {
  /** Primary address line (street number, street name) */
  line1?: string;
  
  /** Secondary address line (apartment, suite, unit) */
  line2?: string;
  
  /** City name */
  city?: string;
  
  /** State, province, or region */
  region?: string;
  
  /** Postal code or ZIP code */
  postalCode?: string;
  
  /** Country name or ISO country code */
  country?: string;
};

/**
 * Complete user registration command
 * 
 * This is the main command object that encapsulates all information
 * needed to register a new user in the system. Following the Command
 * pattern from DDD, this object represents the user's intent to register.
 * 
 * The command is designed with flexibility in mind:
 * - Only credentials are required (minimal friction registration)
 * - All other information is optional and can be collected progressively
 * - Supports both traditional and social authentication flows
 * - Extensible through metadata for future requirements
 * 
 * @example
 * ```typescript
 * // Minimal registration
 * const minimalCommand: RegisterCommand = {
 *   credentials: {
 *     email: "user@example.com",
 *     password: "securePassword123",
 *     provider: "password"
 *   }
 * };
 * 
 * // Complete registration
 * const fullCommand: RegisterCommand = {
 *   credentials: { ... },
 *   profile: {
 *     username: "johndoe",
 *     firstName: "John",
 *     lastName: "Doe",
 *     birthDate: "1990-01-15"
 *   },
 *   preferences: {
 *     locale: "en-US",
 *     timezone: "America/New_York"
 *   }
 * };
 * ```
 */
export type RegisterCommand = {
  /** Authentication credentials (required) */
  credentials: Credentials;
  
  /** User profile information (optional - can be collected later) */
  profile?: ProfileInfo;
  
  /** User preferences for localization (optional) */
  preferences?: Preferences;
  
  /** User's physical address (optional) */
  address?: Address;

  /** 
   * Additional metadata for extensibility
   * Can include tracking data, feature flags, experiment groups, etc.
   */
  metadata?: Record<string, unknown>;
};
