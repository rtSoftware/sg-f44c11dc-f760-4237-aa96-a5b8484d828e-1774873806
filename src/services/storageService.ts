import { supabase } from "@/integrations/supabase/client";

const BUCKET_NAME = "portadas";
const MAX_SIZE = 5 * 1024 * 1024; // 5MB en bytes
const MAX_DIMENSION = 2000; // Dimensión máxima en píxeles

/**
 * Comprimir una imagen usando Canvas API
 * @param file - Archivo de imagen original
 * @returns Archivo comprimido
 */
async function compressImage(file: File): Promise<File> {
  console.log("========================================");
  console.log("🖼️ INICIANDO COMPRESIÓN");
  console.log("Archivo original:", file.name);
  console.log("Tamaño original:", (file.size / 1024).toFixed(2), "KB");
  console.log("========================================");

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      console.log("📖 Archivo leído correctamente");
      const img = new Image();
      
      img.onload = () => {
        console.log("✅ Imagen cargada:", img.width, "x", img.height);
        
        // Calcular nuevas dimensiones manteniendo aspect ratio
        let width = img.width;
        let height = img.height;
        
        // Redimensionar si excede el máximo
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          console.log("📏 Redimensionando imagen...");
          if (width > height) {
            height = (height / width) * MAX_DIMENSION;
            width = MAX_DIMENSION;
          } else {
            width = (width / height) * MAX_DIMENSION;
            height = MAX_DIMENSION;
          }
          console.log("Nuevas dimensiones:", width, "x", height);
        }
        
        // Crear canvas
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          console.error("❌ Error al crear contexto del canvas");
          reject(new Error("No se pudo crear el contexto del canvas"));
          return;
        }
        
        console.log("🎨 Canvas creado correctamente");
        
        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);
        console.log("✅ Imagen dibujada en canvas");
        
        // Comprimir progresivamente
        let quality = 0.9;
        const attemptCompression = () => {
          console.log(`🔄 Intentando compresión con calidad ${quality}...`);
          
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                console.error("❌ Error: blob es null");
                reject(new Error("Error al comprimir la imagen"));
                return;
              }
              
              const sizeKB = (blob.size / 1024).toFixed(2);
              console.log(`   Resultado: ${sizeKB} KB`);
              
              // Si el tamaño es aceptable, crear archivo
              if (blob.size <= MAX_SIZE || quality <= 0.1) {
                const compressedFile = new File([blob], file.name, {
                  type: file.type === "image/png" ? "image/jpeg" : file.type,
                  lastModified: Date.now()
                });
                
                console.log("========================================");
                console.log("✅ COMPRESIÓN COMPLETADA");
                console.log("Tamaño original:", (file.size / 1024).toFixed(2), "KB");
                console.log("Tamaño final:", (compressedFile.size / 1024).toFixed(2), "KB");
                console.log("Reducción:", ((1 - compressedFile.size / file.size) * 100).toFixed(1), "%");
                console.log("Calidad final:", quality);
                console.log("========================================");
                
                resolve(compressedFile);
              } else {
                // Reducir calidad y reintentar
                quality -= 0.1;
                attemptCompression();
              }
            },
            file.type === "image/png" ? "image/jpeg" : file.type,
            quality
          );
        };
        
        attemptCompression();
      };
      
      img.onerror = () => {
        console.error("❌ Error al cargar la imagen");
        reject(new Error("Error al cargar la imagen"));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      console.error("❌ Error al leer el archivo");
      reject(new Error("Error al leer el archivo"));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Subir una imagen de portada a Supabase Storage (CON COMPRESIÓN AUTOMÁTICA)
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

    // COMPRIMIR SIEMPRE (sin importar el tamaño)
    console.log("📦 Comprimiendo imagen...");
    let fileToUpload: File;
    try {
      fileToUpload = await compressImage(file);
    } catch (compressError) {
      console.error("❌ Error durante la compresión:", compressError);
      return {
        url: null,
        error: new Error("Error al comprimir la imagen. Intenta con una imagen diferente.")
      };
    }

    // Validar tamaño DESPUÉS de comprimir
    if (fileToUpload.size > MAX_SIZE) {
      console.error("❌ Archivo aún excede 5MB después de compresión:", (fileToUpload.size / 1024).toFixed(2), "KB");
      return {
        url: null,
        error: new Error("No se pudo reducir la imagen a menos de 5MB. Intenta con una imagen diferente.")
      };
    }
    console.log("✅ Tamaño válido después de compresión");

    // Generar nombre único para el archivo
    const fileExt = fileToUpload.type.split("/")[1];
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileName = `${userId}/${timestamp}_${randomStr}.${fileExt}`;
    
    console.log("📂 Nombre de archivo generado:", fileName);

    // Subir archivo a Storage
    console.log("📤 SUBIENDO A STORAGE...");
    const { data, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, fileToUpload, {
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