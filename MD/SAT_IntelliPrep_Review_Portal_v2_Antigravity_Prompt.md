# MASTER PROMPT — Upgrade `sat_interactive_review.html` into SAT IntelliPrep Release QA Portal v2

## ROLE
Act as a **Senior Product Design Lead + Frontend QA Engineer + Release Manager**.

Upgrade the existing internal review file `sat_interactive_review.html` into a professional **Internal Product Review & Release QA Portal**.

This portal is **not** the SAT learning product itself. It is an internal surface for the product owner, designer, QA reviewer, and Antigravity team to inspect the real SAT IntelliPrep build before release.

Do **not** redesign or modify the core SAT app as part of this task unless a tiny integration hook is required. Do **not** alter SAT scoring, adaptive routing, question bank, SRS, diagnostic logic, or learner data.

---

## 1. PRIMARY OBJECTIVE

The portal must answer immediately:

1. Which build am I reviewing?
2. Is Production reachable?
3. Which regression/runtime/visual/accessibility gates have actually passed?
4. What screen and viewport am I currently inspecting?
5. What is verified evidence vs. expert opinion?
6. What remains before the next release?

Visual direction: **Calm · Academic · Professional · Internal QA · Evidence-based · Trustworthy**.

It should align with SAT IntelliPrep’s “Calm Academic Intelligence” language, but look like a **release dashboard / design review board**, not a marketing page.

---

## 2. CRITICAL FIX — REMOVE HARD-CODED LOCALHOST

The current review file hard-codes `http://localhost:5500`.

Replace it with configurable app URL logic:

```js
const params = new URLSearchParams(window.location.search);

const APP_URL =
  params.get('app') ||
  window.REVIEW_CONFIG?.productionUrl ||
  'https://nmstudio-sat-intelliprep.vercel.app';
```

Support:

Production review:
```text
sat_interactive_review.html
```

Local development review:
```text
sat_interactive_review.html?app=http://localhost:5500
```

All iframe sources, Open buttons, hash navigation, and source labels must derive from `APP_URL`.

Show clearly:
- `SOURCE: PRODUCTION`
or
- `SOURCE: LOCAL DEV`

Never hard-code localhost in visible UI.

---

## 3. RELEASE STATUS DATA MODEL

Prefer loading `reports/release_status.json`.

Suggested structure:

```json
{
  "product": "SAT IntelliPrep OS",
  "release": "v1.0 RC",
  "commit": "abcdef1",
  "branch": "main",
  "productionUrl": "https://nmstudio-sat-intelliprep.vercel.app",
  "reviewedAt": "2026-10-04T23:00:00+07:00",
  "gates": {
    "regression": { "status": "PASS", "result": "27/27" },
    "runtime": { "status": "PASS", "result": "8/8" },
    "visual": { "status": "PASS", "result": "8 viewports" },
    "console": { "status": "PASS", "result": "0 page errors" },
    "accessibility": { "status": "PASS", "result": "keyboard modal flow verified" }
  }
}
```

If evidence is unavailable, show `NOT VERIFIED`. Never invent PASS states.

---

## 4. TOP RELEASE HEADER

Use a compact release header:

```text
SAT IntelliPrep — Release QA Portal
Internal Product Review

Build: v1.0 RC · main · abcdef1
Source: Production
Reviewed: 04 Oct 2026, 23:00

[Open Production] [Copy URL]
```

Include one calm status badge:
- READY FOR REVIEW
- PASS WITH NOTES
- BLOCKED

Derived from gate data, not hard-coded decoration.

---

## 5. RELEASE GATE SUMMARY

Add 5 compact status cards:
1. Regression
2. Runtime
3. Visual QA
4. Console
5. Accessibility

Each shows:
- PASS / FAIL / NOT VERIFIED
- evidence summary
- optional report link

Use semantic color, but never color alone.

---

## 6. PAGE NAVIGATION

Replace emoji labels with consistent Lucide-style inline SVG.

Pages:
- Landing
- Today
- Practice
- Review
- Mock Test
- Progress
- optional First-run / Setup

Recommended icons:
- Landing: Home
- Today: Sun
- Practice: BookOpenCheck
- Review: RotateCcw
- Mock: ClipboardCheck
- Progress: TrendingUp
- Setup: ScanSearch

Each button updates iframe route and a `Current screen` label.

---

## 7. VIEWPORT SWITCHER

Use the real QA matrix:

- 1920×1080
- 1440×900
- 1366×768
- 1180×820
- 1024×768
- 768×1024
- 390×844
- 360×800

Also include `Fit to panel`.

The iframe’s CSS viewport must remain the real selected dimensions; visual scaling is only for fitting the preview stage.

---

## 8. LIVE APP PREVIEW

Keep iframe as the primary review surface.

Add:
- neutral review stage
- current route badge
- current resolution badge
- Reload
- Open independently
- iframe title: `SAT IntelliPrep live release preview`

If Production cannot be embedded because of CSP / X-Frame-Options:
- do not count it as an app failure
- show a clean fallback panel
- provide Open in New Tab
- keep local `?app=` mode available

---

## 9. REMOVE DEV-ONLY TAILWIND RUNTIME

Do not ship the review portal using:

`https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js`

Preferred:
- one self-contained HTML file
- small embedded CSS
- semantic classes
- no build step

Acceptable:
- use an existing compiled local stylesheet

Do not add a frontend framework.

---

## 10. EXPERT REVIEW — SEPARATE EVIDENCE FROM OPINION

Keep two expert perspectives, but clearly label them as qualitative.

### A. Creative Director — UI/UX
Label:
`Expert qualitative assessment`

Recommended current score:
`8.7–8.9 / 10`

Show:
- Strengths
- Verified UX findings
- Remaining polish opportunities

