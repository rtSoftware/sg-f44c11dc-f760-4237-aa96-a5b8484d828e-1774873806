import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

/**
 * Obtener el nombre del sitio web actual (origin)
 */
export function getCurrentSiteName(): string {
  if (typeof window === "undefined") {
    return "localhost"; // Fallback para SSR
  }
  return window.location.hostname;
}

/**
 * Inicializar o obtener la casa para el sitio web actual
 * Esta función se ejecuta al inicio de la autenticación
 */
export async function initializeCasa(): Promise<{
  success: boolean;
  casa_id?: string;
  error?: Error;
}> {
  try {
    const casaNombre = getCurrentSiteName();

    // 1. Intentar obtener la casa existente
    const { data: existingCasa, error: fetchError } = await supabase
      .from("casas")
      .select("id, casa_nombre")
      .eq("casa_nombre", casaNombre)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 = no rows returned, otros errores son problemas reales
      console.error("Error fetching casa:", fetchError);
      return { success: false, error: fetchError as Error };
    }

    // 2. Si existe, retornar el casa_id
    if (existingCasa) {
      console.log("Casa encontrada:", existingCasa);
      return { success: true, casa_id: existingCasa.id };
    }

    // 3. Si no existe, crear nueva casa
    const { data: newCasa, error: createError } = await supabase
      .from("casas")
      .insert({
        casa_nombre: casaNombre,
        casa_memo: {
          created_at: new Date().toISOString(),
          origin: window.location.origin,
          initial_setup: true,
        },
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating casa:", createError);
      return { success: false, error: createError as Error };
    }

    console.log("Casa creada:", newCasa);
    return { success: true, casa_id: newCasa.id };
  } catch (error) {
    console.error("Error initializing casa:", error);
    return { success: false, error: error as Error };
  }
}

/**
 * Obtener el casa_id actual desde localStorage
 */
export function getCasaId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("casa_id");
}

/**
 * Guardar casa_id en localStorage
 */
export function setCasaId(casaId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("casa_id", casaId);
}

/**
 * Limpiar casa_id de localStorage
 */
export function clearCasaId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("casa_id");
}

/**
 * Obtener información completa de la casa actual
 */
export async function getCurrentCasa(): Promise<{
  data: Tables<"casas"> | null;
  error: Error | null;
}> {
  try {
    const casaId = getCasaId();
    if (!casaId) {
      return { data: null, error: new Error("No casa_id found") };
    }

    const { data, error } = await supabase
      .from("casas")
      .select("*")
      .eq("id", casaId)
      .single();

    if (error) {
      console.error("Error fetching current casa:", error);
      return { data: null, error: error as Error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error in getCurrentCasa:", error);
    return { data: null, error: error as Error };
  }
}

/**
 * Actualizar memo de la casa actual
 */
export async function updateCasaMemo(
  memo: Record<string, any>
): Promise<{ success: boolean; error?: Error }> {
  try {
    const casaId = getCasaId();
    if (!casaId) {
      return { success: false, error: new Error("No casa_id found") };
    }

    const { error } = await supabase
      .from("casas")
      .update({ casa_memo: memo })
      .eq("id", casaId);

    if (error) {
      console.error("Error updating casa memo:", error);
      return { success: false, error: error as Error };
    }

    return { success: true };
  } catch (error) {
    console.error("Error in updateCasaMemo:", error);
    return { success: false, error: error as Error };
  }
}

/**
 * Crear una nueva casa
 */
export async function createCasa(
  casaNombre: string,
  memo?: Record<string, any>
): Promise<{ success: boolean; casa_id?: string; error?: Error }> {
  try {
    const { data, error } = await supabase
      .from("casas")
      .insert({
        casa_nombre: casaNombre,
        casa_memo: memo || {
          created_at: new Date().toISOString(),
          created_by: "user",
        },
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating casa:", error);
      return { success: false, error: error as Error };
    }

    return { success: true, casa_id: data.id };
  } catch (error) {
    console.error("Error in createCasa:", error);
    return { success: false, error: error as Error };
  }
}

/**
 * Obtener todas las casas
 */
export async function getAllCasas(): Promise<{
  data: Tables<"casas">[] | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from("casas")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching all casas:", error);
      return { data: null, error: error as Error };
    }

    return { data, error: null };
  } catch (error) {
    console.error("Error in getAllCasas:", error);
    return { data: null, error: error as Error };
  }
}