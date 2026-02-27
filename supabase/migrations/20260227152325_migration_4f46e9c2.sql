-- Crear tabla libro para almacenar contenido de la biblioteca
CREATE TABLE libro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  contenido TEXT NOT NULL,
  categoria TEXT,
  orden INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para búsquedas rápidas por usuario
CREATE INDEX idx_libro_user_id ON libro(user_id);
CREATE INDEX idx_libro_orden ON libro(orden);

-- Habilitar RLS
ALTER TABLE libro ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Los usuarios pueden ver todo el contenido publicado
CREATE POLICY "Anyone can view visible libro content" 
  ON libro FOR SELECT 
  USING (visible = true);

-- Solo el propietario puede insertar
CREATE POLICY "Users can insert their own libro content" 
  ON libro FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Solo el propietario puede actualizar
CREATE POLICY "Users can update their own libro content" 
  ON libro FOR UPDATE 
  USING (auth.uid() = user_id);

-- Solo el propietario puede eliminar
CREATE POLICY "Users can delete their own libro content" 
  ON libro FOR DELETE 
  USING (auth.uid() = user_id);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_libro_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER libro_updated_at_trigger
  BEFORE UPDATE ON libro
  FOR EACH ROW
  EXECUTE FUNCTION update_libro_updated_at();