import { RegisterCommand, LoginCommand } from "../commands";

/**
 * Authentication Repository Interface
 * 
 * Defines the contract for authentication operations in the domain layer.
 * This repository abstracts the authentication infrastructure and provides
 * a clean interface for authentication-related use cases.
 * 
 * Following Domain-Driven Design principles:
 * - Interface belongs in domain layer (defines what the domain needs)
 * - Implementation belongs in infrastructure layer (how it's done)
 * - Provides abstraction over external authentication services
 * - Enables testing through dependency injection and mocking
 * 
 * The repository handles:
 * - User authentication (login/logout)
 * - User registration with various providers
 * - Token management and validation
 * - Session persistence and recovery
 * 
 * Implementation considerations:
 * - May integrate with backend APIs
 * - May use local secure storage for tokens
 * - Should handle network errors gracefully
 * - Must maintain security best practices
 */
export interface IAuthRepository {
  /**
   * Authenticates a user with email and password
   * 
   * Performs user login using traditional email/password credentials.
   * On successful authentication, the implementation should:
   * - Store authentication tokens securely
   * - Initialize user session
   * - Handle "remember me" functionality for persistent sessions
   * 
   * @param email - User's email address (used as unique identifier)
   * @param password - User's plain text password (should be secured in transit)
   * @param rememberMe - Whether to maintain session across app restarts
   * 
   * @returns Promise<void> - Completes when authentication is successful
   * 
   * @throws AuthenticationError - When credentials are invalid
   * @throws NetworkError - When authentication service is unavailable
   * @throws ValidationError - When email/password format is invalid
   * 
   * @example
   * ```typescript
   * try {
   *   await authRepository.login(
   *     "user@example.com", 
   *     "userPassword123", 
   *     true
   *   );
   *   console.log("Login successful");
   * } catch (error) {
   *   console.error("Login failed:", error.message);
   * }
   * ```
   */
  login(command: LoginCommand): Promise<void>;

  /**
   * Registers a new user in the system
   * 
   * Creates a new user account using the provided registration command.
   * The implementation should:
   * - Validate all required fields
   * - Check for existing users (email uniqueness)
   * - Handle different authentication providers (email, Google, Apple)
   * - Store user data and profile information
   * - Initialize user session after successful registration
   * - Handle email verification if required
   * 
   * @param command - Complete registration command with user data
   * 
   * @returns Promise<void> - Completes when registration is successful
   * 
   * @throws UserExistsError - When email is already registered
   * @throws ValidationError - When required fields are missing/invalid
   * @throws NetworkError - When registration service is unavailable
   * @throws OAuthError - When social login provider authentication fails
   * 
   * @example
   * ```typescript
   * const registrationCommand: RegisterCommand = {
   *   credentials: {
   *     email: "newuser@example.com",
   *     password: "securePassword123",
   *     provider: "password"
   *   },
   *   profile: {
   *     username: "newuser",
   *     firstName: "John",
   *     lastName: "Doe",
   *     birthDate: "1990-01-15"
   *   }
   * };
   * 
   * try {
   *   await authRepository.register(registrationCommand);
   *   console.log("Registration successful");
   * } catch (error) {
   *   console.error("Registration failed:", error.message);
   * }
   * ```
   */
  register(command: RegisterCommand): Promise<void>;
}
