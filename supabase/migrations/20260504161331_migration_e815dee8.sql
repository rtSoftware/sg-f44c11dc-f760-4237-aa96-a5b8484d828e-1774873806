-- Eliminar TODAS las políticas RLS de la tabla quiz
DROP POLICY IF EXISTS "public_read" ON quiz;
DROP POLICY IF EXISTS "auth_insert" ON quiz;
DROP POLICY IF EXISTS "auth_update" ON quiz;
DROP POLICY IF EXISTS "auth_delete" ON quiz;

-- Eliminar TODAS las políticas RLS de la tabla quiz_pregunta
DROP POLICY IF EXISTS "public_read" ON quiz_pregunta;
DROP POLICY IF EXISTS "auth_insert" ON quiz_pregunta;
DROP POLICY IF EXISTS "auth_update" ON quiz_pregunta;
DROP POLICY IF EXISTS "auth_delete" ON quiz_pregunta;

-- Crear política de acceso público TOTAL para quiz
CREATE POLICY "public_all_access" ON quiz FOR ALL USING (true) WITH CHECK (true);

-- Crear política de acceso público TOTAL para quiz_pregunta
CREATE POLICY "public_all_access" ON quiz_pregunta FOR ALL USING (true) WITH CHECK (true);