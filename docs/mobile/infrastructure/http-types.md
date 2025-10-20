# HTTP Types Documentation

## Overview

This module defines TypeScript types and interfaces for the HTTP client infrastructure, providing type safety and consistent API contracts throughout the application.

## Types Reference

### `HttpMethod`

Supported HTTP methods for API requests.

```typescript
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
```

**Usage:**
- `GET` - Retrieve data from the server
- `POST` - Create new resources
- `PUT` - Update entire resources (replace)
- `PATCH` - Partial updates to resources
- `DELETE` - Remove resources

**Examples:**

```typescript
const getRequest: HttpMethod = "GET";
const createRequest: HttpMethod = "POST";
const updateRequest: HttpMethod = "PUT";
const patchRequest: HttpMethod = "PATCH";
const deleteRequest: HttpMethod = "DELETE";
```

### `HttpHeaders`

HTTP headers as key-value string pairs.

```typescript
export type HttpHeaders = Record<string, string>;
```

**Common Headers:**

| Header | Purpose | Example |
|--------|---------|---------|
| `Content-Type` | Request body format | `"application/json"` |
| `Authorization` | Authentication token | `"Bearer eyJhbGc..."` |
| `Accept` | Expected response format | `"application/json"` |
| `X-Custom-Header` | Application-specific | `"custom-value"` |

**Examples:**

```typescript
// Basic headers
const headers: HttpHeaders = {
  "Content-Type": "application/json",
  "Accept": "application/json"
};

// With authentication
const authHeaders: HttpHeaders = {
  "Content-Type": "application/json",
  "Authorization": "Bearer your-token-here"
};

// Custom headers
const customHeaders: HttpHeaders = {
  "X-API-Version": "2.0",
  "X-Client-Platform": "mobile",
  "X-Request-ID": "uuid-here"
};
```

### `HttpRequestOptions<TBody>`

Configuration options for HTTP requests with generic body type support.

```typescript
export type HttpRequestOptions<TBody = unknown> = {
    method?: HttpMethod;
    body?: TBody;
    headers?: HttpHeaders;
    auth?: boolean;
    timeoutMs?: number;
    _retry?: boolean;
    signal?: AbortSignal;
}
```

**Properties:**

| Property | Type | Default | Required | Description |
|----------|------|---------|----------|-------------|
| `method` | `HttpMethod` | `"GET"` | No | HTTP method to use |
| `body` | `TBody` | `undefined` | No | Request payload (auto-serialized to JSON) |
| `headers` | `HttpHeaders` | `{}` | No | Custom HTTP headers |
| `auth` | `boolean` | `false` | No | Attach authentication token automatically |
| `timeoutMs` | `number` | `undefined` | No | Request timeout in milliseconds |
| `_retry` | `boolean` | `false` | No | Internal retry flag (used by token refresh) |
| `signal` | `AbortSignal` | `undefined` | No | Manual cancellation signal |

**Type Parameter:**
- `TBody` - The type of the request body data for type safety

**Examples:**

```typescript
// Simple GET request
const getOptions: HttpRequestOptions = {
  method: "GET"
};

// POST with typed body
interface CreateUserRequest {
  name: string;
  email: string;
  role: 'admin' | 'user';
}

const postOptions: HttpRequestOptions<CreateUserRequest> = {
  method: "POST",
  body: {
    name: "John Doe",
    email: "john@example.com",
    role: "user"
  },
  auth: true,
  timeoutMs: 5000
};

// Request with custom headers
const customOptions: HttpRequestOptions = {
  method: "GET",
  headers: {
    "X-API-Version": "2.0",
    "Accept-Language": "en-US"
  },
  auth: true
};

// Request with timeout and cancellation
const controller = new AbortController();
const timeoutOptions: HttpRequestOptions = {
  method: "GET",
  timeoutMs: 10000,
  signal: controller.signal,
  auth: true
};
```

### `HttpResponse<T>`

Standardized HTTP response wrapper providing consistent response format across all API calls.

```typescript
export type HttpResponse<T> = {
    ok: boolean;
    status: number;
    data?: T;
    error?: string;
}
```

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `ok` | `boolean` | Indicates if the request was successful (status 200-299) |
| `status` | `number` | HTTP status code (200, 404, 500, etc.) |
| `data` | `T \| undefined` | Response payload when successful (undefined on error) |
| `error` | `string \| undefined` | Error message when request fails (undefined on success) |

**Type Parameter:**
- `T` - The expected type of the response data

**Response Patterns:**

#### Success Response
```typescript
const successResponse: HttpResponse<User> = {
  ok: true,
  status: 200,
  data: {
    id: 1,
    name: "John Doe",
    email: "john@example.com"
  },
  error: undefined
};
```

#### Error Response
```typescript
const errorResponse: HttpResponse<never> = {
  ok: false,
  status: 404,
  data: undefined,
  error: "User not found"
};
```

#### Network Error
```typescript
const networkError: HttpResponse<never> = {
  ok: false,
  status: 0,
  data: undefined,
  error: "Network error"
};
```

