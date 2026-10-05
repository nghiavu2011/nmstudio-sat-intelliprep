# MASTER PROMPT — SAT IntelliPrep v1.0 PILOT INSTRUMENTATION & LEARNING ANALYTICS

## ROLE
Act as a **Senior Product Analytics Lead + Learning Science Specialist + Privacy-Aware Frontend/Backend Engineer + QA Lead**.

You are working on the already released **SAT IntelliPrep OS v1.0 Production Pilot**.

The product UI, SAT engine, adaptive routing, score-band logic, question bank, diagnostic flow, SRS review, and Release QA Portal are considered **feature-frozen** for this phase.

Your job is **not to add learner-facing features**.

Your job is to make the product measurable enough to run a controlled pilot with approximately **10–30 real high-school students**, while preserving all existing behavior.

---

# 1. PHASE OBJECTIVE

Move SAT IntelliPrep from:

> “A technically complete SAT preparation app”

to:

> “A measurable pilot-ready learning product with trustworthy behavioral and learning telemetry.”

The system must answer:
- Do students understand onboarding?
- Do they complete the diagnostic?
- Do they start and finish the Today plan?
- Which learning activities are actually used?
- Where do students drop out?
- Which skills repeatedly cause errors?
- Does retry performance improve?
- Are SRS reviews completed?
- Do students return after 1, 3, and 7 days?
- Do students complete Full Adaptive Mock tests?
- Does measured score band change between real mock attempts?
- Which content items appear too easy, too difficult, confusing, or slow?

Do not infer success from UI impressions. Measure actual behavior.

---

# 2. NON-NEGOTIABLE FREEZE

Do not change:
- SAT question content
- correct answers
- distractors
- adaptive routing thresholds
- module structure
- diagnostic logic
- `calculateSATScoreBands()` behavior
- SRS scheduling behavior
- existing learner navigation
- visual design system
- current Release QA Portal logic

Do not add in this phase:
- Cross-out
- Highlighter
- Dark Mode
- New question types
- New AI features
- Gamification
- New mock forms
- New scoring models

Those belong to later releases.

---

# 3. FIRST STEP — REPOSITORY INSPECTION

Before coding:
1. inspect the current repository,
2. identify current app version / commit,
3. inspect existing API/backend/database/analytics integrations,
4. inspect localStorage schema,
5. inspect test scripts,
6. inspect the Release QA Portal,
7. verify existing gates.

Reuse infrastructure if it already exists.

If no persistent analytics backend exists:
- implement a clean analytics-provider abstraction,
- prepare backend endpoint/schema,
- do not fabricate credentials,
- do not embed secrets in frontend code,
- keep Production telemetry disabled until environment variables are configured.

---

# 4. PRIVACY & DATA MINIMIZATION

This pilot may involve school-age users. Collect only the minimum needed.

Never collect:
- student name
- email
- phone
- exact DOB
- home/school address
- free-text personal notes
- passwords
- clipboard contents
- keystroke logs
- full passage text
- full question text
- answer-choice text
- screenshots/session replay
- microphone/camera data
- precise location
- raw IP address as an application telemetry field

Do not fingerprint users.
Do not install session replay.

Create anonymous identity with:

```js
crypto.randomUUID()
```

Persist as:

```text
sat_pilot_anon_id
```

Also generate a per-session `session_id`.

---

# 5. PILOT CONSENT

Add only one minimal learner-facing change:

A concise **Pilot Data Notice** shown once before telemetry is enabled.

Example:

> “SAT IntelliPrep can collect anonymous learning-usage data during this pilot to improve study flow and question quality. It does not collect your name, phone number, email, or answer text.”

Controls:
- `Cho phép dữ liệu Pilot`
- `Không tham gia`

Requirements:
- analytics disabled until explicit choice,
- rejecting analytics does not block learning,
- choice reversible from a small Privacy/Pilot Data setting,
- no dark patterns,
- no legal-compliance claims.

