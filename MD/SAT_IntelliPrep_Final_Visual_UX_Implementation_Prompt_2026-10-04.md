# SAT IntelliPrep — FINAL VISUAL / UX IMPLEMENTATION PROMPT

**Version:** Final Visual Release Candidate Gate  
**Date:** 2026-10-04  
**Target:** SAT IntelliPrep OS (2026)  
**Mode:** Final visual polish + UX correction only  
**Primary objective:** đưa sản phẩm từ “đã đủ chức năng” sang **production-grade Calm Academic Intelligence**, không làm thay đổi SAT engine, scoring, question bank, SRS logic hoặc dữ liệu học tập.

---

# 0. ROLE

Act as a **Senior Product Designer + Senior Frontend UI Engineer + Visual QA Lead**.

You are working on an existing Vanilla HTML/CSS/JS SAT preparation web app.  
Do **not** redesign from zero.  
Do **not** add unrelated features.  
Do **not** rewrite the assessment engine.

Your task is to perform the **FINAL VISUAL / UX PASS** based on:

1. the current `index.html`,
2. the current `css/style.css`,
3. the current `js/app.js`,
4. the already-integrated WebP asset system in `assets/visual/`,
5. the supplied current screenshots,
6. the approved UI/UX redesign specification,
7. the existing 27/27 technical Acceptance Gate.

The current screenshots show that the product is functionally rich but still has several visible polish and interaction problems. Fix them before declaring visual release candidate.

---

# 1. NON-NEGOTIABLE GUARDRAILS

## Preserve
- Digital SAT adaptive engine.
- 98-question / 134-minute full simulation.
- Module routing.
- Diagnostic flow/data.
- Score-band logic.
- Question-bank IDs and answer keys.
- Error Intelligence.
- SRS data model.
- Existing localStorage/user data migration.
- Export functions.
- Desmos behavior.
- Existing optimized WebP files and canonical asset paths.
- All 27 Acceptance Gate tests.

## Do not
- change question content,
- change scoring logic,
- change route thresholds,
- reintroduce “Official” claims,
- reintroduce fake AI claims,
- reintroduce FSRS branding unless a real FSRS implementation exists,
- add decorative photography inside the active timed exam flow,
- add heavy dependencies/frameworks,
- replace Vanilla HTML/CSS/JS,
- create new raster icons,
- use emoji as production UI icons.

---

# 2. FINAL DESIGN TARGET

The final product must feel:

**Calm · Academic · Premium · Human · Intelligent · Focused · Trustworthy**

Use the mood of the approved education reference:
- bright canvas,
- generous whitespace,
- strong hierarchy,
- sophisticated rounded cards,
- editorial typography,
- soft pastel accents,
- restrained photography,
- premium education-product composition.

However:

> SAT IntelliPrep is a learning operating system, not a course marketplace.

The product must always prioritize:
**next learning action > data > imagery > decoration.**

---

# 3. P0 — FIX THE FIRST-RUN / SETUP EXPERIENCE

This is the highest-priority visible issue.

## Current visual problem
The setup UI currently renders as a narrow block attached to the top-left of the document, while the rest of the viewport becomes a large empty field and the app header appears below it.

This is unacceptable for production.

## Required first-run behavior

### New user
1. Load the **Landing page** first.
2. Do **not** automatically inject the setup panel into normal document flow.
3. Clicking:
   - `Bắt Đầu Bài Chẩn Đoán`
   - `Vào Bàn Học Hôm Nay`
   - or any protected app destination without a profile  
   opens the setup experience as a real modal.

### Returning user
- Route directly to `#today`.
- Never show setup again unless user explicitly resets profile/progress.

### Deep-link without profile
If a new user opens `#practice`, `#review`, `#test`, or `#progress`:
- retain intended destination,
- open setup modal,
- after successful setup, continue to that destination or diagnostic depending on selected onboarding option.

## Setup modal layout — desktop

Use a centered full-screen overlay:

