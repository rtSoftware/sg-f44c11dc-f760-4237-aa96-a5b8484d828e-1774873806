-- Agregar columnas faltantes a la tabla libro
ALTER TABLE libro 
ADD COLUMN IF NOT EXISTS autor TEXT,
ADD COLUMN IF NOT EXISTS portada_url TEXT;