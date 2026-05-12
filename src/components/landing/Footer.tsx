import Link from "next/link";
import { BookOpen, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/90 backdrop-blur-sm border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-stone-900" />
              <span className="text-xl font-bold text-stone-900">Experiencia Miguel</span>
            </div>
            <p className="text-sm text-stone-600">
              Transformando vidas a través de la lectura reflexiva y el crecimiento personal.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="font-semibold text-stone-900 mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#descripcion" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                  Sobre el Libro
                </Link>
              </li>
              <li>
                <Link href="/#precios" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                  Precios
                </Link>
              </li>
              <li>
                <Link href="/#contacto" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/auth" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                  Iniciar Sesión
                </Link>
              </li>
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h3 className="font-semibold text-stone-900 mb-4">Recursos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/biblioteca" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                  Biblioteca Digital
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                  Guía de Estudio
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                  Preguntas Frecuentes
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-stone-900 mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:tapiara@iasos.com.mx" className="text-stone-600 hover:text-amber-800 transition-colors flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  tapiara@iasos.com.mx
                </a>
              </li>
              <li>
                <a href="tel:+525549193378" className="text-stone-600 hover:text-amber-800 transition-colors flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  55 49 19 33 78
                </a>
              </li>
              <li className="text-stone-600 flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>Reforma 296, Col Juárez<br />Ciudad de México</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-stone-200">
          <p className="text-center text-sm text-stone-600">
            © {currentYear} Experiencia Miguel. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}