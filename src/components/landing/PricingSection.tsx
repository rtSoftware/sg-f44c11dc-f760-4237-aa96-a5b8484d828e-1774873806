import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";

const plans = [
  {
    name: "Lector",
    price: "$19",
    period: "mes",
    description: "Para comenzar tu viaje en la oratoria consciente",
    features: [
      "Acceso a contenido básico del libro",
      "Foro de discusión comunitario",
      "Recursos descargables mensuales",
      "Newsletter semanal",
      "Acceso a eventos virtuales grabados"
    ],
    highlighted: false
  },
  {
    name: "Orador",
    price: "$49",
    period: "mes",
    description: "Para quienes buscan dominar el arte de la palabra",
    features: [
      "Todo lo incluido en Lector",
      "Sesiones de práctica grupales en vivo",
      "Ejercicios interactivos avanzados",
      "Biblioteca completa de recursos",
      "Certificado de participación",
      "Acceso prioritario a eventos",
      "Comunidad privada exclusiva"
    ],
    highlighted: true
  },
  {
    name: "Mentor",
    price: "$99",
    period: "mes",
    description: "Para educadores y líderes que transforman comunidades",
    features: [
      "Todo lo incluido en Orador",
      "Sesiones de mentoría 1:1 mensuales",
      "Materiales pedagógicos exclusivos",
      "Acceso anticipado a nuevo contenido",
      "Certificación como facilitador",
      "Red de mentores profesionales",
      "Recursos para impartir talleres",
      "Soporte prioritario"
    ],
    highlighted: false
  }
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-6 bg-gradient-to-b from-stone-50 to-amber-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-black text-stone-900 mb-6">
            Planes de Acceso
          </h2>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tu nivel de compromiso con el desarrollo de tu oratoria
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-3xl p-8 transition-all duration-300 hover:-translate-y-2 ${
                plan.highlighted
                  ? "bg-gradient-to-br from-amber-600 to-orange-600 shadow-2xl scale-105 border-4 border-amber-400"
                  : "bg-white shadow-lg border-2 border-stone-200 hover:border-amber-300"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-stone-900 text-amber-400 px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                  <Star className="w-4 h-4 fill-current" />
                  Más Popular
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className={`text-3xl font-black mb-2 ${plan.highlighted ? "text-white" : "text-stone-900"}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline justify-center gap-2 mb-3">
                  <span className={`text-5xl font-black ${plan.highlighted ? "text-white" : "text-amber-600"}`}>
                    {plan.price}
                  </span>
                  <span className={`text-lg ${plan.highlighted ? "text-amber-100" : "text-stone-500"}`}>
                    / {plan.period}
                  </span>
                </div>
                <p className={`text-sm ${plan.highlighted ? "text-amber-100" : "text-stone-600"}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-start gap-3">
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                      plan.highlighted ? "bg-amber-400" : "bg-amber-100"
                    }`}>
                      <Check className={`w-3.5 h-3.5 ${plan.highlighted ? "text-amber-900" : "text-amber-700"}`} />
                    </div>
                    <span className={`text-sm ${plan.highlighted ? "text-white" : "text-stone-700"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full py-6 text-lg font-bold rounded-xl transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-white text-amber-700 hover:bg-amber-50 shadow-lg"
                    : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md hover:shadow-lg"
                }`}
              >
                Comenzar Ahora
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-stone-600 mb-4">
            ¿Necesitas un plan personalizado para tu institución?
          </p>
          <Button
            variant="outline"
            className="border-2 border-amber-600 text-amber-700 hover:bg-amber-50 px-8 py-6 text-lg font-semibold rounded-xl"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Contáctanos
          </Button>
        </div>
      </div>
    </section>
  );
}