Reuse any existing consent mechanism if present.

---

# 6. TELEMETRY MODULE

Create a dedicated module, for example:

```text
js/telemetry.js
```

API:

```js
track(eventName, properties)
identifyAnonymous()
startSession()
flush()
setTelemetryEnabled(boolean)
```

Rules:
- failures never block learning,
- calls are non-blocking,
- queue briefly offline,
- retry conservatively,
- deduplicate repeated events,
- use `navigator.sendBeacon()` where appropriate on unload,
- avoid large payloads,
- no event may contain HTML bodies or long text blobs.

Add debug flag:

```js
window.SAT_TELEMETRY_DEBUG = false;
```

---

# 7. COMMON EVENT ENVELOPE

Every event uses:

```json
{
  "event_id": "uuid",
  "event_name": "practice_question_answered",
  "timestamp": "ISO-8601",
  "anonymous_user_id": "uuid",
  "session_id": "uuid",
  "app_version": "v1.0.0",
  "commit": "short-hash-if-available",
  "route": "practice",
  "environment": "production|local|test",
  "device_category": "desktop|tablet|mobile",
  "viewport_bucket": "1440|1024|390",
  "properties": {}
}
```

Use allow-lists per event. Do not accept arbitrary properties.

---

# 8. REQUIRED EVENTS

## Lifecycle
```text
app_opened
session_started
session_ended
route_viewed
```

## Setup / Activation
```text
pilot_consent_selected
setup_started
setup_completed
diagnostic_started
diagnostic_completed
diagnostic_abandoned
```

Safe properties:
```text
grade_band
explanation_level
duration_sec
questions_answered
accuracy
```

## Today
```text
today_viewed
today_plan_started
today_plan_step_completed
today_plan_completed
today_plan_abandoned
```

## Practice
```text
practice_session_started
practice_domain_selected
practice_question_answered
practice_feedback_viewed
practice_retry_started
practice_retry_completed
practice_session_completed
practice_session_abandoned
```

Safe properties:
```text
question_id
domain
skill
difficulty
is_correct
attempt_index
time_spent_ms
error_type
used_desmos
is_grid_in
selected_option
correct_option
```

Never send passage/question/answer text.

## Review / SRS
```text
review_viewed
review_due_started
review_card_rated
review_due_completed
mistake_retry_started
mistake_retry_completed
```

## Mock Test
```text
mock_started
mock_module_started
mock_question_answered
mock_question_flagged
mock_module_completed
mock_break_started
mock_break_completed
mock_route_assigned
mock_completed
mock_abandoned
```

On `mock_completed`, include only already-computed assessment output:

```text
rw_min
rw_max
math_min
math_max
total_min
total_max
rw_routing
math_routing
duration_sec
```

Do not recalculate scores inside telemetry.

## Reliability
```text
client_error
asset_load_error
telemetry_flush_failed
```

Sanitize errors and strip tokenized URLs/user content.

---

# 9. DERIVED METRICS

## Activation Funnel
```text
App Open
→ Setup Completed
→ Diagnostic Started
→ Diagnostic Completed
→ Today Plan Started
→ First Practice Session Completed
```

Report counts, conversion %, median time between stages.

## Engagement
- sessions / learner
- median session duration
- questions / session
- active days / last 7
- D1 return
- D3 return
- D7 return

Use local calendar-day cohort logic.

## Learning Behavior
- accuracy by section/domain/skill
- median time per question
- first-attempt vs retry accuracy
- error recurrence rate
- review-due completion rate
- practice completion rate
- mock completion rate

## Assessment
Use only completed Full Adaptive Mock history.

Show:
- latest score band
- first score band
- number of completed mocks
- midpoint change between first and latest
- RW routing history
- Math routing history

Never convert generic practice accuracy into SAT score.

---

# 10. EXPLORATORY ITEM ANALYTICS

