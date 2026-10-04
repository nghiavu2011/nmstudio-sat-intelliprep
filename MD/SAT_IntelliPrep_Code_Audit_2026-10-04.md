# SAT IntelliPrep — Code & Product Audit

**Audit date:** 2026-10-04  
**Basis:** uploaded repository ZIP `nmstudio-sat-intelliprep-main.zip` + current College Board public specifications.  
**Verdict:** Strong product concept; current implementation is a functional prototype, not yet a production-grade adaptive SAT prep platform.

## Executive score

| Dimension | Score | Notes |
|---|---:|---|
| Product vision / information architecture | 8.5/10 | Clear 5-destination flow; strong Error/Review concept |
| UI structure / visual system | 7.5/10 | Cohesive HTML/CSS, responsive intent; accessibility gaps remain |
| SAT fidelity | 3.0/10 | Full mock structure/timing/adaptivity/scoring materially incorrect |
| Learning / personalization engine | 4.0/10 | Mostly cumulative accuracy + hard-coded recommendations |
| Error intelligence / SRS | 4.0/10 | Strong concept, weak implementation; not true FSRS |
| Question bank / assessment quality | 3.5/10 | 194 items, but no approved items; known wrong/ambiguous items and answer-position bias |
| Engineering quality for pilot | 6.5/10 | Simple, syntax-valid, robust localStorage; monolithic and no automated tests |
| Production readiness | 3.0/10 | Content QA, trust metrics, scoring, test engine, data model need correction |

**Overall implementation score: ~5.3/10.**  
**Product potential after P0 fixes: ~8.5–9/10.**

---

## P0 — Must fix before calling this an adaptive SAT platform

### P0.1 Full mock is not a real SAT simulation

**Code:** `js/app.js` around lines 748–943.

- UI advertises `65 phút · 54 câu` for a “Digital SAT Full Adaptive Exam”.
- Real SAT structure is 98 questions, 134 minutes of testing time: 54 RW / 64 min + 44 Math / 70 min.
- Repository packs contain only 15 RW questions per module and 12 Math questions per module, not 27 and 22.
- `startMockExam()` always selects `module_2_hard` and concatenates it with Module 1.
- `module_2_standard` exists in data but is never used for routing.
- There is one global timer instead of separately timed modules.
- Student can navigate away from Test and effectively pause the timer.

**Required fix:** implement a section/module state machine:
`RW M1 -> route -> RW M2 -> break -> Math M1 -> route -> Math M2 -> results`.

### P0.2 SAT score shown is mathematically invalid

**Code:** `js/app.js` around lines 1159–1168.

Current formula:

```js
400 + accuracy * 1200
```

This is not SAT scoring. Digital SAT scoring uses an adaptive/IRT-based model and depends on the item characteristics and response pattern, not raw percent correct alone.

**Required fix:** until a defensible calibration model exists, show:
- raw accuracy,
- section-level performance bands,
- readiness range / confidence,
- never present a fabricated exact `xxxx / 1600` as SAT-equivalent.

### P0.3 Question bank contains known wrong/ambiguous items

Concrete examples:

- `data/questions/math_advanced.json` → `MATH-ADV-011`: explanation itself says “The choices are wrong”; mathematical answer is 5, but key is `A`, with A=`3`. It is simultaneously marked `is_grid_in: true` while also containing MC choices.
- `data/questions/rw_conventions.json` → `RW-C-001`: keyed completion ends in an incomplete `They` sentence.
- `RW-C-011` and `RW-C-011-ALT`: explanations contain authoring notes such as “Actually... Let’s adjust...” and explicitly acknowledge ambiguity.

`MATH-ADV-011` also appears in generated practice tests.

**Bank audit:**
- 194 question-bank items.
- 170 are `qa_status: DRAFT`.
- 24 have no `qa_status` at all.
- 0 are `APPROVED`.
- All 194 have `source_basis: original`.

**Required fix:** no item enters Practice/Mock unless `qa_status === APPROVED` after schema validation + answer verification + human SME review.

### P0.4 Answer-key distribution is severely biased

Among 171 MCQs:

- A = 75
- B = 62
- C = 30
- D = 4

D is correct only ~2.3% of the time. Each current 54-question mock route has only one D-correct item.

**Impact:** students can learn answer-position artifacts instead of SAT skills; test scores become invalid.

**Required fix:** balanced key generation and a QA rule that fails any pack with statistically implausible answer-position distribution.

### P0.5 Diagnostic exists as data but is not implemented

`data/diagnostic/diagnostic_questions.json` contains 30 questions, but there is no runtime reference from `index.html` or `js/app.js`.

Initial setup collects target score, grade and language level, then sends the student directly into the normal app. The onboarding statement that the system will personalize a route is not backed by diagnostic logic.

