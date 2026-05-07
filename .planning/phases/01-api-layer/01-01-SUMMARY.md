---
phase: 01-api-layer
plan: 01
subsystem: api
tags: [api, storage, tdd, scaffold, next.js]
dependency_graph:
  requires: []
  provides:
    - lib/storage.ts (SwipeRecord, ensureStore, readSwipes, appendSwipe)
    - GET /api/dog
    - POST /api/swipe
    - GET /api/history
  affects:
    - Phase 2 (login) — no API changes needed
    - Phase 3 (swipe UI) — calls all three routes
tech_stack:
  added:
    - Next.js 16 (App Router, TypeScript, Tailwind CSS)
    - Vitest 4 + @vitest/coverage-v8
  patterns:
    - TDD red/green per task (3 × 2 commits)
    - process.cwd() mock + vi.resetModules() for test isolation
    - Shared storage module (no duplicated fs bootstrap logic)
key_files:
  created:
    - lib/storage.ts
    - lib/storage.test.ts
    - app/api/dog/route.ts
    - app/api/dog/route.test.ts
    - app/api/swipe/route.ts
    - app/api/history/route.ts
    - app/api/history/route.test.ts
    - vitest.config.ts
    - package.json
    - tsconfig.json
    - .gitignore
  modified:
    - CLAUDE.md (restored after create-next-app cp overwrote it)
    - README.md (replaced by scaffold-generated README)
decisions:
  - D-01: history reads from GET /api/history (not /api/swipe GET) — single-purpose routes
  - D-02: /data/swipes.json auto-created on first access; not pre-seeded; gitignored
  - D-03: GET /api/dog retries up to 5 total attempts before returning 500
  - D-04: GET /api/dog returns only { url, dogId } — fileSizeBytes stripped
  - D-05: POST /api/swipe returns full record { dogId, imageUrl, action, username, timestamp }
  - Vitest @ alias: added @/* → project root in vitest.config.ts (Rule 3 fix)
metrics:
  duration: "~8 minutes (wall clock)"
  completed_date: "2026-05-07"
  tasks_completed: 3
  files_created: 12
  tests: 15
---

# Phase 01 Plan 01: API Layer Summary

Scaffolded Next.js 16 App Router project with TypeScript + Tailwind and implemented all three Dog Tinder API routes (GET /api/dog with 5-attempt retry, POST /api/swipe with full validation, GET /api/history) backed by a shared lib/storage.ts JSON file helper, with 15 Vitest unit/integration tests all passing.

## Tasks Completed

| Task | Name | Commits | Status |
|------|------|---------|--------|
| Scaffold | Next.js project + Vitest | 5a595e6 | Done |
| 1 | lib/storage.ts | a8f3339 (RED), e4aa808 (GREEN) | Done |
| 2 | GET /api/dog | 8a80cd7 (RED), 662c780 (GREEN) | Done |
| 3 | POST /api/swipe + GET /api/history | fec8637 (RED), 52266d6 (GREEN) | Done |

## What Was Built

### lib/storage.ts
Shared JSON file I/O helper used by all subsequent phases. Three exports:
- `ensureStore()`: creates `/data/` dir and `swipes.json` (with `[]`) if missing — idempotent
- `readSwipes()`: returns `[]` on fresh install, parses existing records
- `appendSwipe(record)`: reads, pushes, writes back, returns the saved record

### GET /api/dog
Fetches from `https://random.dog/woof.json` with `cache: no-store`. Retries up to 5 times on non-image URLs (`.mp4`, etc.). Returns `{ url, dogId }` on success; `500 { error }` after exhaustion. dogId extracted via `split('/').pop().replace(/\.[^.]+$/, '')`.

### POST /api/swipe
Validates all 4 required fields (dogId, imageUrl, action, username). Returns 400 with descriptive error on missing/invalid input. Generates server-side ISO 8601 timestamp. Persists via `appendSwipe()`. Returns the full saved record.

### GET /api/history
Single-line handler: calls `readSwipes()` and returns the array. Returns `[]` on first call (no data).

## Test Results

```
Test Files  3 passed (3)
     Tests  15 passed (15)
```

- `lib/storage.test.ts`: 6 tests (ensureStore, readSwipes, appendSwipe)
- `app/api/dog/route.test.ts`: 4 tests (image URL, mp4 retry, 5-attempt exhaustion, webp)
- `app/api/history/route.test.ts`: 5 tests (empty history, invalid action, missing dogId, save+return, POST→GET e2e)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added @ path alias to vitest.config.ts**
- **Found during:** Pre-execution analysis (Task 1 setup)
- **Issue:** The plan's `vitest.config.ts` had no `resolve.alias` for `@/*`. Task 3's `app/api/history/route.test.ts` dynamically imports `../swipe/route`, which imports `@/lib/storage`. Without the alias, Vitest would fail to resolve the import at test time.
- **Fix:** Added `resolve: { alias: { "@": path.resolve(__dirname, ".") } }` to vitest.config.ts
- **Files modified:** vitest.config.ts
- **Commit:** 5a595e6

**2. [Rule 1 - Bug] Restored CLAUDE.md after scaffold overwrote it**
- **Found during:** Task 1 scaffold step
- **Issue:** `cp -r temp-scaffold/. .` copied the scaffold's minimal `CLAUDE.md` (contents: `@AGENTS.md`) over the project's authoritative CLAUDE.md. The file was not committed to git, so it had to be restored from context.
- **Fix:** Rewrote CLAUDE.md with full project memory contents
- **Files modified:** CLAUDE.md
- **Commit:** 5a595e6

## TDD Gate Compliance

All three tasks followed RED → GREEN:
- Task 1: `a8f3339` (test, RED) → `e4aa808` (feat, GREEN)
- Task 2: `8a80cd7` (test, RED) → `662c780` (feat, GREEN)
- Task 3: `fec8637` (test, RED) → `52266d6` (feat, GREEN)

## Known Stubs

None. All API routes return real data sourced from the random.dog API or the local JSON file.

## Threat Surface Scan

All surfaces are within the plan's threat model:
- POST /api/swipe input validation: implemented (T-01-01 mitigated)
- GET /api/dog retry cap: 5 attempts (T-01-03 mitigated)
- JSON.parse: T-01-05 (corrupt file) — readSwipes does not wrap in try/catch; this is acceptable for Phase 1 (workshop prototype). Deferred.

No new threat surface introduced beyond what was planned.

## Self-Check: PASSED

- lib/storage.ts: FOUND
- lib/storage.test.ts: FOUND
- app/api/dog/route.ts: FOUND
- app/api/dog/route.test.ts: FOUND
- app/api/swipe/route.ts: FOUND
- app/api/history/route.ts: FOUND
- app/api/history/route.test.ts: FOUND
- vitest.config.ts: FOUND
- All commits (5a595e6, a8f3339, e4aa808, 8a80cd7, 662c780, fec8637, 52266d6): FOUND
