import Link from "next/link";
import { BookOpen, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-stone-200">
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
            <h3 className="font-semibold text-stone-900 mb-4">Contacto</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-sm text-stone-600">
                <Mail className="w-4 h-4" />
                contacto@experienciamiguel.com
              </li>
              <li className="flex items-center gap-2 text-sm text-stone-600">
                <Phone className="w-4 h-4" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-center gap-2 text-sm text-stone-600">
                <MapPin className="w-4 h-4" />
                Ciudad, País
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