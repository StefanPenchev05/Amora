# Frontend (React + TypeScript) – README

Solid, scalable frontend with REST **and** WebSocket support. This doc explains structure, setup, scripts, and conventions so the codebase stays clean as it grows.

---

## TL;DR

* **Stack:** React + TypeScript + Vite, TanStack Query (REST cache), optional Redux (app state), react-router, react-i18next, Tailwind.
* **Transport:** `shared/api/httpClient.ts` (REST) and `shared/socket/socketClient.ts` (WebSocket), both framework-agnostic.
* **Architecture:** feature- and entity-driven structure, SOLID/DIP boundaries, DTO→Entity mappers.

---

## Directory Structure

You can see the full directory structure [here](../docs/frontend/directory_structure.md)

---

## Prerequisites

* **Node.js** ≥ 18
* **pnpm** (preferred) or npm/yarn
* (Optional) **Docker** for running backend locally

---

## Getting Started

### 1) Install dependencies

```bash
pnpm install
# or: npm install / yarn
```

### 2) Configure environment

Create `.env` (or `.env.local`) at repo root of the frontend and copy from `.env.example`:

```
VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080/ws
VITE_FEATURE_FLAGS=dev
```

> **Never** commit secrets. Vite exposes `VITE_*` at build time.

### 3) Run dev server

```bash
pnpm dev
```

* Opens at `http://localhost:5173` (default Vite port)

### 4) Build & preview

```bash
pnpm build
pnpm preview      # serves the build locally
```

### 5) Lint, type-check, test

```bash
pnpm lint         # eslint
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest + RTL
```

---

## NPM Scripts (suggested)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext .ts,.tsx",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "format": "prettier --write ."
  }
}
```

---

## Environment Handling

`src/shared/config/env.ts` centralizes env parsing and fails fast if keys are missing.

```ts
const required = ["VITE_API_URL", "VITE_WS_URL"] as const;
type Keys = typeof required[number];
const env = Object.fromEntries(required.map(k => [k, import.meta.env[k]])) as Record<Keys, string>;
for (const k of required) if (!env[k]) throw new Error(`Missing ${k}`);
export const ENV = env;
```

---

## Architecture Principles

* **SOLID**: small modules with single purpose; open for extension via new features.
* **DIP**: UI depends on abstractions (entity APIs, mappers), not concrete libs (`fetch`, Socket.IO…).
* **DTO → Entity mapping**: never let raw API DTOs leak into UI.
* **Side-effects at boundaries**: data fetching in adapters/hooks; components stay pure.
* **Feature isolation**: no cross-imports between features; share via `entities`/`shared`.

---

## Data Access

### REST (TanStack Query)

* Use `shared/api/httpClient.ts` for low-level transport.
* Entity/feature adapters wrap it and return **entities** (mapped types).

Example:

```ts
// entities/user/api/rest.ts
import { http } from "@/shared/api/httpClient";
import { toUser } from "../model/mappers";
import type { User } from "../model/types";
export async function getUser(id: string): Promise<User> {
  const dto = await http.get(`/users/${id}`);
  return toUser(dto);
}
```

### WebSockets

* Single connection managed by `shared/socket/socketClient.ts`.
* Features subscribe to topics and clean up on unmount.

Example:

```ts
// features/chat/model/useChat.ts
import { useEffect, useRef, useState } from "react";
import { socket } from "@/shared/socket/socketClient";

export function useChat(roomId: string) {
  const [messages, setMessages] = useState<Array<{ id: string; text: string }>>([]);
  const unsubRef = useRef<() => void>();
  useEffect(() => {
    socket.connect();
    unsubRef.current?.();
    unsubRef.current = socket.subscribe(`chat.${roomId}`, (m: any) =>
      setMessages(prev => [...prev, m])
    );
    return () => unsubRef.current?.();
  }, [roomId]);
  function send(text: string) { socket.emit("chat.send", { roomId, text }); }
  return { messages, send };
}
```

---

## Routing & Code-Splitting

Lazy-load route pages inside `app/routes` to keep bundles small.

```ts
import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
const Home = lazy(() => import("@/pages/Home"));
const ChatPage = lazy(() => import("@/features/chat/pages/ChatPage"));

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/chat/:roomId", element: <ChatPage /> },
  { path: "*", element: <div>Not Found</div> },
]);
```

---

## Styling

* TailwindCSS (utility-first) + small primitives in `shared/ui`.
* Theme tokens live in `styles/`.

---

## Internationalization

* `react-i18next` initialized in `i18n/index.ts`.
* Namespaced JSON per feature if needed (`features/chat/i18n/en.json`).

---

## Path Aliases

Set in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

Vite: `vite.config.ts` resolves `@` to `src`.

---

## Testing

* **Vitest + React Testing Library** for unit/integration.
* **MSW** for mocking REST; mock socket events via injected handlers.

```ts
// test/setup.ts
import "@testing-library/jest-dom";
```

Run tests:

```bash
pnpm test
pnpm test:ui
```

---

## Adding a New Feature (Checklist)

1. Create `src/features/<feature>/` with `model/`, `api/`, `ui/`, `pages/`.
2. Define entity types or reuse existing `entities/*`.
3. Add REST adapters (and socket handlers if real-time).
4. Add route in `app/routes` and lazy-load page.
5. Write tests + story/examples.

## Adding a New Entity

1. `entities/<entity>/model/{types,dto,mappers}.ts`.
2. `entities/<entity>/api/{rest,socket}.ts`.
3. `entities/<entity>/ui/<SmallComponent>.tsx`.
4. Avoid feature-specific logic here.

---

## Git & CI

* Conventional Commits (e.g., `feat:`, `fix:`, `refactor:`).
* Pre-commit hooks for lint/typecheck are recommended (Husky + lint-staged).

---

## Troubleshooting

* **CORS**: ensure backend sends `Access-Control-Allow-Origin` and cookies if needed (`credentials: 'include'`).
* **WS fails**: check `VITE_WS_URL` schema (`ws://` vs `wss://`) and backend path.
* **Env not found**: make sure keys start with `VITE_` and rebuild after changes.
* **Aliases**: if `@/` import fails, verify `tsconfig.json` + `vite.config.ts`.

---

## License

Internal project documentation. Distribute according to repository policy.
