import { supabase } from "@/integrations/supabase/client";

const BUCKET_NAME = "portadas";
const MAX_SIZE = 5 * 1024 * 1024; // 5MB en bytes

/**
 * Subir una imagen de portada a Supabase Storage (VERSIÓN SIMPLIFICADA - SIN COMPRESIÓN)
 * @param file - Archivo de imagen a subir
 * @param userId - ID del usuario que sube la imagen
 * @returns URL pública de la imagen subida o error
 */
export async function uploadPortada(
  file: File,
  userId: string
): Promise<{ url: string | null; error: Error | null }> {
  console.log("========================================");
  console.log("🚀 INICIO uploadPortada");
  console.log("Archivo:", file.name);
  console.log("Tamaño:", (file.size / 1024).toFixed(2), "KB");
  console.log("Tipo:", file.type);
  console.log("Usuario:", userId);
  console.log("========================================");

  try {
    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      console.error("❌ Tipo de archivo no permitido:", file.type);
      return {
        url: null,
        error: new Error("Tipo de archivo no permitido. Usa JPG, PNG o WebP.")
      };
    }
    console.log("✅ Tipo de archivo válido");

    // Validar tamaño
    if (file.size > MAX_SIZE) {
      console.error("❌ Archivo excede 5MB:", (file.size / 1024).toFixed(2), "KB");
      return {
        url: null,
        error: new Error("La imagen debe pesar menos de 5MB. Por favor usa una imagen más pequeña.")
      };
    }
    console.log("✅ Tamaño válido");

    // Generar nombre único para el archivo
    const fileExt = file.type.split("/")[1];
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileName = `${userId}/${timestamp}_${randomStr}.${fileExt}`;
    
    console.log("📂 Nombre de archivo generado:", fileName);

    // Subir archivo a Storage
    console.log("📤 SUBIENDO A STORAGE...");
    const { data, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false
      });

    if (uploadError) {
      console.error("❌ ERROR EN UPLOAD:", uploadError);
      throw uploadError;
    }

    console.log("✅ UPLOAD EXITOSO:", data);

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    console.log("🔗 URL PÚBLICA:", urlData.publicUrl);
    console.log("========================================");

    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    console.error("========================================");
    console.error("❌ ERROR GENERAL:", error);
    console.error("========================================");
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