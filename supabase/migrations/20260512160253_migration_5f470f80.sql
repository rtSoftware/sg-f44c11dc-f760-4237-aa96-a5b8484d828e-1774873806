-- Crear tabla mensajes para formulario de contacto
CREATE TABLE mensajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  mensaje TEXT NOT NULL,
  dir_ip TEXT,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  leido BOOLEAN DEFAULT false,
  respondido BOOLEAN DEFAULT false,
  notas_admin TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserción pública (formulario de contacto)
CREATE POLICY "public_insert_mensajes" ON mensajes 
  FOR INSERT 
  WITH CHECK (true);

-- Política para lectura (solo usuarios autenticados pueden leer)
CREATE POLICY "auth_read_mensajes" ON mensajes 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Política para actualización (solo usuarios autenticados pueden actualizar)
CREATE POLICY "auth_update_mensajes" ON mensajes 
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

-- Crear índices para búsquedas eficientes
CREATE INDEX idx_mensajes_fecha ON mensajes(fecha DESC);
CREATE INDEX idx_mensajes_leido ON mensajes(leido);
CREATE INDEX idx_mensajes_email ON mensajes(email);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_mensajes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_mensajes_updated_at
  BEFORE UPDATE ON mensajes
  FOR EACH ROW
  EXECUTE FUNCTION update_mensajes_updated_at();