-- Fase 0 — Rúbricas de evaluación (tablas; se pueblan desde seed-data/rubrics.js)
-- La columna grades.rubric jsonb ya existe (001_init.sql). Aquí se añaden las
-- tablas de definición de rúbrica y dos columnas de trazabilidad en grades.

CREATE TABLE IF NOT EXISTS rubrics (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug           text UNIQUE NOT NULL,
  version        int  NOT NULL DEFAULT 1,
  title          text NOT NULL,
  scope          text NOT NULL DEFAULT 'asignatura',   -- 'asignatura' | 'tfm-milestone' | 'peer'
  pass_threshold numeric(5,2) NOT NULL DEFAULT 70,
  total_points   numeric(6,2) NOT NULL DEFAULT 100,
  meta           jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rubric_criteria (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rubric_id    uuid NOT NULL REFERENCES rubrics(id) ON DELETE CASCADE,
  order_index  int  NOT NULL DEFAULT 0,
  key          text NOT NULL,
  title        text NOT NULL,
  description  text NOT NULL DEFAULT '',
  weight       numeric(5,2) NOT NULL DEFAULT 1,       -- puntos en el nivel máximo
  UNIQUE (rubric_id, key)
);

CREATE TABLE IF NOT EXISTS rubric_levels (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  criterion_id uuid NOT NULL REFERENCES rubric_criteria(id) ON DELETE CASCADE,
  order_index  int  NOT NULL DEFAULT 0,               -- 0 = nivel más bajo
  label        text NOT NULL,
  points       numeric(5,2) NOT NULL,
  descriptor   text NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_rubric_criteria_rubric ON rubric_criteria(rubric_id, order_index);
CREATE INDEX IF NOT EXISTS idx_rubric_levels_criterion ON rubric_levels(criterion_id, order_index);

ALTER TABLE grades ADD COLUMN IF NOT EXISTS rubric_slug     text;
ALTER TABLE grades ADD COLUMN IF NOT EXISTS llm_suggestion  jsonb;
