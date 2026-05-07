# Phase 1: API Layer - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-08
**Phase:** 1-API Layer
**Areas discussed:** Read route naming, swipes.json bootstrap, MP4 retry cap, Response contracts

---

## Read Route Naming

| Option | Description | Selected |
|--------|-------------|----------|
| /api/history (separate GET route) | Separate route file for read; /api/swipe handles POST only | ✓ |
| /api/swipe GET+POST | Same route handles both read and write | |
| You decide | Claude picks — would have chosen /api/history | |

**User's choice:** `/api/history` (Recommended)
**Notes:** Matches CLAUDE.md file structure. Clean separation of concerns.

---

## swipes.json Bootstrap

| Option | Description | Selected |
|--------|-------------|----------|
| Auto-create on first access | API creates /data/swipes.json with [] if missing | ✓ |
| Pre-seed in repo | Commit empty file; API assumes it exists | |

**User's choice:** Auto-create on first access
**Notes:** CLAUDE.md specifies data/swipes.json should be in .gitignore, so pre-seeding would conflict.

---

## MP4 Retry Cap

| Option | Description | Selected |
|--------|-------------|----------|
| Cap at 5 retries, then 500 error | Prevents infinite loop; clear failure signal | ✓ |
| Infinite retry | Keeps retrying; risk of hanging request | |
| Cap at 3 retries | More conservative, faster failure | |

**User's choice:** Cap at 5 retries, then 500 error
**Notes:** Balances resilience with failure safety.

---

## Response Contracts — GET /api/dog

| Option | Description | Selected |
|--------|-------------|----------|
| { url, dogId } only | Strip fileSizeBytes; return only what frontend needs | ✓ |
| Full passthrough | Include fileSizeBytes + dogId from random.dog | |

**User's choice:** `{ url, dogId }` only
**Notes:** Clean contract; Phase 3 needs url and dogId, nothing else.

---

## Response Contracts — POST /api/swipe

| Option | Description | Selected |
|--------|-------------|----------|
| { success: true } | Minimal acknowledgement | |
| Full saved record | Return { dogId, imageUrl, action, username, timestamp } | ✓ |

**User's choice:** Full saved record
**Notes:** Confirms exactly what was persisted; useful for debugging and future history feature.

---

## Claude's Discretion

- HTTP error codes for invalid request bodies and fs write failures — standard Next.js conventions
- dogId extraction: `url.split("/").pop()?.replace(/\.[^.]+$/, "") ?? ""`
- Image URL validation: check extension against allowlist (jpg/jpeg/png/gif/webp)

## Deferred Ideas

None — discussion stayed within phase scope.
