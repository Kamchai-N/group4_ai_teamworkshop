---
phase: 01-api-layer
reviewed: 2026-05-08T00:00:00Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - lib/storage.ts
  - lib/storage.test.ts
  - app/api/dog/route.ts
  - app/api/dog/route.test.ts
  - app/api/swipe/route.ts
  - app/api/history/route.ts
  - app/api/history/route.test.ts
  - vitest.config.ts
findings:
  critical: 4
  warning: 4
  info: 2
  total: 10
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-05-08T00:00:00Z
**Depth:** standard
**Files Reviewed:** 8
**Status:** issues_found

## Summary

Reviewed the API layer for the Dog Tinder application: the storage module, three API routes (`/api/dog`, `/api/swipe`, `/api/history`), their tests, and the Vitest config. The implementation covers the happy-path well and the input-validation checks in the swipe route are thorough. However, there are four critical blockers — a data-loss race condition in storage, two categories of unhandled crash paths in the dog route, and one crash path when valid-but-non-object JSON is POSTed to the swipe route. These must be resolved before shipping.

---

## Critical Issues

### CR-01: Race condition in `appendSwipe` causes silent record loss under concurrent writes

**File:** `lib/storage.ts:30-36`
**Issue:** `appendSwipe` performs a read-modify-write in three separate async steps with no locking. Two simultaneous POST `/api/swipe` requests will both call `readSwipes()`, receive the same existing array, each push their own record, and then both call `writeFile` — the last write wins and the other record is silently dropped. On a multi-user prototype where several people swipe at the same moment, this is real data loss.

**Fix:** The simplest safe option for a prototype using a flat file is to serialize writes with a module-level promise chain (a mutex), or to switch to NDJSON append-only writes using the `'a'` flag:

```typescript
// Option A: mutex (minimal change)
let writeQueue: Promise<void> = Promise.resolve();

export async function appendSwipe(record: SwipeRecord): Promise<SwipeRecord> {
  writeQueue = writeQueue.then(async () => {
    await ensureStore();
    const records = await readSwipes();
    records.push(record);
    await fs.writeFile(SWIPES_FILE, JSON.stringify(records, null, 2), "utf-8");
  });
  await writeQueue;
  return record;
}
```

---

### CR-02: POST `/api/swipe` crashes with 500 when JSON body is valid but non-object

**File:** `app/api/swipe/route.ts:12`
**Issue:** The `try/catch` around `req.json()` only guards against malformed JSON. If a client sends syntactically valid JSON that is not an object — `null`, `"string"`, `42`, `[]` — then `body` is set to that value, and the cast `body as Record<string, unknown>` succeeds at the type level. The subsequent destructure `const { dogId, imageUrl, action, username } = body as ...` throws `TypeError: Cannot destructure property 'dogId' of null` (or similar), which escapes the outer try/catch and surfaces as an unhandled 500.

**Fix:** Add an object guard immediately after parsing:

```typescript
if (!body || typeof body !== "object" || Array.isArray(body)) {
  return NextResponse.json({ error: "Request body must be a JSON object" }, { status: 400 });
}
```

---

### CR-03: Network errors and non-OK responses in `/api/dog` are unhandled — crashes the route

**File:** `app/api/dog/route.ts:17-18`
**Issue:** The `fetch` call has no try/catch and no `res.ok` guard. Two distinct crash paths:
1. A network failure (timeout, DNS error) throws from `await fetch(...)`, which is unhandled inside a for-loop with no try/catch, causing an uncaught promise rejection / 500 with no useful error body.
2. If random.dog returns a non-200 response with an HTML body, `await res.json()` throws a JSON parse error — same outcome.

Neither crash is retried; the whole route fails immediately on the first affected attempt instead of consuming the remaining attempts.

**Fix:**

```typescript
export async function GET(): Promise<NextResponse> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await fetch(RANDOM_DOG_URL, { cache: "no-store" });
      if (!res.ok) continue; // treat upstream errors as non-image; retry
      const data = (await res.json()) as { fileSizeBytes: number; url: string };
      if (typeof data.url !== "string") continue;
      if (isImageUrl(data.url)) {
        return NextResponse.json({ url: data.url, dogId: extractDogId(data.url) });
      }
    } catch {
      // network error on this attempt — try again
    }
  }
  return NextResponse.json(
    { error: `Could not fetch a valid dog image after ${MAX_ATTEMPTS} attempts` },
    { status: 500 }
  );
}
```

---

### CR-04: `JSON.parse` in `readSwipes` is unguarded — corrupted file crashes all read and write paths

**File:** `lib/storage.ts:27`
**Issue:** `JSON.parse(raw)` throws if `swipes.json` contains non-JSON content (truncated file from a mid-write crash, manual edit, disk-full scenario). Because `readSwipes()` is called by both the `/api/history` GET and inside `appendSwipe`, a corrupted file takes down every API endpoint that touches storage, with no recovery path.

**Fix:**