For each `question_id` calculate:

```text
attempts
p_correct
median_response_time
option_selection_distribution
retry_success_rate
abandonment_count
```

Possible flags:

```text
VERY_EASY
VERY_HARD
SLOW_ITEM
DISTRACTOR_NOT_FUNCTIONING
HIGH_ABANDONMENT
INSUFFICIENT_DATA
```

Small-sample rules:
- `<10 attempts`: `INSUFFICIENT_DATA`
- `10–19`: exploratory only
- `>=20`: provisional difficulty/time flags allowed
- do not claim stable discrimination/calibration from this pilot

Label section:

**Exploratory Item Analytics — Not Psychometric Calibration**

---

# 11. INTERNAL PILOT DASHBOARD

Create:

```text
pilot_dashboard.html
```

Do not add it to learner navigation.

Sections:
```text
Pilot Summary
Activation Funnel
Retention & Engagement
Learning Behavior
Mock Assessments
Domain Performance
Error Recurrence
Item Quality Signals
Reliability
```

Use the same Calm Academic design language as the Release QA Portal, but prioritize charts/tables over decorative cards.

---

# 12. REQUIRED DASHBOARD PANELS

## Pilot Summary
```text
Anonymous participants
Activated learners
Diagnostic completion
Practice completion
Full mocks completed
D7 return
Median study time
Last event received
```

## Activation Funnel
Counts + conversion.

## Retention
D1 / D3 / D7 with raw counts and %.

Example:
```text
D7: 8 / 14 (57%)
```

## Learning
Table:
```text
Domain
Attempts
Accuracy
Median time
Retry improvement
Repeated-error rate
```

## Error Intelligence
Show:
- most frequent error types
- most recurrent errors
- highest retry improvement

## Mock
Anonymous learner rows:
```text
Anon ID shortened
Mock count
First band
Latest band
Band midpoint delta
Completion time
```

Do not rank students.

## Item Signals
Sortable:
```text
Question ID
Domain
Attempts
p-correct
Median time
Top distractor
Flag
```

Default-hide insufficient-data rows.

## Reliability
Show:
- client errors
- asset errors
- telemetry failures
- ingestion lag

---

# 13. FILTERS

Pilot dashboard filters:
```text
Date range
Cohort
Section
Domain
Skill
Device category
Mock ID
```

No student-name filters.

---

# 14. BACKEND / STORAGE

Reuse existing infrastructure where possible.

If no persistent store exists, use a provider abstraction:

```text
TelemetryProvider
  ├── LocalDebugProvider
  └── ProductionProvider
```

Production requirements:
- server-side ingestion endpoint
- schema validation
- reject unknown events
- reject oversized payloads
- rate limit
- no admin/service secret in browser
- persistent storage
- indexes on timestamp, anonymous_user_id, event_name

If credentials are unavailable:
- create schema/migration,
- create integration code,
- document env vars,
- leave Production telemetry OFF,
- never embed fake keys.

---

# 15. RETENTION

Default pilot retention:

```text
90 days
```

Make it configurable.

Provide admin/developer cleanup and, where backend supports it, deletion by anonymous ID.

Do not claim legal compliance solely from retention.

---

# 16. PERFORMANCE

Telemetry must have negligible impact:
- no blocking fetch on critical UI path
- no heavy third-party bundle unless already approved
- no session replay
- batch small events where useful
- no visual layout changes

Measure before/after:
- initial JS transfer
- LCP
- interaction responsiveness

---

# 17. TEST / DEMO DATA SEPARATION

Every event includes:

```text
environment: production | local | test
```

Dashboard defaults to `production`.

Synthetic QA data must never mix with real pilot data.

---

# 18. NEW QA SCRIPT

Create:

```text
scripts/verify_pilot_telemetry.js
```

Verify at minimum:

