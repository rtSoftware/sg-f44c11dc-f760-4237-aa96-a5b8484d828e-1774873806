-- 1. Eliminar la política restrictiva actual
DROP POLICY IF EXISTS "update_books_in_same_casa" ON libro;

-- 2. Crear nueva política que permite mover libros entre casas
CREATE POLICY "authenticated_users_can_update_books" ON libro
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);