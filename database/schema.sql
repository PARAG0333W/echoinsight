-- ============================================================
-- EchoInsight AI — Complete Supabase Database Schema
-- Target: Supabase (PostgreSQL 15+)
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 0. EXTENSIONS
-- ────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";   -- uuid_generate_v4()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";    -- gen_random_uuid()

-- ────────────────────────────────────────────────────────────
-- 1. ENUM TYPES
-- ────────────────────────────────────────────────────────────
CREATE TYPE user_role        AS ENUM ('admin', 'manager', 'analyst');
CREATE TYPE file_type        AS ENUM ('audio', 'document');
CREATE TYPE conversation_status AS ENUM (
  'uploaded', 'processing', 'transcribed',
  'text_extracted', 'parsed', 'analyzing',
  'analyzed', 'failed'
);
CREATE TYPE speaker_role     AS ENUM ('agent', 'customer', 'system');
CREATE TYPE sentiment_type   AS ENUM ('positive', 'neutral', 'negative');
CREATE TYPE severity_level   AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE score_category   AS ENUM (
  'greeting', 'empathy', 'resolution',
  'compliance', 'professionalism', 'clarity'
);
CREATE TYPE mistake_category AS ENUM (
  'tone', 'protocol', 'accuracy',
  'compliance', 'escalation'
);
CREATE TYPE risk_type        AS ENUM (
  'legal', 'compliance', 'churn',
  'escalation', 'data_privacy'
);

