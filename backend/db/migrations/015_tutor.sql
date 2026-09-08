-- Fase 4 — Tutor socrático por lección (chat anclado en el contenido).

CREATE TABLE IF NOT EXISTS tutor_threads (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, resource_id)
);

CREATE TABLE IF NOT EXISTS tutor_messages (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id  uuid NOT NULL REFERENCES tutor_threads(id) ON DELETE CASCADE,
  role       text NOT NULL,          -- 'user' | 'assistant' | 'system-refusal'
  content    text NOT NULL,
  flagged    boolean NOT NULL DEFAULT false,  -- intento de extraer respuestas de examen
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tutor_messages_thread ON tutor_messages(thread_id, created_at);
