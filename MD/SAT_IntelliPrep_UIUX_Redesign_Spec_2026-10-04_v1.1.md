# SAT IntelliPrep — UI/UX Redesign Master Specification

**Version:** 1.1  
**Date:** 2026-10-04  
**Target product:** SAT IntelliPrep  
**Production:** https://nmstudio-sat-intelliprep.vercel.app/  
**Repository:** https://github.com/nghiavu2011/nmstudio-sat-intelliprep  
**Purpose:** Redesign the visual experience and interaction model after the technical/assessment audit remediation, without breaking the SAT engine or learning logic.

---

# 0. Executive Direction

The product logic has been significantly strengthened after the technical audit. The next phase is **not another functional expansion**. The next phase is a **complete UI/UX elevation** so SAT IntelliPrep feels like a premium, trustworthy, student-centered SAT preparation product rather than a functional prototype.

The redesign should take visual inspiration from the supplied education reference image:

- bright and airy canvas
- strong editorial hero area
- generous whitespace
- sophisticated rounded cards
- soft pastel surfaces
- elegant typography pairing
- premium education-product feel
- high visual hierarchy
- human and optimistic tone

**Important:** The reference image is a **mood/style reference only**. Do not copy its layout literally, and do not make SAT IntelliPrep look like a real-estate listing, course marketplace, or generic school website.

The SAT product must remain **learning-centered**.

> Primary design question: **“What should the student do next, and why?”**

---

# 1. Product Positioning

## 1.1 Product promise

SAT IntelliPrep should feel like a **personal SAT learning system** that continuously helps the student:

1. understand current readiness,
2. identify the highest-value next task,
3. practice efficiently,
4. review mistakes intelligently,
5. prepare for the adaptive Digital SAT,
6. see real progress without fake precision.

## 1.2 Core loop

```text
DIAGNOSE
   ↓
PLAN TODAY
   ↓
PRACTICE
   ↓
FEEDBACK
   ↓
ERROR INTELLIGENCE
   ↓
SPACED REVIEW
   ↓
MOCK TEST
   ↓
PROGRESS / READINESS
   ↺
```

Every main screen should reinforce this loop.

## 1.3 Target users

### Primary
- High school students preparing for the Digital SAT.
- Students may be studying independently or with parent oversight.
- Students may be Vietnamese speakers but should gradually work in English-first SAT environments.

### Secondary
- Parents reviewing progress and consistency.
- Tutors/mentors using the student’s performance information.

---

# 2. Design Principles

## 2.1 Visual keywords

**Calm · Premium · Academic · Youthful · Intelligent · Human · Trustworthy**

## 2.2 Product principles

### P1 — One obvious next action
Every screen should clearly answer: **What is the primary action here?**

### P2 — Learning hierarchy before decoration
Typography, spacing, grouping, and sequencing should carry most of the hierarchy. Color is secondary.

### P3 — Fewer, larger, more meaningful cards
Do not create a dense grid of tiny dashboards. Use larger cards that communicate one meaningful thing well.

### P4 — Data must feel trustworthy
Never display fake values, placeholder percentages, or ungrounded precision. Empty states should say that data is not yet available.

### P5 — Progress should motivate, not gamify excessively
Use progress, momentum, streaks, and readiness carefully. Avoid coins, badges, fireworks, mascots, or game mechanics that reduce academic credibility.

### P6 — The app should feel premium but not luxury-for-luxury’s-sake
Avoid excessive glassmorphism, gradients, drop shadows, neon accents, or decorative motion.

### P7 — English-first SAT environment
English should dominate the test/practice surfaces. Vietnamese assistance can appear contextually where useful, especially in onboarding and strategy explanations.

---

# 3. Information Architecture

Keep the core navigation compact.

## 3.1 Main navigation

```text
Today
Practice
Review
Mock Test
Progress
Resources
```

Right side:

```text
Search / Command
Notifications (optional)
Profile / Settings
```

### Navigation rule
Do not promote every feature into a top-level navigation item.

Diagnostic, flashcards, vocabulary, strategy coach, formulas, and similar capabilities should appear **inside the relevant learning flow**.

---

# 4. Global Layout System

## 4.1 Desktop frame

- Maximum content width: **1280–1360 px**
- Main app content width target: **1200–1280 px**
- Outer page padding: **32–48 px**
- Main section spacing: **56–80 px**
- Card gaps: **16–24 px**

## 4.2 Tablet

- Page padding: **24 px**
- Two-column card grids become one or two columns depending on content priority.
- Navigation may collapse secondary items into a menu.

## 4.3 Mobile

- Page padding: **16 px**
- All primary learning flows must work in a single column.
- Horizontal chip rows may scroll.
- Persistent actions should move into a bottom sticky action area only when useful.
- Do not simply shrink desktop cards.

---

# 5. Visual Design System

## 5.1 Color direction

Use semantic roles rather than isolated colors.

### Core surfaces

```text
Canvas / page:        #F5F7FB to #F7F8FC
Primary surface:     #FFFFFF
Raised surface:      #FFFFFF
Soft neutral:        #EEF2F7
Border:              #DDE3EC
Text primary:        #18212F
Text secondary:      #667085
Text tertiary:       #98A2B3
```

### Primary brand

```text
Primary / Indigo:    #4E66E8
Primary hover:       #4056CF
Primary soft:        #E9EDFF
```

### Academic pastel accents

```text
Blue soft:           #DDE8F8
Green soft:          #DDE9DF
Sage soft:           #CEDDBB
Warm yellow:         #FFE0A0
Coral soft:          #F3A09E
Lilac soft:          #E7E0F7
```

### Semantic

```text
Success:             #2D8A57
Warning:             #B7791F
Danger:              #C44949
Info:                #4E66E8
```

### Color rule
Pastels should be used as **section/card identity**, not as meaning by themselves. All important states need text/icon support.

## 5.2 Typography

### Display / editorial headings
Choose one:
- Cormorant Garamond
- Lora
- Playfair Display

Recommended: **Lora** for better readability and less fashion-oriented appearance.

### UI / body
Choose one:
- Inter
- Manrope
- Be Vietnam Pro

Recommended: **Inter** for UI consistency; use **Be Vietnam Pro** where Vietnamese-heavy support content appears.

### Type scale