-- ────────────────────────────────────────────────────────────
-- 2. USERS TABLE
--    Extends Supabase auth.users with app-specific profile data
-- ────────────────────────────────────────────────────────────
CREATE TABLE public.users (
  id             UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email          VARCHAR(255) NOT NULL UNIQUE,
  full_name      VARCHAR(150) NOT NULL,
  avatar_url     TEXT,
  role           user_role    NOT NULL DEFAULT 'analyst',
  organization   VARCHAR(200),
  is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
  last_login_at  TIMESTAMPTZ,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.users IS 'Application user profiles linked to Supabase Auth';

-- ────────────────────────────────────────────────────────────
-- 3. AGENTS TABLE
--    Call center agents being evaluated
-- ────────────────────────────────────────────────────────────
CREATE TABLE public.agents (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id    VARCHAR(50)  NOT NULL UNIQUE,
  full_name      VARCHAR(150) NOT NULL,
  email          VARCHAR(255),
  department     VARCHAR(100),
  team           VARCHAR(100),
  hire_date      DATE,
  is_active      BOOLEAN      NOT NULL DEFAULT TRUE,
  created_by     UUID         REFERENCES public.users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.agents IS 'Call center agents whose conversations are evaluated';

-- ────────────────────────────────────────────────────────────
-- 4. CONVERSATIONS TABLE
--    Each uploaded file = one conversation record
-- ────────────────────────────────────────────────────────────
CREATE TABLE public.conversations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID                NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  agent_id          UUID                REFERENCES public.agents(id) ON DELETE SET NULL,
  title             VARCHAR(255),
  file_name         VARCHAR(500)        NOT NULL,
  file_type         file_type           NOT NULL,
  file_size_bytes   BIGINT,
  mime_type         VARCHAR(100),
  storage_path      TEXT                NOT NULL,
  status            conversation_status NOT NULL DEFAULT 'uploaded',
  error_message     TEXT,
  duration_seconds  INTEGER,
  language          VARCHAR(10)         DEFAULT 'en',
  call_date         TIMESTAMPTZ,
  metadata          JSONB               DEFAULT '{}',
  created_at        TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.conversations IS 'Uploaded audio/document files representing customer-agent conversations';

-- ────────────────────────────────────────────────────────────
-- 5. MESSAGES TABLE
--    Individual turns within a parsed conversation
-- ────────────────────────────────────────────────────────────
CREATE TABLE public.messages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id   UUID          NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  turn_index        INTEGER       NOT NULL,
  speaker           speaker_role  NOT NULL,
  speaker_name      VARCHAR(150),
  content           TEXT          NOT NULL,
  start_time_ms     INTEGER,
  end_time_ms       INTEGER,
  confidence        REAL,
  sentiment         sentiment_type,
  metadata          JSONB         DEFAULT '{}',
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.messages IS 'Individual dialogue turns extracted from a conversation transcript';

-- Unique constraint: one turn_index per conversation
ALTER TABLE public.messages
  ADD CONSTRAINT uq_messages_conversation_turn
  UNIQUE (conversation_id, turn_index);

-- ────────────────────────────────────────────────────────────
-- 6. ANALYSIS RESULTS TABLE
--    Top-level AI analysis output per conversation
-- ────────────────────────────────────────────────────────────
CREATE TABLE public.analysis_results (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id     UUID           NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  overall_score       REAL           NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  overall_sentiment   sentiment_type NOT NULL DEFAULT 'neutral',
  summary             TEXT,
  key_topics          TEXT[],
  positive_highlights TEXT[],
  areas_of_concern    TEXT[],
  llm_model_used      VARCHAR(100),
  llm_raw_response    JSONB,
  processing_time_ms  INTEGER,
  analyzed_at         TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.analysis_results IS 'Top-level AI analysis results for each conversation';

-- One analysis per conversation (latest wins; reanalysis replaces)
ALTER TABLE public.analysis_results
  ADD CONSTRAINT uq_analysis_conversation
  UNIQUE (conversation_id);

-- ────────────────────────────────────────────────────────────
-- 7. SCORES TABLE
--    Per-dimension quality scores
-- ────────────────────────────────────────────────────────────
CREATE TABLE public.scores (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id     UUID           NOT NULL REFERENCES public.analysis_results(id) ON DELETE CASCADE,
  category        score_category NOT NULL,
  score           REAL           NOT NULL CHECK (score >= 0 AND score <= 100),
  weight          REAL           NOT NULL DEFAULT 1.0,
  justification   TEXT,
  evidence        TEXT[],
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.scores IS 'Dimensional quality scores (greeting, empathy, resolution, etc.)';

-- One score per category per analysis
ALTER TABLE public.scores
  ADD CONSTRAINT uq_scores_analysis_category
  UNIQUE (analysis_id, category);

-- ────────────────────────────────────────────────────────────
-- 8. MISTAKES TABLE
--    Agent mistakes detected by AI
-- ────────────────────────────────────────────────────────────
CREATE TABLE public.mistakes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id       UUID             NOT NULL REFERENCES public.analysis_results(id) ON DELETE CASCADE,
  message_id        UUID             REFERENCES public.messages(id) ON DELETE SET NULL,
  category          mistake_category NOT NULL,
  severity          severity_level   NOT NULL DEFAULT 'medium',
  title             VARCHAR(300)     NOT NULL,
  description       TEXT             NOT NULL,
  original_text     TEXT,
  turn_index        INTEGER,
  impact            TEXT,
  created_at        TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.mistakes IS 'Agent communication mistakes detected during AI analysis';

-- ────────────────────────────────────────────────────────────
-- 9. SUGGESTED RESPONSES TABLE
--    AI-generated improved responses for each mistake
-- ────────────────────────────────────────────────────────────
CREATE TABLE public.suggested_responses (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mistake_id          UUID    NOT NULL REFERENCES public.mistakes(id) ON DELETE CASCADE,
  suggested_text      TEXT    NOT NULL,
  explanation         TEXT,
  tone_improvement    TEXT,
  confidence_score    REAL    CHECK (confidence_score >= 0 AND confidence_score <= 1),
  is_preferred        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.suggested_responses IS 'AI-suggested improved responses for detected agent mistakes';

-- ────────────────────────────────────────────────────────────
-- 10. RISKS TABLE
--     Compliance, legal, churn, and escalation risks
-- ────────────────────────────────────────────────────────────
CREATE TABLE public.risks (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id         UUID           NOT NULL REFERENCES public.analysis_results(id) ON DELETE CASCADE,
  message_id          UUID           REFERENCES public.messages(id) ON DELETE SET NULL,
  risk_type           risk_type      NOT NULL,
  severity            severity_level NOT NULL DEFAULT 'medium',
  title               VARCHAR(300)   NOT NULL,
  description         TEXT           NOT NULL,
  evidence            TEXT,
  turn_index          INTEGER,
  recommended_action  TEXT,
  is_resolved         BOOLEAN        NOT NULL DEFAULT FALSE,
  resolved_by         UUID           REFERENCES public.users(id) ON DELETE SET NULL,
  resolved_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.risks IS 'Risk flags (legal, compliance, churn, escalation, data privacy)';

-- ────────────────────────────────────────────────────────────
-- 11. INDEXES
-- ────────────────────────────────────────────────────────────

-- Users
CREATE INDEX idx_users_role          ON public.users(role);
CREATE INDEX idx_users_org           ON public.users(organization);

-- Agents
CREATE INDEX idx_agents_department   ON public.agents(department);
CREATE INDEX idx_agents_team         ON public.agents(team);
CREATE INDEX idx_agents_active       ON public.agents(is_active) WHERE is_active = TRUE;

-- Conversations
CREATE INDEX idx_conv_user           ON public.conversations(user_id);
CREATE INDEX idx_conv_agent          ON public.conversations(agent_id);
CREATE INDEX idx_conv_status         ON public.conversations(status);
CREATE INDEX idx_conv_file_type      ON public.conversations(file_type);
CREATE INDEX idx_conv_created        ON public.conversations(created_at DESC);
CREATE INDEX idx_conv_call_date      ON public.conversations(call_date DESC);
CREATE INDEX idx_conv_agent_date     ON public.conversations(agent_id, created_at DESC);

-- Messages
CREATE INDEX idx_msg_conversation    ON public.messages(conversation_id);
CREATE INDEX idx_msg_speaker         ON public.messages(speaker);
CREATE INDEX idx_msg_turn            ON public.messages(conversation_id, turn_index);

-- Analysis Results
CREATE INDEX idx_analysis_conv       ON public.analysis_results(conversation_id);
CREATE INDEX idx_analysis_score      ON public.analysis_results(overall_score);
CREATE INDEX idx_analysis_date       ON public.analysis_results(analyzed_at DESC);

-- Scores
CREATE INDEX idx_scores_analysis     ON public.scores(analysis_id);
CREATE INDEX idx_scores_category     ON public.scores(category);

-- Mistakes
CREATE INDEX idx_mistakes_analysis   ON public.mistakes(analysis_id);
CREATE INDEX idx_mistakes_category   ON public.mistakes(category);
CREATE INDEX idx_mistakes_severity   ON public.mistakes(severity);
CREATE INDEX idx_mistakes_message    ON public.mistakes(message_id);

-- Suggested Responses
CREATE INDEX idx_suggestions_mistake ON public.suggested_responses(mistake_id);

-- Risks
CREATE INDEX idx_risks_analysis      ON public.risks(analysis_id);
CREATE INDEX idx_risks_type          ON public.risks(risk_type);
CREATE INDEX idx_risks_severity      ON public.risks(severity);
CREATE INDEX idx_risks_unresolved    ON public.risks(is_resolved) WHERE is_resolved = FALSE;
CREATE INDEX idx_risks_message       ON public.risks(message_id);

-- ────────────────────────────────────────────────────────────
-- 12. UPDATED_AT TRIGGER (auto-update timestamps)
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ────────────────────────────────────────────────────────────
-- 13. ROW LEVEL SECURITY (RLS) POLICIES
--     Supabase-specific: restrict data access per user
-- ────────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_results   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mistakes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggested_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risks              ENABLE ROW LEVEL SECURITY;

-- ── USERS ───────────────────────────────────────────────────
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- ── AGENTS ──────────────────────────────────────────────────
-- All authenticated users can view agents
CREATE POLICY "Authenticated users can view agents"
  ON public.agents FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only admins/managers can insert/update agents
CREATE POLICY "Admins and managers can manage agents"
  ON public.agents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'manager')
    )
  );

-- ── CONVERSATIONS ───────────────────────────────────────────
-- Users can view their own conversations
CREATE POLICY "Users can view own conversations"
  ON public.conversations FOR SELECT
  USING (user_id = auth.uid());

-- Admins/managers can view all conversations
CREATE POLICY "Admins and managers can view all conversations"
  ON public.conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'manager')
    )
  );

