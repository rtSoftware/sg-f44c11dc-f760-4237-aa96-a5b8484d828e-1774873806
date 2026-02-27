-- Agregar campos de URLs de audio streaming a la tabla libro
ALTER TABLE libro 
ADD COLUMN IF NOT EXISTS audio_https TEXT,
ADD COLUMN IF NOT EXISTS audioAnalisis_https TEXT;

-- Agregar comentarios para documentar los campos
COMMENT ON COLUMN libro.audio_https IS 'URL HTTPS al servidor de streaming para el audio principal del libro';
COMMENT ON COLUMN libro.audioAnalisis_https IS 'URL HTTPS al servidor de streaming para el audio de análisis del libro';