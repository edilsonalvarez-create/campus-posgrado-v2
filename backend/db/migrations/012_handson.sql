-- Fase 2 — Entregas hands-on (tracks computacionales III/VI/IX/X) y del TFM.
-- Sin blobs en Postgres: los artefactos son URLs externas (GitHub, Colab, Kaggle,
-- Drive). submission_files.storage deja la puerta abierta a un blob store futuro.

ALTER TABLE submissions ADD COLUMN IF NOT EXISTS kind     text NOT NULL DEFAULT 'text'; -- 'text' | 'handson' | 'tfm'
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS repo_url text;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS meta     jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS submission_files (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  label         text NOT NULL,                 -- 'Notebook', 'Model card', 'Informe', 'Demo'
  file_type     text NOT NULL DEFAULT 'link',  -- 'link'|'notebook'|'pdf'|'repo'|'dataset'|'video'
  url           text NOT NULL,
  storage       text NOT NULL DEFAULT 'external',
  sha256        text,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_submission_files_sub ON submission_files(submission_id);
