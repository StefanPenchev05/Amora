# 📱 Mobile App Directory Structure

> Complete file and folder structure for the Amora React Native mobile application following Clean Architecture principles.

## 📁 Full Directory Tree

```
apps/mobile/
├── 📋 app.json                     # Expo app configuration
├── 📦 package.json                 # Dependencies and scripts
├── 🔧 tsconfig.json               # TypeScript configuration
├── 🔧 .gitignore                  # Git ignore rules
├── 📖 README.md                   # Main documentation
│
├── 📱 src/                        # Source code root
│   ├── 🏢 domain/                 # BUSINESS LOGIC LAYER
│   │   ├── entities/              # Core business objects
│   │   │   ├── User.ts           # User entity
│   │   │   ├── Post.ts           # Post entity
│   │   │   ├── Calendar.ts       # Calendar entity
│   │   │   ├── Mood.ts           # Mood entity
│   │   │   └── index.ts          # Entity exports
│   │   ├── repositories/          # Repository interfaces (contracts)
│   │   │   ├── IUserRepository.ts
│   │   │   ├── IPostRepository.ts
│   │   │   ├── ICalendarRepository.ts
│   │   │   └── index.ts
│   │   └── usecases/             # Business use cases
│   │       ├── auth/
│   │       │   ├── LoginUseCase.ts
│   │       │   ├── RegisterUseCase.ts
│   │       │   └── LogoutUseCase.ts
│   │       ├── posts/
│   │       │   ├── CreatePostUseCase.ts
│   │       │   ├── GetPostsUseCase.ts
│   │       │   └── DeletePostUseCase.ts
│   │       └── calendar/
│   │           ├── CreateEventUseCase.ts
│   │           └── GetEventsUseCase.ts
│   │
│   ├── 🔌 infrastructure/         # EXTERNAL DEPENDENCIES LAYER
│   │   ├── repositories/         # Repository implementations
│   │   │   ├── UserRepository.ts
│   │   │   ├── PostRepository.ts
│   │   │   ├── CalendarRepository.ts
│   │   │   └── index.ts
│   │   └── http/                # HTTP clients and configurations
│   │       ├── ApiClient.ts     # Main HTTP client
│   │       ├── interceptors/    # Request/response interceptors
│   │       ├── endpoints.ts     # API endpoint constants
│   │       └── types.ts         # HTTP-related types
│   │
│   ├── 📱 presentation/          # UI LAYER
│   │   └── viewmodels/          # State management for UI
│   │       ├── AuthViewModel.ts
│   │       ├── PostsViewModel.ts
│   │       ├── CalendarViewModel.ts
│   │       └── index.ts
│   │
│   ├── 🎨 components/            # REUSABLE UI COMPONENTS
│   │   ├── ui/                  # Basic UI building blocks
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.styles.ts
│   │   │   │   └── index.ts
│   │   │   ├── Input/
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Input.styles.ts
│   │   │   │   └── index.ts
│   │   │   ├── Card/
│   │   │   ├── Modal/
│   │   │   ├── Avatar/
│   │   │   └── index.ts         # UI component exports
│   │   └── layout/              # Layout components
│   │       ├── Header/
│   │       │   ├── Header.tsx
│   │       │   └── index.ts
│   │       ├── Footer/
│   │       ├── Container/
│   │       └── index.ts
│   │
│   ├── 📺 screens/               # SCREEN COMPONENTS
│   │   ├── auth/                # Authentication screens
│   │   │   ├── LoginScreen/
│   │   │   │   ├── LoginScreen.tsx
│   │   │   │   ├── LoginScreen.styles.ts
│   │   │   │   └── index.ts
│   │   │   ├── RegisterScreen/
│   │   │   ├── ForgotPasswordScreen/
│   │   │   └── index.ts
│   │   ├── home/               # Home and main screens
│   │   │   ├── HomeScreen/
│   │   │   ├── FeedScreen/
│   │   │   ├── CalendarScreen/
│   │   │   └── index.ts
│   │   ├── profile/            # Profile-related screens
│   │   │   ├── ProfileScreen/
│   │   │   ├── EditProfileScreen/
│   │   │   ├── SettingsScreen/
│   │   │   └── index.ts
│   │   ├── posts/              # Post-related screens
│   │   │   ├── CreatePostScreen/
│   │   │   ├── PostDetailScreen/
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── 🔗 services/             # APPLICATION SERVICES
│   │   ├── api/                # API service implementations
│   │   │   ├── AuthService.ts
│   │   │   ├── PostService.ts
│   │   │   ├── CalendarService.ts
│   │   │   └── index.ts
│   │   ├── auth/               # Authentication services
│   │   │   ├── TokenService.ts
│   │   │   ├── BiometricService.ts
│   │   │   └── index.ts
│   │   └── storage/            # Local storage services
│   │       ├── SecureStorage.ts
│   │       ├── AsyncStorage.ts
│   │       └── index.ts
│   │
│   ├── 🎣 hooks/                # CUSTOM REACT HOOKS
│   │   ├── useAuth.ts
│   │   ├── usePosts.ts
│   │   ├── useCalendar.ts
│   │   ├── useTheme.ts
│   │   ├── useNotifications.ts
│   │   └── index.ts
│   │
│   ├── 🏪 stores/               # GLOBAL STATE MANAGEMENT
│   │   ├── authStore.ts        # Authentication state
│   │   ├── userStore.ts        # User data state
│   │   ├── themeStore.ts       # Theme and appearance
│   │   ├── notificationStore.ts # Notification state
│   │   └── index.ts
│   │
│   ├── 🧭 navigation/           # NAVIGATION CONFIGURATION
│   │   ├── AppNavigator.tsx    # Main app navigation
│   │   ├── AuthNavigator.tsx   # Auth flow navigation
│   │   ├── TabNavigator.tsx    # Bottom tab navigation
│   │   ├── types.ts           # Navigation types
│   │   └── index.ts
│   │
│   ├── 🎨 styles/              # GLOBAL STYLES AND THEMES
│   │   ├── colors.ts          # Color palette
│   │   ├── typography.ts      # Font styles
│   │   ├── spacing.ts         # Spacing constants
│   │   ├── themes/            # Theme configurations
│   │   │   ├── light.ts
│   │   │   ├── dark.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── 🎯 types/               # TYPESCRIPT DEFINITIONS
│   │   ├── auth.ts           # Authentication types
│   │   ├── api.ts            # API response types
│   │   ├── navigation.ts     # Navigation types
│   │   ├── storage.ts        # Storage types
│   │   └── index.ts
│   │
│   ├── 🛠️ utils/               # UTILITY FUNCTIONS
│   │   ├── validation.ts      # Input validation helpers
│   │   ├── formatters.ts      # Data formatting utilities
│   │   ├── dates.ts          # Date manipulation helpers
│   │   ├── permissions.ts     # Device permissions helpers
│   │   └── index.ts
│   │
│   ├── 📊 constants/           # APPLICATION CONSTANTS
│   │   ├── api.ts            # API endpoints and configs
│   │   ├── app.ts            # App-wide constants
│   │   ├── storage.ts        # Storage keys
│   │   └── index.ts
│   │
│   └── 🎨 assets/              # STATIC ASSETS
│       ├── images/            # Image files
│       │   ├── logos/
│       │   ├── icons/
│       │   ├── backgrounds/
│       │   └── placeholders/
│       └── fonts/             # Custom font files
│           ├── primary/
│           └── secondary/
│
├── 🧪 __tests__/              # TEST FILES
│   ├── domain/               # Domain layer tests
│   │   ├── entities/
│   │   ├── repositories/
│   │   └── usecases/
│   ├── infrastructure/       # Infrastructure tests
│   ├── presentation/         # Presentation tests
│   ├── components/          # Component tests
│   ├── screens/             # Screen tests
│   ├── services/            # Service tests
│   ├── hooks/               # Hook tests
│   └── utils/               # Utility tests
│
├── 📚 docs/                  # DOCUMENTATION
│   ├── setup.md            # Setup instructions
│   ├── architecture.md     # Architecture decisions
│   ├── testing.md          # Testing guidelines
│   └── deployment.md       # Deployment guide
│
└── 🔧 config/               # CONFIGURATION FILES
    ├── jest.config.js       # Testing configuration
    ├── metro.config.js      # Metro bundler config
    ├── babel.config.js      # Babel configuration
    └── eslint.config.js     # ESLint rules
```