```text
Hero display: 52–64 / 1.05
H1:           40–48 / 1.1
H2:           30–36 / 1.15
H3:           22–26 / 1.2
Body large:   18 / 1.55
Body:         16 / 1.55
Body small:   14 / 1.45
Caption:      12–13 / 1.4
Data large:   28–36 / 1.1
```

### Typography rule
Use serif only for large editorial headings and occasional section titles. Keep test content, answers, data, labels, buttons, chips, and dense UI in sans-serif.

## 5.3 Radius

```text
Hero container: 28–32 px
Large cards:    24 px
Regular cards:  18–20 px
Controls:       12–14 px
Pills/chips:    999 px
```

## 5.4 Shadows

Very subtle only.

```text
Card shadow:
0 6px 24px rgba(24, 33, 47, 0.06)

Hover shadow:
0 12px 32px rgba(24, 33, 47, 0.10)
```

Avoid heavy elevation stacks.

## 5.5 Icons

- Use one consistent line-icon family.
- Stroke width should feel refined, not cartoonish.
- Use icons as supporting cues, not decoration.
- Avoid emoji in production UI.

---

# 6. Global Components

## 6.1 Top navigation

### Desktop
- White or near-white background.
- Height: 72–80 px.
- Logo left.
- Main navigation centered/left-center.
- Profile controls right.
- Active state should be subtle: text + small underline/pill, not a heavy tab.

### Mobile
- Compact top bar.
- Bottom navigation may be used for: Today / Practice / Review / Mock / Progress.

## 6.2 Primary button

- Strong indigo fill.
- Height: 48–52 px.
- Radius: 14 px or pill depending on context.
- Clear active/hover/focus states.

## 6.3 Secondary button

- Soft-neutral or white surface.
- 1 px border.
- No competing visual weight with primary CTA.

## 6.4 Filter chips

Use for:
- section
- domain
- difficulty
- weak skills
- due now
- timed
- recently missed

Chips should be compact but not tiny. Support horizontal scrolling on mobile.

## 6.5 Practice card

Each practice card should show only information that helps the student decide:

- title
- section/domain
- short learning objective
- duration
- question count
- difficulty
- progress/mastery if available
- primary CTA

Avoid showing more than 6–7 pieces of metadata.

## 6.6 Progress / metric card

Use metric cards sparingly.

Recommended status cards:
- Readiness range
- Review due
- Weekly consistency
- Next mock

Cards should support small context labels, not just a large number.

## 6.7 Empty states

Never fabricate data.

Example:

> **No readiness estimate yet**  
> Complete the diagnostic or a full mock test to unlock a readiness range.

CTA: `Start diagnostic`

## 6.8 Modal

- Max width: 520–720 px depending on content.
- Strong title.
- Clear close action.
- Focus trap.
- `role="dialog"`, `aria-modal="true"`.
- Avoid multi-step logic inside tiny modals if a full page is more appropriate.

---

# 7. Screen Specification — TODAY

## 7.1 Purpose

The Today page should answer one question immediately:

> **What should I do now?**

This is the most important product screen.

## 7.2 Recommended structure

### A. Personalized hero

Desktop: wide card, approximately 2/3 to 3/4 viewport content width.

Content example:

```text
Good evening, Minh.
Your highest-value focus today is Advanced Math + Inference.

54 min planned · 12 reviews due · Target 1450

[Start today’s plan]    [Adjust plan]
```

Optional visual:
- high-quality student image,
- tasteful abstract academic illustration,
- or a clean color/image hybrid.

Do not let the visual overpower the learning action.

### B. Quick status row

4 compact cards:

1. **Estimated readiness**
   - `1380–1450`
   - `Medium confidence`

2. **Review due**
   - `12 items`

3. **Weekly consistency**
   - `5 of 7 days`

4. **Next mock**
   - `Saturday · 08:00`

If no data exists, show meaningful empty states.

### C. Today’s plan — PRIMARY BLOCK

This must visually dominate the page below the hero.

Example:

```text
TODAY’S PLAN                                     54 min

01  Review 8 mistakes                           12 min
02  Advanced Math · Quadratics                  16 min
03  Vocabulary retrieval                       10 min
04  Timed RW · Inferences                      16 min

[Start session]
```

Support:
- completion states,
- resume state,
- skipped state,
- optional reorder only if product logic supports it.

### D. Recommended practice

2–4 cards only. Recommendation logic should be visible through small reason labels:

```text
Recommended because: repeated sign errors
Recommended because: mastery below 60%
Recommended because: due for retrieval
```

### E. Review due

Small horizontal list or 2-column card block.

### F. Progress snapshot

Show no more than:
- RW readiness
- Math readiness
- strongest domain
- focus domain

CTA: `View full progress`

### G. Strategy tip

Small editorial card, not a chatbot window.

Example:

> **SAT Strategy — Inference**  
> The correct answer must be supported by the text, not merely plausible in real life.

CTA: `See example`

---

# 8. Screen Specification — PRACTICE

## 8.1 Purpose

Let students quickly find the right practice without feeling overwhelmed.

## 8.2 Structure

### A. Page header

```text
Practice
Build the exact SAT skill you need next.
```

Right side:
`Create focused session`

### B. Filter bar

Primary filters:

```text
All
Reading & Writing
Math
Weak skills
Due today
Timed
```

Secondary filter drawer:
- domain
- subskill
- difficulty
- duration
- question count

### C. Recommended row

One large recommended practice card + 2 smaller alternates.

### D. Domain sections

#### Reading & Writing
- Information & Ideas
- Craft & Structure
- Expression of Ideas
- Standard English Conventions

#### Math
- Algebra
- Advanced Math
- Problem-Solving and Data Analysis
- Geometry and Trigonometry

Cards can use different soft pastel surfaces while keeping content layout consistent.

## 8.3 Practice card states

- not started
- in progress
- completed
- recommended
- needs review
- mastered

Do not use color alone for these states.

---

# 9. Screen Specification — REVIEW / MISTAKES

## 9.1 Purpose

This page should make error correction feel like the highest-value study activity, not punishment.

## 9.2 Hero status

```text
Review what matters most.
12 items due · 3 repeated traps detected

[Review due now]
```

## 9.3 Error intelligence summary

Show top recurring patterns, for example:

```text
1. Sign error after rearranging equations      5 occurrences
2. Extreme-answer distractor                   4 occurrences
3. Inference exceeds text evidence             3 occurrences
```

Each row should open the related mistakes.

## 9.4 Review queue

Each mistake item should show:
- original skill/domain
- short stem preview
- chosen answer
- correct answer
- error classification
- date
- SRS due state