**Required fix:** first-run flow should be:
`Profile -> Diagnostic -> Skill baseline -> Today plan`.

### P0.6 Math mastery tracking is structurally broken

`js/app.js` hardcodes 15 canonical skill labels. Practice writes progress using `q.skill`.

- RW questions mostly use those canonical labels.
- Math questions use 40+ granular subskill strings such as `Linear functions`, `Quadratics`, `Circles`.
- 89/194 questions use skill labels not found in the hardcoded 15-skill list.
- Progress UI then looks for `Algebra`, `Advanced Math`, etc., which are not the keys being updated.

**Impact:** students can answer many Math questions while Math progress bars remain 0%. Parent mastered-skill counts can also become inconsistent with the `/15` denominator.

**Required fix:** make `data/sat_skill_map.json` the single canonical taxonomy and store both `domain_id` + `skill_id` rather than free-text labels.

### P0.7 Error Intelligence is mostly a label, not a diagnosis engine

Bank completeness:

- 170/194 questions have no `error_type`.
- 77/194 have no `thinking_framework`.
- 24/194 have no `why_others_wrong`.

When an answer is wrong, the app stores the question-level `error_type` rather than diagnosing the specific distractor selected. Most items therefore collapse to `COGNITIVE_DISTRACTOR`.

`retryMistakeItem()` switches to the default `rw-info` practice pool and searches that pool only; mistakes from most other domains cannot reliably be retrained.

Mistake flashcards use IDs like `FC-ERR-0` based on array index. Since new errors are inserted at the front, a new error can inherit the old error’s spaced-review state.

**Required fix:** stable `attempt_id`, distractor-specific misconception tags, root-cause classification, and deterministic remapping to a remedial item set.

### P0.8 “FSRS” is not FSRS and due scheduling is incorrect

`rateFlashcard()` uses simple interval multipliers. It does not implement FSRS memory stability/difficulty/retrievability.

Additional functional mismatches:

- UI says `Again (<1m)`, but code schedules Again at 1 day.
- UI says `Good (3d)`, initial code gives ~2.2 days.
- UI says `Easy (7d)`, initial code gives 4 days.
- Due count uses `dueCount || flashcardDeck.length`; when zero cards are due it displays the whole deck as due.
- Review session does not filter out not-due cards.

**Required fix:** either implement real FSRS or rename it honestly to a simple SRS. Do not market simple multipliers as FSRS.

### P0.9 Parent/achievement metrics contain fabricated estimates

Examples:

- `totalHours = totalQuestions * 1.5 min` instead of measured study time.
- active days = `ceil(totalQuestions/15)` capped at 7, not calendar activity.
- share card shows defaults of 25 questions, 80% accuracy and 2/15 skills even when the student has zero data.
- Today page defaults to 75% accuracy with zero answered questions.
- Today “trap alert” is hard-coded to Over-Inference regardless of actual errors.

**Impact:** trust issue, especially because the report is explicitly for parents.

**Required fix:** only display measured events. If data is insufficient, show `Chưa đủ dữ liệu`.

---

## P1 — High-value product corrections

### P1.1 “AI Coach” is not AI

`askAIPrompt()` returns hard-coded templates; no model/API call exists. Responses are largely RW-specific and can be nonsensical for Math.

Rename to `Strategy Coach` until a real contextual AI service exists, or connect a model with a tightly structured context payload.

### P1.2 Language-level personalization is not implemented

The `VI / EN` control only cycles `foundation -> intermediate -> advanced` and shows an alert. The selected level is not used to alter question text, hints, explanations or UI language.

### P1.3 Today plan is mostly static

The page claims 3 optimized activities and 27 minutes, but `startTodayPlan()` simply routes to `#practice`. The activity list is static and not executed as a session plan.

### P1.4 Mock items are not isolated from practice bank

Every practice-test item is copied from `data/questions`. A student can encounter the same item in normal practice before the mock.

Current hard-route overlaps:
- Practice Test 1 ↔ Test 2: 17 shared items.
- Test 1 ↔ Test 3: 0.
- Test 2 ↔ Test 3: 21 shared items.

Use separate calibrated `practice`, `diagnostic`, and `assessment` item pools.

### P1.5 Test content blueprint is not enforced

`build_practice_packs.py` selects slices/random pools by difficulty, not a formal College Board blueprint. Domain naming is inconsistent (`Geometry & Trigonometry` vs `Geometry and Trigonometry`, etc.). At least one hard Math module lacks normalized Geometry coverage.

### P1.6 Desmos logic is based on fragile string matching

`isMath` checks whether domain/skill text contains `math`, `algebra` or `geometry`.

This can hide Desmos for Algebra and PSDA questions. Use a canonical section ID (`section: math`) instead.

