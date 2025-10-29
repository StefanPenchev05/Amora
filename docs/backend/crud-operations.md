# CRUD Operations

## Overview

This document describes the CRUD (Create, Read, Update, Delete) operations implemented for the User entity in the Viki backend system. The operations follow DDD principles and provide comprehensive user management functionality.

## Implemented CRUD Operations

### Create Operations

#### 1. User Registration (`CreateUserUseCase`)

**Purpose**: Create a new user account with complete validation

**Flow**:
1. **Validation**: Check email/username uniqueness via `UserService`
2. **Domain Creation**: Create `User` entity with business rules
3. **Persistence**: Save user to database via `Repository`
4. **Event Publishing**: Emit `UserCreatedEvent`
5. **Response**: Return user profile data

**Request**:
```json
{
  "email": "john@example.com",
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe",
  "password": "SecurePass123!"
}
```

**Response**:
```json
{
  "id": "uuid-string",
  "email": "john@example.com",
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Read Operations

#### 1. Get User by ID (`GetUserUseCase`)

**Purpose**: Retrieve user profile information

**Repository Methods**:
- `GetByID(ctx, userID)` - Get user by UUID
- `GetByEmail(ctx, email)` - Get user by email
- `GetByUsername(ctx, username)` - Get user by username

**Response**:
```json
{
  "id": "uuid-string",
  "email": "john@example.com",
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe",
  "full_name": "John Doe",
  "bio": "Software developer",
  "gender": "male",
  "is_verified": true,
  "mfa_enabled": false,
  "locale": "en",
  "timezone": "UTC",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

#### 2. User Authentication (`AuthenticateUserUseCase`)

**Purpose**: Authenticate user and return profile with tokens

**Flow**:
1. **Find User**: Locate by email or username
2. **Verify Password**: Check against stored hash
3. **Record Login**: Update last login timestamp
4. **Generate Tokens**: Create JWT access/refresh tokens
5. **Event Publishing**: Emit `UserLoggedInEvent`
6. **Response**: Return user profile with authentication tokens

### Update Operations

#### 1. Update User Profile (`UpdateProfileUseCase`)

**Purpose**: Modify user profile information

**Supported Updates**:
- First name / Last name
- Bio / Display name
- Gender / Date of birth
- Locale / Timezone
- Avatar photo

**Request**:
```json
{
  "first_name": "John",
  "last_name": "Smith",
  "bio": "Senior Software Developer",
  "gender": "male",
  "date_of_birth": "1990-05-15"
}
```

#### 2. Change Password (`ChangePasswordUseCase`)

**Purpose**: Update user password with validation

**Flow**:
1. **Verify Current Password**: Validate existing password
2. **Hash New Password**: Create secure hash
3. **Update Entity**: Change password in domain entity
4. **Persistence**: Save updated user
5. **Event Publishing**: Emit password changed event

**Request**:
```json
{
  "current_password": "OldPassword123!",
  "new_password": "NewSecurePass456!"
}
```

#### 3. Email Verification (`VerifyEmailUseCase`)

**Purpose**: Mark user email as verified

**Flow**:
1. **Find User**: Locate by verification token
2. **Verify Token**: Validate token expiration
3. **Update Status**: Mark email as verified
4. **Event Publishing**: Emit `UserEmailVerifiedEvent`

#### 4. Record Login Activity

**Purpose**: Update user login information

**Automatic Updates**:
- Last login timestamp
- Login IP address (via domain event)
- User agent information

### Delete Operations

#### 1. Delete User Account (`DeleteUserUseCase`)

**Purpose**: Remove user account and all associated data

**Repository Method**: `Delete(ctx, userID)`

**Flow**:
1. **Find User**: Verify user exists
2. **Business Rules**: Check deletion constraints
3. **Cascade Delete**: Remove related data (credentials, profile)
4. **Event Publishing**: Emit `UserDeletedEvent`
5. **Audit Log**: Record deletion for compliance

## Repository Interface

### Core CRUD Methods

```go
type Repository interface {
    // Create
    Create(ctx context.Context, user *User) error
    
    // Read
    GetByID(ctx context.Context, id string) (*User, error)
    GetByEmail(ctx context.Context, email Email) (*User, error)
    GetByUsername(ctx context.Context, username Username) (*User, error)
    
    // Update
    Update(ctx context.Context, user *User) error
    
    // Delete
    Delete(ctx context.Context, id string) error
    
    // Utility
    Exists(ctx context.Context, email Email, username Username) (bool, error)
}
```

### MySQL Implementation Features

- **GORM Integration**: Uses existing models with relationships
- **Transaction Safety**: All operations are atomic
- **Preloading**: Automatically loads Credentials and Profile
- **UUID Generation**: Generates unique IDs for new users
- **Error Handling**: Comprehensive error handling with context
- **Query Optimization**: Uses JOINs for efficient lookups

## Domain Validation

### Value Object Validation

#### Email Validation
- Format validation (RFC 5322 compliant)
- Maximum length (255 characters)
- Case normalization (lowercase)

#### Username Validation
- Length validation (3-30 characters)
- Character restrictions (alphanumeric + underscore)
- Case normalization (lowercase)

#### Password Validation
- Minimum length (8 characters)
- Maximum length (128 characters)
- Complexity requirements:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character

#### Name Validation
- Required fields (first name, last name)
- Maximum length (50 characters each)
- No special character restrictions

### Business Rules

- **Email Uniqueness**: No duplicate emails allowed
- **Username Uniqueness**: No duplicate usernames allowed
- **Password Security**: Stored as bcrypt hash only
- **Email Verification**: New accounts start unverified
- **MFA Default**: Multi-factor authentication disabled by default

## Error Handling

### Validation Errors
```json
{
  "error": "validation_failed",
  "message": "Invalid input data",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Business Logic Errors
```json
{
  "error": "business_rule_violation",
  "message": "Email address already registered"
}
```

### System Errors
```json
{
  "error": "internal_error",
  "message": "Unable to process request"
}
```

## Performance Considerations

### Database Optimization
- **Indexes**: Email and username fields indexed for fast lookups
- **Connection Pooling**: GORM manages connection pool efficiently
- **Preloading**: Related data loaded in single query
- **Batch Operations**: Support for bulk operations when needed

### Caching Strategy
- **User Profiles**: Cache frequently accessed user data
- **Authentication**: Cache JWT validation results
- **Session Management**: Redis-based session storage (future)

## Audit Trail

### Logged Events
- User registration
- Login attempts (success/failure)
- Profile updates
- Password changes
- Email verification
- Account deletion

### Log Format
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "event": "user_created",
  "user_id": "uuid-string",
  "email": "john@example.com",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "metadata": {
    "source": "web_app"
  }
}
```

## Security Features

### Data Protection
- **Password Hashing**: bcrypt with cost factor 12
- **Sensitive Data**: Never logged or exposed in responses
- **Input Sanitization**: All inputs validated and sanitized

### Access Control
- **Authentication Required**: Most operations require valid JWT
- **Authorization**: Users can only modify their own data
- **Rate Limiting**: Protection against brute force attacks (future)

## Testing Strategy

### Unit Tests
- **Value Objects**: Validation logic testing
- **Domain Entities**: Business rule testing
- **Use Cases**: Application logic testing
- **Repository**: Data access testing (with mocks)

### Integration Tests
- **Database Operations**: Full CRUD cycle testing
- **Authentication Flow**: End-to-end auth testing
- **Event Publishing**: Event system testing

### Test Coverage Goals
- **Domain Layer**: 100% coverage
- **Application Layer**: 95% coverage
- **Infrastructure Layer**: 80% coverage

---

*This documentation covers the complete CRUD operations for the User entity. Additional entities and operations will be documented as they are implemented.*