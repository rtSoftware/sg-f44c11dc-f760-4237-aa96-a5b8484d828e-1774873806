import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100/40 via-orange-50/30 to-stone-100/40" />
      
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-20 left-10 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-400 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100/80 backdrop-blur-sm rounded-full mb-8 border border-amber-200/50">
          <BookOpen className="w-4 h-4 text-amber-700" />
          <span className="text-sm font-medium text-amber-900">Comunidad de Lectores</span>
        </div>

        <h1 className="text-6xl md:text-8xl font-black mb-6 leading-tight">
          <span className="bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 bg-clip-text text-transparent">
            EXPERIENCIA
          </span>
          <br />
          <span className="text-stone-900">MIGUEL</span>
        </h1>

        <p className="text-2xl md:text-3xl text-stone-700 font-light mb-4 max-w-3xl mx-auto leading-relaxed">
          Más que palabras: la habilidad olvidada que define tu inteligencia
        </p>

        <p className="text-lg md:text-xl text-stone-600 mb-12 max-w-2xl mx-auto">
          Oratoria para liberar la mente
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/auth">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              Acceder a la Plataforma
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          
          <Button 
            size="lg" 
            variant="outline"
            className="border-2 border-stone-300 hover:border-amber-600 hover:bg-amber-50 px-8 py-6 text-lg font-semibold rounded-xl transition-all duration-300"
            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Ver Planes
          </Button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-stone-400 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-1.5 bg-stone-400 rounded-full" />
        </div>
      </div>
    </section>
  );
}