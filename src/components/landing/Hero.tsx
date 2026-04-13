import { Button } from "@/components/ui/button";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-stone-50 to-stone-100">
      <AnimatedBackground />
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 mb-6">
          Experiencia Miguel
        </h1>
        
        <p className="text-xl sm:text-2xl text-stone-700 mb-12 max-w-3xl mx-auto">
          Transforma tu vida a través de la lectura reflexiva y el crecimiento personal
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth">
            <Button size="lg" className="bg-stone-900 hover:bg-stone-800 text-white px-8">
              Comenzar Ahora
            </Button>
          </Link>
          <Link href="#descripcion">
            <Button size="lg" variant="outline" className="border-stone-300 text-stone-900 hover:bg-stone-100 px-8">
              Conocer Más
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}