```typescript
export async function readSwipes(): Promise<SwipeRecord[]> {
  await ensureStore();
  const raw = await fs.readFile(SWIPES_FILE, "utf-8");
  try {
    return JSON.parse(raw) as SwipeRecord[];
  } catch {
    // File is corrupt; return empty list and log so the operator can recover
    console.error("[storage] swipes.json is not valid JSON — returning empty list");
    return [];
  }
}
```

---

## Warnings

### WR-01: `data.url` is not type-guarded before use, causing a crash when absent

**File:** `app/api/dog/route.ts:20`
**Issue:** `data` is cast via `as { fileSizeBytes: number; url: string }` but not validated. If the random.dog API returns an object without a `url` field (e.g., an error response like `{"error":"rate limited"}`), then `data.url` is `undefined` and `isImageUrl(undefined)` calls `undefined.toLowerCase()`, throwing a TypeError. This manifests as an unhandled 500 on every attempt in the loop.

This is partially addressed by the fix in CR-03 (`typeof data.url !== "string" → continue`), but it deserves an explicit call-out since the current code has no guard at all.

**Fix:** Included in the CR-03 fix: add `if (typeof data.url !== "string") continue;` after parsing the response.

---

### WR-02: `extractDogId` silently returns `""` for malformed or empty URLs

**File:** `app/api/dog/route.ts:11-13`
**Issue:** `url.split("/").pop()` returns `undefined` when the array is empty (impossible in practice for split) and `""` when the last segment is empty (e.g., trailing slash like `"https://random.dog/"`). The `??` falls back to `""`. An empty `dogId` then passes through `isImageUrl`, passes validation in the swipe route (`if (!dogId || ...)` — empty string is falsy, so this actually IS caught), but it is a silent code smell that could produce unexpected behavior if the guard is ever relaxed.

**Fix:**

```typescript
function extractDogId(url: string): string {
  const filename = url.split("/").pop() ?? "";
  if (!filename) return "";
  return filename.replace(/\.[^.]+$/, "");
}
```

Also add a guard in the route so that a generated `dogId` of `""` triggers a retry rather than being returned:

```typescript
const dogId = extractDogId(data.url);
if (!dogId) continue;
```

---

### WR-03: No length/content cap on user-controlled string fields in POST `/api/swipe`

**File:** `app/api/swipe/route.ts:14-25`
**Issue:** `username`, `imageUrl`, and `dogId` are only checked for type (`typeof x === "string"`) and truthiness. A client can send multi-megabyte strings for any of these fields, which get written verbatim into `swipes.json`. Repeated malicious calls will grow the file unboundedly and can exhaust disk space.

**Fix:** Add reasonable length guards:

```typescript
if (dogId.length > 200) {
  return NextResponse.json({ error: "dogId too long" }, { status: 400 });
}
if (imageUrl.length > 2000) {
  return NextResponse.json({ error: "imageUrl too long" }, { status: 400 });
}
if (username.length > 50) {
  return NextResponse.json({ error: "username too long" }, { status: 400 });
}
```

---

### WR-04: Swipe route tests placed in history test file — wrong module, misleading coverage location

**File:** `app/api/history/route.test.ts:39-101`
**Issue:** The `describe("POST /api/swipe", ...)` block — covering happy-path and sad-path for the swipe route — lives inside `route.test.ts` for the history route. This means there is no `app/api/swipe/route.test.ts`, the swipe route has no co-located test file, and test runners that report by-file will show swipe coverage only under `history`. This is a structural quality defect that will confuse future maintainers.

**Fix:** Move the `POST /api/swipe` describe block to a new file `app/api/swipe/route.test.ts`.

---

## Info

### IN-01: `appendSwipe` calls `ensureStore()` redundantly — `readSwipes()` calls it again

**File:** `lib/storage.ts:31-32`
**Issue:** `appendSwipe` calls `ensureStore()` on line 31, then immediately calls `readSwipes()` on line 32, which itself calls `ensureStore()` again. The double call is harmless (idempotent) but wastes an `fs.access` syscall on every swipe write.

**Fix:** Remove the top-level `ensureStore()` call from `appendSwipe` and let `readSwipes` handle it, or keep `ensureStore` only in `appendSwipe` and remove it from the `readSwipes` path.

---

### IN-02: `as any` cast used for `global.fetch` mock in dog route tests

**File:** `app/api/dog/route.test.ts:23,37,47,57`
**Issue:** Each test sets `global.fetch = makeFetchMock([...]) as any`. The `as any` hides the fact that `makeFetchMock` returns a `vi.fn()` that only implements `json()`, not the full `Response` interface. This is a test-quality smell — acceptable for a prototype, but worth tracking.

**Fix:** Type the mock explicitly or cast to `typeof fetch` to document the intentional partial mock:

```typescript
global.fetch = makeFetchMock([...]) as unknown as typeof fetch;
```

---

_Reviewed: 2026-05-08T00:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
