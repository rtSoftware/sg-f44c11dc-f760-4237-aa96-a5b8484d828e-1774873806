import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Nota = Tables<"notas">;

export type NotaWithLibro = Nota & {
  libro: {
    titulo: string;
  } | null;
};

export type CreateNotaData = {
  origen: string;
  nota: string;
  libro_id: string;
  user_id: string;
  casa_id: string;
};

/**
 * Obtener todas las notas del usuario en su casa
 */
export async function getNotasByUserAndCasa(
  userId: string,
  casaId: string
): Promise<NotaWithLibro[]> {
  const { data, error } = await supabase
    .from("notas")
    .select(`
      *,
      libro:libro_id (
        titulo
      )
    `)
    .eq("user_id", userId)
    .eq("casa_id", casaId)
    .order("created_at", { ascending: false });

  console.log("getNotasByUserAndCasa:", { data, error });

  if (error) {
    console.error("Error fetching notas:", error);
    throw error;
  }

  return (data || []) as NotaWithLibro[];
}

/**
 * Crear una nueva nota
 */
export async function createNota(notaData: CreateNotaData): Promise<Nota> {
  console.log("createNota - Input data:", notaData);
  
  const { data, error } = await supabase
    .from("notas")
    .insert({
      origen: notaData.origen,
      nota: notaData.nota,
      libro_id: notaData.libro_id,
      user_id: notaData.user_id,
      casa_id: notaData.casa_id,
    })
    .select()
    .single();

  console.log("createNota - Response:", { data, error });

  if (error) {
    console.error("createNota - Detailed error:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    throw error;
  }

  return data;
}

/**
 * Actualizar una nota existente
 */
export async function updateNota(
  notaId: string,
  updates: { origen?: string; nota?: string; libro_id?: string }
): Promise<Nota> {
  const { data, error } = await supabase
    .from("notas")
    .update(updates)
    .eq("id", notaId)
    .select()
    .single();

  console.log("updateNota:", { data, error });

  if (error) {
    console.error("Error updating nota:", error);
    throw error;
  }

  return data;
}

/**
 * Eliminar una nota
 */
export async function deleteNota(notaId: string): Promise<void> {
  const { error } = await supabase.from("notas").delete().eq("id", notaId);

  console.log("deleteNota:", { notaId, error });

  if (error) {
    console.error("Error deleting nota:", error);
    throw error;
  }
}