Primary CTA:
`Review` / `Try again`

## 9.5 Review session UI

When inside a review session:

```text
Question
Your previous answer
Try again
→ feedback
→ why the distractor was attractive
→ correct reasoning
→ similar micro-question
→ SRS rating
```

SRS controls:

```text
Again · 10m
Hard · 1d
Good · 3d
Easy · 7d
```

Keep rating labels and actual scheduling logic aligned.

---

# 10. Screen Specification — MOCK TEST

## 10.1 Purpose

Make mock testing feel credible, structured, and close to the Digital SAT experience.

## 10.2 Mock landing page

### Primary card

```text
Full Digital SAT Simulation
98 questions · 134 minutes + 10-minute break
Adaptive two-stage routing

Recommended environment:
Quiet room · calculator ready · uninterrupted session

[Start full mock]
```

### Secondary cards

- Reading & Writing section test
- Math section test
- Short adaptive checkpoint

## 10.3 Pre-test readiness check

Before starting:

```text
□ 2 h 24 min available
□ Calculator ready
□ Quiet environment
□ Full-screen recommended
```

Primary CTA only enabled when user confirms readiness unless skip is intentionally allowed.

## 10.4 In-test UI

Use a much more restrained visual system than the dashboard.

Priorities:
- question number
- module name
- timer
- mark for review
- answer choices
- next/back
- Desmos access for Math

Minimize decorative graphics.

## 10.5 Adaptive transition

Do not reveal routing labels like “hard” or “standard” during the test if it can affect psychology.

Simply show:

```text
Module complete.
Your next module is ready.
```

## 10.6 Break screen

Calm full-screen break state.

```text
10:00
Break
Stand up, drink water, and reset for Math.

[Start Math early]
```

## 10.7 Results

Do not show false precision.

Recommended hierarchy:

```text
Estimated SAT Readiness
1420–1520
Medium confidence

Reading & Writing: 700–750
Math:              720–770
```

Then:
- domain performance
- timing
- repeated errors
- recommended next actions

Add independent-estimate disclaimer unobtrusively.

---

# 11. Screen Specification — PROGRESS

## 11.1 Purpose

Help the student understand trajectory and next priorities, not drown in charts.

## 11.2 Structure

### A. Readiness hero

```text
Current readiness
1380–1450
+60–90 points since baseline
```

Only show change when sufficient data exists.

### B. Section overview

Two large cards:
- Reading & Writing
- Math

Each card:
- range
- trend
- mastery summary
- top strength
- focus area

### C. Domain mastery

Use horizontal bars or simple segmented progress, not a radar chart by default.

Reading & Writing:
- Information & Ideas
- Craft & Structure
- Expression of Ideas
- Standard English Conventions

Math:
- Algebra
- Advanced Math
- Problem-Solving and Data Analysis
- Geometry and Trigonometry

### D. Momentum

Simple 7-day or 4-week study activity.

Do not overemphasize streaks.

### E. Error improvement

Example:

```text
Repeated sign errors
5 → 2 over the last 14 days
```

### F. Parent view

If a parent summary exists, use the same source data and clearly distinguish:
- measured study time
- active dates
- questions attempted
- actual accuracy
- readiness estimate confidence

---

# 12. Screen Specification — LANDING / MARKETING

## 12.1 Purpose

Build immediate emotional trust while explaining what makes the product different.

## 12.2 Hero

Reference mood: use the attached education image as inspiration for scale, warmth, composition, rounded image container, and editorial typography.

Recommended copy direction:

```text
Prepare smarter for the Digital SAT.

A personal study system that diagnoses weaknesses,
plans what to study next, and turns mistakes into progress.

[Start diagnostic]   [Explore how it works]
```

Visual:
- authentic high-school study scene,
- premium editorial photography or high-quality illustration,
- diverse but natural student representation,
- no clichéd stock-photo feeling.

## 12.3 How it works

5 steps:

```text
Diagnose → Practice → Review → Test → Improve
```

## 12.4 Featured learning paths

Large pastel cards:
- Reading & Writing
- Math
- Mistake Review
- Full Mock

## 12.5 Trust section

Use product capabilities rather than exaggerated claims:

- adaptive module routing
- error intelligence
- measured study activity
- honest readiness ranges
- SAT-specific taxonomy

## 12.6 Compliance footer

Retain the College Board non-affiliation disclaimer.

---

# 13. Interaction & Motion

## 13.1 Motion principles

- Duration: 150–250 ms for UI transitions.
- Use motion to clarify change, not decorate.
- Respect `prefers-reduced-motion`.

## 13.2 Recommended motion

- card hover lift: subtle
- progress change: small animated fill
- modal open: fade + slight scale
- navigation transitions: fade/slide less than 12 px

## 13.3 Avoid

- bouncing CTAs
- confetti
- excessive parallax
- animated gradient backgrounds
- prolonged page transitions

---

# 14. Accessibility Requirements

Target practical WCAG 2.2 AA behavior.

Required:
- keyboard navigation
- visible focus rings
- sufficient contrast
- 44 px minimum touch targets where practical
- no information conveyed by color alone
- semantic buttons/links
- form labels
- modal focus trap
- correct ARIA for dialogs
- reduced-motion support
- test questions readable at 200% zoom
- answer choices accessible to screen readers
- chart information available in text form

---

# 15. Responsive Rules

## Desktop ≥ 1200 px
- full top navigation
- 12-column grid
- 2–4 card columns depending on content
- hero can use text + visual split

## Tablet 768–1199 px
- 8-column grid
- hero stacks or shifts to 60/40
- metric row becomes 2×2
- practice cards: 2 columns

## Mobile < 768 px
- single-column learning flow
- simplify hero visual
- horizontal filter chips
- bottom navigation allowed
- today plan rows become vertically stacked
- charts collapse into readable lists/bars
- in-test view prioritizes question content over navigation chrome

---

# 16. Content & Tone

## 16.1 Tone

- confident
- clear
- academically credible
- encouraging without exaggeration
- concise

## 16.2 Avoid

- “Crush the SAT!”
- “Guaranteed +200 points”
- fake AI language
- exaggerated score certainty
- excessive motivational slogans

## 16.3 Preferred

- “Your next highest-value skill”
- “Estimated readiness”
- “Based on your recent work”
- “Review due today”
- “Recommended because…”

---

# 17. Design Acceptance Gate

