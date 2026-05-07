# Walking Skeleton — Dog Tinder

**Phase:** 01-api-layer
**Created:** 2026-05-08
**Proof statement:** A caller can `GET /api/dog` to receive a valid dog image URL, then `POST /api/swipe` to persist that swipe to disk, and `GET /api/history` to read it back — all without a database or auth.

---

## Architectural Decisions

These decisions are locked for all subsequent phases. Later phases build on them without renegotiating.

### Framework

| Concern | Decision | Rationale |
|---------|----------|-----------|
| Framework | Next.js 14+ App Router | Workshop standard; latest patterns |
| Language | TypeScript (strict) | Workshop requirement |
| Styling | Tailwind CSS | Installed in Phase 1; used starting Phase 3 |
| Runtime | Node.js >= 20 | fs/promises, native fetch |

### Directory Layout

```
/
  app/
    layout.tsx              — Root layout (created by scaffold)
    page.tsx                — Root redirect (Phase 2 adds logic)
    api/
      dog/
        route.ts            — GET /api/dog
      swipe/
        route.ts            — POST /api/swipe
      history/
        route.ts            — GET /api/history
    login/
      page.tsx              — Phase 2
    swipe/
      page.tsx              — Phase 3
    history/
      page.tsx              — v2
  components/               — Phase 3+
  lib/
    storage.ts              — Shared JSON file I/O helper
  data/
    swipes.json             — Runtime-only; gitignored; auto-created on first access
  .planning/                — GSD planning artifacts
```

### Data Layer

| Concern | Decision |
|---------|----------|
| Storage engine | Local JSON file at `/data/swipes.json` |
| Storage helper | `lib/storage.ts` — all phases import from here |
| Bootstrap | `ensureStore()` creates `/data/` dir + `swipes.json` (with `[]`) if missing |
| gitignore | `data/` directory is gitignored to avoid team conflicts |

**Storage helper contract (all phases import this):**

```typescript
// lib/storage.ts
export interface SwipeRecord {
  dogId: string;
  imageUrl: string;
  action: "like" | "dislike";
  username: string;
  timestamp: string; // ISO 8601, generated server-side
}

export async function ensureStore(): Promise<void>;
export async function readSwipes(): Promise<SwipeRecord[]>;
export async function appendSwipe(record: SwipeRecord): Promise<SwipeRecord>;
```

### Auth / Identity

| Concern | Decision |
|---------|----------|
| Auth | None — username only for record-keeping |
| Username transport | Sent in POST body by client; stored in sessionStorage (Phase 2) |
| Server trust | Server does not validate username beyond presence |

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| /api/dog | GET | Fetch random dog image URL with dogId |
| /api/swipe | POST | Save swipe record to disk |
| /api/history | GET | Read all swipe records from disk |

**Note:** `/api/swipe` is POST-only. History reads come from `/api/history` (D-01 — locked).

### Dog ID Extraction

Canonical regex used by all phases:

```typescript
const dogId = url.split("/").pop()?.replace(/\.[^.]+$/, "") ?? "";
```

Example: `"https://random.dog/d40de385-3626-46c8-94bf-b7097226174f.jpg"` → `"d40de385-3626-46c8-94bf-b7097226174f"`

### Image Extension Allowlist

Only these extensions are accepted from random.dog. Anything else (e.g., `.mp4`) triggers a retry:

```typescript
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
```

Retry policy: Up to **5 total attempts**. After 5 failed attempts with no image URL, return HTTP 500.

### Test Framework

| Concern | Decision |
|---------|----------|
| Framework | Vitest |
| Run command | `npm test` |
| Scope | Unit tests for `lib/storage.ts` and integration tests for route handlers (imported directly, no server boot) |
| Test files | Co-located: `*.test.ts` alongside source |

### Deployment

| Concern | Decision |
|---------|----------|
| Target | Local dev only (`npm run dev` / `next dev`) |
| Port | 3000 (Next.js default) |
| Production deploy | Out of scope for workshop |

---

## Phase Build Order

| Phase | Adds |
|-------|------|
| 1 — API Layer (this skeleton) | Next.js scaffold + all API routes + `lib/storage.ts` |
| 2 — Login Page | `/login` page, sessionStorage guard on `/swipe` |
| 3 — Swipe UI | SwipeCard, SwipeButtons, Navbar components; connects to Phase 1 API |

---

*Skeleton established: 2026-05-08*
