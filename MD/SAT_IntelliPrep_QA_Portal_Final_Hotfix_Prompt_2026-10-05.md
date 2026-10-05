# SAT IntelliPrep — FINAL QA PORTAL EVIDENCE-INTEGRITY HOTFIX

**Date:** 2026-10-05
**Target:** `sat_interactive_review.html`, `reports/release_status.json`, `scripts/generate_release_status.js`, QA/runtime scripts
**Mode:** Minimal evidence-integrity + reproducibility patch. Do not redesign the SAT learner app.

## RELEASE STATE BEFORE PATCH

**Core learner app:** PASS WITH NOTES  
**Release QA Portal v2:** HOLD  
**Overall Final Release:** HOLD until all items below pass.

---

## P0.1 — RELEASE STATUS MUST BE GENERATED FROM REAL TEST RESULTS, NOT HARD-CODED PASS

Current `scripts/generate_release_status.js` hard-codes:
- regression PASS
- runtime PASS
- visual PASS
- console PASS
- accessibility PASS
- overallStatus `READY FOR REVIEW`
- reviewedAt fixed timestamp
- fallback commit `79b8ca3`

This violates the portal rule: **PASS only when supported by reproducible evidence.**

### Required implementation

Refactor `generate_release_status.js` so it:

1. Executes or reads machine-readable results from:
   - `node scripts/verify_acceptance_gate.js`
   - `node scripts/verify_rc_hotfixes.js`
   - visual QA run / screenshot manifest
   - console/pageerror result
   - accessibility runtime result

2. Sets each gate to:
   - `PASS`
   - `FAIL`
   - `NOT VERIFIED`

3. Derives `overallStatus`:
   - any P0/required FAIL => `BLOCKED`
   - all required PASS => `READY FOR REVIEW`
   - missing evidence => `PASS WITH NOTES` or `NOT VERIFIED`

4. Set `reviewedAt = new Date().toISOString()` or explicit build-time timestamp.

5. Git identity:
   - if `.git` exists, use real commit/branch;
   - if unavailable, do **not** fabricate a commit hash;
   - use `null` / `NOT VERIFIED`, or an explicit environment variable such as `GIT_COMMIT_SHA` supplied by CI.

Never use a hard-coded commit fallback.

---

## P0.2 — PORTAL GATE CARDS MUST BIND TO `release_status.json`

Current portal loads JSON but only updates release metadata and inventory. The visible gate cards remain hard-coded PASS.

### Required

Create a renderer:

```js
renderGate('regression', data.gates.regression)
renderGate('runtime', data.gates.runtime)
renderGate('visual', data.gates.visual)
renderGate('console', data.gates.console)
renderGate('accessibility', data.gates.accessibility)
```

For every gate update:
- status text
- metric/result
- detail
- semantic CSS class
- optional evidence link/command

Also bind:
- reviewedAt
- overallStatus
- commit
- branch
- release

### Failure fallback

If `release_status.json` fails to load:

Do **not** say “using verified inline data”.

Instead show:

```text
STATUS DATA: NOT VERIFIED
```

and set all evidence gate cards to `NOT VERIFIED`.

Inventory may show `--` until data loads.

No stale PASS state may remain in initial HTML.

---

## P0.3 — FIX FULL MOCK FORM INVENTORY

Repository currently contains:
- `practice_test_1.json`: full structure 27/27/27 RW and 22/22/22 Math
- `practice_test_2.json`: full structure 27/27/27 RW and 22/22/22 Math
- `practice_test_3.json`: partial structure 15/15/15 RW and 12/12/12 Math

Therefore `fullMockForms = ptFiles.length` incorrectly reports **3 full mock forms**.

### Required structural classifier

Count a test as a full adaptive mock only if:

```text
RW M1 = 27
RW M2 Hard = 27
RW M2 Standard = 27
Math M1 = 22
Math M2 Hard = 22
Math M2 Standard = 22
```

Output separate inventory:

```json
{
  "fullAdaptiveMockForms": 2,
  "partialOrCompactMockForms": 1,
  "allMockFiles": 3,
  "allMockPlacements": 375,
  "fullMockPlacements": 294
}
```

If `practice_test_3.json` is intended to be a true full simulation, either rebuild it to full 98-question adaptive structure and test it, or relabel it clearly as compact/partial and do not call it Full Simulation.

Also extend `verify_acceptance_gate.js` so every form labeled full is structurally validated.

---

## P1.1 — QA REPRODUCIBILITY: DECLARE PLAYWRIGHT DEPENDENCIES

The uploaded source archive contains Playwright-based tests but no dependency manifest sufficient for a clean checkout.

### Required

Prefer one Playwright stack only.

