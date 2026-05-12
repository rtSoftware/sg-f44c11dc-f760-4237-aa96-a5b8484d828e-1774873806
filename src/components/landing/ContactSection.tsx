import { useState } from "react";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { createMensaje, getClientIP } from "@/services/mensajesService";

export function ContactSection() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.email || !formData.mensaje) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Obtener la IP del cliente (no bloqueante si falla)
      let clientIP = null;
      try {
        clientIP = await getClientIP();
        console.log("IP obtenida:", clientIP);
      } catch (ipError) {
        console.warn("No se pudo obtener IP, continuando sin ella:", ipError);
      }

      // Preparar datos del mensaje
      const mensajeData = {
        nombre: formData.nombre.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono?.trim() || null,
        mensaje: formData.mensaje.trim(),
        dir_ip: clientIP || null
      };

      console.log("Enviando mensaje:", { ...mensajeData, dir_ip: clientIP ? "***" : null });

      // Guardar mensaje en la base de datos
      const { data, error } = await createMensaje(mensajeData);

      if (error) {
        console.error("Error de Supabase al enviar mensaje:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast({
          title: "Error",
          description: `No se pudo enviar el mensaje: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      console.log("Mensaje enviado exitosamente:", data);

      toast({
        title: "Mensaje enviado",
        description: "Gracias por contactarnos. Te responderemos pronto.",
      });

      // Limpiar formulario
      setFormData({
        nombre: "",
        email: "",
        telefono: "",
        mensaje: ""
      });
    } catch (error) {
      console.error("Error inesperado al enviar mensaje:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contacto" className="py-20 bg-stone-50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900 mb-4">
              Contáctanos
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              ¿Tienes preguntas sobre la Experiencia Miguel? Estamos aquí para ayudarte
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Información de contacto */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="font-serif text-2xl font-semibold text-stone-900 mb-6">
                Información de Contacto
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <Mail className="w-6 h-6 text-amber-800" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900 mb-1">Email</h4>
                    <a href="mailto:tapiara@iasos.com.mx" className="text-stone-600 hover:text-amber-800 transition-colors">
                      tapiara@iasos.com.mx
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <Phone className="w-6 h-6 text-amber-800" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900 mb-1">Teléfono</h4>
                    <a href="tel:+525549193378" className="text-stone-600 hover:text-amber-800 transition-colors">
                      55 49 19 33 78
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <MapPin className="w-6 h-6 text-amber-800" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-stone-900 mb-1">Dirección</h4>
                    <p className="text-stone-600">
                      Reforma 296, Col Juárez<br />
                      Ciudad de México
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario de contacto */}
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="font-serif text-2xl font-semibold text-stone-900 mb-6">
                Envíanos un Mensaje
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-stone-700 mb-2">
                    Nombre *
                  </label>
                  <Input
                    id="nombre"
                    name="nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    placeholder="Tu nombre completo"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">
                    Email *
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="tu@email.com"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-stone-700 mb-2">
                    Teléfono
                  </label>
                  <Input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="55 1234 5678"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label htmlFor="mensaje" className="block text-sm font-medium text-stone-700 mb-2">
                    Mensaje *
                  </label>
                  <Textarea
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={handleChange}
                    required
                    placeholder="¿En qué podemos ayudarte?"
                    rows={4}
                    disabled={isSubmitting}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-amber-700 hover:bg-amber-800 text-white font-semibold py-3"
                >
                  {isSubmitting ? (
                    "Enviando..."
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Mensaje
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}