-- Fase 0 — Claves estables para siembra idempotente NO destructiva.
-- El seed dejará de hacer TRUNCATE; en su lugar hace upsert por:
--   courses  -> slug (ya UNIQUE en 001)
--   modules  -> (course_id, stable_key)
--   resources-> (module_id, stable_key)
-- Backfill de filas de producción existentes desde order_index, con el MISMO
-- esquema que usará el seed refactorizado ('m'||order_index, 'r'||order_index),
-- de modo que catálogo sembrado y catálogo en prod quedan alineados sin recrear
-- ninguna fila (los UUID de resources/courses se conservan -> el progreso, las
-- entregas, las notas y los certificados de los estudiantes siguen siendo válidos).

ALTER TABLE modules   ADD COLUMN IF NOT EXISTS stable_key text;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS stable_key text;

UPDATE modules   SET stable_key = 'm' || order_index WHERE stable_key IS NULL;
UPDATE resources SET stable_key = 'r' || order_index WHERE stable_key IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_modules_course_stable
  ON modules(course_id, stable_key) WHERE stable_key IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_resources_module_stable
  ON resources(module_id, stable_key) WHERE stable_key IS NOT NULL;

-- Fila canónica del programa: contenedor para certificados de tramo y de programa.
-- kind='program' pero SIN meta.programSlug -> no aparece en GET /api/programs/master-iep
-- (que filtra por meta->>'programSlug'); no publicado -> no sale en el catálogo.
INSERT INTO courses (slug, kind, title, description, published, meta, order_index)
VALUES (
  'master-iep', 'program',
  'Máster en Inteligencia Artificial y Tecnologías Disruptivas para la Innovación en la Industria 4.0',
  'Contenedor del programa: agrupa las 11 asignaturas + TFM y emite los certificados de tramo y de programa.',
  false,
  '{"isProgramContainer": true}'::jsonb,
  0
)
ON CONFLICT (slug) DO NOTHING;