Option A — Node only (recommended):
- convert/keep all browser QA in Node
- add `package.json`
- devDependency: `playwright`
- scripts:
  - `qa:acceptance`
  - `qa:runtime`
  - `qa:visual`
  - `qa:release`

Document:

```bash
npm ci
npx playwright install chromium
npm run qa:release
```

Option B — keep Python visual capture:
- add `requirements-dev.txt` with `playwright`
- document `python -m playwright install chromium`
- still add Node dependency manifest for `verify_rc_hotfixes.js`

A reviewer must be able to reproduce the gates from a clean clone/ZIP.

---

## P1.2 — INCLUDE OR GENERATE VISUAL EVIDENCE

The QA report references screenshots such as:
- `portal_v2_desktop_1440.png`
- `portal_v2_mobile_390.png`
- viewport screenshots

but the current archive does not contain `reports/screenshots/`.

### Required

Choose one:

1. Include final evidence screenshots in `reports/screenshots/`, or
2. generate them as part of `qa:release` and create a machine-readable screenshot manifest.

Add portal-specific screenshot capture, not only learner-app screenshots.

Minimum portal evidence:
- 1440×900
- 1024×768
- 390×844

Minimum learner-app evidence remains the 8-viewport matrix.

---

## P1.3 — IFRAME FALLBACK MUST ACTUALLY WORK

The portal contains `.iframe-fallback`, but no controller logic activates it.

Cross-origin frame blocking is not reliably detectable with a simple DOM read because of browser security.

### Required practical UX

- Keep `Open App` always visible.
- Add a persistent small helper near the preview:
  `Preview blank or blocked? Open in new tab.`
- For same-origin/local mode, detect load failures where possible.
- If a handshake is acceptable, add an optional `postMessage` ready signal from the learner app; otherwise do not claim automatic CSP-block detection.

Do not leave a hidden fallback component that is never reachable.

---

## P1.4 — PRESERVE CURRENT REVIEW ROUTE WHEN SWITCHING SOURCE

Current `toggleLocalOverride()` reloads the portal and resets `currentHash` to `#today`.

### Required

Persist route in portal URL, e.g.:

```text
sat_interactive_review.html?app=http://localhost:5500&route=practice
```

On load:

```js
currentHash = '#' + (params.get('route') || 'today');
```

When changing route, update the portal URL using `history.replaceState()`.

When switching Local ↔ Production, preserve route and selected viewport.

Optionally preserve viewport using `vp=1366x768`.

---

## P1.5 — FIX LOCAL DATE TRACKING IN CORE APP

`getActiveDaysLast7()` correctly uses local calendar dates, but `init()` still records today with:

```js
new Date().toISOString().slice(0, 10)
```

This is UTC and can record the previous calendar day for Vietnam users during early morning hours.

Replace with:

```js
const todayISO = getLocalDateKey();
```

Add a timezone-sensitive test covering a local date where UTC date differs.

---

## P2 — FINISH “ZERO FUNCTIONAL EMOJI” CLAIM OR CHANGE THE CLAIM

The current source still contains emoji in visible/runtime content, including some buttons/labels.

Either:
- replace remaining functional emoji with the established SVG icon system,

or:
- narrow the QA statement to exactly what is verified, e.g. `No functional emoji in primary navigation and timed exam controls`.

Do not claim “Zero Functional Emoji” unless a comprehensive test actually proves it.

---

# REQUIRED RELEASE QA COMMAND

Create one deterministic command, for example:

```bash
npm run qa:release
```

It should:

1. run static Acceptance Gate
2. run RC runtime browser tests
3. run visual captures
4. collect console/page errors
5. generate release status JSON from results
6. fail with non-zero exit code if a required gate fails

Only after this command finishes should the portal show PASS.

---

# FINAL ACCEPTANCE CHECKLIST

Do not label v1.0 Final until:

```text
Core Acceptance Gate                         PASS
Runtime T01–T08                              PASS
Release status generated from evidence       PASS
Portal gates bind to JSON                     PASS
No stale inline PASS fallback                 PASS
Full mock inventory structurally correct      PASS
Clean-checkout QA dependencies declared       PASS
Portal screenshots reproducible/present       PASS
Learner-app 8-view visual evidence             PASS
Iframe fallback/help reachable                PASS
Source switch preserves route                 PASS
Local calendar date tracking                  PASS
Console/page errors                           0
```

## EXPECTED RELEASE VERDICT AFTER PATCH

If all checks pass:

**SAT IntelliPrep v1.0 — FINAL RELEASE: PASS**

Do not change SAT scoring, adaptive routing, question content, or learner pedagogy while applying this patch except the explicit local-date tracking fix above.
