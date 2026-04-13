import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, MapPin, Phone, Send, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ContactSection() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulación de envío
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: "Mensaje enviado",
      description: "Nos pondremos en contacto contigo pronto.",
    });

    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  return (
    <section id="contacto" className="py-24 bg-stone-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
            Contacto
          </h2>
          <p className="text-xl text-stone-600 max-w-3xl mx-auto">
            ¿Tienes alguna pregunta? Estamos aquí para ayudarte
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Información de contacto */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-stone-900 mb-6">
                Información de Contacto
              </h3>
              <p className="text-stone-600 mb-8">
                Estamos disponibles para responder tus preguntas y ayudarte en tu camino de crecimiento personal.
              </p>
            </div>

            <div className="space-y-4">
              <Card className="border-stone-200 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-6 h-6 text-stone-900" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-stone-900 mb-1">Email</h4>
                      <p className="text-stone-600">contacto@experienciamiguel.com</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-stone-200 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center">
                      <Phone className="w-6 h-6 text-stone-900" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-stone-900 mb-1">Teléfono</h4>
                      <p className="text-stone-600">+1 (555) 123-4567</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-stone-200 bg-white">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-stone-900" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-stone-900 mb-1">Ubicación</h4>
                      <p className="text-stone-600">Ciudad, País</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="pt-6">
              <h4 className="font-semibold text-stone-900 mb-4">Horario de Atención</h4>
              <div className="space-y-2 text-stone-600">
                <p>Lunes - Viernes: 9:00 AM - 6:00 PM</p>
                <p>Sábados: 10:00 AM - 2:00 PM</p>
                <p>Domingos: Cerrado</p>
              </div>
            </div>
          </div>

          {/* Formulario de contacto */}
          <Card className="border-stone-200 bg-white">
            <CardHeader>
              <CardTitle className="text-stone-900">Envíanos un Mensaje</CardTitle>
              <CardDescription className="text-stone-600">
                Completa el formulario y te responderemos lo antes posible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-stone-900">Nombre</Label>
                  <Input
                    id="name"
                    placeholder="Tu nombre completo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="border-stone-300 focus:border-stone-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-stone-900">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="border-stone-300 focus:border-stone-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-stone-900">Asunto</Label>
                  <Input
                    id="subject"
                    placeholder="¿Sobre qué quieres hablar?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="border-stone-300 focus:border-stone-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-stone-900">Mensaje</Label>
                  <Textarea
                    id="message"
                    placeholder="Escribe tu mensaje aquí..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    className="min-h-[150px] border-stone-300 focus:border-stone-500"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Enviar Mensaje
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}