/**
 * Email Value Object
 * 
 * Represents a validated email address in the domain.
 * Encapsulates email validation logic and ensures email invariants.
 * 
 * Following DDD principles:
 * - Value objects are immutable
 * - They validate their own invariants
 * - Business rules are embedded in the domain
 */

export class Email {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  /**
   * Creates a new Email instance with validation
   * 
   * @param value - Raw email string
   * @returns Valid Email instance
   * @throws ValidationError when email is invalid
   */
  public static create(value: string): Email {
    // Domain validation - format and business rules
    if (!value) {
      throw new ValidationError("Email cannot be empty");
    }

    if (value.length > 254) {
      throw new ValidationError("Email cannot exceed 254 characters");
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) {
      throw new ValidationError("Invalid email format");
    }

    // Business rule: No disposable email providers (domain-specific)
    const disposableProviders = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com'];
    const domain = value.split('@')[1];
    if (disposableProviders.includes(domain)) {
      throw new ValidationError("Disposable email addresses are not allowed");
    }

    return new Email(value.toLowerCase().trim());
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: Email): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}