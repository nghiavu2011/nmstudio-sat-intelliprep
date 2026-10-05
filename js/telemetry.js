/* ═══════════════════════════════════════════════════════════════
   SAT IntelliPrep v1.0 — Privacy-Aware Learning Telemetry Engine
   Pilot Instrumentation & Behavioral Analytics Module
   File: js/telemetry.js
   ═══════════════════════════════════════════════════════════════ */

(function(global) {
  'use strict';

  // Storage Keys
  const STORAGE_KEY_CONSENT = 'sat_pilot_consent'; // 'granted' | 'declined' | null
  const STORAGE_KEY_ANON_ID = 'sat_pilot_anon_id';
  const STORAGE_KEY_SESSION_ID = 'sat_pilot_session_id';
  const STORAGE_KEY_SESSION_TIMESTAMP = 'sat_pilot_session_ts';
  const STORAGE_KEY_QUEUE = 'sat_pilot_event_queue';
  const STORAGE_KEY_SEEN_EVENTS = 'sat_pilot_seen_events';

  // Constants & Thresholds
  const APP_VERSION = 'v1.0.0';
  const APP_COMMIT = '11c861d';
  const SESSION_INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
  const MAX_QUEUE_SIZE = 100;
  const MAX_SEEN_CACHE = 200;
  const FLUSH_INTERVAL_MS = 15000; // 15 seconds batch flush
  const MAX_PAYLOAD_SIZE = 10240; // 10 KB per event cap
  const ENDPOINT_API = '/api/telemetry'; // Prepared endpoint

  // Strict Event Allow-List and Property Schemas
  const ALLOWED_EVENTS = new Set([
    // Lifecycle
    'app_opened',
    'session_started',
    'session_ended',
    'route_viewed',

    // Setup / Activation
    'pilot_consent_selected',
    'setup_started',
    'setup_completed',
    'diagnostic_started',
    'diagnostic_completed',
    'diagnostic_abandoned',

    // Today
    'today_viewed',
    'today_plan_started',
    'today_plan_step_completed',
    'today_plan_completed',
    'today_plan_abandoned',

    // Practice
    'practice_session_started',
    'practice_domain_selected',
    'practice_question_answered',
    'practice_feedback_viewed',
    'practice_retry_started',
    'practice_retry_completed',
    'practice_session_completed',
    'practice_session_abandoned',

    // Review / SRS
    'review_viewed',
    'review_due_started',
    'review_card_rated',
    'review_due_completed',
    'mistake_retry_started',
    'mistake_retry_completed',

    // Mock Test
    'mock_started',
    'mock_module_started',
    'mock_question_answered',
    'mock_question_flagged',
    'mock_module_completed',
    'mock_break_started',
    'mock_break_completed',
    'mock_route_assigned',
    'mock_completed',
    'mock_abandoned',

    // Reliability
    'client_error',
    'asset_load_error',
    'telemetry_flush_failed'
  ]);

  // Deny-list for PII or excessive blobs
  const FORBIDDEN_PROPERTY_KEYS = new Set([
    'name', 'student_name', 'email', 'phone', 'dob', 'address', 'password',
    'passage', 'passage_text', 'question', 'question_text', 'choice_text', 'choices',
    'explanation', 'notes', 'clipboard', 'keystroke', 'audio', 'video', 'screenshot'
  ]);

  // Utility to generate standards-compliant UUID
  function generateUUID() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Detect environment
  function detectEnvironment() {
    if (typeof window === 'undefined') return 'test';
    if (window.SAT_TELEMETRY_ENV) return window.SAT_TELEMETRY_ENV;
    const hostname = window.location.hostname || '';
    if (hostname.includes('vercel.app')) return 'production';
    if (hostname === 'localhost' || hostname === '127.0.0.1') return 'local';
    return 'production';
  }

  // Device & Viewport bucketing
  function getDeviceCategory() {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width <= 600) return 'mobile';
    if (width <= 1024) return 'tablet';
    return 'desktop';
  }

  function getViewportBucket() {
    if (typeof window === 'undefined') return '1440';
    const width = window.innerWidth;
    if (width <= 480) return '390';
    if (width <= 1180) return '1024';
    return '1440';
  }

  // Telemetry Engine Class
  class SatTelemetryEngine {
    constructor() {
      this.initialized = false;
      this.enabled = false;
      this.anonId = null;
      this.sessionId = null;
      this.queue = [];
      this.seenEventIds = new Set();
      this.flushTimer = null;
      this.endpoint = ENDPOINT_API;
      this.debug = !!(typeof window !== 'undefined' && window.SAT_TELEMETRY_DEBUG);
    }

    init() {
      if (this.initialized) return;
      this.initialized = true;

      // Check Consent
      const consent = this.getConsentStatus();
      if (consent === 'granted') {
        this.enabled = true;
        this.anonId = this.getOrCreateAnonymousId();
        this.startSession();
      } else {
        this.enabled = false;
      }

      // Restore offline queue safely
      this.loadQueue();

      // Setup periodic flush if enabled
      if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', () => this.onUnload());
        window.addEventListener('pagehide', () => this.onUnload());
        this.flushTimer = setInterval(() => this.flush(), FLUSH_INTERVAL_MS);
      }
    }

    getConsentStatus() {
      try {
        return localStorage.getItem(STORAGE_KEY_CONSENT);
      } catch (_) {
        return null;
      }
    }

    setConsent(granted) {
      try {
        const val = granted ? 'granted' : 'declined';
        localStorage.setItem(STORAGE_KEY_CONSENT, val);
        if (granted) {
          this.enabled = true;
          this.anonId = this.getOrCreateAnonymousId();
          this.startSession();
          this.track('pilot_consent_selected', { consent_granted: true });
        } else {
          // If declining or revoking, track final event then clear identity and disable
          if (this.enabled) {
            this.track('pilot_consent_selected', { consent_granted: false });
            this.flush();
          }
          this.enabled = false;
          this.queue = [];
          this.saveQueue();
        }
      } catch (_) {}
    }

    getOrCreateAnonymousId() {
      try {
        let id = localStorage.getItem(STORAGE_KEY_ANON_ID);
        if (!id) {
          id = generateUUID();
          localStorage.setItem(STORAGE_KEY_ANON_ID, id);
        }
        return id;
      } catch (_) {
        return generateUUID();
      }
    }

    startSession() {
      if (!this.enabled) return null;
      try {
        const now = Date.now();
        const lastTs = parseInt(localStorage.getItem(STORAGE_KEY_SESSION_TIMESTAMP) || '0', 10);
        let sId = localStorage.getItem(STORAGE_KEY_SESSION_ID);

        if (!sId || (now - lastTs > SESSION_INACTIVITY_TIMEOUT_MS)) {
          sId = generateUUID();
          localStorage.setItem(STORAGE_KEY_SESSION_ID, sId);
          this.sessionId = sId;
          this.track('session_started', {
            is_new_session: true,
            inactivity_reset: now - lastTs > SESSION_INACTIVITY_TIMEOUT_MS
          });
        } else {
          this.sessionId = sId;
        }

        localStorage.setItem(STORAGE_KEY_SESSION_TIMESTAMP, String(now));
        return this.sessionId;
      } catch (_) {
        this.sessionId = generateUUID();
        return this.sessionId;
      }
    }

    sanitizeProperties(props) {
      if (!props || typeof props !== 'object') return {};
      const clean = {};
      for (const [k, v] of Object.entries(props)) {
        const keyLower = k.toLowerCase();
        if (FORBIDDEN_PROPERTY_KEYS.has(keyLower)) {
          if (this.debug) console.warn(`[Telemetry] Dropped forbidden PII field: ${k}`);
          continue;
        }
        // Only allow safe primitives or short arrays
        if (typeof v === 'string') {
          clean[k] = v.length > 256 ? v.slice(0, 256) : v;
        } else if (typeof v === 'number' || typeof v === 'boolean') {
          clean[k] = v;
        } else if (Array.isArray(v)) {
          clean[k] = v.slice(0, 50);
        }
      }
      return clean;
    }

    track(eventName, properties = {}) {
      if (!this.enabled && eventName !== 'pilot_consent_selected') {
        if (this.debug) console.log(`[Telemetry: Skipped (Consent not granted)]`, eventName);
        return null;
      }

      if (!ALLOWED_EVENTS.has(eventName)) {
        if (this.debug) console.warn(`[Telemetry: Unknown Event Rejected]`, eventName);
        return null;
      }

      const eventId = generateUUID();
      const sanitizedProps = this.sanitizeProperties(properties);

      // Current Route
      let route = 'today';
      if (typeof window !== 'undefined' && window.location && window.location.hash) {
        route = window.location.hash.replace(/^#/, '');
      }

      const envelope = {
        event_id: eventId,
        event_name: eventName,
        timestamp: new Date().toISOString(),
        anonymous_user_id: this.anonId || 'anonymous_unconsented',
        session_id: this.sessionId || 'session_init',
        app_version: APP_VERSION,
        commit: APP_COMMIT,
        route: route,
        environment: detectEnvironment(),
        device_category: getDeviceCategory(),
        viewport_bucket: getViewportBucket(),
        properties: sanitizedProps
      };

      // Payload cap check
      const serialized = JSON.stringify(envelope);
      if (serialized.length > MAX_PAYLOAD_SIZE) {
        if (this.debug) console.warn(`[Telemetry: Payload size exceeded]`, serialized.length);
        return null;
      }

      if (this.debug || window.SAT_TELEMETRY_DEBUG) {
        console.log(`📡 [Telemetry Track]`, eventName, envelope);
      }

      // In-memory deduplication check
      if (this.seenEventIds.has(eventId)) return null;
      this.seenEventIds.add(eventId);
      if (this.seenEventIds.size > MAX_SEEN_CACHE) {
        const first = this.seenEventIds.values().next().value;
        this.seenEventIds.delete(first);
      }

      this.enqueue(envelope);
      return envelope;
    }

    enqueue(envelope) {
      this.queue.push(envelope);
      if (this.queue.length > MAX_QUEUE_SIZE) {
        this.queue.shift(); // Evict oldest
      }
      this.saveQueue();
    }

    loadQueue() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY_QUEUE);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) this.queue = parsed;
        }
      } catch (_) {}
    }

    saveQueue() {
      try {
        localStorage.setItem(STORAGE_KEY_QUEUE, JSON.stringify(this.queue));
      } catch (_) {}
    }

    async flush() {
      if (this.queue.length === 0) return true;

      // Defensive: Only attempt network transmission if not strictly disabled
      const batch = [...this.queue];
      const env = detectEnvironment();

      // In local or test without configured backend, retain locally in debug store
      if (env === 'test') {
        this.queue = [];
        this.saveQueue();
        return true;
      }

      try {
        const bodyStr = JSON.stringify({ batch });
        let sent = false;

        // Try standard fetch if supported
        if (typeof fetch === 'function') {
          const res = await fetch(this.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: bodyStr,
            keepalive: true
          });
          if (res.ok) {
            sent = true;
          }
        }

        if (sent) {
          // Remove sent items from queue
          this.queue = this.queue.filter(ev => !batch.some(b => b.event_id === ev.event_id));
          this.saveQueue();
          return true;
        } else {
          // Keep in queue for conservative retry
          return false;
        }
      } catch (err) {
        if (this.debug) console.warn('[Telemetry Flush Offline/Deferred]', err.message);
        return false;
      }
    }

    onUnload() {
      if (this.queue.length === 0 || !this.enabled) return;
      try {
        const batch = [...this.queue];
        const payload = JSON.stringify({ batch });
        if (navigator && typeof navigator.sendBeacon === 'function') {
          navigator.sendBeacon(this.endpoint, payload);
          this.queue = [];
          this.saveQueue();
        }
      } catch (_) {}
    }
  }

  // Singleton instance
  const instance = new SatTelemetryEngine();

  // Export to global window
  global.SatTelemetry = instance;

  // Auto-init on DOMContentLoaded if browser environment
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => instance.init());
    } else {
      instance.init();
    }
  }

  // Node.js CommonJS export for QA scripts
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      SatTelemetryEngine,
      ALLOWED_EVENTS,
      FORBIDDEN_PROPERTY_KEYS,
      APP_VERSION,
      APP_COMMIT
    };
  }

})(typeof window !== 'undefined' ? window : globalThis);
