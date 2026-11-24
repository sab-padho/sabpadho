-- Migration: 20261124_005_learner_activity_tables.sql
-- Purpose: Persist learner shelf bookmarks, revision queue, practice sprints, and mock attempts in Supabase

CREATE TABLE IF NOT EXISTS public.saved_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_email text NOT NULL,
  question_id text NOT NULL,
  saved_on text NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (learner_email, question_id)
);

CREATE TABLE IF NOT EXISTS public.revision_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_email text NOT NULL,
  question_id text NOT NULL,
  status text NOT NULL DEFAULT 'due' CHECK (status IN ('due', 'done')),
  source text NOT NULL DEFAULT 'Practice sprint',
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (learner_email, question_id)
);

CREATE TABLE IF NOT EXISTS public.mock_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_email text NOT NULL,
  paper_id text NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  marked text[] NOT NULL DEFAULT ARRAY[]::text[],
  submitted_at bigint NOT NULL,
  time_used_seconds integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (learner_email, paper_id)
);

CREATE TABLE IF NOT EXISTS public.practice_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_email text NOT NULL,
  chapter_id text NOT NULL,
  correct_count integer NOT NULL DEFAULT 0,
  total_count integer NOT NULL DEFAULT 0,
  duration_seconds integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revision_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access saved_questions" ON public.saved_questions;
CREATE POLICY "Public access saved_questions" ON public.saved_questions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access revision_queue" ON public.revision_queue;
CREATE POLICY "Public access revision_queue" ON public.revision_queue FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access mock_attempts" ON public.mock_attempts;
CREATE POLICY "Public access mock_attempts" ON public.mock_attempts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access practice_attempts" ON public.practice_attempts;
CREATE POLICY "Public access practice_attempts" ON public.practice_attempts FOR ALL USING (true) WITH CHECK (true);
