import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const ADMIN_EMAIL = "tapiara@iasos.com.mx";

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { nombre, email, telefono, mensaje, ip } = await req.json();

    // Si no hay RESEND_API_KEY configurada, solo loguear y continuar
    if (!RESEND_API_KEY) {
      console.log("Nuevo mensaje de contacto recibido (no se envió email - RESEND_API_KEY no configurada):");
      console.log({ nombre, email, telefono, mensaje, ip });
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Mensaje guardado (notificación por email deshabilitada)" 
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200 
        }
      );
    }

    // Enviar email de notificación usando Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Experiencia Miguel <no-reply@experienciamiguel.com>",
        to: [ADMIN_EMAIL],
        subject: `Nuevo mensaje de contacto: ${nombre}`,
        html: `
          <h2>Nuevo mensaje de contacto</h2>
          <p><strong>Nombre:</strong> ${nombre}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Teléfono:</strong> ${telefono || "No proporcionado"}</p>
          <p><strong>IP:</strong> ${ip || "No disponible"}</p>
          <hr />
          <h3>Mensaje:</h3>
          <p>${mensaje}</p>
          <hr />
          <p style="color: #666; font-size: 12px;">
            Este mensaje fue enviado desde el formulario de contacto de Experiencia Miguel.
          </p>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text();
      console.error("Error enviando email:", errorData);
      throw new Error(`Error al enviar email: ${errorData}`);
    }

    return new Response(
      JSON.stringify({ success: true, message: "Notificación enviada" }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error en enviar-notificacion-mensaje:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500 
      }
    );
  }
});