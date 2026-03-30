import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { getCasaId } from "@/services/casaService";

export type Libro = Tables<"libro">;

/**
 * Obtener todos los libros de la casa actual
 */
export async function getAllLibros(casaId: string): Promise<{ data: Libro[] | null; error: Error | null }> {
  try {
    console.log("getAllLibros - Received casa_id parameter:", casaId);
    
    if (!casaId) {
      console.error("getAllLibros - No casa_id provided!");
      return { data: null, error: new Error("No casa_id provided") };
    }

    console.log("getAllLibros - Querying libros with casa_id:", casaId);
    
    const { data, error } = await supabase
      .from("libro")
      .select("*")
      .eq("casa_id", casaId)
      .order("created_at", { ascending: false });

    console.log("getAllLibros - Query result:", { 
      rowCount: data?.length || 0,
      error: error?.message 
    });
    
    if (data && data.length > 0) {
      console.log("getAllLibros - Libros casa_ids:", data.map(l => ({ 
        titulo: l.titulo, 
        casa_id: l.casa_id 
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
export async function getLibroById(id: string, casaId: string): Promise<{ data: Libro | null; error: Error | null }> {
  try {
    if (!casaId) {
      return { data: null, error: new Error("No casa_id provided") };
    }

    const { data, error } = await supabase
      .from("libro")
      .select("*")
      .eq("id", id)
      .eq("casa_id", casaId)
      .single();

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
    const casaId = getCasaId();
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
  },
  userId: string
): Promise<{ data: Libro | null; error: Error | null }> {
  try {
    const casaId = getCasaId();
    if (!casaId) {
      return { data: null, error: new Error("No casa_id found") };
    }

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
        audioanalisis_https: content.audioanalisis_https
      })
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error creating libro:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * ACTUALIZAR un libro existente (UPDATE)
 */
export async function updateLibro(
  id: string,
  casaId: string,
  content: {
    titulo?: string;
    descripcion?: string;
    contenido?: string;
    autor?: string;
    portada_url?: string;
    audio_https?: string;
    audioanalisis_https?: string;
  }
): Promise<{ data: Libro | null; error: Error | null }> {
  try {
    if (!casaId) {
      return { data: null, error: new Error("No casa_id provided") };
    }

    const { data, error } = await supabase
      .from("libro")
      .update(content)
      .eq("id", id)
      .eq("casa_id", casaId)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error updating libro:", error);
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
    const casaId = getCasaId();
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
        .single();

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
        .single();

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
export async function deleteLibroContent(id: string, casaId: string): Promise<{ success: boolean; error: Error | null }> {
  try {
    if (!casaId) {
      return { success: false, error: new Error("No casa_id provided") };
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