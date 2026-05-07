# Phase 1: API Layer - Context

**Gathered:** 2026-05-08
**Status:** Ready for planning

<domain>
## Phase Boundary

Three Next.js 14+ App Router API route files that form the data layer:
- `GET /api/dog` — fetch a random dog image from random.dog, skip .mp4s, return `{ url, dogId }`
- `POST /api/swipe` — validate and write one swipe record to `/data/swipes.json`
- `GET /api/history` — read all swipe records from `/data/swipes.json`

No UI. No login logic. No sessionStorage. Just callable, testable API endpoints.

</domain>

<decisions>
## Implementation Decisions

### Route Structure
- **D-01:** History reads from `/api/history` (GET only) — not from `/api/swipe` GET. `/api/swipe` handles POST only. Separate route files, single-purpose each.

### Storage Bootstrap
- **D-02:** `/data/swipes.json` is auto-created on first access. API checks existence of both `/data/` directory and `swipes.json` before reading or writing; creates with `[]` if missing. Do NOT pre-seed in repo (file is in `.gitignore`).

### MP4 Retry Policy
- **D-03:** `GET /api/dog` retries up to **5 times** when random.dog returns a `.mp4` URL. After 5 failed attempts (no image found), returns HTTP 500. Each retry is a fresh fetch to `https://random.dog/woof.json`.

### Response Contracts
- **D-04:** `GET /api/dog` returns `{ url: string, dogId: string }` only. `fileSizeBytes` from random.dog is stripped.
- **D-05:** `POST /api/swipe` returns the full saved record on success: `{ dogId, imageUrl, action, username, timestamp }`. This confirms exactly what was written to disk.

### Claude's Discretion
- HTTP error codes for other failure modes (bad request body, fs write failure) — standard Next.js conventions apply.
- `dogId` extraction implementation: `url.split("/").pop()?.replace(/\.[^.]+$/, "") ?? ""`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Spec
- `.planning/REQUIREMENTS.md` — DOG-01, DOG-02, SWIPE-01, SWIPE-02 define the 4 requirements this phase must satisfy
- `.planning/ROADMAP.md` §Phase 1 — Success criteria checklist (4 items)
- `CLAUDE.md` — Data schema for swipes.json, dogId extraction logic, API endpoint URLs, file structure

### Data Schema (from CLAUDE.md)
Swipe record shape:
```json
{
  "dogId": "string",
  "imageUrl": "string",
  "action": "like" | "dislike",
  "username": "string",
  "timestamp": "ISO8601 string"
}
```

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — fresh project, no existing code.

### Established Patterns
- Next.js 14+ App Router route convention: `app/api/<name>/route.ts` with named exports `GET`, `POST`, etc.
- TypeScript strict mode expected (workshop uses latest Next.js patterns).
- Node.js `fs/promises` for file I/O inside route handlers (server-side only).

### Integration Points
- `GET /api/dog` is called by Phase 3's swipe page on mount and after each swipe.
- `POST /api/swipe` is called by Phase 3 on Like/Dislike button click (body includes username from sessionStorage).
- `GET /api/history` is available for future History page (v2, out of scope for v1).

</code_context>

<specifics>
## Specific Ideas

- random.dog API: `GET https://random.dog/woof.json` → `{ fileSizeBytes, url }`
- dogId example: `"https://random.dog/d40de385-3626-46c8-94bf-b7097226174f.jpg"` → `"d40de385-3626-46c8-94bf-b7097226174f"`
- Image check: URL must end in `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp` — anything else (incl. `.mp4`) triggers retry.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 1-API Layer*
*Context gathered: 2026-05-08*
