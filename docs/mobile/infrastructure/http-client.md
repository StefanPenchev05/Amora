# HTTP Client Documentation

## Overview

The HTTP client provides a robust, type-safe interface for making API requests with automatic authentication, token refresh, error handling, and timeout management. It's built following Clean Architecture principles with proper separation of concerns.

## Architecture

```
src/infrastructure/http/
├── client.ts          # Main HTTP client implementation
├── types.ts           # TypeScript type definitions
└── utils.ts           # Utility functions (parseJSON, withTimeout)
```

## Core Features

- 🔐 **Automatic Authentication** - Bearer token management with automatic refresh
- 🔄 **Token Refresh** - Transparent token renewal on 401 responses
- ⏱️ **Timeout Handling** - Configurable request timeouts with AbortController
- 🛡️ **Type Safety** - Full TypeScript support with generic types
- 🚨 **Error Handling** - Consistent error response format
- 📱 **Mobile Optimized** - Designed for React Native/Expo environments

## Quick Start

### Basic Usage

```typescript
import { httpFetch } from "@/src/infrastructure/http/client";

// Simple GET request
const response = await httpFetch<{ message: string }>("/ping");
if (response.ok) {
  console.log(response.data.message);
} else {
  console.error(response.error);
}
```

### Authenticated Requests

```typescript
// GET with authentication
const profile = await httpFetch<User>("/profile", { auth: true });

// POST with body and authentication
const newPost = await httpFetch<Post>("/posts", {
  method: "POST",
  body: { title: "Hello", content: "World" },
  auth: true,
});
```

### Advanced Configuration

```typescript
// Request with custom headers and timeout
const data = await httpFetch<ApiResponse>("/data", {
  method: "GET",
  headers: { 
    "X-Custom-Header": "value",
    "X-Client-Version": "1.0.0"
  },
  timeoutMs: 10000,
  auth: true
});
```

## API Reference

### `httpFetch<TResponse, TBody>(path, options)`

#### Type Parameters

- `TResponse` - Expected response data type
- `TBody` - Request body data type (optional, defaults to `unknown`)

#### Parameters

- `path: string` - API endpoint (relative path or full URL)
- `options: HttpRequestOptions<TBody>` - Request configuration

#### Returns

`Promise<HttpResponse<TResponse>>` - Standardized response wrapper

### Request Options (`HttpRequestOptions<TBody>`)

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `method` | `HttpMethod` | `"GET"` | HTTP method to use |
| `body` | `TBody` | `undefined` | Request payload (auto-serialized to JSON) |
| `headers` | `HttpHeaders` | `{}` | Custom HTTP headers |
| `auth` | `boolean` | `false` | Attach authentication token automatically |
| `timeoutMs` | `number` | `undefined` | Request timeout in milliseconds |
| `signal` | `AbortSignal` | `undefined` | Manual cancellation signal |
| `_retry` | `boolean` | `false` | Internal retry flag (used by token refresh) |

### Response Format (`HttpResponse<T>`)

```typescript
type HttpResponse<T> = {
  ok: boolean;        // Success indicator (status 200-299)
  status: number;     // HTTP status code
  data?: T;          // Response data (present when ok: true)
  error?: string;    // Error message (present when ok: false)
}
```

## Authentication System

### Token Management

The client integrates with your secure storage system to automatically:

1. **Attach Tokens** - Add Bearer tokens to authenticated requests
2. **Refresh Tokens** - Automatically refresh expired tokens on 401 responses
3. **Handle Failures** - Trigger auth failure callbacks when refresh fails

### Token Refresh Flow

```
Request with auth: true
         ↓
   Add Bearer token
         ↓
    Make request
         ↓
   Response 401?
    ↓         ↓
   No        Yes
    ↓         ↓
 Return    Refresh token
 response      ↓
           Success?
        ↓         ↓
       Yes        No
        ↓         ↓
    Retry     Trigger
   request   auth failure
        ↓
   Return final
    response
```

### Authentication Configuration

```typescript
import { setOnAuthFailure } from "@/src/infrastructure/http/client";

// Set up auth failure handler (e.g., redirect to login)
setOnAuthFailure(() => {
  // Clear user session
  // Navigate to login screen
  router.replace("/login");
});
```

## Error Handling

### Response Format

All requests return a consistent response format:

```typescript
// Success response
{
  ok: true,
  status: 200,
  data: { /* response data */ }
}

// Error response
{
  ok: false,
  status: 404,
  error: "Not found"
}
```

### Error Types

| Status | Type | Description |
|--------|------|-------------|
| `0` | Network | Connection failed, timeout, or abort |
| `4xx` | Client | Bad request, unauthorized, not found, etc. |
| `5xx` | Server | Internal server error, service unavailable, etc. |

### Error Handling Patterns

