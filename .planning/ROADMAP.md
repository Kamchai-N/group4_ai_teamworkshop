# Roadmap: Dog Tinder

## Overview

Three vertical slices deliver the full core loop: API routes first (the data layer), then login identity (the gate), then the swipe UI (the experience). Each phase is independently runnable and testable.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

---

## ✅ v0.1 — API Layer Checkpoint (SHIPPED 2026-05-08)

- [x] **Phase 1: API Layer** — Dog fetch and swipe storage endpoints live and callable → [archive](.planning/milestones/v0.1-ROADMAP.md)

---

## 🚧 v1.0 — Full Core Loop (IN PROGRESS)

- [ ] **Phase 2: Login Page** - Users can enter a username and the app guards /swipe access
- [ ] **Phase 3: Swipe UI** - Users can swipe on dogs with full like/dislike flow and persistence

## Phase Details

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
**Plans**: 2 plans

Plans:
- [ ] 02-01-PLAN.md — Replace globals.css (@theme design tokens) and layout.tsx (Quicksand font + Pawnder metadata)
- [ ] 02-02-PLAN.md — Build login page, swipe auth-guard stub, root redirect + UAT checkpoint

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

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. API Layer | 1/1 | ✅ Complete | 2026-05-08 |
| 2. Login Page | 0/2 | Not started | - |
| 3. Swipe UI | 0/? | Not started | - |