-- Users can insert their own conversations
CREATE POLICY "Users can upload conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own conversations
CREATE POLICY "Users can delete own conversations"
  ON public.conversations FOR DELETE
  USING (user_id = auth.uid());

-- ── MESSAGES ────────────────────────────────────────────────
-- Access messages if user can access the parent conversation
CREATE POLICY "Users can view messages of accessible conversations"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = messages.conversation_id
        AND (
          c.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'manager')
          )
        )
    )
  );

-- ── ANALYSIS RESULTS ────────────────────────────────────────
CREATE POLICY "Users can view analysis of accessible conversations"
  ON public.analysis_results FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = analysis_results.conversation_id
        AND (
          c.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'manager')
          )
        )
    )
  );

-- ── SCORES ──────────────────────────────────────────────────
CREATE POLICY "Users can view scores of accessible analyses"
  ON public.scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.analysis_results ar
      JOIN public.conversations c ON c.id = ar.conversation_id
      WHERE ar.id = scores.analysis_id
        AND (
          c.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'manager')
          )
        )
    )
  );

-- ── MISTAKES ────────────────────────────────────────────────
CREATE POLICY "Users can view mistakes of accessible analyses"
  ON public.mistakes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.analysis_results ar
      JOIN public.conversations c ON c.id = ar.conversation_id
      WHERE ar.id = mistakes.analysis_id
        AND (
          c.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'manager')
          )
        )
    )
  );

