import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

export function PricingSection() {
  const plans = [
    {
      name: "Básico",
      price: "$9.99",
      period: "/mes",
      description: "Perfecto para comenzar tu viaje",
      features: [
        "Acceso completo al libro digital",
        "Notas personales ilimitadas",
        "Actualizaciones de contenido",
        "Soporte por email",
      ],
      cta: "Comenzar",
      popular: false,
    },
    {
      name: "Premium",
      price: "$19.99",
      period: "/mes",
      description: "La experiencia completa",
      features: [
        "Todo en Básico",
        "Audio libro completo",
        "Ejercicios interactivos",
        "Mentorías grupales mensuales",
        "Certificado de finalización",
        "Soporte prioritario",
      ],
      cta: "Comenzar Premium",
      popular: true,
    },
    {
      name: "Anual",
      price: "$199.99",
      period: "/año",
      description: "Mejor valor a largo plazo",
      features: [
        "Todo en Premium",
        "2 meses gratis",
        "Acceso anticipado a nuevo contenido",
        "Sesiones 1-a-1 trimestrales",
        "Acceso de por vida a contenido exclusivo",
      ],
      cta: "Comenzar Anual",
      popular: false,
    },
  ];

  return (
    <section id="precios" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
            Elige tu Plan
          </h2>
          <p className="text-xl text-stone-600 max-w-3xl mx-auto">
            Selecciona el plan que mejor se adapte a tus necesidades y objetivos
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative border-stone-200 bg-white ${
                plan.popular ? "shadow-xl scale-105" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-stone-900 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Más Popular
                  </span>
                </div>
              )}
              
              <CardHeader className="border-b border-stone-100 pb-6">
                <CardTitle className="text-2xl text-stone-900">{plan.name}</CardTitle>
                <CardDescription className="text-stone-600">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-stone-900">{plan.price}</span>
                  <span className="text-stone-600">{plan.period}</span>
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-stone-900 flex-shrink-0 mt-0.5" />
                      <span className="text-stone-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/auth">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-stone-900 hover:bg-stone-800 text-white"
                        : "bg-white hover:bg-stone-50 text-stone-900 border border-stone-300"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-stone-600 mb-4">
            ¿No estás seguro qué plan elegir?
          </p>
          <Link href="/#contacto">
            <Button variant="outline" className="border-stone-300 text-stone-900 hover:bg-stone-100">
              Contáctanos para Ayuda
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}