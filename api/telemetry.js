// ═══════════════════════════════════════════════════════════════
// SAT IntelliPrep v1.0 — Server-side Telemetry Ingestion Endpoint
// Vercel Serverless Function / Next.js Node API Handler
// File: api/telemetry.js
// ═══════════════════════════════════════════════════════════════

const ALLOWED_EVENTS = new Set([
  'app_opened', 'session_started', 'session_ended', 'route_viewed',
  'pilot_consent_selected', 'setup_started', 'setup_completed',
  'diagnostic_started', 'diagnostic_completed', 'diagnostic_abandoned',
  'today_viewed', 'today_plan_started', 'today_plan_step_completed',
  'today_plan_completed', 'today_plan_abandoned',
  'practice_session_started', 'practice_domain_selected',
  'practice_question_answered', 'practice_feedback_viewed',
  'practice_retry_started', 'practice_retry_completed',
  'practice_session_completed', 'practice_session_abandoned',
  'review_viewed', 'review_due_started', 'review_card_rated',
  'review_due_completed', 'mistake_retry_started', 'mistake_retry_completed',
  'mock_started', 'mock_module_started', 'mock_question_answered',
  'mock_question_flagged', 'mock_module_completed', 'mock_break_started',
  'mock_break_completed', 'mock_route_assigned', 'mock_completed', 'mock_abandoned',
  'client_error', 'asset_load_error', 'telemetry_flush_failed'
]);

const FORBIDDEN_KEYS = new Set([
  'name', 'student_name', 'email', 'phone', 'dob', 'address', 'password',
  'passage', 'passage_text', 'question', 'question_text', 'choice_text', 'choices',
  'explanation', 'notes', 'clipboard', 'keystroke', 'audio', 'video', 'screenshot'
]);

const MAX_BATCH_SIZE = 50;
const MAX_EVENT_BYTES = 10240; // 10 KB

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const batch = body?.batch;

    if (!Array.isArray(batch) || batch.length === 0) {
      return res.status(400).json({ error: 'Invalid batch format: Array required' });
    }

    if (batch.length > MAX_BATCH_SIZE) {
      return res.status(413).json({ error: `Batch exceeds limit of ${MAX_BATCH_SIZE} events` });
    }

    const acceptedEvents = [];
    const rejectedEvents = [];

    for (const ev of batch) {
      // Validate schema envelope
      if (!ev.event_id || !ev.event_name || !ev.timestamp || !ev.anonymous_user_id) {
        rejectedEvents.push({ id: ev.event_id, reason: 'Missing required envelope fields' });
        continue;
      }

      if (!ALLOWED_EVENTS.has(ev.event_name)) {
        rejectedEvents.push({ id: ev.event_id, reason: 'Event name not in allow-list' });
        continue;
      }

      const strSize = JSON.stringify(ev).length;
      if (strSize > MAX_EVENT_BYTES) {
        rejectedEvents.push({ id: ev.event_id, reason: 'Payload exceeds size cap' });
        continue;
      }

      // Check for forbidden PII keys
      let containsPII = false;
      if (ev.properties && typeof ev.properties === 'object') {
        for (const k of Object.keys(ev.properties)) {
          if (FORBIDDEN_KEYS.has(k.toLowerCase())) {
            containsPII = true;
            break;
          }
        }
      }

      if (containsPII) {
        rejectedEvents.push({ id: ev.event_id, reason: 'Contains prohibited personal information or raw text' });
        continue;
      }

      acceptedEvents.push(ev);
    }

    // Storage integration placeholder:
    // If DATABASE_URL or SUPABASE_URL configured, persist to pilot_events table
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (dbUrl && acceptedEvents.length > 0) {
      // Production database insertion logic goes here when env vars are connected
    }

    return res.status(200).json({
      status: 'ok',
      received: batch.length,
      accepted: acceptedEvents.length,
      rejected: rejectedEvents.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(400).json({ error: 'Malformed JSON payload', details: err.message });
  }
}
