import { BookOpen, Mail, MessageCircle } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-stone-900 to-stone-800 text-stone-300 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">EXPERIENCIA</h3>
                <p className="text-sm text-amber-400">MIGUEL</p>
              </div>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed">
              Oratoria para liberar la mente. Una comunidad dedicada al desarrollo del pensamiento crítico y la elocuencia consciente.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">Inicio</a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-amber-400 transition-colors">Planes</a>
              </li>
              <li>
                <a href="#contact" className="hover:text-amber-400 transition-colors">Contacto</a>
              </li>
              <li>
                <a href="#" className="hover:text-amber-400 transition-colors">Acceder a la Plataforma</a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Contacto</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400" />
                <span>contacto@experienciamiguel.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-amber-400" />
                <span>Comunidad activa 24/7</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-stone-700 text-center">
          <p className="text-sm text-stone-400">
            © {currentYear} Experiencia Miguel. Todos los derechos reservados.
          </p>
          <p className="text-xs text-stone-500 mt-2 italic">
            "La verdadera transformación comienza cuando aprendes a pensar en voz alta"
          </p>
        </div>
      </div>
    </footer>
  );
}