-- Tokens de un solo uso para el flujo de "olvidé mi contraseña", disponible
-- para cualquier rol. Se guarda el hash del token (sha256), nunca el valor
-- en claro que viaja en el enlace de correo, para que una fuga de la base de
-- datos no habilite restablecer contraseñas de terceros.
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  text NOT NULL UNIQUE,
  expires_at  timestamptz NOT NULL,
  used_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
