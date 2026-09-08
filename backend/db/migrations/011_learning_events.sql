-- Fase 1 — Registro de eventos de aprendizaje (base de la analítica de Fase 3).
-- El motor de exámenes y el frontend escriben aquí; la vista de dificultad y el
-- panel del instructor se añaden en Fase 3.

CREATE TABLE IF NOT EXISTS learning_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id   uuid REFERENCES courses(id) ON DELETE SET NULL,
  resource_id uuid REFERENCES resources(id) ON DELETE SET NULL,
  event_type  text NOT NULL,
  payload     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_learning_events_res  ON learning_events(resource_id, event_type);
CREATE INDEX IF NOT EXISTS idx_learning_events_user ON learning_events(user_id, created_at DESC);
