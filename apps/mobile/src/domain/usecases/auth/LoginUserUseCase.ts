import { Env } from "@/config/env";
import { LoginCommand } from "../../commands";
import { IAuthRepository } from "../../repositories/IAuthRepository";
import { Email } from "../../valueobjects/Email";
import { Password } from "../../valueobjects/Password";

/**
 * Login User Use Case
 *
 * Handles the business workflow for user authentication.
 * This is where application-level validations and business logic coordination occurs.
 *
 * Validation responsibilities:
 * 1. Cross-aggregate validation (business workflow rules)
 * 2. Use case preconditions and postconditions
 * 3. Coordination between different domain services
 * 4. Authorization checks
 */
export class LoginUserUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(cmd: LoginCommand): Promise<void> {
    this.validateCommand(cmd);

    await this.validateBusinessPreconditions(cmd);

    if (cmd.credentials.identifier.type === "email") {
      Email.create(cmd.credentials.identifier.email);
    }

    if (cmd.credentials.provider === "password") {
      Password.create(cmd.credentials.password);
    }

    this.validateSecurityRequirements(cmd);

    // Execute the actual authentication
    await this.authRepo.login(cmd);
  }

  /**
   * Validates that the command contains all required data for the use case.
   * This is application-level validation, not domain validation.
   */
  private validateCommand(cmd: LoginCommand): void {
    if (!cmd) {
      throw new Error("LoginCommand is required");
    }

    if (!cmd.credentials) {
      throw new Error("Credentials are required");
    }

    if (!cmd.deviceInfo) {
      throw new Error("Device information is required for security tracking");
    }

    if (!cmd.deviceInfo.platform) {
      throw new Error("Device platform is required");
    }

    if (!cmd.deviceInfo.appVersion) {
      throw new Error("App version is required for compatibility checks");
    }

    // Provider-specific validations
    if (cmd.credentials.provider === "password" && !cmd.credentials.password) {
      throw new Error("Password is required for password authentication");
    }

    if (
      cmd.credentials.provider !== "password" &&
      !cmd.credentials.oauthToken
    ) {
      throw new Error("OAuth token is required for social authentication");
    }
  }

  /**
   * Checks conditions that must be true before the use case can execute.
   * This includes cross-aggregate checks and business constraints.
   */
  private async validateBusinessPreconditions(
    cmd: LoginCommand
  ): Promise<void> {
    if (
      cmd.deviceInfo.platform &&
      !["ios", "android", "web"].includes(cmd.deviceInfo.platform)
    ) {
      throw new Error("Unsupported platform");
    }

    const minVersion = Env.MIN_VERSION;
    if (this.compareVersions(cmd.deviceInfo.appVersion, minVersion) < 0) {
      throw new Error(
        `App version ${cmd.deviceInfo.appVersion} is not supported. Please update to version ${minVersion} or higher.`
      );
    }
  }

  /**
   * Validates security-related constraints and authorization.
   */
  private validateSecurityRequirements(cmd: LoginCommand): void {
    // Security validation: OAuth token format
    if (cmd.credentials.oauthToken) {
      if (cmd.credentials.oauthToken.length < 10) {
        throw new Error("Invalid OAuth token format");
      }
    }

    // Business rule: Metadata size limits (prevent abuse)
    if (cmd.metadata) {
      const metadataSize = JSON.stringify(cmd.metadata).length;
      if (metadataSize > 1000) {
        // 1KB limit
        throw new Error("Metadata size exceeds limit");
      }
    }
  }

  /**
   * Utility method for version comparison
   */
  private compareVersions(version1: string, version2: string): number {
    const v1parts = version1.split(".").map((n) => Number.parseInt(n, 10));
    const v2parts = version2.split(".").map((n) => Number.parseInt(n, 10));

    for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
      const v1part = v1parts[i] || 0;
      const v2part = v2parts[i] || 0;

      if (v1part < v2part) return -1;
      if (v1part > v2part) return 1;
    }

    return 0;
  }
}
