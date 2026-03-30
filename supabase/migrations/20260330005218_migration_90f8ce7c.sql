-- Función que crea automáticamente un perfil cuando se registra un usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_casa_id UUID;
  v_email TEXT;
BEGIN
  -- Obtener el email del nuevo usuario
  v_email := NEW.email;
  
  -- Obtener el casa_id desde user_metadata si existe
  v_casa_id := (NEW.raw_user_meta_data->>'casa_id')::UUID;
  
  -- Si no hay casa_id en metadata, buscar la casa por el dominio del email
  IF v_casa_id IS NULL AND v_email IS NOT NULL THEN
    -- Extraer dominio del email
    SELECT id INTO v_casa_id
    FROM casas
    WHERE casa_nombre = split_part(v_email, '@', 2)
    LIMIT 1;
  END IF;
  
  -- Si aún no hay casa_id, obtener la primera casa disponible
  IF v_casa_id IS NULL THEN
    SELECT id INTO v_casa_id
    FROM casas
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;
  
  -- Insertar el nuevo perfil
  INSERT INTO public.profiles (id, email, casa_id, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    v_email,
    v_casa_id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(v_email, '@', 1)),
    NOW(),
    NOW()
  );
  
  RETURN NEW;
END;
$$;

-- Crear el trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Comentarios
COMMENT ON FUNCTION public.handle_new_user() IS 'Crea automáticamente un perfil en la tabla profiles cuando se registra un nuevo usuario en auth.users';