Also, the iframe loads the public Desmos calculator URL; it should not be labeled as the exact “Digital SAT Official Interface”.

### P1.7 Accessibility is incomplete

- Modals lack `role="dialog"` / `aria-modal`.
- No focus trap or focus restoration.
- Desmos iframe has no title.
- Setup labels are not associated with selects using `for`.
- Inline event handlers make a strong CSP harder to adopt.

### P1.8 No true session analytics

`sessionLog` exists in state but is never written. Test question time is estimated by dividing whole-test time by total questions, not measured per item.

### P1.9 No automatic test coverage

JavaScript and Python syntax compile, but repo contains no unit/integration/E2E tests for:
- answer equivalence,
- routing,
- scoring/display rules,
- SRS scheduling,
- taxonomy mapping,
- item schema validation,
- practice-pack generation.

---

## P2 — Engineering / repository hygiene

1. `app.js` is ~1,840 lines and handles routing, UI, data, exams, SRS, reports, exports and analytics in one file.
2. Generation scripts use hard-coded Windows paths (`d:\antigravity_scratch\...`).
3. Internal reports are stale: they describe 155 questions / 8-section navigation / system fonts, while the current repo has 194 questions / 5 destinations / Google Fonts.
4. Google Fonts is loaded in both `index.html` and CSS `@import`.
5. `data/ielts/*` is included in a SAT repo but unused by runtime.
6. `extracted/sat_rw_prep/` includes full Kaplan 2020 PDF and EPUB (~11.7 MB). If the repository is public, remove these unless you have explicit distribution rights.
7. `file_hashes.txt` exposes local Windows folder paths from the source machine.
8. Vercel config has no security headers such as CSP / Referrer-Policy / Permissions-Policy.
9. Zalo display number and link format appear inconsistent (`+98...` display vs `+84...` link) and should be verified.

---

## Branding / College Board compliance warning

The UI uses labels such as **“Digital SAT Official Practice Pack 1”** although the bank is original and not College Board-authored. This can imply affiliation.

Recommended:
- remove `Official` from all third-party practice-pack labels;
- use SAT® correctly and include the College Board non-affiliation disclaimer if applicable;
- do not copy/import official College Board practice questions into a commercial test-prep app without permission;
- do not use College Board copyrighted questions in generative-AI workflows.

Also review the product/service name `SAT IntelliPrep` against current College Board trademark rules before commercial launch.

---

## Recommended remediation sequence

### Phase 0 — Trust & compliance (1–2 days)
- Remove `Official` claims and fake/default stats.
- Rename AI Coach / FSRS claims to match current functionality.
- Remove copyrighted source files from public repo if unlicensed.
- Add disclaimer and review product naming.

### Phase 1 — Canonical data model + item QA (3–5 days)
- Single taxonomy from `sat_skill_map.json`.
- JSON Schema for every item.
- Stable IDs (`item_id`, `attempt_id`, `skill_id`, `domain_id`).
- Fix/disable every unapproved item.
- Balance answer positions.
- Separate practice / diagnostic / assessment pools.

### Phase 2 — Real diagnostic + Today engine (3–5 days)
- First-run diagnostic.
- Mastery model using recency, difficulty, accuracy and response time.
- Today plan generated from measurable weaknesses and due reviews.

### Phase 3 — Exam engine (5–8 days)
- 27/27 RW and 22/22 Math module structure.
- Separate module timers and locked transitions.
- M1 routing to higher/lower M2.
- 10-minute break.
- Resume protection / session persistence.
- Replace exact fake SAT score with calibrated readiness bands until empirical calibration exists.

### Phase 4 — Error intelligence + spaced retrieval (4–7 days)
- Distractor-specific misconception taxonomy.
- Stable mistake review cards.
- Real FSRS (or honest simpler SRS).
- Remedial question selection.

### Phase 5 — Production layer
- Account/backend sync only when multi-device / parent dashboard is actually needed.
- Analytics and error monitoring.
- Accessibility pass.
- AI tutor with domain-specific prompts, guardrails and evaluation set.

---

## Acceptance gate for v2

Do not label the app production-ready until all of the following are true:

- [ ] No unapproved item can enter a scored test.
- [ ] Full mock uses 98 questions / 134 minutes and module-level timing.
- [ ] M2 routing actually changes based on M1 performance.
- [ ] No fabricated 400–1600 score.
- [ ] Math taxonomy and Progress are aligned.
- [ ] Diagnostic is wired into onboarding.
- [ ] Parent analytics only use measured data.
- [ ] Error remediation works for every domain.
- [ ] SRS scheduling is internally consistent.
- [ ] Automated QA validates keys, answer distribution, domain blueprint and duplicates.
- [ ] College Board naming/copyright review is completed.

