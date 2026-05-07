# Roadmap: Dog Tinder

## Overview

Three vertical slices deliver the full core loop: API routes first (the data layer), then login identity (the gate), then the swipe UI (the experience). Each phase is independently runnable and testable. By Phase 3 the complete user journey — enter username, swipe dogs, save records — works end to end.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: API Layer** - Dog fetch and swipe storage endpoints are live and callable
- [ ] **Phase 2: Login Page** - Users can enter a username and the app guards /swipe access
- [ ] **Phase 3: Swipe UI** - Users can swipe on dogs with full like/dislike flow and persistence

## Phase Details

### Phase 1: API Layer
**Goal**: The backend API endpoints exist and work — dog images can be fetched and swipes can be saved and read
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: DOG-01, DOG-02, SWIPE-01, SWIPE-02
**Success Criteria** (what must be TRUE):
  1. GET /api/dog returns a JSON response with a valid image URL (jpg/png) and extracted dogId
  2. GET /api/dog never returns a .mp4 URL — it retries until an image is found
  3. POST /api/swipe with a valid body writes a record to /data/swipes.json and returns success
  4. GET /api/history returns the full list of swipe records from /data/swipes.json
**Plans**: 1 plan
Plans:
- [ ] 01-01-PLAN.md — Scaffold Next.js + lib/storage.ts + all three API routes (GET /api/dog, POST /api/swipe, GET /api/history)

### Phase 2: Login Page
**Goal**: Users can identify themselves with a username and the app prevents access to /swipe without one
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: LOGIN-01, LOGIN-02, LOGIN-03
**Success Criteria** (what must be TRUE):
  1. User can visit /login, type a username, and submit the form
  2. After submitting, the username is stored in sessionStorage under the key "username"
  3. User is redirected to /swipe after successful login
  4. Visiting /swipe without a username in sessionStorage redirects back to /login
**Plans**: TBD

### Phase 3: Swipe UI
**Goal**: Users can see dog images and swipe like or dislike — each action is saved and the next dog loads
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: UI-01, UI-02, UI-03, UI-04, UI-05
**Success Criteria** (what must be TRUE):
  1. /swipe page shows a dog image in a card layout
  2. User can click Like or Dislike buttons on the card
  3. Each button click sends a POST to /api/swipe with the correct action, dogId, imageUrl, username, and timestamp
  4. After each swipe, the next dog image loads automatically in the card
  5. The navbar displays the current username while on the swipe page
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. API Layer | 0/1 | Not started | - |
| 2. Login Page | 0/? | Not started | - |
| 3. Swipe UI | 0/? | Not started | - |