## 📋 Layer Responsibilities

### 🏢 **Domain Layer** (`src/domain/`)
**Pure business logic - no external dependencies**
- **Entities**: Core business objects (User, Post, Calendar)
- **Repositories**: Interfaces defining data access contracts
- **Use Cases**: Business rules and application logic

### 🔌 **Infrastructure Layer** (`src/infrastructure/`)
**External dependencies and implementations**
- **Repositories**: Concrete implementations of domain interfaces
- **HTTP**: API clients, interceptors, network handling

### 📱 **Presentation Layer** (`src/presentation/`)
**UI state management**
- **ViewModels**: State management logic for UI components
- **Reactive state**: Connects domain use cases to UI

### 🎨 **UI Components** (`src/components/`)
**Reusable interface elements**
- **UI**: Basic building blocks (Button, Input, Card)
- **Layout**: Structural components (Header, Container, Navigation)

### 📺 **Screens** (`src/screens/`)
**Full-screen application views**
- **Feature-grouped**: Organized by app functionality
- **Screen components**: Complete user interface pages

### 🔗 **Services** (`src/services/`)
**Application-level services**
- **API**: Service layer for external APIs
- **Auth**: Authentication and security services
- **Storage**: Local data persistence services

### 🎣 **Hooks** (`src/hooks/`)
**Custom React hooks for shared logic**
- **State management**: Reusable stateful logic
- **Side effects**: Data fetching and lifecycle management

### 🏪 **Stores** (`src/stores/`)
**Global application state**
- **Zustand/Redux**: Centralized state management
- **Reactive updates**: Cross-component state sharing

## 📐 **Naming Conventions**

### Files and Folders
- **PascalCase**: Components, screens, entities (`UserProfile.tsx`)
- **camelCase**: Utilities, services, hooks (`userService.ts`)
- **kebab-case**: Folders when needed (`user-profile/`)

### TypeScript
- **Interfaces**: Prefix with `I` for domain interfaces (`IUserRepository`)
- **Types**: Descriptive names (`UserDTO`, `AuthState`)
- **Enums**: PascalCase with descriptive names (`UserRole`)

### Components
- **Props interface**: `ComponentNameProps` (`ButtonProps`)
- **Styled components**: `ComponentName.styles.ts`
- **Index files**: Export main component as default

## 🎯 **Import Guidelines**

### Path Aliases
```typescript
// Use absolute imports with @ alias
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks';
import { AuthService } from '@/services/api';

// Avoid relative imports for src/ files
// ❌ import { Button } from '../../../components/ui';
// ✅ import { Button } from '@/components/ui';
```

### Layer Dependencies
```typescript
// ✅ Allowed dependencies (following dependency rule)
// Domain → None (pure business logic)
// Infrastructure → Domain
// Presentation → Domain + Infrastructure
// UI → Presentation + Domain

// ❌ Forbidden (violates clean architecture)
// Domain → Infrastructure
// Domain → Presentation
// Infrastructure → Presentation
```

---

**This structure ensures maintainable, testable, and scalable mobile application development following Clean Architecture principles.**