The redesign is accepted only when all items below pass.

## 17.1 Global

- [ ] Visual style clearly feels more premium than the current prototype.
- [ ] The attached reference image is reflected in mood, spacing, card quality, typography, and hierarchy without being copied literally.
- [ ] The product still feels like a SAT learning application, not a marketplace or generic LMS.
- [ ] One primary CTA is visually dominant per decision context.
- [ ] No dense “dashboard of equal cards.”
- [ ] No fake metrics or placeholder statistics are introduced.
- [ ] Current SAT logic and P0 audit fixes remain intact.

## 17.2 Today

- [ ] Student understands what to do next within 5 seconds.
- [ ] Today’s Plan is the main learning block.
- [ ] Empty diagnostic/readiness states are handled honestly.

## 17.3 Practice

- [ ] Students can reach a relevant practice set within 2–3 interactions.
- [ ] Filters remain manageable on mobile.
- [ ] Domain taxonomy matches the canonical SAT taxonomy.

## 17.4 Review

- [ ] Due review is obvious.
- [ ] Error types are visible and actionable.
- [ ] SRS controls match actual schedule behavior.

## 17.5 Mock

- [ ] Full mock clearly states 98 questions / 134 minutes + break.
- [ ] In-test UI is visually restrained.
- [ ] Adaptive routing is not exposed in a way that biases the student.
- [ ] Results display ranges/confidence, not fake exact SAT scoring.

## 17.6 Progress

- [ ] Domain mastery is readable without specialist interpretation.
- [ ] Measured vs estimated metrics are visually distinguishable.
- [ ] Charts have text equivalents where needed.

## 17.7 Accessibility

- [ ] Keyboard flow works.
- [ ] Focus states are visible.
- [ ] Text and controls meet contrast requirements.
- [ ] Reduced-motion is supported.
- [ ] Mobile touch targets are usable.

---

# 18. Implementation Guardrails for Antigravity

1. **Do not rewrite SAT assessment logic while redesigning UI.**
2. Preserve the adaptive mock state machine.
3. Preserve diagnostic flow and data writes.
4. Preserve honest score ranges and disclaimer.
5. Preserve canonical Math taxonomy mapping.
6. Preserve error intelligence and stable attempt IDs.
7. Preserve SRS timing and labels.
8. Preserve measured study-time and active-date logic.
9. Preserve non-affiliation disclaimer.
10. Do not reintroduce “Official SAT” wording.
11. Do not add fake AI features or unimplemented claims.
12. Do not change question-bank answer keys as part of visual redesign.
13. Refactor CSS/components only when required to establish the design system.
14. Before each page redesign, verify core interactions still work.
15. After each page redesign, run the existing acceptance gate plus page-level smoke tests.

---

# 19. Recommended Implementation Sequence

```text
PHASE UI-0  Design tokens + global shell
        ↓
PHASE UI-1  Today
        ↓
PHASE UI-2  Practice
        ↓
PHASE UI-3  Review / Mistakes
        ↓
PHASE UI-4  Mock Test
        ↓
PHASE UI-5  Progress
        ↓
PHASE UI-6  Landing + final polish
        ↓
QA / Accessibility / Responsive regression
```

Do not redesign every page simultaneously.

---

# 20. MASTER PROMPT — ANTIGRAVITY

Copy the following prompt into Antigravity when starting the redesign project.

```text
ROLE
You are a senior product designer, UX architect, design-system designer, and frontend engineer working on an existing SAT preparation web application called SAT IntelliPrep.

CONTEXT
The functional SAT engine has already been audited and remediated. The assessment logic, adaptive module flow, diagnostic, score-range logic, taxonomy normalization, error intelligence, SRS, measured analytics, and compliance work must NOT be broken during this redesign.

The next objective is a major UI/UX redesign.

VISUAL REFERENCE
Use the attached education website image as a STYLE / MOOD reference only.

Extract these characteristics:
- bright, airy composition
- premium editorial feeling
- generous whitespace
- large rounded cards
- elegant serif display typography paired with clean sans-serif UI typography
- soft pastel card surfaces
- strong visual hierarchy
- warm educational human photography
- refined controls

DO NOT copy the reference layout literally.
DO NOT create a real-estate, catalog, course marketplace, or generic LMS visual structure.

PRODUCT IDENTITY
SAT IntelliPrep must feel:
Calm · Premium · Academic · Youthful · Intelligent · Human · Trustworthy

PRIMARY UX QUESTION
Every main screen must answer:
“What should the student do next, and why?”

CORE NAVIGATION
Today
Practice
Review
Mock Test
Progress
Resources

GLOBAL DESIGN DIRECTION
- light canvas
- white primary surfaces
- indigo primary action color
- restrained soft pastel accent cards
- large radii
- subtle shadows
- generous spacing
- no heavy glassmorphism
- no neon
- no excessive gradients
- no excessive gamification
- no equal-weight dashboard card wall

TYPOGRAPHY
Use an elegant serif display font for major editorial headings, preferably Lora or equivalent.
Use Inter or equivalent for UI/body.
SAT test content and answer choices must remain highly readable sans-serif.

IMPORTANT PRODUCT RULES
- Never fabricate data to make the design look populated.
- Preserve empty states honestly.
- Keep SAT terminology accurate.
- Preserve all existing P0 assessment fixes.
- Never restore “Official SAT” claims.
- Never replace score ranges with fake exact predicted scores.
- Never expose adaptive route difficulty labels during a live mock.
- Do not change question keys or question-bank content as part of the visual redesign.

WORKFLOW
1. Inspect the existing source and existing components.
2. Build shared design tokens first.
3. Redesign the app shell/navigation.
4. Redesign ONE screen at a time.
5. Preserve existing behavior and event handlers.
6. Run functional regression after every screen.
7. Run existing acceptance gate after each milestone.

IMPLEMENT IN THIS ORDER
UI-0 Global design system + app shell
UI-1 Today
UI-2 Practice
UI-3 Review / Mistakes
UI-4 Mock Test
UI-5 Progress
UI-6 Landing / final polish

Read and follow the full specification in:
SAT_IntelliPrep_UIUX_Redesign_Spec_2026-10-04.md

Do not begin by rewriting the whole app.
Start with UI-0 only.
After UI-0 is complete, report:
- files changed
- tokens/components introduced
- behavior preserved
- screenshots/visual summary if available
- regression checks performed
- any unresolved issues
Then STOP and wait for approval before UI-1.
```

