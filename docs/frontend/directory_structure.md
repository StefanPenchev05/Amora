## Directory Structure of Viki

```
src/
├─ app/                      # App shell (providers, routes, store)
│  ├─ providers/
│  ├─ routes/
│  ├─ store/                 # (optional) Redux
│  ├─ App.tsx
│  └─ main.tsx               # Vite entry
│
├─ shared/                   # Reusable, framework-agnostic pieces
│  ├─ api/                   # http client, base dto helpers
│  │  ├─ httpClient.ts
│  │  └─ dto.ts
│  ├─ socket/                # websocket client (single connection)
│  │  └─ socketClient.ts
│  ├─ ui/                    # design-system primitives (Button, Modal…)
│  ├─ hooks/                 # generic hooks (useDebounce, useEventListener)
│  ├─ lib/                   # utilities (date, fp, zod schemas)
│  ├─ config/                # env parsing, feature flags
│  ├─ styles/                # global.css, tailwind.css
│  └─ types/                 # global TS types (Result<T>, Brand<>, etc.)
│
├─ entities/                 # Domain objects (User, Post…) w/ minimal UI
│  └─ user/
│     ├─ model/              # types + dto + mappers
│     ├─ api/                # adapters: rest.ts, socket.ts
│     └─ ui/                 # tiny presentational comps (Avatar, Tag)
│
├─ features/                 # User-facing capabilities (Auth, Chat, Feed…)
│  └─ chat/
│     ├─ model/              # state machines/slices/hooks (useChat)
│     ├─ api/                # feature-level calls
│     ├─ socket/             # room subscriptions, event handlers
│     ├─ ui/                 # MessageList, Composer, etc.
│     └─ pages/              # route-level entry (ChatPage)
│
├─ pages/                    # Page glue around features/entities
├─ widgets/                  # Cross-feature composites (Header, Sidebar)
├─ processes/                # Long flows (onboarding, checkout)
├─ i18n/                     # translations + init for react-i18next
├─ test/                     # test utils, msw server, fixtures
└─ index.html
```

> **Rule of thumb**: `shared` knows nothing about your domain; `entities` model the domain; `features` orchestrate behaviour; `pages` wire features to routes.