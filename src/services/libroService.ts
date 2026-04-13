import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Libro = Tables<"libro">;

/**
 * Obtener casa_id y user_id del contexto/localStorage
 */
function getAuthContext(): { casaId: string | null; userId: string | null } {
  let casaId: string | null = null;
  const userId: string | null = null;

  if (typeof window !== "undefined") {
    casaId = localStorage.getItem("casa_id");
  }

  return { casaId, userId };
}

/**
 * Obtener todos los libros de la casa actual
 */
export async function getAllLibros(): Promise<{ data: Libro[] | null; error: Error | null }> {
  try {
    const { casaId } = getAuthContext();
    
    console.log("getAllLibros - casa_id:", casaId);
    
    if (!casaId) {
      console.error("getAllLibros - No casa_id found!");
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from("libro")
      .select("*")
      .eq("casa_id", casaId)
      .order("orden", { ascending: true })
      .order("created_at", { ascending: false });

    console.log("getAllLibros - Query result:", { 
      rowCount: data?.length || 0,
      error: error?.message 
    });
    
    if (data && data.length > 0) {
      console.log("getAllLibros - Sample libro casa_ids:", data.slice(0, 3).map(l => ({ 
        titulo: l.titulo, 
        casa_id: l.casa_id,
        orden: l.orden
      })));
    }

    if (error) throw error;

    return { data: data || [], error: null };
  } catch (error) {
    console.error("Error fetching libros:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * Obtener un libro específico por ID
 */
export async function getLibroById(id: string): Promise<{ data: Libro | null; error: Error | null }> {
  try {
    const { casaId } = getAuthContext();
    
    if (!casaId) {
      return { data: null, error: new Error("No casa_id found") };
    }

    const { data, error } = await supabase
      .from("libro")
      .select("*")
      .eq("id", id)
      .eq("casa_id", casaId)
      .maybeSingle();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error("Error fetching libro by id:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * Obtener todo el contenido del libro (primer registro para retrocompatibilidad)
 */
export async function getLibroContent(): Promise<{ data: Libro | null; error: Error | null }> {
  try {
    const { casaId } = getAuthContext();
    
    if (!casaId) {
      return { data: null, error: new Error("No casa_id found") };
    }

    const { data, error } = await supabase
      .from("libro")
      .select("*")
      .eq("casa_id", casaId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    console.error("Error fetching libro content:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * CREAR un nuevo libro (INSERT)
 */
export async function createLibro(
  content: {
    titulo: string;
    descripcion?: string;
    contenido?: string;
    autor?: string;
    portada_url?: string;
    audio_https?: string;
    audioanalisis_https?: string;
    orden?: number;
  },
  userId: string
): Promise<{ data: Libro | null; error: Error | null }> {
  try {
    const { casaId } = getAuthContext();
    
    if (!casaId) {
      console.error("createLibro - No casa_id found!");
      return { data: null, error: new Error("No casa_id found") };
    }

    console.log("createLibro - Using casa_id:", casaId, "user_id:", userId);
    console.log("createLibro - Content:", content);

    const { data, error } = await supabase
      .from("libro")
      .insert({
        user_id: userId,
        casa_id: casaId,
        titulo: content.titulo,
        contenido: content.contenido || "",
        descripcion: content.descripcion,
        autor: content.autor,
        portada_url: content.portada_url,
        audio_https: content.audio_https,
        audioanalisis_https: content.audioanalisis_https,
        orden: content.orden || 0
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error("createLibro - Supabase error:", error);
      throw error;
    }
    
    console.log("createLibro - Success, libro created with casa_id:", data?.casa_id);
    
    return { data, error: null };
  } catch (error) {
    console.error("createLibro - Exception:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * ACTUALIZAR un libro existente (UPDATE)
 */
export async function updateLibro(
  id: string,
  content: {
    titulo?: string;
    descripcion?: string;
    contenido?: string;
    autor?: string;
    portada_url?: string;
    audio_https?: string;
    audioanalisis_https?: string;
    orden?: number;
  }
): Promise<{ data: Libro | null; error: Error | null }> {
  try {
    console.log("========================================");
    console.log("🔄 ACTUALIZANDO LIBRO");
    console.log("ID:", id);
    console.log("Content:", content);
    console.log("========================================");

    // RLS policy verifica que auth.uid() = user_id automáticamente
    // NO necesitamos filtrar por casa_id aquí
    const { data, error } = await supabase
      .from("libro")
      .update(content)
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error) {
      console.error("❌ Supabase error:", error);
      throw error;
    }
    
    if (!data) {
      console.error("❌ No data returned");
      console.error("Posibles causas:");
      console.error("1. El libro no existe (ID incorrecto)");
      console.error("2. No tienes permisos para editar este libro (no eres el creador)");
      console.error("3. RLS bloqueó la operación");
      
      // Intentar obtener el libro para ver si existe
      const { data: existingLibro, error: fetchError } = await supabase
        .from("libro")
        .select("id, user_id, titulo")
        .eq("id", id)
        .maybeSingle();
      
      if (fetchError) {
        console.error("Error al verificar existencia:", fetchError);
      } else if (!existingLibro) {
        console.error("El libro no existe en la base de datos");
        return { data: null, error: new Error("El libro no existe o fue eliminado.") };
      } else {
        console.error("El libro existe:", existingLibro);
        console.error("Pero no puedes editarlo. Solo el creador puede editar un libro.");
        return { data: null, error: new Error("No tienes permisos para editar este libro. Solo el creador puede editarlo.") };
      }
      
      return { data: null, error: new Error("No se pudo actualizar el libro. Verifica que existe y tienes permisos.") };
    }
    
    console.log("✅ UPDATE EXITOSO:", data);
    console.log("========================================");
    return { data, error: null };
  } catch (error) {
    console.error("❌ Exception:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * Crear o actualizar contenido del libro (DEPRECATED - usar createLibro o updateLibro)
 */
export async function upsertLibroContent(
  content: {
    titulo?: string;
    descripcion?: string;
    contenido?: string;
    autor?: string;
    portada_url?: string;
    audio_https?: string;
    audioanalisis_https?: string;
  },
  userId: string
): Promise<{ data: Libro | null; error: Error | null }> {
  try {
    const { casaId } = getAuthContext();
    
    if (!casaId) {
      return { data: null, error: new Error("No casa_id found") };
    }

    // Primero verificamos si ya existe contenido
    const { data: existingData } = await getLibroContent();

    if (existingData) {
      // Actualizar contenido existente
      const { data, error } = await supabase
        .from("libro")
        .update(content)
        .eq("id", existingData.id)
        .eq("casa_id", casaId)
        .select()
        .maybeSingle();

      if (error) throw error;
      return { data, error: null };
    } else {
      // Crear nuevo contenido - asegurar campos obligatorios
      const { data, error } = await supabase
        .from("libro")
        .insert({
          user_id: userId,
          casa_id: casaId,
          titulo: content.titulo || "",
          contenido: content.contenido || "",
          descripcion: content.descripcion,
          autor: content.autor,
          portada_url: content.portada_url,
          audio_https: content.audio_https,
          audioanalisis_https: content.audioanalisis_https
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      return { data, error: null };
    }
  } catch (error) {
    console.error("Error upserting libro content:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * Eliminar contenido del libro
 */
export async function deleteLibroContent(id: string): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { casaId } = getAuthContext();
    
    if (!casaId) {
      return { success: false, error: new Error("No casa_id found") };
    }

    const { error } = await supabase
      .from("libro")
      .delete()
      .eq("id", id)
      .eq("casa_id", casaId);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error("Error deleting libro content:", error);
    return { success: false, error: error as Error };
  }
}

/**
 * Mover libro a otra casa (incluye reasignación automática de user_id y notas)
 */
export async function moverLibroACasa(
  libroId: string,
  nuevaCasaId: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // 1. Buscar un usuario válido en la nueva casa
    const { data: perfilEnNuevaCasa, error: perfilError } = await supabase
      .from("profiles")
      .select("id")
      .eq("casa_id", nuevaCasaId)
      .limit(1)
      .maybeSingle();

    if (perfilError) throw perfilError;
    
    if (!perfilEnNuevaCasa) {
      return { 
        success: false, 
        error: new Error("No hay usuarios en la casa de destino") 
      };
    }

    // 2. Actualizar libro (casa_id + user_id simultáneamente)
    const { error: updateError } = await supabase
      .from("libro")
      .update({
        casa_id: nuevaCasaId,
        user_id: perfilEnNuevaCasa.id
      })
      .eq("id", libroId);

    if (updateError) throw updateError;

    // 3. Mover todas las notas asociadas
    const { error: notasError } = await supabase
      .from("notas")
      .update({ casa_id: nuevaCasaId })
      .eq("libro_id", libroId);

    // No bloqueamos si no hay notas o hay error menor
    if (notasError) {
      console.warn("Error moviendo notas:", notasError);
    }

    return { success: true, error: null };
  } catch (error) {
    console.error("Error moviendo libro a nueva casa:", error);
    return { success: false, error: error as Error };
  }
}

/**
 * Detectar libros huérfanos (user_id no está en la misma casa que libro.casa_id)
 */
export async function detectarLibrosHuerfanos(): Promise<{
  data: Array<Libro & { user_casa_id: string | null }> | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from("libro")
      .select(`
        *,
        profiles!libro_user_id_fkey(casa_id)
      `);

    if (error) throw error;

    // Filtrar libros donde casa_id del libro != casa_id del perfil del usuario
    const huerfanos = data?.filter(libro => {
      const perfiles = libro.profiles as any;
      const userCasaId = perfiles?.casa_id || null;
      return libro.casa_id !== userCasaId;
    }).map(libro => ({
      ...libro,
      user_casa_id: (libro.profiles as any)?.casa_id || null
    })) || [];

    return { data: huerfanos, error: null };
  } catch (error) {
    console.error("Error detectando libros huérfanos:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * Reasignar user_id de un libro huérfano a un usuario válido en su casa actual
 */
export async function reasignarLibroHuerfano(
  libroId: string,
  casaIdActual: string
): Promise<{ success: boolean; error: Error | null }> {
  try {
    // 1. Buscar usuario válido en la casa actual del libro
    const { data: perfilValido, error: perfilError } = await supabase
      .from("profiles")
      .select("id")
      .eq("casa_id", casaIdActual)
      .limit(1)
      .maybeSingle();

    if (perfilError) throw perfilError;
    
    if (!perfilValido) {
      return { 
        success: false, 
        error: new Error("No hay usuarios válidos en esta casa") 
      };
    }

    // 2. Reasignar user_id
    const { error: updateError } = await supabase
      .from("libro")
      .update({ user_id: perfilValido.id })
      .eq("id", libroId);

    if (updateError) throw updateError;

    return { success: true, error: null };
  } catch (error) {
    console.error("Error reasignando libro huérfano:", error);
    return { success: false, error: error as Error };
  }
}