```typescript
// Type-safe error handling
const response = await httpFetch<User>("/user/123");

if (response.ok) {
  // TypeScript knows response.data exists and is of type User
  console.log(`User: ${response.data.name}`);
} else {
  // Handle different error scenarios
  switch (response.status) {
    case 0:
      console.error("Network error:", response.error);
      break;
    case 401:
      console.error("Authentication failed");
      break;
    case 404:
      console.error("User not found");
      break;
    default:
      console.error("Request failed:", response.error);
  }
}
```

## Timeout Management

### Configuration

```typescript
// 5-second timeout
const response = await httpFetch("/slow-endpoint", {
  timeoutMs: 5000
});

// Manual cancellation
const controller = new AbortController();
const response = await httpFetch("/data", {
  signal: controller.signal
});

// Cancel after 3 seconds
setTimeout(() => controller.abort(), 3000);
```

### Timeout Behavior

- Requests without `timeoutMs` run indefinitely (until network timeout)
- Timeout triggers `AbortError` which returns status `0` with "Request timed out" error
- Manual cancellation via `AbortSignal` works the same way

## Best Practices

### 1. Type Safety

Always specify response types for better development experience:

```typescript
// ✅ Good - Type-safe
interface User { id: number; name: string; email: string; }
const user = await httpFetch<User>("/user/me", { auth: true });

// ❌ Avoid - No type safety
const user = await httpFetch("/user/me", { auth: true });
```

### 2. Error Handling

Always check the `ok` property before accessing data:

```typescript
// ✅ Good - Proper error handling
const response = await httpFetch<User[]>("/users");
if (response.ok) {
  response.data.forEach(user => console.log(user.name));
} else {
  showErrorMessage(response.error);
}

// ❌ Avoid - Unsafe data access
const response = await httpFetch<User[]>("/users");
response.data?.forEach(user => console.log(user.name)); // Could be undefined
```

### 3. Request Configuration

Use specific timeouts for different request types:

```typescript
// Quick health checks
const ping = await httpFetch("/ping", { timeoutMs: 2000 });

// File uploads
const upload = await httpFetch("/upload", {
  method: "POST",
  body: formData,
  timeoutMs: 30000,
  auth: true
});

// Real-time data
const stream = await httpFetch("/stream", {
  timeoutMs: 60000,
  auth: true
});
```

### 4. Authentication

Use `auth: true` for protected endpoints:

```typescript
// ✅ Good - Explicit auth for protected resources
const profile = await httpFetch<User>("/profile", { auth: true });
const settings = await httpFetch<Settings>("/settings", { auth: true });

// ✅ Good - No auth for public endpoints
const posts = await httpFetch<Post[]>("/public/posts");
```

## Integration Examples

### With React Query

```typescript
import { useQuery } from '@tanstack/react-query';
import { httpFetch } from '@/src/infrastructure/http/client';

function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await httpFetch<User>('/profile', { auth: true });
      if (!response.ok) throw new Error(response.error);
      return response.data;
    }
  });
}
```

### With SWR

```typescript
import useSWR from 'swr';
import { httpFetch } from '@/src/infrastructure/http/client';

const fetcher = async (url: string) => {
  const response = await httpFetch<any>(url, { auth: true });
  if (!response.ok) throw new Error(response.error);
  return response.data;
};

function Profile() {
  const { data, error } = useSWR('/profile', fetcher);
  
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>Loading...</div>;
  
  return <div>Hello {data.name}!</div>;
}
```

## Environment Configuration

The client uses environment variables for configuration:

```typescript
// config/env.ts
export const Env = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api',
  // other config...
};
```

Ensure your environment variables are properly configured:

```bash
# .env
EXPO_PUBLIC_API_URL=https://api.example.com/v1
```

## Troubleshooting

### Common Issues

1. **401 Errors Despite Valid Tokens**
   - Check if token refresh is working properly
   - Verify `getFreshAccessToken()` implementation
   - Ensure secure storage is accessible

2. **Request Timeouts**
   - Check network connectivity
   - Increase `timeoutMs` for slow endpoints
   - Verify API server is responding

3. **Type Errors**
   - Ensure response types match actual API responses
   - Check for optional vs required fields
   - Verify generic type parameters

### Debug Mode

Enable debug logging by modifying the client to log requests:

```typescript
// In development, add logging
if (__DEV__) {
  console.log(`HTTP ${method} ${url}`, { headers, body });
}
```

## Migration Guide

If migrating from a different HTTP client:

1. Replace fetch calls with `httpFetch`
2. Update response handling to use `response.ok` checks
3. Add type parameters for request/response types
4. Configure authentication with `auth: true`
5. Set up auth failure handling with `setOnAuthFailure`

## Related Documentation

- [Types Reference](./http-types.md)
- [Repository Pattern](./repositories.md)
- [Design System](./DESIGN_SYSTEM.md)
- [Directory Structure](./directory_structure.md)