-- Eliminar TODAS las políticas de UPDATE existentes
DROP POLICY IF EXISTS "Users can update their own libro" ON libro;
DROP POLICY IF EXISTS "update_shared_house_books" ON libro;

-- Crear nueva política: CUALQUIER usuario autenticado de la misma casa puede editar CUALQUIER libro
CREATE POLICY "update_books_in_same_casa" ON libro
  FOR UPDATE
  TO authenticated
  USING (
    casa_id IN (
      SELECT casa_id 
      FROM profiles 
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    casa_id IN (
      SELECT casa_id 
      FROM profiles 
      WHERE id = auth.uid()
    )
  );