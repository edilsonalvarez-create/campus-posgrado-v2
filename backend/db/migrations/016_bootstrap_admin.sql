-- Crea (o promueve) la primera cuenta de administrador de la plataforma.
-- No existía ningún usuario con role='admin' en producción: sin uno, los
-- endpoints /api/admin/reseed, /api/admin/users y la asignación de director
-- de TFM son inalcanzables por API. Se aplica una sola vez (tabla
-- _migrations); si el correo ya existía (por ejemplo, autoregistrado como
-- estudiante), solo se promueve su rol y se conserva su contraseña actual.
--
-- Contraseña inicial entregada al usuario fuera de este archivo (por chat),
-- nunca en texto plano en el repositorio. Hash legado sha256 (mismo patrón
-- que los usuarios de servicio de db/seed.js); se re-hashea a scrypt
-- automáticamente en el primer login exitoso.
INSERT INTO users (email, name, password_hash, role)
VALUES (
  'edilson.alvarez@sumimedical.com',
  'Edilson Alvarez',
  'af796ed0694816f31f58e32033f502c095fc15622d2d6f69dcbde41ac6f08179',
  'admin'
)
ON CONFLICT (email) DO UPDATE SET role = 'admin';
