-- Fase 1 — Motor de intentos de examen: límite de intentos, cooldown y sorteo.
-- Sustituye a quiz_responses para los recursos type='exam'. quiz_responses se
-- conserva intacto para los datos ya registrados.

CREATE TABLE IF NOT EXISTS exam_attempts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_id  uuid NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  attempt_no   int  NOT NULL,
  question_ids jsonb NOT NULL,               -- item_bank_questions.id[] sorteados para este intento
  answers      jsonb NOT NULL DEFAULT '[]'::jsonb,
  score        numeric(5,2),
  passed       boolean,
  status       text NOT NULL DEFAULT 'in_progress',  -- 'in_progress'|'submitted'|'expired'
  started_at   timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  expires_at   timestamptz NOT NULL,
  UNIQUE (user_id, resource_id, attempt_no)
);

CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_res
  ON exam_attempts(user_id, resource_id, submitted_at DESC);

-- Dominio de un estudiante por concepto (contenidoOficial). Alimenta el repaso
-- dirigido tras un examen suspenso y la analítica de dificultad (Fase 3).
CREATE TABLE IF NOT EXISTS skill_mastery (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id  uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  skill_tag  text NOT NULL,
  correct    int NOT NULL DEFAULT 0,
  total      int NOT NULL DEFAULT 0,
  last_seen  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id, skill_tag)
);
