import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Discurso = Database["public"]["Tables"]["discursos"]["Row"];
type DiscursoInsert = Database["public"]["Tables"]["discursos"]["Insert"];
type DiscursoUpdate = Database["public"]["Tables"]["discursos"]["Update"];

/**
 * Obtiene el discurso de un libro específico
 */
export async function getDiscursoByLibroId(libroId: string): Promise<Discurso | null> {
  const { data, error } = await supabase
    .from("discursos")
    .select("*")
    .eq("libro_id", libroId)
    .maybeSingle();

  if (error) {
    console.error("Error al obtener discurso:", error);
    throw error;
  }

  return data;
}

/**
 * Crea un nuevo discurso para un libro
 */
export async function createDiscurso(libroId: string, contenido: string): Promise<Discurso> {
  const discursoData: DiscursoInsert = {
    libro_id: libroId,
    contenido
  };

  const { data, error } = await supabase
    .from("discursos")
    .insert(discursoData)
    .select()
    .single();

  if (error) {
    console.error("Error al crear discurso:", error);
    throw error;
  }

  return data;
}

/**
 * Actualiza el contenido de un discurso existente
 */
export async function updateDiscurso(id: string, contenido: string): Promise<Discurso> {
  const updateData: DiscursoUpdate = {
    contenido,
    updated_at: new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("discursos")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error al actualizar discurso:", error);
    throw error;
  }

  return data;
}

/**
 * Guarda o actualiza un discurso (upsert simplificado)
 */
export async function saveDiscurso(libroId: string, contenido: string): Promise<Discurso> {
  // Intentar obtener el discurso existente
  const existente = await getDiscursoByLibroId(libroId);

  if (existente) {
    // Actualizar existente
    return await updateDiscurso(existente.id, contenido);
  } else {
    // Crear nuevo
    return await createDiscurso(libroId, contenido);
  }
}

/**
 * Elimina un discurso
 */
export async function deleteDiscurso(id: string): Promise<void> {
  const { error } = await supabase
    .from("discursos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error al eliminar discurso:", error);
    throw error;
  }
}