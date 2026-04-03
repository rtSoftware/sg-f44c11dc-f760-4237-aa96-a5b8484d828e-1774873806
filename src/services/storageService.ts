import { supabase } from "@/integrations/supabase/client";

const BUCKET_NAME = "portadas";

/**
 * Configuración del bucket de portadas
 * - Público para permitir acceso directo a las imágenes
 * - Tamaño máximo: 5MB
 * - Tipos permitidos: image/jpeg, image/png, image/webp
 */

/**
 * Subir una imagen de portada a Supabase Storage
 * @param file - Archivo de imagen a subir
 * @param userId - ID del usuario que sube la imagen
 * @returns URL pública de la imagen subida o error
 */
export async function uploadPortada(
  file: File,
  userId: string
): Promise<{ url: string | null; error: Error | null }> {
  try {
    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return {
        url: null,
        error: new Error("Tipo de archivo no permitido. Usa JPG, PNG o WebP.")
      };
    }

    // Validar tamaño (5MB máximo)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > maxSize) {
      return {
        url: null,
        error: new Error("El archivo es demasiado grande. Máximo 5MB.")
      };
    }

    // Generar nombre único para el archivo
    const fileExt = file.name.split(".").pop();
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileName = `${userId}/${timestamp}_${randomStr}.${fileExt}`;

    console.log("Uploading portada:", fileName);

    // Subir archivo a Storage
    const { data, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw uploadError;
    }

    console.log("Upload successful:", data);

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    console.log("Public URL:", urlData.publicUrl);

    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    console.error("Error uploading portada:", error);
    return { url: null, error: error as Error };
  }
}

/**
 * Eliminar una imagen de portada de Supabase Storage
 * @param url - URL de la imagen a eliminar
 * @returns Éxito o error
 */
export async function deletePortada(
  url: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Extraer el path del archivo de la URL
    const urlParts = url.split(`/${BUCKET_NAME}/`);
    if (urlParts.length !== 2) {
      return {
        success: false,
        error: new Error("URL de portada inválida")
      };
    }

    const filePath = urlParts[1];
    console.log("Deleting portada:", filePath);

    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      throw deleteError;
    }

    console.log("Delete successful");
    return { success: true, error: null };
  } catch (error) {
    console.error("Error deleting portada:", error);
    return { success: false, error: error as Error };
  }
}

/**
 * Crear el bucket de portadas si no existe
 * Esta función debe ejecutarse una vez durante la configuración inicial
 */
export async function initializePortadasBucket(): Promise<{ success: boolean; error: Error | null }> {
  try {
    // Verificar si el bucket ya existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      throw listError;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME);

    if (bucketExists) {
      console.log("Bucket 'portadas' already exists");
      return { success: true, error: null };
    }

    // Crear bucket público
    const { data, error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"]
    });

    if (createError) {
      throw createError;
    }

    console.log("Bucket 'portadas' created successfully:", data);
    return { success: true, error: null };
  } catch (error) {
    console.error("Error initializing portadas bucket:", error);
    return { success: false, error: error as Error };
  }
}