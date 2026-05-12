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

// ============ NOTIFICACIONES DEL NAVEGADOR ============

// Solicitar permiso para mostrar notificaciones
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.log("Este navegador no soporta notificaciones");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

// Mostrar notificación de nuevo mensaje
export function showNewMessageNotification(mensaje: Mensaje) {
  if (Notification.permission !== "granted") {
    return;
  }

  const notification = new Notification("Nuevo mensaje de contacto", {
    body: `${mensaje.nombre} envió un mensaje`,
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    tag: `mensaje-${mensaje.id}`,
    requireInteraction: true,
    data: {
      mensajeId: mensaje.id,
      url: "/dashboard"
    }
  });

  notification.onclick = function() {
    window.focus();
    window.location.href = "/dashboard";
    notification.close();
  };
}

// Suscribirse a nuevos mensajes en tiempo real
export function subscribeTonewMessages(callback: (mensaje: Mensaje) => void) {
  const channel = supabase
    .channel("mensajes-nuevos")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "mensajes"
      },
      (payload) => {
        const nuevoMensaje = payload.new as Mensaje;
        callback(nuevoMensaje);
      }
    )
    .subscribe();

  return channel;
}

// Inicializar sistema de notificaciones
export async function initNotificationSystem() {
  const hasPermission = await requestNotificationPermission();
  
  if (hasPermission) {
    // Suscribirse a nuevos mensajes
    const channel = subscribeTonewMessages((mensaje) => {
      showNewMessageNotification(mensaje);
    });

    return channel;
  }

  return null;
}