```text
viewport
┌────────────────────────────────────────────────────────┐
│ translucent calm backdrop / subtle blur               │
│                                                        │
│   ┌───────────────────────────────────────────────┐    │
│   │ visual / brand       │ profile setup form     │    │
│   │ 38–42%               │ 58–62%                 │    │
│   │ diagnostic image     │ target / grade / level │    │
│   │ short reassurance    │ diagnostic option      │    │
│   │                      │ PRIMARY CTA             │    │
│   └───────────────────────────────────────────────┘    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

Recommended:
- overlay: `position: fixed; inset: 0; z-index: 10000`
- backdrop: rgba / blur, not flat blank gray
- card max-width: **880–960px**
- card max-height: `calc(100vh - 64px)`
- card radius: **24px**
- visual pane: use `assets/visual/editorial/diagnostic-start.webp`
- form pane: white
- do not use inline styles for core layout
- body scroll locked while modal is open

### Mobile
- single-column modal
- visual reduced to a compact 160–200px header image or hidden if viewport height is short
- form fields full width
- CTA sticky only if necessary
- no horizontal overflow

## Modal interaction requirements
- focus trap
- visible focus ring
- ESC closes only when setup is optional
- `aria-labelledby`
- proper label/input linkage
- restore focus to trigger on close
- no content behind modal should be keyboard-interactive

---

# 4. P0 — FIX HEADER / APP SHELL COMPOSITION

## Visible problems
The desktop header is visually crowded:
- brand lockup wraps awkwardly,
- navigation competes with utility controls,
- `Mock Test` wraps,
- utility pills consume too much horizontal space,
- the header feels like a dense toolbar instead of a premium learning product.

## Required desktop structure

Use a single aligned shell:

```text
[Logo + SAT IntelliPrep]   [Today Practice Review Mock Progress]   [Utilities]
```

### Brand
Desktop:
- logo: 38–42px
- title: one line `SAT IntelliPrep`
- secondary `N&Mstudio Education` may sit below at 11–12px
- never allow brand to break into 3–4 lines
- brand column target: 150–180px

### Core pill
`Digital SAT 2026 Core`
- visually secondary
- compact
- do not let it compete with navigation
- may move into utility area on narrower desktop

### Primary nav
- no wrapping
- consistent 40–44px interaction height
- icon 16–18px
- active item uses soft indigo background
- use Lucide-style line icons only
- `Mock Test` must remain one visual unit

### Utilities
Do not expose every utility as a large pill at all widths.

At wide desktop:
- Method
- language
- academic contact

At <= 1180px:
- collapse Method + language + contact into one compact `More` / profile utility control or icon menu
- preserve the five learning destinations

### Mobile
At <= 768px:
- top header = brand + compact utility/menu
- use a fixed or sticky **5-item bottom navigation** for Today / Practice / Review / Mock / Progress
- labels remain readable
- no horizontal header squeeze

---

# 5. P0 — REMOVE EMOJI AS FUNCTIONAL ICONOGRAPHY

The visual system claims Lucide consistency, but production markup still contains many emoji-based UI cues.

Final pass must replace **functional emoji** with inline Lucide-style SVG icons.

Examples to replace:
- 💡 Method
- 🌐 Language
- 🎯 badges where used as a UI icon
- ▶ in CTA labels
- 📖 / 🏛️ / ✍️ / ⚖️ / 📐 / 📊 / 🔷 domain icons
- 🤖 Strategy Coach
- 📈 Desmos control
- 🚩 flag
- export-tool emojis
- parent/dashboard functional emoji
- feedback-section emoji where they function as icons

Allowed:
- emoji only inside user-generated/social-share copy if deliberately part of content, not as core interface iconography.

Recommended icon map:
- Today: `Sun`
- Practice: `BookOpenCheck`
- Review: `RotateCcw`
- Mock: `ClipboardCheck`
- Progress: `TrendingUp`
- Method: `Lightbulb`
- Language: `Languages`
- Diagnostic: `ScanSearch`
- Strategy Coach: `Sparkles` or `MessageCircleQuestion`
- Reading: `BookOpen`
- Craft & Structure: `Blocks`
- Expression: `PenLine`
- Conventions: `SpellCheck2`
- Algebra: `Variable`
- Advanced Math: `Sigma`
- PSDA: `ChartNoAxesCombined`
- Geometry: `Shapes`
- Timer: `Timer`
- Flag: `Flag`
- Desmos: `ChartSpline`
- Parent: `Users`

Use one icon family and one stroke logic.

---

# 6. P1 — REFINE TODAY HERO

Keep the existing content and data binding, but improve visual balance.

## Desktop
Target:
- max-width aligned with global shell
- 60/40 or 65/35 split
- text max width around 650–720px
- cutout occupies **25–30%** of hero width
- cutout anchored to bottom-right
- hero min-height around **270–320px**
- no collision with text at 1280 / 1366 widths

## Typography
- greeting: Lora, responsive `clamp()`
- do not allow the greeting to become oversized simply because viewport is wide
- body / metadata use Inter
- target line length: 55–70 characters where applicable

## CTA
One visually dominant CTA:
`Bắt Đầu Kế Hoạch Hôm Nay`

Secondary CTA:
`Làm Bài Chẩn Đoán`

Do not make both buttons equally loud.

---

# 7. P1 — STATUS CARDS / INFORMATION DENSITY

The 4 status cards must:
- have equal height,
- use one semantic metric each,
- avoid oversized labels,
- avoid decorative icons larger than the data,
- support “no data” states honestly.

Suggested desktop:
- 4 columns
- card height 122–145px
- 16–20px internal padding
- metric first, note second

Tablet:
- 2 × 2

Mobile:
- 2 columns if readable, otherwise horizontal snap row or single column

---

# 8. P1 — STRATEGY BANNER REFINEMENT

The current full-width yellow banner is too visually dominant.

Keep the strategy content and editorial image, but soften it.

## Required direction
- use a cream/off-white surface with subtle warm-yellow accent
- avoid a large saturated yellow slab
- preserve:
  - strategy tag,
  - title,
  - one short explanation,
  - 120×80 editorial image,
  - secondary CTA
- title remains the strongest element
- CTA does not compete with Today’s main action

Recommended large-surface pastel tint:
- use 20–35% pastel mix with white rather than the full base pastel

---

# 9. P1 — REBUILD “THE LEARNING LOOP” VISUAL HIERARCHY

Current screenshot shows weak header composition and cramped five-column cards.

## Final component

### Header
Single coherent row:

```text
[eyebrow + title + one-line explanation]             [Learn more]
```

The button must not fall awkwardly under the title on desktop.

### Step cards
Wide desktop >= 1200:
- 5 equal cards
- 16–20px gap
- height ~190–220px
- number is subtle background typography
- 1 title
- 1 short 2–3 line explanation
- no paragraph-heavy copy

Tablet 768–1199:
- 3 + 2 grid

Mobile:
- vertical 5-step timeline/list
- no five-column squeeze

### Visual
- lighten pastel fills
- use 1px borders
- no heavy shadow
- optional subtle connector/arrow only when it improves sequence comprehension
- use consistent padding/radius

---

# 10. P1 — PRACTICE DOMAIN CARDS

The 8 domain images are approved, but must not turn Practice into an image catalogue.

## Card composition

```text
┌──────────────────────────────┐
│ image / visual 32–38% height │
├──────────────────────────────┤
│ line icon + section tag      │
│ Domain title                 │
│ 1-line description           │
│ mastery / progress           │
│ Practice →                   │
└──────────────────────────────┘
```

### Rules
- image area maximum: **32–38%** of total card height
- `object-fit: cover`
- consistent aspect ratio for all 8 images
- do not stretch images
- title / mastery / CTA remain more important than image
- replace current emoji domain icons with Lucide-style SVG
- selected card needs a clear border/focus state, not only a color difference
- keyboard focus visible
- hover: 2–4px lift maximum, subtle shadow change

### Data
If real mastery data is available, show it.
If not available:
- show `Chưa đủ dữ liệu`
- do not create fake percentages.

---

# 11. P1 — PRACTICE QUESTION SHELL

The active question area is a high-focus surface.

## Remove visual noise
- no decorative photography
- no unnecessary gradients
- no floating decorative cards

## Keep
- 65–75 character reading width
- 17–18px text
- line-height 1.65–1.75
- A/B/C/D keyboard shortcuts
- clear answer state
- clear submit action

## Fix naming inconsistency
The visible button must say:
`Cần gợi ý? Hỏi Strategy Coach`

Do not display `AI Coach` anywhere unless a real generative model integration exists.

Internal legacy function names may remain if changing them risks regression.

---

# 12. P1 — REVIEW / PROGRESS / MOCK CONSISTENCY

## Review
- soften coral hero surface
- avoid full-saturation large blocks
- “due review” remains primary action
- export tools move visually lower in hierarchy

## Progress
- charts/data dominate
- no decorative photography
- keep Lora only for major headings/score ranges
- avoid emojis in metric labels
- preserve honest “no data” behavior

## Mock
Entry card may use `mock-test.webp`.

Once exam starts:
- no photography,
- no decorative illustrations,
- no Strategy Coach floating trigger,
- no site footer,
- no marketing navigation distraction,
- only exam-critical actions.

During timed exam, temporarily hide:
- global navigation if safe,
- floating Strategy Coach,
- marketing/footer content.

Restore after exit/submission.

---

# 13. P1 — STRATEGY COACH PRESENTATION

Current floating pill should be visually quieter.

## Rename consistently
Visible UI:
**SAT Strategy Coach**

Never:
**AI Coach**

## Trigger
- use Lucide `Sparkles` or `MessageCircleQuestion`
- compact pill on desktop
- icon-only + accessible label on narrow mobile if needed
- must not cover answer buttons, footer controls, or exam navigation

## Exam rule
Hide completely during active timed mock exam.

---

# 14. P1 — CONTENT / TRUST CONSISTENCY FIXES

Audit all visible strings before release.

## Phone / Zalo
Use one canonical contact format everywhere.

Recommended:
- local display: `0985 578 385`
- international display where needed: `+84 985 578 385`

Do not use malformed variants.

## SRS naming
Visible UI must consistently say:
`Spaced Repetition System (SRS)`

Do not display FSRS unless it is actually implemented.

Also remove stale FSRS references from:
- meta keywords,
- visible copy,
- comments only if they create developer confusion.

## “AI”
Remove user-facing fake AI terminology where no model is actually running.

---

# 15. P2 — TYPOGRAPHY SYSTEM CLEANUP

## Lora
Use only for:
- H1/H2 editorial headings,
- readiness ranges,
- hero statements,
- large feature titles.

## Inter
Use for:
- navigation,
- buttons,
- forms,
- passages,
- questions,
- metadata,
- metrics,
- tables,
- cards.

## Vietnamese support
Be Vietnam Pro may be used selectively if specific Vietnamese glyph rendering needs it, but do not create random font switching within the same hierarchy.

## Responsive type
Use `clamp()` for large titles.

Avoid:
- 32px+ headings wrapping to awkward 2-line blocks on laptop widths,
- serif font on dense body/UI text.

---

# 16. P2 — GLOBAL SPACING / WIDTH SYSTEM

Create one consistent shell.

Recommended:

```css
--shell-max: 1240px;
--shell-gutter-desktop: 32px;
--shell-gutter-tablet: 24px;
--shell-gutter-mobile: 16px;
```

At very wide screens:
- do not let content float in a narrow 1050px column with excessive side void
- keep content around 1180–1240px

Section rhythm:
- major section gap: 56–72px
- card group gap: 20–24px
- card padding: 20–28px

Do not overuse 32px+ padding on small cards.

---

# 17. P2 — FOOTER

Make footer quieter and more intentional.

- max-width aligned with content shell
- 11–12px legal text
- use 2 short paragraphs maximum
- remove unnecessary large blank vertical area before footer
- preserve non-affiliation disclaimer
- fix phone number consistency
- footer hidden during active exam mode

---

# 18. CSS / MARKUP CLEANUP

Do a visual-code hygiene pass.

## Required
- move important layout styles out of inline `style=""` attributes into semantic CSS classes
- keep dynamic inline styles only where truly necessary
- remove duplicate one-off spacing rules
- ensure cards use shared tokens/classes
- fix invalid inline CSS
- preserve IDs required by JS

Do not rename DOM IDs that `app.js` depends on unless every reference is updated and tested.

---

# 19. RESPONSIVE ACCEPTANCE MATRIX

The redesign is not accepted until manually verified at:

| Viewport | Must verify |
|---|---|
| 1920×1080 | centered shell, no excessive void, hero balance |
| 1440×900 | primary desktop target |
| 1366×768 | no header wrapping, hero remains usable |
| 1180×820 | utility collapse works |
| 1024×768 | tablet hierarchy / 2×2 cards |
| 768×1024 | compact navigation behavior |
| 390×844 | mobile onboarding + bottom nav + cards |
| 360×800 | no horizontal overflow |

Also test browser zoom:
- 100%
- 125%
- 200% for core task surfaces where practical

---

# 20. ACCESSIBILITY CONTRACT

Minimum final checks:
- keyboard navigation across all primary controls
- visible focus state
- no focus behind modal
- modal focus trap
- correct `aria-labelledby`
- descriptive `alt` or empty `alt` for decorative images
- sufficient contrast
- 44×44px touch target where appropriate
- not color-only states
- `prefers-reduced-motion` respected
- no hover-only essential information

---

# 21. FINAL VISUAL QA — DO NOT SKIP

After implementation, **do not stop after code compiles or automated tests pass**.

Open the actual app and visually inspect it.

## Required workflow

```text
IMPLEMENT
↓
RUN 27/27 ACCEPTANCE GATE
↓
OPEN APP
↓
CAPTURE REQUIRED VIEWPORTS
↓
VISUAL REVIEW
↓
FIX
↓
RE-CAPTURE
↓
FINAL REPORT
```

## Visual QA checklist

### First run
- [ ] landing appears first for new user
- [ ] setup opens centered as overlay, never as document-flow block
- [ ] no giant blank viewport around setup
- [ ] setup works on 390px mobile

### Header
- [ ] brand does not wrap awkwardly
- [ ] Mock Test does not split
- [ ] nav remains primary
- [ ] utilities collapse before core nav is damaged

### Today
- [ ] hero cutout does not cover text
- [ ] primary CTA visually obvious
- [ ] status cards balanced
- [ ] strategy banner not overly saturated
- [ ] learning loop reads as one component

### Practice
- [ ] 8 images feel like supporting thumbnails, not posters
- [ ] domain cards remain learning-first
- [ ] all emoji functional icons removed
- [ ] selected/focus states obvious

### Review / Progress
- [ ] data hierarchy stronger than decoration
- [ ] no fake precision
- [ ] no large saturated color slabs

### Mock
- [ ] entry image only
- [ ] no decorative media during timed exam
- [ ] Strategy Coach hidden during exam
- [ ] footer/nav do not distract from exam

### Mobile
- [ ] no horizontal scroll
- [ ] 5 primary destinations accessible
- [ ] cards reflow intentionally
- [ ] actions remain thumb-friendly

---

# 22. AUTOMATED / REGRESSION REQUIREMENTS

Run existing:

```bash
node scripts/verify_acceptance_gate.js
```

Must remain:

**27/27 PASS**

Then add lightweight visual/DOM regression checks where practical for:
- setup modal class/overlay behavior
- no visible “AI Coach”
- no visible “FSRS”
- no functional emoji domain icons
- image paths valid
- no broken asset requests
- no duplicate IDs
- no horizontal overflow at key widths if browser tooling is available

---

# 23. REQUIRED OUTPUTS

At completion produce:

## A. Code changes
- `index.html`
- `css/style.css`
- `js/app.js` only where routing/modal/exam-view state requires it

## B. Visual QA evidence
Create:
`MD/SAT_IntelliPrep_FINAL_VISUAL_QA_2026-10-04.md`

Include:
- issues fixed,
- desktop/mobile screenshots,
- viewport used,
- any intentionally retained deviations,
- confirmation of 27/27 Acceptance Gate,
- confirmation that core SAT logic was not changed.

## C. Final status table

```text
P0 first-run/setup             PASS
P0 header/app shell            PASS
P0 icon consistency            PASS
P1 Today hierarchy             PASS
P1 Practice cards              PASS
P1 Strategy / Learning Loop    PASS
P1 Mock focus mode             PASS
P1 Review / Progress           PASS
P1 responsive behavior         PASS
P1 accessibility essentials    PASS
Regression gate 27/27          PASS
```

If any item fails, do not label the release “final”.

---

# 24. SPECIFIC CURRENT-MARKUP ISSUES TO VERIFY

Check current implementation for these known risks:

1. `#setup-modal` currently lacks a production-grade overlay/backdrop class and must never participate in normal page flow.
2. Header utility controls still use emoji and consume too much horizontal width.
3. Domain cards still contain emoji icon spans.
4. Practice question shell still exposes an `AI Coach` user-facing label.
5. Strategy Coach trigger still uses a robot emoji.
6. Some export / parent / test controls still use emoji instead of the approved icon system.
7. Visible SRS naming must be consistent with the actual simple SRS implementation.
8. Contact number must be consistent across header, footer and share card.
9. Fix malformed inline CSS declarations.
10. Verify the large Learning Loop component at 1366×768 and 1440×900; current visual hierarchy is not yet production quality.

---

# 25. FINAL DEFINITION OF DONE

The release is complete only when:

> A new student can open SAT IntelliPrep, understand what the product is, enter onboarding without seeing a broken modal, complete setup, arrive at Today, understand the single next learning action, navigate all five core areas without header crowding, and use Practice/Review/Mock/Progress across desktop and mobile with a consistent premium academic interface.

The final experience must visually communicate:

**“A serious, modern SAT learning system”**

—not:

**“a prototype with many features.”**

Do not declare completion based only on automated tests.  
The final gate is **real browser visual inspection + responsive screenshots + regression pass**.
