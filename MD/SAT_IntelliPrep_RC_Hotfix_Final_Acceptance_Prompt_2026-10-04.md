# SAT IntelliPrep — RC HOTFIX / FINAL ACCEPTANCE PATCH

**Date:** 2026-10-04  
**Purpose:** Correct residual runtime/data-integrity/accessibility issues found in independent source audit after the reported Final Visual RC PASS.  
**Scope:** Minimal patch only. Do not redesign and do not change question content or adaptive exam routing.

---

## RELEASE VERDICT BEFORE PATCH

**HOLD — not yet Final Release.**

The browser-visual report is useful, but source inspection reveals several paths not covered by the current 27/27 acceptance script. Fix all P0/P1 items below, then rerun both regression and browser QA.

---

# P0.1 — FIX TODAY READINESS RUNTIME CRASH

Current implementation calls:

```js
calculateSATScoreBands(totalCorrect, totalQ)
```

but the function signature is:

```js
calculateSATScoreBands(rwCorrect, rwRouting, mathCorrect, mathRouting)
```

and it returns flat fields:

```js
{ rwMin, rwMax, mathMin, mathMax, totalMin, totalMax }
```

while Today reads:

```js
bands.totalBand.min
bands.totalBand.max
bands.confidence
```

This path will fail after the user has enough practice data.

## Required fix

Do **not** convert generic practice accuracy into a SAT score band.

Use one of these two states:

### A. No completed full adaptive mock
Display:

```text
Chưa có dải điểm
Hoàn thành Full Adaptive Mock để ước lượng
```

Optionally show a separate real metric:

```text
Practice Accuracy: 78% · 42 questions
```

### B. At least one completed full adaptive mock
Display the latest persisted adaptive-mock band:

```text
1380–1450
Từ Full Adaptive Mock gần nhất
```

Create/persist a minimal `db.assessmentHistory` entry after full adaptive mock completion:

```js
{
  id,
  type: "full_adaptive_mock",
  timestamp,
  rwMin,
  rwMax,
  mathMin,
  mathMax,
  totalMin,
  totalMax,
  rwRouting,
  mathRouting
}
```

Do not use practice-question accuracy as a SAT-scaled score.

---

# P0.2 — REMOVE FABRICATED SCORE / TRAJECTORY FORMULAS FROM PROGRESS

Delete the current heuristic score conversions such as:

```js
920 + overallPct * 6
460 + rwAcc * 3.3
460 + mathAcc * 3.4
totalQ * 1.5 + 30
```

Also remove default fake ranges when there is no score evidence:

```text
480–540 (Ước lượng)
490–550 (Ước lượng)
```

## Required behavior

### No full adaptive mock
- Overall readiness: `Chưa có dải điểm`
- RW band: `Chưa có dữ liệu khảo thí`
- Math band: `Chưa có dữ liệu khảo thí`
- Trajectory: `--`
- Keep real practice accuracy as a **separate** practice metric.

### One full mock
Use its actual stored bands from `calculateSATScoreBands()`.

### Two or more full mocks
Trajectory is based only on real mock history:

```js
latestMidpoint - firstMidpoint
```

Label:

```text
Thay đổi dải điểm qua các bài thi thử
```

Never derive score growth from question count.

---

# P1.1 — FIX WEEKLY CONSISTENCY

Current code uses lifetime count:

```js
(db.activeDates || []).length
```

and displays it as:

```text
X / 7 ngày
```

This can become 12/7, 30/7, etc.

## Required fix

Create:

```js
getActiveDaysLast7()
```

- unique local calendar dates,
- only today and previous 6 local days,
- return 0–7.

Use this for Today and Progress weekly consistency.

Keep lifetime active dates separately only if needed for analytics.

Also stop using UTC date keys for daily activity. Use local date keys.

---

# P1.2 — FINISH ICON CONSISTENCY

The QA report claims zero functional emoji, but dynamic JS/CSS still contains functional emoji.

Examples that must be removed from UI behavior:
- timed exam flag text `🚩`
- flagged palette `content: '🚩'`
- functional feedback warning glyphs if used as UI icons

## Required approach

Create a small reusable inline-SVG helper, e.g.:

```js
iconSvg("flag", 16)
iconSvg("alertTriangle", 16)
iconSvg("lightbulb", 16)
```

For the timed flag button:
- keep icon as DOM/SVG,
- update only the label text,
- do not replace the entire button with emoji text.

For palette flagged state:
- use CSS dot/marker or inline SVG,
- no emoji pseudo-element.

Instructional emoji inside exported/social text may remain only if deliberately treated as content, not control iconography.

