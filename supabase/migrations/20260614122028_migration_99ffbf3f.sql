ALTER TABLE libro ADD COLUMN quiz TEXT NULL;

COMMENT ON COLUMN libro.quiz IS 'Código HTML del quiz para desplegar en la aplicación';