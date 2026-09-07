-- Fase 0 — Desacoplar el certificado de un único examen de opción múltiple.
-- Un certificado pasa a tener 'kind' (asignatura | tramo | programa) y un
-- snapshot 'requirements' de lo que se cumplió para emitirlo.
-- El UNIQUE(user_id, course_id) se sustituye por UNIQUE(user_id, course_id, kind)
-- para poder emitir el certificado de tramo/programa sobre la fila canónica.

ALTER TABLE certificates ADD COLUMN IF NOT EXISTS kind         text NOT NULL DEFAULT 'asignatura';
ALTER TABLE certificates ADD COLUMN IF NOT EXISTS requirements jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE certificates DROP CONSTRAINT IF EXISTS certificates_user_id_course_id_key;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'certificates_user_course_kind_key'
  ) THEN
    ALTER TABLE certificates
      ADD CONSTRAINT certificates_user_course_kind_key UNIQUE (user_id, course_id, kind);
  END IF;
END $$;