## Type Guards and Utilities

### Response Type Guards

Use type guards to safely access response data:

```typescript
async function fetchUser(id: number): Promise<User | null> {
  const response = await httpFetch<User>(`/users/${id}`);
  
  if (response.ok) {
    // TypeScript knows response.data exists and is of type User
    return response.data;
  } else {
    // Handle error case
    console.error(`Failed to fetch user: ${response.error}`);
    return null;
  }
}
```

### Generic Response Handlers

Create reusable response handlers:

```typescript
function handleResponse<T>(response: HttpResponse<T>): T | never {
  if (response.ok) {
    return response.data as T;
  } else {
    throw new Error(`Request failed: ${response.error}`);
  }
}

// Usage
try {
  const users = handleResponse(await httpFetch<User[]>("/users"));
  console.log(`Found ${users.length} users`);
} catch (error) {
  console.error("Failed to fetch users:", error.message);
}
```

## Advanced Type Patterns

### Union Response Types

Handle multiple possible response shapes:

```typescript
type ApiResponse<T> = HttpResponse<T> | HttpResponse<{ error: string; code: number }>;

interface User {
  id: number;
  name: string;
}

interface ApiError {
  error: string;
  code: number;
}

const response: ApiResponse<User> = await httpFetch<User>("/user/me");
```

### Conditional Request Types

Different request types based on method:

```typescript
type ConditionalRequest<M extends HttpMethod> = M extends "GET" 
  ? HttpRequestOptions<never>
  : HttpRequestOptions<unknown>;

function typedRequest<M extends HttpMethod>(
  method: M,
  path: string,
  options: ConditionalRequest<M>
) {
  return httpFetch(path, { method, ...options });
}
```

### Response Transformation

Transform responses with type safety:

```typescript
interface RawUser {
  id: string;
  full_name: string;
  email_address: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

async function fetchTransformedUser(id: string): Promise<HttpResponse<User>> {
  const response = await httpFetch<RawUser>(`/users/${id}`);
  
  if (!response.ok) {
    return response as HttpResponse<User>;
  }
  
  return {
    ok: true,
    status: response.status,
    data: {
      id: parseInt(response.data.id),
      name: response.data.full_name,
      email: response.data.email_address
    }
  };
}
```

## Error Type Definitions

### Common Error Responses

```typescript
interface ValidationError {
  field: string;
  message: string;
}

interface ApiErrorResponse {
  error: string;
  code: number;
  details?: ValidationError[];
}

// Usage with specific error types
const response = await httpFetch<User, CreateUserRequest>("/users", {
  method: "POST",
  body: userData,
  auth: true
});

if (!response.ok && response.status === 422) {
  // Handle validation errors
  try {
    const errorData: ApiErrorResponse = JSON.parse(response.error || "{}");
    errorData.details?.forEach(error => {
      console.error(`${error.field}: ${error.message}`);
    });
  } catch {
    console.error("Validation failed:", response.error);
  }
}
```

### Status Code Utilities

```typescript
type HttpStatusCode = 
  | 200 | 201 | 204  // Success
  | 400 | 401 | 403 | 404 | 422  // Client errors
  | 500 | 502 | 503;  // Server errors

function isSuccessStatus(status: number): status is 200 | 201 | 204 {
  return status >= 200 && status < 300;
}

function isClientError(status: number): status is 400 | 401 | 403 | 404 | 422 {
  return status >= 400 && status < 500;
}

function isServerError(status: number): status is 500 | 502 | 503 {
  return status >= 500;
}
```

## Best Practices

### 1. Use Specific Types

```typescript
// ✅ Good - Specific interface
interface CreatePostRequest {
  title: string;
  content: string;
  tags: string[];
}

const postOptions: HttpRequestOptions<CreatePostRequest> = {
  method: "POST",
  body: { title: "Hello", content: "World", tags: ["tech"] },
  auth: true
};

// ❌ Avoid - Generic unknown type
const postOptions: HttpRequestOptions<unknown> = {
  method: "POST",
  body: { anything: "goes" },
  auth: true
};
```

### 2. Handle All Response Cases

```typescript
// ✅ Good - Comprehensive error handling
const response = await httpFetch<User[]>("/users");

if (response.ok) {
  return response.data;
} else {
  switch (response.status) {
    case 0:
      throw new Error("Network error - check your connection");
    case 401:
      throw new Error("Authentication required");
    case 403:
      throw new Error("Permission denied");
    case 404:
      throw new Error("Users not found");
    default:
      throw new Error(`Request failed: ${response.error}`);
  }
}
```

### 3. Type Response Data Properly

```typescript
// ✅ Good - Proper typing
interface ApiListResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

const response = await httpFetch<ApiListResponse<User>>("/users");
if (response.ok) {
  console.log(`Found ${response.data.total} users`);
  response.data.data.forEach(user => console.log(user.name));
}
```

## Related Documentation

- [HTTP Client](./http-client.md)
- [Repository Pattern](./repositories.md)
- [Directory Structure](./directory_structure.md)