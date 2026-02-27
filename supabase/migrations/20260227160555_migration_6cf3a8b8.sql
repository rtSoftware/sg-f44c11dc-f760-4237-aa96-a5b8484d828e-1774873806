-- 1. Crear tabla casas
CREATE TABLE casas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  casa_nombre TEXT NOT NULL UNIQUE,
  casa_memo JSONB DEFAULT '{}'::jsonb
);

-- 2. Habilitar RLS en casas
ALTER TABLE casas ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Todos pueden leer casas
CREATE POLICY "Anyone can view casas"
  ON casas FOR SELECT
  USING (true);

-- 4. Policy: Solo administradores pueden crear casas (por ahora permitir a usuarios autenticados)
CREATE POLICY "Authenticated users can insert casas"
  ON casas FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 5. Agregar casa_id a tabla profiles
ALTER TABLE profiles 
ADD COLUMN casa_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;

-- 6. Agregar foreign key en profiles
ALTER TABLE profiles
ADD CONSTRAINT profiles_casa_id_fkey 
FOREIGN KEY (casa_id) REFERENCES casas(id) ON DELETE CASCADE;

-- 7. Crear índice en profiles.casa_id
CREATE INDEX idx_profiles_casa_id ON profiles(casa_id);

-- 8. Agregar casa_id a tabla libro
ALTER TABLE libro 
ADD COLUMN casa_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000000'::uuid;

-- 9. Agregar foreign key en libro
ALTER TABLE libro
ADD CONSTRAINT libro_casa_id_fkey 
FOREIGN KEY (casa_id) REFERENCES casas(id) ON DELETE CASCADE;

-- 10. Crear índice en libro.casa_id
CREATE INDEX idx_libro_casa_id ON libro(casa_id);

-- 11. Actualizar RLS policies de profiles para filtrar por casa_id
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Profiles viewable within same casa"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile in their casa"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 12. Actualizar RLS policies de libro para filtrar por casa_id
DROP POLICY IF EXISTS "Anyone can view visible libro content" ON libro;
DROP POLICY IF EXISTS "Users can insert their own libro content" ON libro;
DROP POLICY IF EXISTS "Users can update their own libro content" ON libro;
DROP POLICY IF EXISTS "Users can delete their own libro content" ON libro;

CREATE POLICY "Libro content viewable within same casa"
  ON libro FOR SELECT
  USING (visible = true);

CREATE POLICY "Users can insert libro in their casa"
  ON libro FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own libro"
  ON libro FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own libro"
  ON libro FOR DELETE
  USING (auth.uid() = user_id);