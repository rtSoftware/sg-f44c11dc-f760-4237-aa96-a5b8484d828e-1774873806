-- Agregar columna user_memo a la tabla profiles para guardar configuraciones del usuario
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS user_memo JSONB DEFAULT '{}'::jsonb;

-- Comentario explicativo
COMMENT ON COLUMN profiles.user_memo IS 'Configuraciones personales del usuario como dashboard_bg';