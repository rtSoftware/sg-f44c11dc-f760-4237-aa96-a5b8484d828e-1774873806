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
    const { casaId } = getAuthContext();
    
    if (!casaId) {
      console.error("updateLibro - No casa_id found!");
      return { data: null, error: new Error("No casa_id found") };
    }

    console.log("updateLibro - ID:", id, "casa_id:", casaId);
    console.log("updateLibro - Content:", content);

    const { data, error } = await supabase
      .from("libro")
      .update(content)
      .eq("id", id)
      .eq("casa_id", casaId)
      .select()
      .maybeSingle();

    if (error) {
      console.error("updateLibro - Supabase error:", error);
      throw error;
    }
    
    if (!data) {
      console.error("updateLibro - No data returned (libro not found or no permission)");
      return { data: null, error: new Error("No se pudo actualizar el libro. Verifica que existe y tienes permisos.") };
    }
    
    console.log("updateLibro - Success:", data);
    return { data, error: null };
  } catch (error) {
    console.error("updateLibro - Exception:", error);
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