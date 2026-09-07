-- Fase 1 — Reanudar donde quedó + fecha de revisión de contenido.

CREATE TABLE IF NOT EXISTS resume_positions (
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id   uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, course_id)
);

ALTER TABLE resources ADD COLUMN IF NOT EXISTS revised_at    date;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS revision_note text;
