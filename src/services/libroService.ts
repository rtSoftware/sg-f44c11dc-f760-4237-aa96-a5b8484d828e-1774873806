import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Libro = Tables<"libro">;

/**
 * Obtener todo el contenido del libro
 */
export async function getLibroContent(): Promise<{ data: Libro | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("libro")
      .select("*")
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
 * Crear o actualizar contenido del libro
 */
export async function upsertLibroContent(
  content: {
    titulo?: string;
    descripcion?: string;
    contenido?: string;
    autor?: string;
    portada_url?: string;
  },
  userId: string
): Promise<{ data: Libro | null; error: Error | null }> {
  try {
    // Primero verificamos si ya existe contenido
    const { data: existingData } = await getLibroContent();

    if (existingData) {
      // Actualizar contenido existente
      const { data, error } = await supabase
        .from("libro")
        .update(content)
        .eq("id", existingData.id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } else {
      // Crear nuevo contenido
      const { data, error } = await supabase
        .from("libro")
        .insert({ ...content, user_id: userId })
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
export async function deleteLibroContent(id: string): Promise<{ success: boolean; error: Error | null }> {
  try {
    const { error } = await supabase
      .from("libro")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return { success: true, error: null };
  } catch (error) {
    console.error("Error deleting libro content:", error);
    return { success: false, error: error as Error };
  }
}