---

# 21. PAGE PROMPT 01 — TODAY

```text
TASK: REDESIGN SAT INTELLIPREP — TODAY PAGE ONLY

Do not modify assessment logic, question-bank data, adaptive routing, score calculations, or SRS logic.

GOAL
Make Today the strongest product screen and immediately answer:
“What should I do now?”

STYLE
Follow the approved global design system:
- bright premium canvas
- strong editorial hierarchy
- generous whitespace
- soft pastel accents
- large rounded cards
- serif display headings only where appropriate
- clean sans-serif UI

REQUIRED STRUCTURE
1. Personalized hero
2. Quick status row
3. Today’s Plan — dominant primary block
4. Recommended practice
5. Review due
6. Progress snapshot
7. Strategy tip

HERO
Show:
- greeting
- today’s highest-value focus
- total planned study time
- review due count
- target/readiness context when supported by real data
- primary CTA: Start today’s plan

TODAY’S PLAN
This must be the most important actionable block below the hero.
Each task should show:
- sequence
- task name
- domain/skill
- duration
- state

Avoid a dense grid of equal dashboard cards.

DATA INTEGRITY
If readiness/diagnostic data is unavailable, show an honest empty state and diagnostic CTA.
Do not insert fallback percentages.

RESPONSIVE
Desktop: hero + strong section rhythm.
Tablet: 2-column status grid.
Mobile: single-column flow with Today’s Plan kept above secondary content.

ACCEPTANCE
- Within 5 seconds the user knows what to do next.
- One primary CTA is obvious.
- The screen feels significantly more premium than the old prototype.
- Existing Today interactions still work.
- No fake data introduced.

After implementation, report changed files and regression test results, then stop.
```

---

# 22. PAGE PROMPT 02 — PRACTICE

```text
TASK: REDESIGN SAT INTELLIPREP — PRACTICE PAGE ONLY

GOAL
Create a premium, calm practice discovery experience where students can find the right skill drill in 2–3 interactions.

PRESERVE
- canonical SAT taxonomy
- current practice loading logic
- question selection logic
- progress writes
- diagnostic/mastery data

PAGE STRUCTURE
1. Page heading + concise description
2. Primary filter chips
3. Recommended practice block
4. Reading & Writing domain section
5. Math domain section
6. Optional focused-session action

PRIMARY FILTERS
All
Reading & Writing
Math
Weak skills
Due today
Timed

SECONDARY FILTERS
Domain
Subskill
Difficulty
Duration
Question count

PRACTICE CARD
Show:
- title
- domain
- short learning objective
- duration
- question count
- difficulty
- mastery/progress when real data exists
- recommendation reason when applicable
- one clear CTA

VISUAL
Use restrained pastel surfaces to distinguish categories while maintaining a consistent card component.
Do not make every card a different visual design.

MOBILE
- horizontal scroll chips
- one-column cards
- filters available in compact drawer/sheet

ACCEPTANCE
- Relevant practice can be reached quickly.
- Domain hierarchy is obvious.
- Cards are visually premium but not cluttered.
- No SAT taxonomy labels are changed incorrectly.
- Existing practice behavior passes regression.

Report changed files and tests, then stop.
```

---

# 23. PAGE PROMPT 03 — REVIEW / MISTAKES

```text
TASK: REDESIGN SAT INTELLIPREP — REVIEW / MISTAKES ONLY

GOAL
Make mistake review feel like the most valuable improvement activity in the product.

PRESERVE
- stable attempt IDs
- error classification
- distractor-trap classification
- retryMistakeItem behavior
- SRS intervals and labels

PAGE STRUCTURE
1. Review hero/status
2. Due-now CTA
3. Top repeated error patterns
4. Review queue
5. Recent mistakes
6. Review history / improvement summary

REVIEW HERO
Example:
Review what matters most.
12 items due · 3 repeated traps detected
[Review due now]

ERROR PATTERN CARDS
Examples:
- Sign error after rearranging equations
- Extreme-answer distractor
- Inference exceeds textual evidence

Each pattern must link to supporting mistakes.

MISTAKE ITEM
Show:
- domain/skill
- question preview
- previous choice
- correct answer
- error type
- date
- SRS due state
- action

REVIEW SESSION
Use a focused question-first layout.
Sequence:
question → try again → feedback → trap explanation → correct reasoning → related micro-practice → SRS rating

SRS CONTROLS
Again · 10m
Hard · 1d
Good · 3d
Easy · 7d

Do not rename this FSRS.

ACCEPTANCE
- Due reviews are obvious.
- Error causes are understandable.
- SRS labels exactly match scheduling behavior.
- New mistakes do not break existing review states.
- Existing review logic passes regression.

Report changed files and tests, then stop.
```

---

# 24. PAGE PROMPT 04 — MOCK TEST

```text
TASK: REDESIGN SAT INTELLIPREP — MOCK TEST EXPERIENCE ONLY

GOAL
Make the mock experience credible, calm, structured, and close to the Digital SAT while preserving the existing adaptive state machine.

DO NOT MODIFY
- 98-question architecture
- module timers
- routing threshold logic
- 10-minute break logic
- score-range algorithm
- question keys

MOCK LANDING
Primary card:
Full Digital SAT Simulation
98 questions · 134 minutes + 10-minute break
Adaptive two-stage routing
[Start full mock]

Secondary options may include:
- Reading & Writing section
- Math section
- Short checkpoint

PRE-TEST CHECK
Provide a simple readiness checklist:
- enough time available
- quiet environment
- calculator ready
- full-screen recommended

IN-TEST UI
Visually restrained.
Prioritize:
- module/question number
- timer
- mark for review
- question content
- answers
- Desmos access for Math
- next/back controls

Remove unnecessary decorative card styling inside the live exam.

ADAPTIVE TRANSITION
Do not reveal “hard” or “standard” route labels to the student during the test.
Use neutral transition copy.

BREAK SCREEN
Create a calm dedicated break layout with countdown and optional early Math start.

RESULTS
Hierarchy:
1. Estimated SAT readiness range
2. Confidence level
3. Section ranges
4. Domain performance
5. Timing
6. repeated errors
7. recommended next actions

Keep independent-estimate disclaimer visible but unobtrusive.

ACCEPTANCE
- Full mock facts are clearly 98 questions / 134 minutes + break.
- Routing behavior remains intact.
- No exact fake predicted score returns.
- In-test UI is distraction-free.
- Desmos remains accessible for Math.
- Full mock regression passes.

Report changed files and tests, then stop.
```

