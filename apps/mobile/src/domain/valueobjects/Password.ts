/**
 * Password Value Object
 * 
 * Represents a validated password in the domain.
 * Encapsulates password validation and security requirements.
 */

export class Password {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  /**
   * Creates a new Password instance with business rule validation
   * 
   * @param value - Raw password string
   * @returns Valid Password instance
   * @throws ValidationError when password doesn't meet requirements
   */
  public static create(value: string): Password {
    // Domain validation - security requirements (business rules)
    if (!value) {
      throw new ValidationError("Password cannot be empty");
    }

    if (value.length < 8) {
      throw new ValidationError("Password must be at least 8 characters long");
    }

    if (value.length > 128) {
      throw new ValidationError("Password cannot exceed 128 characters");
    }

    // Business rule: Password complexity requirements
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumbers = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      throw new ValidationError(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      );
    }

    // Business rule: No common passwords
    const commonPasswords = [
      "password", "123456", "password123", "admin", "qwerty",
      "letmein", "welcome", "monkey", "dragon"
    ];
    
    if (commonPasswords.includes(value.toLowerCase())) {
      throw new ValidationError("Password is too common, please choose a stronger password");
    }

    return new Password(value);
  }

  /**
   * Gets password strength score (domain logic)
   * 
   * @returns Number from 0-100 representing password strength
   */
  public getStrengthScore(): number {
    let score = 0;
    
    // Length bonus
    if (this._value.length >= 12) score += 25;
    else if (this._value.length >= 8) score += 15;
    
    // Character variety bonus
    if (/[A-Z]/.test(this._value)) score += 15;
    if (/[a-z]/.test(this._value)) score += 15;
    if (/\d/.test(this._value)) score += 15;
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(this._value)) score += 15;
    
    // Complexity bonus
    if (/[A-Z].*[A-Z]/.test(this._value)) score += 5; // Multiple uppercase
    if (/\d.*\d/.test(this._value)) score += 5; // Multiple numbers
    if (this._value.length >= 16) score += 10; // Very long
    
    return Math.min(score, 100);
  }

  // We don't expose the actual password value for security
  public get length(): number {
    return this._value.length;
  }

  public equals(other: Password): boolean {
    return this._value === other._value;
  }

  // Internal method for authentication - should only be used by domain services
  public getHashableValue(): string {
    return this._value;
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}