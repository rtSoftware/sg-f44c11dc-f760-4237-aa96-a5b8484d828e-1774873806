import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Casa = Tables<"casas">;

export async function getAllCasas() {
  return await supabase
    .from("casas")
    .select("*")
    .order("casa_nombre");
}

export async function getCasaByNombre(casaNombre: string) {
  return await supabase
    .from("casas")
    .select("*")
    .ilike("casa_nombre", casaNombre)
    .single();
}

export async function getCasaById(id: string) {
  return await supabase
    .from("casas")
    .select("*")
    .eq("id", id)
    .single();
}

export async function createCasa(casaNombre: string, casaMemo: Record<string, any> = {}) {
  return await supabase
    .from("casas")
    .insert({
      casa_nombre: casaNombre,
      casa_memo: casaMemo,
    })
    .select()
    .single();
}

export async function updateCasa(id: string, data: Partial<Casa>) {
  return await supabase
    .from("casas")
    .update(data)
    .eq("id", id)
    .select()
    .single();
}

export async function deleteCasa(id: string) {
  return await supabase
    .from("casas")
    .delete()
    .eq("id", id);
}

export async function getUsuariosPorCasa(casaId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url")
    .eq("casa_id", casaId);

  if (error) {
    console.error("Error fetching usuarios por casa:", error);
    return { data: [], error };
  }

  return { data: data || [], error: null };
}

export async function asignarCasaAUsuario(userId: string, casaId: string) {
  return await supabase
    .from("profiles")
    .update({ casa_id: casaId })
    .eq("id", userId);
}

export async function updateCasaNombre(id: string, nombre: string) {
  return await supabase
    .from("casas")
    .update({ casa_nombre: nombre })
    .eq("id", id)
    .select()
    .single();
}

export async function setCasaId(casaId: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem("experiencia_miguel_casa_id", casaId);
  }
}

export async function initializeCasa() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return { success: false };
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("casa_id")
      .eq("id", session.user.id)
      .single();
      
    if (profile?.casa_id) {
      return { success: true, casa_id: profile.casa_id };
    }
    return { success: false };
  } catch (error) {
    return { success: false, error };
  }
}