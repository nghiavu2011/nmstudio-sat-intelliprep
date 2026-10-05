# SAT IntelliPrep v1.0 — Pilot Learning Telemetry Specification & Schema

**Release:** v1.0 Pilot Instrumentation  
**Date:** 2026-10-05  
**Engine:** Privacy-Aware Client Engine (`js/telemetry.js`) + Server Ingestion (`api/telemetry.js`) + PostgreSQL Schema (`db/pilot_telemetry_schema.sql`)

---

## 1. Principles & Privacy Bounds

1. **Strict Data Minimization:** Designed for high-school students (15–18 years old).
2. **Never Collected:** Names, emails, phones, precise locations, IP addresses, raw text of passages or questions, free-form notes, or session replay video.
3. **Explicit Consent Gate:** Anonymous learning telemetry is inactive until the student selects "Cho phép dữ liệu Pilot". Opting out preserves 100% of the core app's functionality without penalty.
4. **Anonymous Identity:** Generated via `crypto.randomUUID()` and saved as `sat_pilot_anon_id`.

---

## 2. Common Event Envelope

Every event adheres to this JSON structure:

```json
{
  "event_id": "4b68ff0d-2713-4f9e-a611-399ea48ec9ab",
  "event_name": "practice_question_answered",
  "timestamp": "2026-10-05T07:45:00.000Z",
  "anonymous_user_id": "93f41249-14a0-47eb-ba67-0c7f2ee6b0c2",
  "session_id": "d0c3fe5a-5ba2-475a-a384-3c66ba473708",
  "app_version": "v1.0.0",
  "commit": "11c861d",
  "route": "practice",
  "environment": "production",
  "device_category": "desktop",
  "viewport_bucket": "1440",
  "properties": {}
}
```

---

## 3. Allowed Event Registry & Properties

| Domain | Event Name | Safe Property Allow-List | Description |
| :--- | :--- | :--- | :--- |
| **Lifecycle** | `app_opened` | `referrer`, `launch_mode` | Dispatched on DOM ready |
| | `session_started` | `is_new_session`, `inactivity_reset` | Dispatched on session init or >30m resume |
| | `session_ended` | `duration_sec`, `events_count` | Dispatched on page unload |
| | `route_viewed` | `route_name` | Route change (`today`, `practice`, `review`, `test`, `progress`) |
| **Setup & Activation** | `pilot_consent_selected` | `consent_granted` (bool) | Explicit consent choice |
| | `setup_started` | `step` | Opened profile modal |
| | `setup_completed` | `grade_band`, `explanation_level`, `target_score`, `chose_diagnostic` | Profile saved |
| | `diagnostic_started` | `test_id` | Started diagnostic exam |
| | `diagnostic_completed`| `duration_sec`, `questions_answered`, `correct_count`, `accuracy` | Finished diagnostic |
| | `diagnostic_abandoned`| `questions_answered`, `time_spent_sec` | Left exam early |
| **Today** | `today_viewed` | None | Opened Today dashboard |
| | `today_plan_started` | None | Clicked "Bắt Đầu Lộ Trình Hôm Nay" |
| | `today_plan_step_completed` | `step_index`, `step_type` | Completed activity step |
| | `today_plan_completed`| `total_duration_sec` | All 3 daily steps completed |
| **Practice** | `practice_session_started` | `domain_key` | Loaded domain practice set |
| | `practice_domain_selected`| `domain_key` | Switched domain tab |
| | `practice_question_answered`| `question_id`, `domain`, `skill`, `difficulty`, `is_correct`, `attempt_index`, `time_spent_ms`, `error_type`, `used_desmos`, `is_grid_in`, `selected_option`, `correct_option` | Submitted question answer |
| | `practice_feedback_viewed`| `question_id`, `is_correct` | Viewed 6-stage deliberate feedback |
| | `practice_retry_started` | `question_id` | Clicked "Làm Lại Biến Thể" |
| **Review / SRS** | `review_viewed` | None | Opened SRS review destination |
| | `review_card_rated` | `card_id`, `card_type`, `rating` (1–4), `review_count`, `next_interval_days` | Rated flashcard memory state |
| | `mistake_retry_started` | `skill` | Triggered retry from mistake log |
| **Mock Test** | `mock_started` | `test_id`, `is_full_adaptive` | Started timed practice test |
| | `mock_module_started` | `test_id`, `stage` | Started module (RW M1, RW M2, Math M1, Math M2) |
| | `mock_question_answered`| `test_id`, `stage`, `question_index`, `question_id`, `selected_option`, `is_flagged` | Selected answer in exam |
| | `mock_question_flagged`| `test_id`, `question_index`, `is_flagged` | Flagged question for review |
| | `mock_break_started` | `break_seconds` | Entered 10-minute Bluebook break |
| | `mock_completed` | `test_id`, `rw_min`, `rw_max`, `math_min`, `math_max`, `total_min`, `total_max`, `rw_routing`, `math_routing`, `duration_sec` | Completed mock test (strictly already-computed bands) |
| **Reliability** | `client_error` | `error_message`, `source_file`, `line_no` | Unhandled client exception |
| | `asset_load_error` | `asset_url`, `status_code` | Missing or failed JSON asset |

---

## 4. Derived Metrics & Small-Sample Rules

1. **Activation Funnel:** `App Open` $\rightarrow$ `Setup Completed` $\rightarrow$ `Diagnostic Completed` $\rightarrow$ `Today Plan Started` $\rightarrow$ `First Practice Completed`.
2. **Cohort Retention:** D1, D3, D7 return rates calculated strictly from local calendar day differences.
3. **Item Analytics Sample Thresholds:**
   - `< 10 attempts`: Marked as `INSUFFICIENT_DATA`.
   - `10–19 attempts`: Exploratory indications only.
   - `≥ 20 attempts`: Provisional difficulty flags allowed (`VERY_EASY`, `VERY_HARD`, `SLOW_ITEM`).
   - Notice: **Exploratory Item Analytics — Not Psychometric Calibration**.

---

## 5. Storage & 90-Day Retention

- **Database Table:** `pilot_events` in PostgreSQL.
- **Auto-Purge Function:** `purge_expired_pilot_telemetry(90)` runs every 90 days.
- **Participant Deletion:** `purge_pilot_participant(target_anon_id)` allows instant deletion of any pseudonymous participant upon request.
