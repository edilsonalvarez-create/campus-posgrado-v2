-- Fase 1 — Red de seguridad para officialCode de las asignaturas V, VIII y TFM
-- (meta.officialCode era null). El valor real lo inyecta el seed desde
-- OFFICIAL_CODE_V / OFFICIAL_CODE_VIII / OFFICIAL_CODE_TFM; si no están, el seed
-- pone un marcador interno. Esta migración solo garantiza que ninguna fila de
-- producción quede con officialCode nulo tras el arranque, sin pisar un valor ya puesto.

UPDATE courses
   SET meta = jsonb_set(meta, '{officialCode}', to_jsonb(v.code::text), true)
  FROM (VALUES
    ('master-v',    'IEP-V-INTERNO'),
    ('master-viii', 'IEP-VIII-INTERNO'),
    ('master-tfm',  'IEP-TFM-INTERNO')
  ) AS v(slug, code)
 WHERE courses.slug = v.slug
   AND COALESCE(NULLIF(courses.meta->>'officialCode', ''), '') = '';
