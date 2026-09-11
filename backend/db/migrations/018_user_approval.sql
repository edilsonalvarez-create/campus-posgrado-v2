-- Aprobación de cuentas autorregistradas. Hasta ahora cualquier persona que
-- se registraba desde /register quedaba con acceso inmediato a TODO el
-- contenido publicado (ver el fix de acceso en loadCourseDetail, en el mismo
-- commit): no había ninguna comprobación de matrícula antes de servir el
-- contenido real de una lección. `status` cierra la mitad "cuenta" del
-- problema: una cuenta autorregistrada nace 'pending' y no obtiene acceso
-- hasta que un administrador la aprueba (y decide en qué se matricula).
--
-- Todas las filas existentes quedan 'active' (ninguna cuenta ya creada pierde
-- acceso por este cambio; el administrador puede revisar manualmente, desde
-- el panel, las que se autorregistraron antes de este fix si quiere revocarlas).
ALTER TABLE users ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
  CHECK (status IN ('pending', 'active'));
