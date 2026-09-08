-- Fase 1 — Bancos de ítems de aplicación por asignatura.
-- El examen deja de ser una reformulación de los quiz de lección: cada asignatura
-- tiene >=30 ítems de aplicación/caso, y cada intento sortea un subconjunto.
-- Se pueblan desde backend/db/seed-data/item-banks/master-{i..xi}.js

CREATE TABLE IF NOT EXISTS item_banks (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       text UNIQUE NOT NULL,
  title      text NOT NULL,
  scope_slug text NOT NULL,                 -- slug del curso (asignatura) al que pertenece
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS item_bank_questions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_id       uuid NOT NULL REFERENCES item_banks(id) ON DELETE CASCADE,
  ext_key       text NOT NULL,              -- id estable de autoría, p. ej. 'i-app-014'
  stem          text NOT NULL,
  options       jsonb NOT NULL,             -- ["...", "...", "...", "..."]
  correct_index int  NOT NULL,
  explanations  jsonb NOT NULL DEFAULT '[]'::jsonb,  -- 'why' por opción
  difficulty    text NOT NULL DEFAULT 'media',       -- 'baja' | 'media' | 'alta'
  skill_tag     text,                        -- corresponde a un contenidoOficial
  cognitive     text NOT NULL DEFAULT 'aplicacion', -- 'comprension' | 'aplicacion' | 'analisis'
  active        boolean NOT NULL DEFAULT true,
  source        text NOT NULL DEFAULT 'authored',   -- 'authored' | 'llm-reviewed'
  UNIQUE (bank_id, ext_key)
);

CREATE INDEX IF NOT EXISTS idx_bankq_bank ON item_bank_questions(bank_id) WHERE active;
