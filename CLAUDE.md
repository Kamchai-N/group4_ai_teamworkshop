# Dog Tinder — Project Memory

## Project Overview
A Tinder-like app for dogs. Users must enter a username on the first page before swiping.
Users swipe right (like) or left (dislike) on random dog images.
Data is fetched from random.dog API. Swipe results are stored in a local JSON file,
recording which user performed each action.
A history page shows all past swipe records.

## Stack
- Framework: Next.js 14+ (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- External API: https://random.dog/woof.json
- Storage: Local JSON file at /data/swipes.json (via Node.js fs on API routes)

## API Details
- Endpoint: GET https://random.dog/woof.json
- No API key required
- Returns: { "fileSizeBytes": 123456, "url": "https://random.dog/abc123.jpg" }
- Dog ID extraction: split url by "/" and take last segment, then remove file extension
  - Example: "https://random.dog/d40de385-3626-46c8-94bf-b7097226174f.jpg"
  - ID → "d40de385-3626-46c8-94bf-b7097226174f"
- Note: some URLs may be .mp4 — skip and fetch again if not an image

## Data Schema (swipes.json)
[
  {
    "dogId": "d40de385-3626-46c8-94bf-b7097226174f",
    "imageUrl": "https://random.dog/d40de385-3626-46c8-94bf-b7097226174f.jpg",
    "action": "like" | "dislike",
    "username": "john_doe",
    "timestamp": "2026-05-08T10:00:00Z"
  }
]

## Username Flow
- On app load, if no username is stored in sessionStorage → redirect to /login page
- /login page: simple form with username input (no password, no auth)
- Username is saved to sessionStorage under key "username"
- Username is sent in every POST /api/swipe request body
- Username is displayed in the top navbar while swiping

## File Structure
/app
  /page.tsx                — Redirect: if no username → /login, else → /swipe
  /login/page.tsx          — Username entry form (required before anything)
  /swipe/page.tsx          — Main swipe page (protected: requires username)
  /history/page.tsx        — History page — shows all swipe records
  /api
    /dog/route.ts          — GET: fetch random dog from random.dog, extract ID from URL
    /swipe/route.ts        — POST: save swipe result (with username) to JSON
    /history/route.ts      — GET: read swipe history from JSON
/data
  /swipes.json             — Persistent swipe storage
/components
  /SwipeCard.tsx           — Dog card with swipe animation
  /SwipeButtons.tsx        — Like/Dislike buttons
  /HistoryList.tsx         — List of past swipes, shows username per record
  /Navbar.tsx              — Top bar showing current username + logout button

## Milestones
1. API Layer — random.dog integration + JSON read/write with username field
2. Login Page — username form + sessionStorage + redirect guard
3. Swipe UI — Card display + swipe interaction + username in POST
4. History Page — Display past swipe records with username column
5. Polish — Animations, empty states, error handling, skip .mp4 urls

## Decisions Made
- Using App Router (not Pages Router)
- JSON file storage (no database needed for this prototype)
- Swipe via buttons (optional: add drag gesture later)
- No auth/password — username only for record-keeping purposes
- Username stored in sessionStorage (clears on browser close)
- Dog ID extracted from URL via split("/").pop() then remove extension
- Skip .mp4 and non-image URLs from random.dog — fetch again automatically
- data/swipes.json should be in .gitignore to avoid team conflicts
