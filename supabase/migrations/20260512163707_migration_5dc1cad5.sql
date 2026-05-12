-- Eliminar todas las políticas restrictivas de la tabla mensajes
DROP POLICY IF EXISTS "auth_read" ON mensajes;
DROP POLICY IF EXISTS "auth_update" ON mensajes;
DROP POLICY IF EXISTS "public_insert" ON mensajes;

-- Crear política pública para insertar (CUALQUIERA puede enviar mensajes)
CREATE POLICY "anon_insert" ON mensajes 
  FOR INSERT 
  WITH CHECK (true);

-- Solo usuarios autenticados pueden leer mensajes
CREATE POLICY "auth_read" ON mensajes 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Solo usuarios autenticados pueden actualizar mensajes
CREATE POLICY "auth_update" ON mensajes 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

-- Solo usuarios autenticados pueden eliminar mensajes
CREATE POLICY "auth_delete" ON mensajes 
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);