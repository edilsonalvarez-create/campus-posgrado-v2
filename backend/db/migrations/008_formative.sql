-- Fase 1 — Persistencia del quiz formativo + entrega de la actividad de lección.
-- El "Marcar como completada" autoinformado se sustituye por: actividad entregada
-- AND quiz formativo aprobado (umbral en content_json.formativeThreshold, def. 0.6).

CREATE TABLE IF NOT EXISTS formative_responses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  answers     jsonb NOT NULL DEFAULT '[]'::jsonb,   -- [{i, choice}]
  score       numeric(5,2) NOT NULL,
  max_score   numeric(5,2) NOT NULL,
  passed      boolean NOT NULL,
  attempts    int NOT NULL DEFAULT 1,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, resource_id)
);

CREATE TABLE IF NOT EXISTS activity_submissions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  content     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, resource_id)
);

CREATE INDEX IF NOT EXISTS idx_formative_user ON formative_responses(user_id);
