-- Eliminar política incorrecta
DROP POLICY IF EXISTS "update_shared_house_books" ON libro;

-- Crear política correcta que permite UPDATE a:
-- 1. El creador del libro (user_id = auth.uid())
-- 2. El dueño de la casa donde está el libro
CREATE POLICY "update_shared_house_books" ON libro
FOR UPDATE TO authenticated
USING (
  (auth.uid() = user_id) OR 
  (casa_id IN (SELECT id FROM casas WHERE user_id = auth.uid()))
)
WITH CHECK (
  (auth.uid() = user_id) OR 
  (casa_id IN (SELECT id FROM casas WHERE user_id = auth.uid()))
);