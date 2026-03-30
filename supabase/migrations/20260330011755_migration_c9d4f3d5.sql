-- Crear política para permitir a usuarios autenticados actualizar casas
CREATE POLICY "Authenticated users can update casas"
ON casas
FOR UPDATE
TO public
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);