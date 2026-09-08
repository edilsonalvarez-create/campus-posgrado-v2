-- Fase 0 — Roles preparados para cohorte real + sal de contraseña.
-- Amplía el CHECK de users.role con 'director_tfm' (dirección de TFM) sin
-- romper las filas existentes. Añade password_salt para migrar de SHA-256 sin
-- sal a scrypt en el próximo login exitoso (lectura dual en simple-server.js).

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('student', 'instructor', 'director_tfm', 'admin'));

ALTER TABLE users ADD COLUMN IF NOT EXISTS password_salt text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_algo text NOT NULL DEFAULT 'sha256';