-- ── SUGGESTED RESPONSES ─────────────────────────────────────
CREATE POLICY "Users can view suggestions of accessible mistakes"
  ON public.suggested_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.mistakes m
      JOIN public.analysis_results ar ON ar.id = m.analysis_id
      JOIN public.conversations c ON c.id = ar.conversation_id
      WHERE m.id = suggested_responses.mistake_id
        AND (
          c.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'manager')
          )
        )
    )
  );

-- ── RISKS ───────────────────────────────────────────────────
CREATE POLICY "Users can view risks of accessible analyses"
  ON public.risks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.analysis_results ar
      JOIN public.conversations c ON c.id = ar.conversation_id
      WHERE ar.id = risks.analysis_id
        AND (
          c.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.users u
            WHERE u.id = auth.uid() AND u.role IN ('admin', 'manager')
          )
        )
    )
  );

-- ────────────────────────────────────────────────────────────
-- 14. SUPABASE STORAGE BUCKET (run via Supabase dashboard)
-- ────────────────────────────────────────────────────────────
-- Create a storage bucket named 'conversation-files' from
-- the Supabase Dashboard → Storage → New Bucket
--
-- Bucket settings:
--   Name:          conversation-files
--   Public:        false
--   File size max:  104857600  (100 MB)
--   Allowed types:  audio/wav, audio/mpeg, audio/mp4, audio/flac,
--                   application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document,
--                   text/plain, text/csv

-- ────────────────────────────────────────────────────────────
-- 15. HELPER VIEWS (for dashboard queries)
-- ────────────────────────────────────────────────────────────

-- Agent performance overview
CREATE OR REPLACE VIEW public.v_agent_performance AS
SELECT
  a.id                AS agent_id,
  a.full_name         AS agent_name,
  a.department,
  COUNT(c.id)         AS total_conversations,
  ROUND(AVG(ar.overall_score)::numeric, 1) AS avg_score,
  COUNT(CASE WHEN ar.overall_score >= 80 THEN 1 END) AS high_quality_count,
  COUNT(CASE WHEN ar.overall_score < 50 THEN 1 END)  AS low_quality_count,
  COUNT(DISTINCT m.id)  AS total_mistakes,
  COUNT(DISTINCT r.id)  AS total_risks
FROM public.agents a
LEFT JOIN public.conversations c    ON c.agent_id = a.id AND c.status = 'analyzed'
LEFT JOIN public.analysis_results ar ON ar.conversation_id = c.id
LEFT JOIN public.mistakes m          ON m.analysis_id = ar.id
LEFT JOIN public.risks r             ON r.analysis_id = ar.id
GROUP BY a.id, a.full_name, a.department;

-- Conversation detail view (joins core tables)
CREATE OR REPLACE VIEW public.v_conversation_detail AS
SELECT
  c.id                  AS conversation_id,
  c.title,
  c.file_name,
  c.file_type,
  c.status,
  c.duration_seconds,
  c.call_date,
  c.created_at,
  a.full_name           AS agent_name,
  a.department          AS agent_department,
  u.full_name           AS uploaded_by,
  ar.overall_score,
  ar.overall_sentiment,
  ar.summary,
  (SELECT COUNT(*) FROM public.mistakes m WHERE m.analysis_id = ar.id)           AS mistake_count,
  (SELECT COUNT(*) FROM public.risks r WHERE r.analysis_id = ar.id)              AS risk_count,
  (SELECT COUNT(*) FROM public.mistakes m WHERE m.analysis_id = ar.id AND m.severity IN ('high', 'critical')) AS critical_mistake_count
FROM public.conversations c
LEFT JOIN public.agents a              ON a.id = c.agent_id
LEFT JOIN public.users u               ON u.id = c.user_id
LEFT JOIN public.analysis_results ar   ON ar.conversation_id = c.id;

-- Risk summary view
CREATE OR REPLACE VIEW public.v_risk_summary AS
SELECT
  r.risk_type,
  r.severity,
  COUNT(*)              AS total_count,
  COUNT(CASE WHEN r.is_resolved THEN 1 END) AS resolved_count,
  COUNT(CASE WHEN NOT r.is_resolved THEN 1 END) AS unresolved_count
FROM public.risks r
GROUP BY r.risk_type, r.severity;

-- ────────────────────────────────────────────────────────────
-- 16. SUPABASE AUTH HOOK
--     Auto-create a user profile row on signup
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