---

# P1.3 — DEFINE ALL DESIGN TOKENS ACTUALLY USED

Current stylesheet uses several variables without a canonical definition.

Add aliases in `:root`:

```css
--radius-lg: var(--radius-card-sm);
--radius-xl: var(--radius-card-lg);
--radius-card-xl: var(--radius-hero);

--shadow: var(--shadow-card);
--shadow-md: var(--shadow-card);
--shadow-lg: var(--shadow-modal);
--shadow-card-hover: var(--shadow-hover);
```

Or replace every usage with existing canonical tokens.

Do not leave unresolved CSS custom properties because the affected declaration becomes invalid.

---

# P1.4 — SETUP MODAL ACCESSIBILITY: FOCUS MANAGEMENT

Visual centering is not enough.

Implement:
- remember previously focused element,
- focus first meaningful control when setup opens,
- trap `Tab` / `Shift+Tab` inside setup dialog,
- prevent background keyboard interaction,
- restore focus on close,
- keep `aria-labelledby`,
- if setup is mandatory, Escape may remain disabled for that modal; if optional, Escape closes it.

Create a small reusable modal-focus helper rather than one-off code if practical.

---

# P1.5 — “WEAK SKILLS” FILTER MUST BE DATA-DRIVEN

Current `filterPracticeDomains('weak')` hardcodes specific domains.

Replace hardcoded:

```js
rw-info
math-adv
```

with actual weakest domains calculated from `db.skills`.

Rules:
- minimum evidence threshold before declaring a domain weak,
- if not enough data, show all domains or a neutral “Complete diagnostic first” state,
- never label a hardcoded domain as the learner’s weakness.

---

# P2 — CLEAN STALE DEVELOPER NAMING

User-facing terminology is already SRS, but comments still contain `FSRS`.

Update comments/classes only where safe:
- comments should say `SRS`
- class names may stay for regression safety if renaming adds unnecessary risk

Do not claim real FSRS.

---

# NEW RUNTIME ACCEPTANCE TESTS

The current acceptance suite is not sufficient because it missed a runtime mismatch.

Add these tests.

## T01 — Today after 15+ answered questions
Seed valid state with >=15 practice answers.

Assert:
- `#today` renders,
- no `pageerror`,
- no TypeError,
- readiness area does not invent a SAT band from generic practice accuracy.

## T02 — Progress with zero assessments
Assert:
- no 480–540 / 490–550 fallback score ranges,
- no fake trajectory,
- UI says no assessment band available.

## T03 — Progress after one adaptive full mock
Seed one assessmentHistory entry.

Assert:
- overall, RW, Math bands match persisted values exactly.

## T04 — Progress after two adaptive full mocks
Assert:
- trajectory equals latest midpoint minus first midpoint,
- no `questions × constant` formula.

## T05 — Weekly consistency
Seed 30 lifetime active dates.

Assert:
- weekly display is between 0 and 7,
- old dates do not count.

## T06 — Functional emoji regression
Assert runtime/control surfaces do not contain:
- flag emoji in timed toolbar,
- flag emoji pseudo-element,
- legacy AI Coach label,
- visible FSRS branding.

## T07 — Setup modal keyboard
Assert:
- focus enters modal,
- Tab cycles inside,
- background controls are not focused,
- focus returns appropriately on close.

## T08 — CSS custom-property integrity
Scan every `var(--token)` used by production stylesheet.

Assert:
- every token has a definition or an explicit fallback.

---

# REQUIRED RE-RUN

After patch:

```text
1. Existing 27/27 regression gate
2. New RC runtime tests T01–T08
3. Playwright 8 viewport capture
4. Console/pageerror = zero
5. Manual spot-check:
   - first run
   - Today with >15 answers
   - Progress before mock
   - Progress after mock
   - timed flag/unflag
   - setup keyboard focus
```

---

# FINAL ACCEPTANCE TABLE

Do not mark Final until all are PASS:

```text
P0 Today readiness runtime                 PASS
P0 Progress score integrity                PASS
P1 Weekly consistency                      PASS
P1 Functional icon consistency             PASS
P1 CSS token integrity                     PASS
P1 Setup focus management                  PASS
P1 Weak-skill personalization              PASS
Existing regression 27/27                  PASS
New RC runtime tests T01–T08               PASS
8-viewports browser visual QA              PASS
Browser console/pageerror                  PASS
```

---

# FINAL RULE

Do not solve these issues by changing the report text only.

Fix the implementation, add runtime tests, then regenerate the Final Visual QA report from the post-fix build.
