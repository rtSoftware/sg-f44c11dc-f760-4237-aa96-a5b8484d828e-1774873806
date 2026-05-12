import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Mensaje = Tables<"mensajes">;

interface CreateMensajeData {
  nombre: string;
  email: string;
  telefono?: string;
  mensaje: string;
  dir_ip?: string;
}

export async function createMensaje(data: CreateMensajeData) {
  const { data: mensaje, error } = await supabase
    .from("mensajes")
    .insert([data])
    .select()
    .single();

  return { data: mensaje, error };
}

export async function getMensajes() {
  const { data, error } = await supabase
    .from("mensajes")
    .select("*")
    .order("fecha", { ascending: false });

  return { data, error };
}

export async function getMensajesNoLeidos() {
  const { data, error } = await supabase
    .from("mensajes")
    .select("*")
    .eq("leido", false)
    .order("fecha", { ascending: false });

  return { data, error };
}

export async function marcarComoLeido(id: string) {
  const { data, error } = await supabase
    .from("mensajes")
    .update({ leido: true })
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}

export async function marcarComoRespondido(id: string, notas?: string) {
  const { data, error } = await supabase
    .from("mensajes")
    .update({ 
      respondido: true,
      ...(notas && { notas_admin: notas })
    })
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}

// Función helper para obtener la IP del cliente
export async function getClientIP(): Promise<string | null> {
  try {
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Error obteniendo IP:", error);
    return null;
  }
}