---

# 25. PAGE PROMPT 05 — PROGRESS

```text
TASK: REDESIGN SAT INTELLIPREP — PROGRESS PAGE ONLY

GOAL
Turn Progress into a clear story of readiness, mastery, momentum, and next priorities without creating a crowded analytics dashboard.

PRESERVE
- canonical Math domain mapping
- actual study-time tracking
- active-date tracking
- measured accuracy
- readiness score bands
- parent dashboard data source

PAGE STRUCTURE
1. Readiness hero
2. Reading & Writing summary
3. Math summary
4. Domain mastery
5. Study momentum
6. Error improvement
7. Recommended focus
8. Parent summary if applicable

READINESS HERO
Show range and confidence, not fake exact score.
Only show score change when sufficient historical data exists.

DOMAIN MASTERY
Use clear horizontal bars or segmented progress.
Do not default to radar charts.

RW domains:
- Information & Ideas
- Craft & Structure
- Expression of Ideas
- Standard English Conventions

Math domains:
- Algebra
- Advanced Math
- Problem-Solving and Data Analysis
- Geometry and Trigonometry

MOMENTUM
Use measured study activity only.
No synthetic active-day estimates.

ERROR IMPROVEMENT
Show real reduction of repeated error categories over time when supported by data.

ACCEPTANCE
- Student understands strongest and weakest areas quickly.
- Measured and estimated data are visually distinguishable.
- No fake metrics.
- Parent data matches student source data.
- Responsive layout remains readable.

Report changed files and tests, then stop.
```

---

# 26. PAGE PROMPT 06 — LANDING / FINAL POLISH

```text
TASK: REDESIGN SAT INTELLIPREP — LANDING PAGE + FINAL VISUAL POLISH

GOAL
Create a premium education landing experience inspired by the supplied reference image while remaining distinctly SAT IntelliPrep.

REFERENCE QUALITIES TO BORROW
- strong editorial hero
- warm learning imagery
- generous whitespace
- rounded image containers
- elegant serif headline
- restrained blue primary CTA
- pastel content cards
- high-end education feel

DO NOT COPY
- exact card arrangement
- marketplace/catalog layout
- reference text
- reference branding

HERO COPY DIRECTION
Prepare smarter for the Digital SAT.

A personal study system that diagnoses weaknesses, plans what to study next, and turns mistakes into progress.

[Start diagnostic]
[Explore how it works]

LANDING STRUCTURE
1. Hero
2. How it works: Diagnose → Practice → Review → Test → Improve
3. Featured learning paths
4. Why SAT IntelliPrep is different
5. Readiness / progress product preview
6. Student/parent trust block
7. CTA
8. College Board non-affiliation disclaimer

FEATURED CARDS
- Reading & Writing
- Math
- Mistake Review
- Full Mock

FINAL POLISH PASS
After landing implementation, review the whole product for:
- consistent radii
- typography hierarchy
- spacing rhythm
- button hierarchy
- chip consistency
- hover/focus states
- empty states
- mobile behavior
- reduced motion
- contrast

Do not change learning or SAT engine logic during final polish.

ACCEPTANCE
- Product feels premium and emotionally engaging.
- It clearly looks like one coherent product across landing and authenticated app.
- Reference mood is recognizable without literal copying.
- Compliance disclaimer remains present.
- Global regression/acceptance tests pass.

Report changed files, final QA results, remaining visual issues, then stop.
```

---

# 27. Final QA Checklist

Before declaring the redesign complete:

## Product
- [ ] Today makes next action obvious.
- [ ] Practice is easy to browse.
- [ ] Review makes mistakes actionable.
- [ ] Mock feels credible and focused.
- [ ] Progress tells a coherent learning story.

## Visual
- [ ] Consistent type scale.
- [ ] Consistent card radius.
- [ ] Consistent spacing rhythm.
- [ ] Consistent button hierarchy.
- [ ] Pastel colors are restrained and meaningful.
- [ ] Whitespace is sufficient.
- [ ] No dashboard clutter.

## Technical
- [ ] Existing technical acceptance gate still passes.
- [ ] Diagnostic flow still works.
- [ ] Mock routing still works.
- [ ] Break logic still works.
- [ ] SRS still works.
- [ ] Error retry still works.
- [ ] Progress still uses canonical skill data.
- [ ] Study-time data remains measured.

## Responsive
- [ ] 1440 desktop checked.
- [ ] 1024 tablet checked.
- [ ] 768 tablet checked.
- [ ] 390 mobile checked.
- [ ] 360 mobile checked.

## Accessibility
- [ ] Keyboard navigation.
- [ ] Visible focus states.
- [ ] Dialog focus management.
- [ ] Contrast.
- [ ] 200% zoom.
- [ ] Reduced motion.
- [ ] Screen-reader labels on primary controls.

---

# 28. Definition of Done

The UI/UX redesign is complete when:

1. The product no longer feels like a functional prototype.
2. SAT IntelliPrep has a recognizable, coherent premium visual identity.
3. The Today page makes the next learning action obvious.
4. Learning workflows are faster and clearer than before.
5. The visual language of the supplied reference image has been translated into the SAT product appropriately.
6. All audit-remediated SAT logic remains intact.
7. No fake data, fake AI, fake scoring precision, or misleading “official” claims are introduced.
8. Desktop, tablet, mobile, keyboard, and reduced-motion states are verified.
9. The existing technical acceptance gate passes after the final redesign.

---

**END OF SPECIFICATION**

---

# 29. Visual Asset Production Pack

## 29.1 Why this asset pack should be prepared before the UI implementation

The reference direction depends on more than layout, color, and typography. Its premium character comes from the controlled combination of:

- a strong editorial hero image,
- human educational imagery,
- consistent iconography,
- restrained decorative illustration,
- generous white space,
- large color-block cards.

Therefore the redesign should **not wait until the end to decide imagery**. Prepare the high-value visual assets before implementing the final UI so Antigravity can compose around real image proportions and safe zones instead of placeholders.

However, do **not** generate every visual element with AI. The correct split is:

```text
GENERATIVE IMAGE ASSETS
→ hero photography / editorial learning scenes
→ optional student cutout for the Today banner
→ optional small editorial strategy illustration

VECTOR / CODE ASSETS
→ navigation icons
→ domain icons
→ progress icons
→ buttons and controls
→ charts and data graphics
→ decorative shapes / backgrounds
```

