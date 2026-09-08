-- Referencia interna de asignatura del Máster IEP — red de seguridad para el seed.
--
-- Contexto (auditoría 2026-09-08): el documento oficial del IEP NO publica una clave
-- de catálogo por asignatura. Lo único oficial es el RVOE del programa (acuerdo SEP
-- México nº 20250986) y los ECTS por asignatura. Los valores `2702799xxxxxx` que se
-- sembraron como `meta.officialCode` en I–XI eran un error de extracción: coordenadas
-- de posición (EMU) de las líneas decorativas del .docx. Esta migración:
--   1) limpia esos valores espurios,
--   2) garantiza que las 12 asignaturas (I–XI + TFM) queden con una referencia interna
--      consistente `IEP-<numeral>-INTERNO` cuando el seed aún no la haya puesto.
-- El seed (db/seed.js) es la fuente de verdad y admite override por entorno
-- OFFICIAL_CODE_<numeral> si el IEP facilita la clave real.

-- 1. Quitar los officialCode espurios (patrón 2702799 seguido de 6 dígitos).
UPDATE courses
   SET meta = meta - 'officialCode'
 WHERE meta->>'programSlug' = 'master-iep'
   AND meta->>'officialCode' ~ '^2702799[0-9]{6}$';

-- 2. Backfill de referencia interna para las 12 asignaturas si está vacía.
UPDATE courses
   SET meta = jsonb_set(
                jsonb_set(meta, '{internalCode}', to_jsonb(v.code::text), true),
                '{officialCode}', to_jsonb(v.code::text), true)
  FROM (VALUES
    ('master-i',    'IEP-I-INTERNO'),
    ('master-ii',   'IEP-II-INTERNO'),
    ('master-iii',  'IEP-III-INTERNO'),
    ('master-iv',   'IEP-IV-INTERNO'),
    ('master-v',    'IEP-V-INTERNO'),
    ('master-vi',   'IEP-VI-INTERNO'),
    ('master-vii',  'IEP-VII-INTERNO'),
    ('master-viii', 'IEP-VIII-INTERNO'),
    ('master-ix',   'IEP-IX-INTERNO'),
    ('master-x',    'IEP-X-INTERNO'),
    ('master-xi',   'IEP-XI-INTERNO'),
    ('master-tfm',  'IEP-TFM-INTERNO')
  ) AS v(slug, code)
 WHERE courses.slug = v.slug
   AND COALESCE(NULLIF(courses.meta->>'officialCode', ''), '') = '';
