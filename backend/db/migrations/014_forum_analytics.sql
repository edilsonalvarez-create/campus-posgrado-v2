-- Fase 3 — Foro por asignatura, revisión por pares y vista de dificultad.

CREATE TABLE IF NOT EXISTS forum_threads (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id  uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  author_id  uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title      text NOT NULL,
  body       text NOT NULL,
  pinned     boolean NOT NULL DEFAULT false,
  locked     boolean NOT NULL DEFAULT false,
  anchor     boolean NOT NULL DEFAULT false,   -- hilo ancla sembrado (FAQ, errores comunes)
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS forum_posts (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id      uuid NOT NULL REFERENCES forum_threads(id) ON DELETE CASCADE,
  author_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_post_id uuid REFERENCES forum_posts(id) ON DELETE CASCADE,
  body           text NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_forum_threads_course ON forum_threads(course_id, pinned DESC, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_thread ON forum_posts(thread_id, created_at);

CREATE TABLE IF NOT EXISTS peer_reviews (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  reviewer_id   uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rubric_slug   text NOT NULL,
  scores        jsonb NOT NULL DEFAULT '[]'::jsonb,   -- [{key, levelPoints, comment}]
  comment       text NOT NULL DEFAULT '',
  status        text NOT NULL DEFAULT 'assigned',      -- 'assigned' | 'submitted'
  assigned_at   timestamptz NOT NULL DEFAULT now(),
  submitted_at  timestamptz,
  UNIQUE (submission_id, reviewer_id)
);
CREATE INDEX IF NOT EXISTS idx_peer_reviews_reviewer ON peer_reviews(reviewer_id, status);

-- Vista de dificultad por recurso (se refresca en el job de arranque + cada 30 min).
CREATE MATERIALIZED VIEW IF NOT EXISTS resource_difficulty AS
  SELECT r.id AS resource_id, m.course_id,
         count(*) FILTER (WHERE e.event_type = 'exam_submit')                              AS exam_submits,
         count(*) FILTER (WHERE e.event_type = 'exam_fail')                                AS exam_fails,
         avg((e.payload->>'score')::numeric) FILTER (WHERE e.event_type IN ('exam_submit','exam_fail')) AS avg_score
    FROM resources r
    JOIN modules m ON m.id = r.module_id
    LEFT JOIN learning_events e ON e.resource_id = r.id
   GROUP BY r.id, m.course_id;
CREATE UNIQUE INDEX IF NOT EXISTS idx_resource_difficulty ON resource_difficulty(resource_id);
