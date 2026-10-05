-- ═══════════════════════════════════════════════════════════════
-- SAT IntelliPrep v1.0 — Pilot Learning Telemetry Database Schema
-- Production Ingestion & Learning Analytics Schema
-- File: db/pilot_telemetry_schema.sql
-- ═══════════════════════════════════════════════════════════════

-- Ensure UUID extension is available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: pilot_events (Immutable Append-Only Raw Telemetry Log)
CREATE TABLE IF NOT EXISTS pilot_events (
    event_id UUID PRIMARY KEY,
    event_name VARCHAR(64) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    anonymous_user_id UUID NOT NULL,
    session_id UUID NOT NULL,
    app_version VARCHAR(16) NOT NULL DEFAULT 'v1.0.0',
    commit VARCHAR(16) NOT NULL DEFAULT '11c861d',
    route VARCHAR(32) NOT NULL DEFAULT 'today',
    environment VARCHAR(16) NOT NULL DEFAULT 'production', -- 'production' | 'local' | 'test'
    device_category VARCHAR(16) NOT NULL DEFAULT 'desktop', -- 'desktop' | 'tablet' | 'mobile'
    viewport_bucket VARCHAR(16) NOT NULL DEFAULT '1440',
    properties JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for Fast Analytics & Aggregation Queries (Section 14)
CREATE INDEX IF NOT EXISTS idx_pilot_events_timestamp ON pilot_events (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_pilot_events_anon_user ON pilot_events (anonymous_user_id);
CREATE INDEX IF NOT EXISTS idx_pilot_events_name ON pilot_events (event_name);
CREATE INDEX IF NOT EXISTS idx_pilot_events_env ON pilot_events (environment);
CREATE INDEX IF NOT EXISTS idx_pilot_events_session ON pilot_events (session_id);

-- Composite Indexes for High-Velocity Funnel and Item Analysis
CREATE INDEX IF NOT EXISTS idx_pilot_events_env_name_ts ON pilot_events (environment, event_name, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_pilot_events_props_gin ON pilot_events USING gin (properties);

-- View: v_pilot_active_cohort (Excludes local/test by default)
CREATE OR REPLACE VIEW v_pilot_active_cohort AS
SELECT 
    anonymous_user_id,
    DATE_TRUNC('day', MIN(timestamp)) AS cohort_date,
    COUNT(DISTINCT session_id) AS total_sessions,
    COUNT(CASE WHEN event_name = 'setup_completed' THEN 1 END) AS setup_done,
    COUNT(CASE WHEN event_name = 'diagnostic_completed' THEN 1 END) AS diag_done,
    COUNT(CASE WHEN event_name = 'mock_completed' THEN 1 END) AS mock_done,
    MAX(timestamp) AS last_active_at
FROM pilot_events
WHERE environment = 'production'
GROUP BY anonymous_user_id;

-- View: v_pilot_item_performance (Exploratory Content Quality Signals)
CREATE OR REPLACE VIEW v_pilot_item_performance AS
SELECT 
    properties->>'question_id' AS question_id,
    properties->>'domain' AS domain,
    properties->>'skill' AS skill,
    COUNT(*) AS total_attempts,
    COUNT(CASE WHEN (properties->>'is_correct')::boolean IS TRUE THEN 1 END) AS correct_attempts,
    ROUND((COUNT(CASE WHEN (properties->>'is_correct')::boolean IS TRUE THEN 1 END)::numeric / NULLIF(COUNT(*), 0)) * 100, 1) AS p_correct,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY (properties->>'time_spent_ms')::numeric) / 1000.0 AS median_time_sec
FROM pilot_events
WHERE environment = 'production' AND event_name = 'practice_question_answered'
GROUP BY properties->>'question_id', properties->>'domain', properties->>'skill';

-- 90-Day Retention Policy Cleanup Function (Section 15)
CREATE OR REPLACE FUNCTION purge_expired_pilot_telemetry(retention_days INT DEFAULT 90)
RETURNS INT AS $$
DECLARE
    deleted_rows INT;
BEGIN
    DELETE FROM pilot_events
    WHERE timestamp < NOW() - (retention_days || ' days')::INTERVAL;
    GET DIAGNOSTICS deleted_rows = ROW_COUNT;
    RETURN deleted_rows;
END;
$$ LANGUAGE plpgsql;

-- GDPR / Participant Right to be Forgotten Deletion by Anonymous ID (Section 15)
CREATE OR REPLACE FUNCTION purge_pilot_participant(target_anon_id UUID)
RETURNS INT AS $$
DECLARE
    deleted_rows INT;
BEGIN
    DELETE FROM pilot_events
    WHERE anonymous_user_id = target_anon_id;
    GET DIAGNOSTICS deleted_rows = ROW_COUNT;
    RETURN deleted_rows;
END;
$$ LANGUAGE plpgsql;
