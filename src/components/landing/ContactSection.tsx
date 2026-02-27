import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MessageSquare, Send, Phone } from "lucide-react";
import { useState } from "react";

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <section id="contact" className="py-24 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 rounded-full mb-6">
            <MessageSquare className="w-4 h-4 text-amber-700" />
            <span className="text-sm font-medium text-amber-900">Contacto</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-black text-stone-900 mb-6">
            Hablemos
          </h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            ¿Tienes preguntas sobre la comunidad o necesitas más información? Estamos aquí para ayudarte.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-stone-900 mb-4">
                Únete a la conversación
              </h3>
              <p className="text-stone-600 leading-relaxed mb-6">
                La oratoria es un viaje que se recorre mejor en comunidad. Escríbenos y descubre cómo Experiencia Miguel puede transformar tu manera de pensar y comunicar.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-xl border border-amber-200/50">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 mb-1">Email</h4>
                  <p className="text-stone-600 text-sm">tapiara@iasos.com.mx</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-200/50">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 mb-1">WhatsApp</h4>
                  <p className="text-stone-600 text-sm font-medium">5619 77 3576</p>
                  <p className="text-stone-500 text-xs mt-1 italic">(No contesto llamadas directas, envía un mensaje)</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-xl border border-orange-200/50">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 mb-1">Comunidad</h4>
                  <p className="text-stone-600 text-sm">Respuesta en menos de 24 horas</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl">
              <p className="text-amber-400 font-bold text-lg mb-2">
                La palabra es el vehículo de la libertad
              </p>
              <p className="text-stone-300 text-sm">
                Cada conversación es una oportunidad para ordenar el pensamiento y construir significado.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 bg-stone-50 p-8 rounded-2xl border-2 border-stone-200">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-stone-900 mb-2">
                Nombre completo
              </label>
              <Input
                id="name"
                type="text"
                placeholder="Tu nombre"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="bg-white border-stone-300 focus:border-amber-500 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-stone-900 mb-2">
                Correo electrónico
              </label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-white border-stone-300 focus:border-amber-500 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-bold text-stone-900 mb-2">
                Mensaje
              </label>
              <Textarea
                id="message"
                placeholder="Cuéntanos cómo podemos ayudarte..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="bg-white border-stone-300 focus:border-amber-500 focus:ring-amber-500 min-h-32"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white py-6 text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              Enviar Mensaje
              <Send className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}