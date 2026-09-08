-- Fase 2 — Proceso del TFM: 4 hitos con rúbrica, subida de artefactos + vídeo de
-- defensa, y flujo de director (rol director_tfm o instructor).

CREATE TABLE IF NOT EXISTS tfm_milestones (
  slug           text PRIMARY KEY,
  order_index    int  NOT NULL,
  title          text NOT NULL,
  description    text NOT NULL DEFAULT '',
  rubric_slug    text NOT NULL,
  weight         numeric(5,2) NOT NULL,   -- % de la nota del TFM
  requires_video boolean NOT NULL DEFAULT false,
  template_url   text
);

CREATE TABLE IF NOT EXISTS tfm_enrollments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  director_id uuid REFERENCES users(id) ON DELETE SET NULL,
  title       text,
  status      text NOT NULL DEFAULT 'draft', -- 'draft'|'in_progress'|'defended'|'passed'|'failed'
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS tfm_milestone_submissions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tfm_id         uuid NOT NULL REFERENCES tfm_enrollments(id) ON DELETE CASCADE,
  milestone_slug text NOT NULL REFERENCES tfm_milestones(slug),
  submission_id  uuid NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  defense_video_url text,
  status         text NOT NULL DEFAULT 'submitted', -- 'submitted'|'changes_requested'|'approved'
  director_note  text,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tfm_id, milestone_slug)
);
