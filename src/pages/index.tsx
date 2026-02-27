import { SEO } from "@/components/SEO";
import { Hero } from "@/components/landing/Hero";
import { BookDescription } from "@/components/landing/BookDescription";
import { PricingSection } from "@/components/landing/PricingSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <SEO 
        title="Experiencia Miguel - Oratoria para liberar la mente"
        description="Más que palabras: la habilidad olvidada que define tu inteligencia. Únete a la comunidad de lectores que están transformando su pensamiento crítico a través de la oratoria consciente."
        image="/og-image.png"
      />
      <main className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-stone-50">
        <Hero />
        <BookDescription />
        <PricingSection />
        <ContactSection />
        <Footer />
      </main>
    </>
  );
}