This prevents inconsistent AI-generated icons and keeps the product scalable, accessible, and maintainable.

---

## 29.2 Asset directory structure

Recommended production structure:

```text
assets/
  visual/
    hero/
      landing-hero-desktop.webp
      landing-hero-mobile.webp
      today-student-cutout.webp
    editorial/
      strategy-study-scene.webp
      diagnostic-study-scene.webp
  icons/
    # Prefer Lucide SVG / inline SVG; do not store raster icons.
```

Use lower-case kebab-case filenames.

### Production format

- Master source: PNG or high-quality JPEG.
- Web delivery: **WebP** preferred.
- Hero desktop target: approximately **1800 × 900 px** or higher.
- Hero mobile target: approximately **1080 × 1350 px** or higher.
- Cutout target: approximately **1200 × 1500 px**, transparent background.
- Optimize for web without visible compression artifacts.

---

# 30. Hero Image System

## 30.1 Landing hero — primary visual

### Purpose

This is the main emotional asset for the marketing/landing experience. It should immediately communicate:

- academic confidence,
- modern high-school learning,
- human connection,
- ambition without pressure,
- premium educational credibility.

### Composition

Desktop:

```text
| text safe zone ~40% | students / learning scene ~60% |
```

Keep the left side relatively calm so real HTML headline and CTA can be overlaid. Do **not** bake words, logos, or UI into the image.

### Recommended visual direction

- photorealistic editorial education photography,
- 16–18-year-old Vietnamese / Southeast Asian high-school students,
- contemporary but believable study environment,
- bright natural daylight,
- books, notebooks, laptop/tablet,
- warm concentration and collaboration,
- sophisticated styling, not stock-photo posing,
- soft blue / warm neutral color harmony matching the UI palette.

### Generation prompt — desktop

```text
Premium editorial education photography for a high-end SAT preparation web app, a small group of 16–18-year-old Vietnamese high school students studying together at a large table in a bright modern learning studio, authentic focused collaboration, notebooks, printed practice questions, pencils, laptop and tablet, smart casual contemporary clothing, natural youthful expressions, aspirational but believable, warm soft daylight through large windows, refined academic atmosphere, clean modern bookshelves subtly in the background, soft blue and warm neutral palette, sophisticated international education campaign aesthetic, realistic skin and hands, subtle depth of field, premium magazine photography, wide horizontal composition, students grouped mainly on the right side of the frame, generous clean negative space on the left for website headline and CTA, no text, no logos, no watermark, no artificial UI elements, photorealistic, high detail, 16:9
```

### Generation prompt — mobile crop

```text
Premium editorial education photography for a high-end SAT preparation mobile website, 16–18-year-old Vietnamese high school students studying together naturally with notebooks, printed SAT-style practice pages, laptop and tablet, bright modern learning studio, authentic focused collaboration, warm natural daylight, refined academic atmosphere, soft blue and warm neutral palette, realistic skin and hands, premium magazine photography, vertical composition with faces and study activity concentrated in the upper-middle area, enough quiet background space for responsive text outside the photograph, no text, no logos, no watermark, photorealistic, high detail, 4:5
```

### Acceptance criteria

- No obvious AI anatomy errors.
- No unreadable fake text on books/pages in focal areas.
- No school-uniform styling unless deliberately requested.
- Scene must feel age-appropriate for SAT students.
- Avoid exaggerated smiles or staged advertising poses.
- Must still work after a 28–32 px rounded container crop.

---

## 30.2 Authenticated Today hero — compact student cutout

### Purpose

Use as an optional visual accent inside the personalized Today banner. The banner should remain functional and not become a marketing hero.

### Layout

```text
| greeting + today's focus + CTA | student cutout |
```

The student image should occupy approximately **25–35%** of the card on desktop and be hidden or reduced on compact mobile layouts.

### Generation prompt

```text
Three-quarter portrait cutout of a confident 16–18-year-old Vietnamese high school student preparing for the SAT, seated slightly angled with a slim laptop, notebook and pencil, intelligent focused expression with a subtle natural smile, modern smart-casual student clothing in white, soft blue and muted lavender, premium Gen Z education brand photography, realistic skin and hands, soft studio daylight, polished but authentic, clean silhouette, isolated subject, no text, no logo, no watermark, transparent background, high detail
```

### Rule

Do not use a giant character illustration here. The student must remain secondary to the personalized learning plan.

---

# 31. Supporting Editorial Imagery

These are optional and should be used sparingly. The product should not become an image-heavy LMS.

## 31.1 Strategy / learning-method image

Possible placement:

- Landing “How it works” section,
- Resources / Strategy section,
- small editorial card at the bottom of Today.

### Prompt

```text
Editorial education photograph for a premium SAT preparation platform, close natural scene of a Vietnamese high school student actively reviewing a difficult problem, handwritten annotations, notebook, pencil, laptop and calculator visible, thoughtful focused posture, modern bright study environment, warm natural daylight, subtle soft-blue accents, calm academic mood, authentic not staged, premium magazine photography, no readable brand text, no logos, no watermark, horizontal 3:2 composition, photorealistic, high detail
```

---

## 31.2 Diagnostic / first-step image

Possible placement:

- onboarding diagnostic panel,
- landing diagnostic CTA,
- empty-state illustration for new accounts.

### Prompt

```text
Premium editorial education photography showing a 16–18-year-old Vietnamese student beginning a digital SAT diagnostic assessment on a laptop at a clean desk, notebook and pencil nearby, calm focused expression, bright modern study environment, soft daylight, understated blue and cream palette, sophisticated academic atmosphere, believable real-world scene, no exam anxiety, no logos, no readable text, no watermark, photorealistic, high detail, wide 3:2 composition
```

---

# 32. Iconography System — Do Not AI-Generate Raster Icons

## 32.1 Recommended library

Use **Lucide Icons** as the default product icon system.

Reason:

- consistent outline geometry,
- easy SVG implementation,
- scalable at any density,
- accessible with labels,
- simple to recolor using design tokens,
- visually compatible with the clean rounded reference aesthetic.

Recommended base style:

```text
Size:        20–24 px normal UI
Large card:  28–32 px
Stroke:      1.75–2 px
Caps/joins:  rounded
Color:       currentColor / semantic token
```

## 32.2 Suggested icon mapping

