-- Crear el bucket de portadas si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portadas',
  'portadas',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Eliminar políticas existentes si hay conflicto
DROP POLICY IF EXISTS "public_read_portadas" ON storage.objects;
DROP POLICY IF EXISTS "auth_upload_portadas" ON storage.objects;
DROP POLICY IF EXISTS "auth_update_portadas" ON storage.objects;
DROP POLICY IF EXISTS "auth_delete_portadas" ON storage.objects;

-- Permitir lectura pública de portadas
CREATE POLICY "public_read_portadas" ON storage.objects 
FOR SELECT USING (
  bucket_id = 'portadas'
);

-- Permitir a usuarios autenticados subir portadas
CREATE POLICY "auth_upload_portadas" ON storage.objects 
FOR INSERT WITH CHECK (
  bucket_id = 'portadas' 
  AND auth.uid() IS NOT NULL
);

-- Permitir a usuarios autenticados actualizar sus propias portadas
CREATE POLICY "auth_update_portadas" ON storage.objects 
FOR UPDATE USING (
  bucket_id = 'portadas' 
  AND auth.uid() IS NOT NULL
);

-- Permitir a usuarios autenticados eliminar sus propias portadas
CREATE POLICY "auth_delete_portadas" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'portadas' 
  AND auth.uid() IS NOT NULL
);