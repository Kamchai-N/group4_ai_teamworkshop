# Dog Tinder

## What This Is

A Tinder-like swipe app for dogs, built as a workshop exercise for learning AI-assisted development. Users enter a username, then swipe right (like) or left (dislike) on random dog images fetched from the random.dog API. Swipe actions are persisted to a local JSON file.

## Core Value

A user can log in, swipe on dogs, and have their swipes saved — the loop must work end to end.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] User can enter a username on /login and be redirected to the swipe page
- [ ] Username is stored in sessionStorage and required before accessing /swipe
- [ ] App fetches random dog image from random.dog API (skips .mp4 URLs)
- [ ] User can swipe right (like) or left (dislike) on a dog image
- [ ] Each swipe is saved to /data/swipes.json with dogId, imageUrl, action, username, timestamp
- [ ] Username is visible in the navbar while swiping

### Out of Scope

- History page — deferred to v2 (core loop first, history is nice-to-have)
- Authentication / passwords — username only, no auth needed for workshop scope
- Drag gesture swiping — buttons only for now; gestures are optional polish
- Database — JSON file storage is sufficient for this prototype
- .mp4 handling UI — skip silently and re-fetch, no user-facing error needed

## Context

Workshop project for a team learning AI-assisted development with Claude Code. Speed of delivery matters. Stack is pre-decided: Next.js 14+ App Router, TypeScript, Tailwind CSS. External API is random.dog (no key required). Storage is a local JSON file at /data/swipes.json via Node.js fs in API routes.

Dog ID extraction: split URL by "/" and take last segment, then strip file extension.
Example: "https://random.dog/d40de385-3626-46c8-94bf-b7097226174f.jpg" → "d40de385-3626-46c8-94bf-b7097226174f"

## Constraints

- **Tech stack**: Next.js 14+ App Router, TypeScript, Tailwind CSS — pre-decided for workshop
- **Storage**: Local JSON file only — no database for this prototype
- **API**: random.dog (GET https://random.dog/woof.json) — no API key
- **Auth**: No passwords — username in sessionStorage only

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| App Router (not Pages Router) | Workshop uses latest Next.js patterns | — Pending |
| JSON file storage | No DB setup overhead for prototype | — Pending |
| sessionStorage for username | Clears on browser close, simple to implement | — Pending |
| Buttons for swipe (not drag) | Simpler to build, drag optional later | — Pending |
| Skip .mp4 URLs silently | random.dog returns video sometimes; re-fetch is cleaner UX | — Pending |
| data/swipes.json in .gitignore | Avoid team conflicts on shared swipe data | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-08 after initialization*