### B. SAT / Assessment Specialist

Evaluate separately:
- Structural alignment
- Learning architecture
- Error intelligence
- Score integrity
- Content scale
- Psychometric maturity

Do not present expert scores as automated metrics.

---

## 11. CORRECT OVERCLAIMS

Replace:
`100% Bluebook equivalent`

with:
`closer interaction parity with the Digital SAT testing experience`

Do not claim `WCAG AAA` unless measured.

Use:
`high-contrast reading-oriented palette`
or
`contrast verified at target level`

When discussing scoring, use:

`aligned to the current Digital SAT structure and multistage testing flow; score bands are independent readiness estimates.`

Never imply College Board certification or official scoring.

---

## 12. QUESTION BANK INVENTORY — DO NOT HARD-CODE 185

Replace a single hard-coded number with reproducible inventory:

```text
Unique authored items: xxx
Diagnostic pool: xx
Approved bank items: xxx
Mock placements: xxx
Full mock forms: x
```

Generate these from repository data if practical.

Optional generator:
`scripts/generate_release_status.js`

Output:
`reports/release_status.json`

Never show a count that cannot be reproduced from source.

---

## 13. OPEN ISSUES / NEXT RELEASE

Add one compact table.

### V1.1 Exam Interaction
- Cross-out answer choices
- Passage highlighter
- Resume interrupted mock
- Keyboard parity

### V1.2 Content Scale
- expand unique authored items
- more Quantitative Evidence RW questions
- more charts / tables
- more adaptive mock forms

### V1.3 Calibration
- item difficulty
- distractor efficiency
- response-time analysis
- discrimination proxy
- route performance

Columns:
- Priority
- Status
- Owner
- Target release

Do not build a large project-management system.

---

## 14. BUILD IDENTITY

Show:
- Commit
- Branch
- Release
- Production URL
- Last reviewed

Populate automatically when available. Never fabricate values.

---

## 15. ACCESSIBILITY OF THE REVIEW PORTAL

Requirements:
- semantic buttons
- visible focus
- no emoji-only controls
- title/aria-label on icon buttons
- iframe title
- correct heading order
- status not color-only
- practical 44px touch targets on mobile
- respect `prefers-reduced-motion`

---

## 16. RESPONSIVE PORTAL

The portal itself must work at:
- 1440 desktop
- 1024 tablet
- 390 mobile

On mobile:
- release gate cards stack or horizontally scroll
- page tabs become horizontal scroll chips
- expert cards become one column
- no page-level horizontal overflow
- large simulated viewports use a scaled preview shell

---

## 17. VISUAL SYSTEM

Use SAT IntelliPrep visual DNA:
- cool off-white canvas
- white surfaces
- restrained Indigo
- slate/navy ink
- subtle borders
- 16–20px card radius
- restrained shadows
- Inter for UI
- optional Lora only for portal title

Avoid:
- oversized photography
- decorative imagery
- saturated pastel blocks
- glassmorphism
- excessive gradients
- fake analytics

---

## 18. TARGET LAYOUT

```text
┌─────────────────────────────────────────────────────────┐
│ SAT IntelliPrep — Release QA Portal                    │
│ Build · Commit · Source · Reviewed                     │
│                             [Open App] [Copy URL]       │
├─────────────────────────────────────────────────────────┤
│ Regression │ Runtime │ Visual │ Console │ Accessibility│
├─────────────────────────────────────────────────────────┤
│ Screen: Landing Today Practice Review Mock Progress    │
│ Viewport: 1920 1440 1366 1180 1024 768 390 360        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                  LIVE APP PREVIEW                       │
│                                                         │
├─────────────────────────────────────────────────────────┤
│ Creative Director Review │ SAT Specialist Review       │
├─────────────────────────────────────────────────────────┤
│ Content Inventory                                       │
├─────────────────────────────────────────────────────────┤
│ Open Issues / V1.1 / V1.2 / V1.3                      │
└─────────────────────────────────────────────────────────┘
```

---

## 19. DO NOT MODIFY THE CORE APP TO MATCH THE REPORT

The portal reports what the product actually does.

Never:
- alter app behavior merely to make a review statement true
- hide failed tests with copy changes
- display PASS when a test was not run
- invent score, question count, commit, or accessibility evidence

If evidence is unavailable:
`NOT VERIFIED`

---

## 20. ACCEPTANCE GATE

Before completion verify:

- no hard-coded localhost except documented query example
- configurable APP_URL works
- production URL opens correctly
- local `?app=` override works
- all 6 core routes work
- all 8 viewport presets work
- iframe title exists
- iframe-blocked fallback works
- no dev Tailwind runtime dependency
- no functional emoji
- expert scores labeled qualitative
- no `100% Bluebook` claim
- no unverified `WCAG AAA` claim
- no hard-coded `185` question count
- PASS states derive from data/config
- mobile portal has no horizontal page overflow
- keyboard navigation works
- console has no errors

---

## 21. DELIVERABLES

Produce:

1. Updated:
   `sat_interactive_review.html`

2. If useful:
   `reports/release_status.json`

3. Optional:
   `scripts/generate_release_status.js`

4. Brief report:
   `reports/SAT_IntelliPrep_Release_QA_Portal_v2.md`

The report should state:
- what changed
- what data is dynamic
- what remains manual
- desktop + mobile screenshots
- known limitations

---

## FINAL INSTRUCTION

Do not overengineer this portal.

It should remain:
- fast
- self-contained
- easy to open
- easy to send internally
- clear enough that the product owner can inspect the latest SAT IntelliPrep release without reading source code

The main success criterion is:

**The portal clearly distinguishes live product evidence, automated test evidence, and expert qualitative judgment.**
