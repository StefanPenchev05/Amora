# Authentication System

## Overview

This document describes the complete authentication system implemented following Domain-Driven Design (DDD) principles. The system includes user registration and login functionality with proper separation of concerns across the Domain and Application layers.

## Features Implemented

### Domain Layer

- **User Aggregate Root** with complete business logic
- **Value Objects**: Email, Username, PasswordHash, Gender with validation
- **Domain Events**:
  - `UserCreatedEvent`
  - `UserLoggedInEvent`
  - `UserEmailVerifiedEvent`
- **Domain Services**: `UserService` for cross-aggregate validation
- **Repository Interface**: clean abstraction for data persistence

### Application Layer

- **Use Cases**:
  - `CreateUserUseCase` – handles user registration with validation
  - `AuthenticateUserUseCase` – handles login and JWT generation
- **DTOs**: Request/Response objects for clean data transfer
- **Interfaces**: `JWTService`, `EventPublisher` abstractions

### Infrastructure Layer

- **MySQL Repository**: GORM-based implementation with proper relationship handling
- **JWT Service**: Token generation, validation, and refresh functionality
- **Event Publisher**: Domain event publishing system

## Architecture

```
internal/
├── domain/user/              # Business logic and rules
│   ├── entity.go            # User aggregate root
│   ├── events.go            # Domain events
│   ├── service.go           # Domain services
│   ├── repository.go        # Repository interface
│   ├── email.go             # Email value object
│   ├── username.go          # Username value object
│   ├── password.go          # PasswordHash value object
│   └── gender.go            # Gender value object
├── application/             # Use cases and orchestration
│   ├── usecases/user/       # Business operations
│   ├── dto/user/           # Data transfer objects
│   └── interfaces/         # Service abstractions
└── infrastructure/         # Technical implementations
    ├── persistence/mysql/  # Database operations
    └── services/          # JWT, Event publishing
```

## Security Features

- **Password Hashing**: secure bcrypt implementation
- **Input Validation**: comprehensive checks for all user inputs
- **JWT Tokens**: support for access and refresh tokens
- **Event Logging**: audit trail for authentication-related events

## Key Components

### User Registration Flow

1. Validate email/username uniqueness (Domain Service)
2. Create User entity with business rules (Domain Entity)
3. Hash password securely (Value Object)
4. Persist user in database (Repository)
5. Publish `UserCreatedEvent` (Domain Event)

### User Authentication Flow

1. Find user by email or username
2. Verify password hash
3. Record login activity (Domain behavior)
4. Generate JWT tokens
5. Publish `UserLoggedInEvent`
6. Return user profile with tokens

## Technical Details

### Domain Events System

- **In-memory event storage** during transaction
- **Event publishing** after successful persistence
- **Clean event lifecycle** management

### Validation Strategy

- **Domain-level**: enforce business rules and invariants
- **Application-level**: cross-aggregate constraints
- **Value Objects**: format and content validation

### Error Handling

- **Structured logging** with request context
- **Proper error propagation** and categorization
- **Security-conscious error messages** (no sensitive data leaks)

## Code Quality

### DDD Principles

✅ **Ubiquitous Language** — clear domain terminology  
✅ **Aggregate Boundaries** — User as aggregate root  
✅ **Domain Events** — represent business behaviors  
✅ **Repository Pattern** — abstract data access  
✅ **Domain Services** — handle cross-aggregate rules  

### Clean Architecture

✅ **Dependency Inversion** — Application depends on Domain interfaces  
✅ **Single Responsibility** — each component has one purpose  
✅ **Separation of Concerns** — clear Domain, Application, Infrastructure boundaries  

### Testing Readiness

- **Mockable interfaces** for all external dependencies
- **Pure domain logic**: business rules testable in isolation
- **Clear use cases** enable straightforward unit testing

## API Endpoints

### Authentication Endpoints

```http
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
```

### User Management Endpoints

```http
GET    /api/v1/users/me
PUT    /api/v1/users/me
POST   /api/v1/users/verify-email
PUT    /api/v1/users/change-password
DELETE /api/v1/users/me
```

## Database Schema

Uses GORM models with relationships:
- **Users table** includes credentials and profile data
- **Support for MFA**, email verification, and user preferences
- **Proper foreign key relationships** between User, Credentials, and Profile

### Entity Relationships

```
User (1) ──── (1) Credentials
 │
 └── (1) ──── (1) Profile
```

## Configuration

### Environment Variables

```bash
# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=168h
JWT_ISSUER=viki-api
JWT_AUDIENCE=viki-users

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=viki_user
DB_PASS=viki_password
DB_NAME=viki_db
```

## What's Next

This implementation sets up the foundation for:

- ✅ Infrastructure layer (JWT service, MySQL repository)
- ⏳ HTTP handlers and REST endpoints
- ⏳ Integration and end-to-end tests
- ⏳ Event-driven architecture integrations
- ⏳ OAuth integration
- ⏳ Multi-factor authentication (MFA)

## Business Value

- **Secure Authentication**: uses modern security standards
- **Extensible Design**: easily extend with OAuth or MFA
- **Audit Trail**: complete logging for security monitoring
- **Developer Experience**: clean, maintainable, modular codebase

## Dependencies

```go
// Core dependencies
github.com/golang-jwt/jwt/v5
gorm.io/gorm
gorm.io/driver/mysql
github.com/google/uuid
golang.org/x/crypto/bcrypt

// Validation and utilities
github.com/go-playground/validator/v10
github.com/joho/godotenv
```

---

*Note: This documentation focuses on the Domain and Application layers implementation. Infrastructure layer details and HTTP API documentation are covered in separate documents.*