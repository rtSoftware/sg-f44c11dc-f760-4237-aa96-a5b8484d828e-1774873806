-- Crear tabla notas
CREATE TABLE notas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  casa_id UUID NOT NULL REFERENCES casas(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Campos propios de la tabla
  origen TEXT NOT NULL, -- Texto seleccionado del libro (contexto)
  nota TEXT NOT NULL, -- Contenido de la nota del usuario
  libro_id UUID NOT NULL REFERENCES libro(id) ON DELETE CASCADE -- Referencia al capítulo del libro
);

-- Crear índices para optimización
CREATE INDEX idx_notas_user_id ON notas(user_id);
CREATE INDEX idx_notas_casa_id ON notas(casa_id);
CREATE INDEX idx_notas_libro_id ON notas(libro_id);

-- Habilitar RLS
ALTER TABLE notas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
-- Usuarios pueden ver sus propias notas dentro de su casa
CREATE POLICY "Users can view their own notas in their casa" 
  ON notas FOR SELECT 
  USING (auth.uid() = user_id AND casa_id IN (SELECT casa_id FROM profiles WHERE id = auth.uid()));

-- Usuarios pueden insertar sus propias notas
CREATE POLICY "Users can insert their own notas" 
  ON notas FOR INSERT 
  WITH CHECK (auth.uid() = user_id AND casa_id IN (SELECT casa_id FROM profiles WHERE id = auth.uid()));

-- Usuarios pueden actualizar sus propias notas
CREATE POLICY "Users can update their own notas" 
  ON notas FOR UPDATE 
  USING (auth.uid() = user_id);

-- Usuarios pueden eliminar sus propias notas
CREATE POLICY "Users can delete their own notas" 
  ON notas FOR DELETE 
  USING (auth.uid() = user_id);

-- Comentarios para documentación
COMMENT ON TABLE notas IS 'Tabla para almacenar notas de usuarios sobre fragmentos de texto de los libros';
COMMENT ON COLUMN notas.origen IS 'Texto seleccionado del libro que origina la nota (contexto)';
COMMENT ON COLUMN notas.nota IS 'Contenido de la nota escrita por el usuario';
COMMENT ON COLUMN notas.libro_id IS 'Referencia al capítulo del libro del que proviene el texto';