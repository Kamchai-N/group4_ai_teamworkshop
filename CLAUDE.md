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

## Design Reference
- UI design exported from Stitch — located at /design/**/*.md and /design/**/*.html
- GSD must read these files before planning any UI phase
- Use the exported HTML/CSS as the base for all components
- Do not invent UI — follow Stitch export exactly

## Design System (extracted from /design/friendly_pet_discovery/DESIGN.md)

### Brand
- Name: Pawnder (displayed as "Pawnder" in UI, not "Dog Tinder")
- Personality: energetic, heartwarming, approachable — "Tactile-Modern"

### Tokens
- Font: Quicksand (400/500/600/700) — import from Google Fonts
- Icons: Material Symbols Outlined — import from Google Fonts, filled variant for active states
- Primary: #9b4500 (warm orange)
- Surface: #fbf9f8 (off-white cream)
- Surface-container-lowest: #ffffff
- Surface-container-low: #f6f3f2
- Primary-container: #ff8c42 (button orange)
- On-primary: #ffffff
- On-surface: #1b1c1c
- On-surface-variant: #564338
- Outline-variant: #ddc1b3
- Error: #ba1a1a (dislike/close color)
- Tertiary-container: #83ba48 (green, success)
- Full color map: see /design/friendly_pet_discovery/DESIGN.md

### Shape & Radius
- Cards: 24px (rounded-3xl or `rounded-[24px]`)
- Inputs: 12px (rounded-xl = 0.75rem)
- Buttons: full pill (rounded-full)
- Modals/sheets: 32px top corners

### Spacing (8px base scale)
- xs: 4px, sm: 12px, md: 24px, lg: 40px, xl: 64px, container-padding: 20px

### Shadows
- Card (resting): `shadow-[0_4px_24px_rgba(0,0,0,0.04)]`
- Card (hover): `shadow-[0_8px_16px_rgba(0,0,0,0.08)]`
- Bottom sheet: `shadow-[0_-8px_24px_rgba(0,0,0,0.06)]`

### Tailwind Config
All design files carry a tailwind.config block — copy it into `tailwind.config.ts` as the single source of truth for custom colors, spacing, fontSize, fontFamily, and borderRadius.

## Phase 2 — Login Page Design Contract

### Mobile (/design/pawnder_login_mobile/code.html)
- Layout: `h-screen flex flex-col overflow-hidden`
- Top half: full-bleed hero dog image (`h-1/2 w-full object-cover`)
- Bottom half: `bg-surface rounded-t-[32px] -mt-6` card overlapping image, shadow on top
- Brand: "Pawnder" in `text-display text-primary` + tagline "Join the pack" in `text-on-surface-variant`
- Input: `person` icon left, `rounded-xl bg-surface-container-low border-2 border-transparent focus:border-primary`
- CTA: "Start Sniffing" + `arrow_forward` icon, `rounded-full bg-primary-container text-on-primary-container`
- Note: design has email+password fields — our app is USERNAME ONLY (no password per project spec)

### Desktop (/design/pawnder_login_desktop/code.html)
- Layout: `min-h-screen flex flex-row`
- Left `md:w-3/5`: full-height dog photo with right-side gradient overlay fading to surface
- Right `md:w-2/5`: centered login form, floating paw/heart/star icons as background decoration
- Login card: `bg-surface rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] p-md border border-surface-container`
- CTA: `bg-primary text-on-primary rounded-full` ("Start Sniffing")

## Phase 3 — Swipe UI Design Contract

### Mobile (/design/pawnder_swipe_mobile/code.html)
- Header: minimal centered "Pawnder" in `text-headline-lg text-primary`
- Card: `absolute` fills `top-0 left-container-padding right-container-padding bottom-[120px]`, `rounded-3xl shadow`, overflow hidden
  - Image fills top, gradient scrim at bottom for text readability
  - Overlay text bottom-left: dog name/age (we show dogId or skip label)
  - Tag pills top-left/right: `bg-surface/90 backdrop-blur-md rounded-full px-sm py-xs`
  - Info strip bottom 100px: description text
- FABs (pinned at `bottom-[20px]` center row):
  - Pass/Dislike: `w-16 h-16 rounded-full bg-surface border-2 border-outline-variant text-error` (close icon 32px)
  - Super Like: `w-12 h-12 rounded-full bg-surface text-tertiary-container` (star icon) — map to like action
  - Like: `w-[72px] h-[72px] rounded-full bg-primary text-on-primary shadow-[0_6px_20px_rgba(155,69,0,0.25)]` (favorite icon 36px)
- Bottom nav: fixed, `rounded-t-xl shadow-[0_-4px_12px_rgba(0,0,0,0.04)]`
  - Active tab: `bg-primary-container text-on-primary-container rounded-full px-6 py-1`
  - Inactive: `text-secondary p-2 hover:bg-secondary-container rounded-full`
  - Tabs: Swipe (pets icon) / Matches→History (favorite icon) / Profile (person icon)

### Desktop (/design/pawnder_swipe_desktop/code.html)
- Fixed sidebar `w-64 bg-surface-container-low border-r border-outline-variant`
  - Logo + nav links (Find Pets active, My Matches, Messages)
  - Active link: `bg-secondary-container text-on-secondary-container rounded-xl`
  - "Get Premium" CTA at bottom: `bg-primary text-on-primary rounded-full`
- Main area `ml-64`: paw-pattern bg, card centered `max-w-[420px] aspect-[3/4] rounded-[24px]`
  - Image top fills card, cream info strip at bottom
  - Buttons below card: Dislike `w-16 h-16 border-2 border-outline-variant text-error`, SuperLike `w-14 h-14`, Like `w-20 h-20 bg-primary`

## Phase 4 — History Page Design Contract (future reference)

### Mobile (/design/pawnder_history_mobile/code.html)
- Sticky top header + search/filter row + pill tabs
- List cards: `flex items-center gap-md rounded-xl p-sm shadow-sm bg-surface-container-lowest`
  - Circular dog thumbnail 64px, name, breed/action, Chat/View button

### Desktop (/design/pawnder_history_desktop/code.html)
- Same sidebar pattern as swipe desktop
- Grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-md`
- Cards: `rounded-[24px] flex flex-col items-center text-center`

## Adaptation Notes (design vs our data model)
- No breed/name/age from random.dog — show dogId or omit label row in swipe card
- Super Like button present in design — treat as like action (same POST /api/swipe with action:"like")
- History cards adapt "Chat" button → shows like/dislike badge + timestamp instead
- Username from sessionStorage shown in navbar, not an avatar/profile photo