-- Campus Posgrado v2 — esquema inicial
-- PostgreSQL 13+ (gen_random_uuid() en el core)

CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text UNIQUE NOT NULL,
  name          text NOT NULL,
  password_hash text NOT NULL,
  role          text NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'instructor', 'admin')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS courses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text UNIQUE NOT NULL,
  kind          text NOT NULL DEFAULT 'course',
  title         text NOT NULL,
  description   text NOT NULL DEFAULT '',
  image_url     text,
  instructor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  published     boolean NOT NULL DEFAULT true,
  source        text,
  url           text,
  note          text,
  meta          jsonb NOT NULL DEFAULT '{}'::jsonb,
  order_index   int NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS modules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title       text NOT NULL,
  numeral     text,
  subtitle    text,
  meta        jsonb NOT NULL DEFAULT '{}'::jsonb,
  order_index int NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS resources (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id    uuid NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  title        text NOT NULL,
  type         text NOT NULL DEFAULT 'lecture',
  url          text,
  source       text,
  note         text,
  content      text,
  content_json jsonb,
  order_index  int NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS enrollments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id   uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  role        text NOT NULL DEFAULT 'student',
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS progress (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_id  uuid NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  completed    boolean NOT NULL DEFAULT true,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, resource_id)
);

CREATE TABLE IF NOT EXISTS submissions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_id  uuid REFERENCES resources(id) ON DELETE SET NULL,
  course_id    uuid REFERENCES courses(id) ON DELETE SET NULL,
  content      text NOT NULL DEFAULT '',
  status       text NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'graded')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS grades (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid UNIQUE NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  graded_by     uuid REFERENCES users(id) ON DELETE SET NULL,
  score         numeric(5, 2) NOT NULL,
  feedback      text NOT NULL DEFAULT '',
  rubric        jsonb,
  graded_at     timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quiz_responses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  resource_id uuid NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
  answers     jsonb NOT NULL DEFAULT '[]'::jsonb,
  score       numeric(5, 2),
  passed      boolean,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS certificates (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id   uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  course_name text NOT NULL,
  issued_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type       text NOT NULL DEFAULT 'info',
  title      text NOT NULL,
  message    text NOT NULL DEFAULT '',
  read       boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sessions (
  token      text PRIMARY KEY,
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind       text NOT NULL DEFAULT 'access',
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_resources_module ON resources(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_course ON submissions(course_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
