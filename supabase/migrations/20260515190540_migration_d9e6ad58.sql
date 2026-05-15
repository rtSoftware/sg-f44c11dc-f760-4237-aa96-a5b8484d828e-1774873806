-- Crear tabla discursos relacionada con libro
CREATE TABLE discursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  libro_id UUID NOT NULL REFERENCES libro(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para búsquedas rápidas por libro_id
CREATE INDEX idx_discursos_libro_id ON discursos(libro_id);

-- RLS - T2: Public read, authenticated write
ALTER TABLE discursos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_discursos" ON discursos 
  FOR SELECT USING (true);

CREATE POLICY "auth_insert_discursos" ON discursos 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "auth_update_discursos" ON discursos 
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "auth_delete_discursos" ON discursos 
  FOR DELETE USING (auth.uid() IS NOT NULL);