```text
T01 consent=no → zero telemetry sent
T02 consent=yes → anonymous UUID created
T03 no PII fields accepted
T04 question event contains IDs/metadata only, not question text
T05 duplicate event IDs not double-counted
T06 offline queue retries safely
T07 telemetry failure does not break learner flow
T08 session IDs rotate correctly
T09 timestamps valid
T10 local/test excluded from production dashboard by default
T11 mock-completed uses stored score band only
T12 active-day metrics use local calendar dates
T13 dashboard zero-data state is honest
T14 item metrics show insufficient-data below threshold
T15 opt-out stops subsequent tracking
```

No PASS may be hard-coded.

---

# 19. PRESERVE EXISTING GATES

After instrumentation rerun:

```text
Existing acceptance gate: 28/28
RC runtime gate: 8/8
Pilot telemetry gate: all PASS
Visual QA: learner screens unchanged
Console/pageerror: zero new errors
```

---

# 20. PILOT OPERATIONS GUIDE

Create:

```text
reports/SAT_IntelliPrep_Pilot_Operations_Guide.md
```

Include:
- pilot objective
- enable/disable telemetry
- environment variables
- starting a cohort
- verifying ingestion
- opening dashboard
- metric definitions
- sample-size limitations
- exporting pilot summary
- deleting a pseudonymous participant if needed
- closing and archiving a pilot

---

# 21. WEEKLY PILOT REPORT

Create:

```text
scripts/generate_pilot_report.js
```

Output:

```text
reports/pilot/Pilot_Week_YYYY-MM-DD.md
```

Sections:
```text
Cohort size
Activation
Engagement
Retention
Learning behavior
Mock completion
Score-band movement
Top recurring errors
Content-item signals
Technical reliability
Interpretation limits
Recommended action for next week
```

Use `Insufficient evidence` when sample size is too small.

---

# 22. RELEASE QA PORTAL INTEGRATION

Add only one small internal section/card to the existing Release QA Portal:

```text
Pilot Analytics
Telemetry: ON/OFF
Last event: timestamp
Participants: N
[Open Pilot Dashboard]
```

Do not expose pilot analytics in learner navigation.

---

# 23. REQUIRED DELIVERABLES

Expected:

```text
js/telemetry.js
api/telemetry.*                (if required)
pilot_dashboard.html
scripts/verify_pilot_telemetry.js
scripts/generate_pilot_report.js
reports/SAT_IntelliPrep_Pilot_Operations_Guide.md
reports/PILOT_TELEMETRY_SCHEMA.md
reports/SAT_IntelliPrep_PILOT_READINESS_2026-10-05.md
```

If needed:

```text
db/pilot_telemetry_schema.sql
```

Update `package.json` with reproducible commands:

```text
npm run qa:pilot
npm run pilot:report
```

---

# 24. FINAL PILOT READINESS REPORT

`reports/SAT_IntelliPrep_PILOT_READINESS_2026-10-05.md` must include:

```text
Core app regression              PASS/FAIL
RC runtime regression            PASS/FAIL
Telemetry privacy checks         PASS/FAIL
Telemetry event validation       PASS/FAIL
Pilot dashboard                  PASS/FAIL
Synthetic/production separation  PASS/FAIL
Consent/opt-out behavior         PASS/FAIL
Console/page errors              PASS/FAIL
Performance regression           PASS/FAIL
```

Do not declare Pilot Ready if any P0 privacy/data-integrity item fails.

---

# 25. FINAL DEFINITION OF DONE

Complete only when:

1. learner flow has no regression,
2. telemetry is invisible after consent,
3. declining analytics does not reduce product functionality,
4. no direct PII is collected,
5. event data is reproducible and auditable,
6. dashboard shows real data rather than demo values,
7. small-sample limitations are explicit,
8. all existing product gates still pass,
9. telemetry can be disabled instantly,
10. system is ready for a controlled 10–30 student pilot.

Core principle:

> **Observe first. Do not optimize from assumptions.**
