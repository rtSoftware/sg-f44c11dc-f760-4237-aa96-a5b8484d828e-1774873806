import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Libro = Tables<"libro">;

/**
 * Obtener casa_id del contexto/localStorage
 */
function getCasaId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("casa_id");
}

/**
 * Obtener user_id del contexto/localStorage
 */
function getUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("user_id");
}

/**
 * Obtener todos los libros de la casa actual
 */
export async function getAllLibros() {
  try {
    const casaId = getCasaId();
    
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
    
    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error("Error fetching libros:", error);
    return { data: [], error: error as Error };
  }
}

/**
 * Obtener libros por casa_id específico
 */
export async function getLibrosPorCasa(casaId: string) {
  try {
    const { data, error } = await supabase
      .from("libro")
      .select("*")
      .eq("casa_id", casaId)
      .order("orden", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error("Error fetching libros por casa:", error);
    return { data: [], error: error as Error };
  }
}

/**
 * Obtener un libro por ID
 */
export async function getLibroById(libroId: string) {
  try {
    const { data, error } = await supabase
      .from("libro")
      .select("*")
      .eq("id", libroId)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching libro:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * Crear un nuevo libro
 */
export async function createLibro(libro: Partial<Libro>) {
  try {
    const casaId = getCasaId();
    const userId = getUserId();

    if (!casaId || !userId) {
      throw new Error("No casa_id or user_id found");
    }

    const { data, error } = await supabase
      .from("libro")
      .insert([
        {
          ...libro,
          casa_id: casaId,
          created_by: userId,
        },
      ])
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
 * Actualizar un libro existente
 */
export async function updateLibro(libroId: string, updates: Partial<Libro>) {
  try {
    const { data, error } = await supabase
      .from("libro")
      .update(updates)
      .eq("id", libroId)
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
 * Eliminar un libro
 */
export async function deleteLibro(libroId: string) {
  try {
    const { error } = await supabase
      .from("libro")
      .delete()
      .eq("id", libroId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Error deleting libro:", error);
    return { error: error as Error };
  }
}

/**
 * Buscar libros por título
 */
export async function searchLibrosByTitulo(searchTerm: string) {
  try {
    const casaId = getCasaId();
    
    if (!casaId) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from("libro")
      .select("*")
      .eq("casa_id", casaId)
      .ilike("titulo", `%${searchTerm}%`)
      .order("titulo", { ascending: true });

    if (error) throw error;
    return { data: data || [], error: null };
  } catch (error) {
    console.error("Error searching libros:", error);
    return { data: [], error: error as Error };
  }
}

/**
 * Obtener el conteo de libros en la casa
 */
export async function getLibrosCount() {
  try {
    const casaId = getCasaId();
    
    if (!casaId) {
      return { count: 0, error: null };
    }

    const { count, error } = await supabase
      .from("libro")
      .select("*", { count: "exact", head: true })
      .eq("casa_id", casaId);

    if (error) throw error;
    return { count: count || 0, error: null };
  } catch (error) {
    console.error("Error counting libros:", error);
    return { count: 0, error: error as Error };
  }
}

/**
 * Reordenar libros
 */
export async function reorderLibros(libroIds: string[]) {
  try {
    const updates = libroIds.map((id, index) => ({
      id,
      orden: index + 1,
    }));

    const promises = updates.map((update) =>
      supabase.from("libro").update({ orden: update.orden }).eq("id", update.id)
    );

    await Promise.all(promises);
    return { error: null };
  } catch (error) {
    console.error("Error reordering libros:", error);
    return { error: error as Error };
  }
}

/**
 * Obtener libro actual de la casa
 */
export async function getCurrentLibro(casaId: string) {
  try {
    // First get the casa to find its current libro_id
    const { data: casa, error: casaError } = await supabase
      .from("casas")
      .select("libro_id")
      .eq("id", casaId)
      .single();

    if (casaError) throw casaError;
    
    if (!casa?.libro_id) {
      // If no libro_id set, return the first libro
      const { data, error } = await supabase
        .from("libro")
        .select("*")
        .eq("casa_id", casaId)
        .order("orden", { ascending: true })
        .limit(1)
        .single();

      if (error) throw error;
      return { data, error: null };
    }

    // Get the specific libro
    const { data, error } = await supabase
      .from("libro")
      .select("*")
      .eq("id", casa.libro_id)
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error("Error getting current libro:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * Cambiar el libro actual de la casa
 */
export async function setCurrentLibro(casaId: string, libroId: string) {
  try {
    const { error } = await supabase
      .from("casas")
      .update({ libro_id: libroId })
      .eq("id", casaId);

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error("Error setting current libro:", error);
    return { error: error as Error };
  }
}