| Product concept | Suggested Lucide icon |
|---|---|
| Today | `Sun` or `CalendarDays` |
| Practice | `BookOpenCheck` |
| Review | `RotateCcw` or `RefreshCw` |
| Mistakes | `CircleAlert` |
| Mock Test | `ClipboardCheck` |
| Timer | `Timer` |
| Progress | `TrendingUp` |
| Diagnostic | `ScanSearch` |
| Reading & Writing | `BookOpenText` |
| Algebra | `Variable` |
| Advanced Math | `Sigma` |
| Problem Solving / Data | `ChartNoAxesCombined` |
| Geometry | `Shapes` |
| Vocabulary | `Languages` |
| Strategy Coach | `Lightbulb` |
| Review due | `Clock3` |
| Strength | `CircleCheckBig` |
| Weakness | `TriangleAlert` |
| Readiness | `Gauge` |
| Parent view | `Users` |
| Settings | `Settings` |

### Icon rule

Never use a different icon family on the same screen. Avoid emoji as functional icons. Avoid filled cartoon icons unless the entire product system is intentionally changed.

---

# 33. Domain Card Visual Language

The reference image uses strong colored cards rather than separate illustrations for every item. SAT IntelliPrep should do the same.

Use **color + icon + typography + progress** as the main card identity.

Recommended mapping:

```text
Reading & Writing              pale blue
Algebra                        pale sage
Advanced Math                  soft lilac
Problem-Solving & Data         warm yellow
Geometry & Trigonometry        light blue-grey
Review / Mistakes              soft coral
Mock Test                      indigo / white
Vocabulary                     pale green
```

Each domain card should contain:

```text
[icon]
Domain name
1 short state line
Progress / mastery signal
Estimated time or recommended action
CTA
```

Do not generate a unique AI illustration for each card. It will make the interface visually noisy and inconsistent.

---

# 34. Image Usage by Screen

| Screen | Image requirement | Recommendation |
|---|---|---|
| Landing | High | Use primary editorial hero + at most 1 supporting scene |
| Today | Medium | Optional transparent student cutout only |
| Practice | Low | No photography; use color-coded cards + SVG icons |
| Review | Low | No photography; prioritize mistakes and due-review data |
| Mock Test | Low | No photography inside test flow; illustration only on landing if needed |
| Progress | Very low | No photography; charts/data need visual authority |
| Diagnostic onboarding | Medium | Optional supporting editorial scene |
| Resources | Medium | Editorial imagery acceptable for article/strategy cards |

### Key rule

**Images create emotion at entry points. Data and interaction create trust inside the learning workflow.**

---

# 35. Responsive Image Rules

## Desktop

- Landing hero can use a 16:9 or approximately 2:1 crop.
- Use `object-fit: cover`.
- Establish a fixed focal point so the student group remains visible.

## Tablet

- Reduce hero height.
- Move headline outside the photo if overlap becomes unstable.

## Mobile

- Prefer the dedicated mobile hero crop.
- Do not simply center-crop the desktop hero if faces are lost.
- Today student cutout can be removed entirely below 640–768 px if it reduces CTA clarity.

Use `srcset` / `<picture>` for desktop and mobile hero variants where possible.

---

# 36. Image Performance Requirements

- Prefer WebP.
- Hero image should ideally remain below **300–450 KB** after optimization if visual quality permits.
- Supporting images target **150–250 KB**.
- Always set intrinsic `width` and `height` to reduce layout shift.
- `loading="eager"` only for the above-the-fold landing hero.
- Use `loading="lazy"` for below-the-fold images.
- Provide meaningful `alt` text for content-bearing images.
- Decorative images should use empty alt text.

---

# 37. Asset Integration Gate

Before UI Phase 1 is considered visually approved, verify:

- [ ] landing hero desktop asset available,
- [ ] landing hero mobile asset available,
- [ ] Today cutout available or intentionally omitted,
- [ ] one icon library selected and implemented consistently,
- [ ] domain icon mapping finalized,
- [ ] image filenames and repository paths fixed,
- [ ] WebP optimization complete,
- [ ] no text is baked into generated imagery,
- [ ] no fake academic logo or institutional branding appears in imagery,
- [ ] images work with both desktop and mobile compositions,
- [ ] UI remains coherent if optional supporting imagery is removed.

---

# 38. Antigravity — Visual Asset Integration Prompt

Use this after the final image files are placed in the repository.

```text
VISUAL ASSET INTEGRATION PASS — SAT INTELLIPREP

Use the finalized visual assets in /assets/visual/ and the Lucide SVG icon system to complete the redesign.

IMPORTANT:
- Do not regenerate or replace the supplied visual assets.
- Do not embed text into images.
- Do not add random stock photos.
- Do not use AI-generated raster icons.
- Do not change SAT engine/business logic.

LANDING HERO
- Use assets/visual/hero/landing-hero-desktop.webp for desktop.
- Use assets/visual/hero/landing-hero-mobile.webp for mobile through <picture> or equivalent responsive handling.
- Preserve the image focal point.
- Keep real headline, body copy and CTA as HTML layered/composed with the image.
- Maintain generous whitespace and the premium editorial visual direction.

TODAY
- If assets/visual/hero/today-student-cutout.webp is present, place it as a secondary visual in the personalized Today hero.
- It must never compete with today's learning plan or CTA.
- Hide/reduce it on small mobile layouts if needed.

ICONS
- Use Lucide icons consistently.
- Use one coherent stroke weight.
- Use semantic CSS color tokens.
- Do not mix icon families.

PRACTICE / REVIEW / MOCK / PROGRESS
- Prioritize SVG icons, color blocks, typography, and data visualization instead of photographs.
- Keep imagery out of test-taking screens.

PERFORMANCE
- Add intrinsic image dimensions.
- Lazy-load below-the-fold images.
- Use eager loading only for the primary above-the-fold landing hero.
- Avoid cumulative layout shift.

Run a final visual QA at desktop, tablet and mobile widths.
```

---

# 39. Recommended Visual Production Order

Prepare assets in this order:

```text
1. Landing hero — desktop
2. Landing hero — mobile
3. Today student cutout
4. Lock Lucide icon mapping
5. Optional strategy image
6. Optional diagnostic image
7. Convert final raster assets to WebP
8. Integrate through the Visual Asset Integration Prompt
```

The first three assets are sufficient to establish the premium visual identity. Do not delay UI implementation waiting for a large image library.

