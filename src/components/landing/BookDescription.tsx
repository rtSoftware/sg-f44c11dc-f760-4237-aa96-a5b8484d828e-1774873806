import { Brain, MessageCircle, Users, Lightbulb, Target, Rocket, BookOpen, Headphones, FileText, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const sections = [
  {
    icon: Target,
    title: "El problema que nadie está enseñando",
    content: [
      "Durante décadas, el sistema educativo ha priorizado la lectura y las matemáticas. Pero olvidó una tercera alfabetización fundamental:",
      "En los años 60, el académico británico Andrew Wilkinson acuñó el término Oracy para advertir que la competencia oral debía tener el mismo estatus que la lectura y las matemáticas.",
      "Y, sin embargo, seguimos formando generaciones que saben repetir… pero no saben argumentar."
    ],
    skills: ["Leer (literacy)", "Calcular (numeracy)", "Hablar y escuchar con pensamiento estructurado (oracy)"]
  },
  {
    icon: Brain,
    title: "La conversación es una fábrica de ideas",
    content: [
      "El neurocientífico argentino Mariano Sigman ha demostrado que la conversación no es solo comunicación: es una herramienta para ordenar el pensamiento.",
      "Hablar bien no es adornar palabras. Es pensar mejor."
    ],
    skills: [
      "Transformas caos mental en estructura lógica",
      "Activan redes de empatía",
      "Se fortalece la neuroplasticidad",
      "Refinas tu comprensión del mundo"
    ]
  },
  {
    icon: Lightbulb,
    title: "La oratoria como laboratorio del pensamiento crítico",
    content: [
      "Según el modelo de Richard Paul y Linda Elder, pensar críticamente implica someter nuestras ideas a estándares rigurosos.",
      "A diferencia de un texto que puede editarse infinitamente, el discurso en vivo te obliga a habitar tu argumento en tiempo real."
    ],
    skills: [
      "Claridad – ¿Se entiende lo que dices?",
      "Exactitud – ¿Es verificable?",
      "Relevancia – ¿Responde al problema central?",
      "Lógica – ¿Tiene coherencia interna?",
      "Justicia intelectual – ¿Considera otros puntos de vista?"
    ]
  },
  {
    icon: Users,
    title: "De estudiantes pasivos a ciudadanos activos",
    content: [
      "La oralidad transforma aulas en foros.",
      "Cuando una persona aprende a argumentar, deja de repetir un guion ajeno y comienza a construir su propia postura ética, política y social.",
      "Y eso cambia destinos."
    ],
    skills: [
      "Debaten",
      "Contrastan ideas",
      "Cuestionan estructuras",
      "Encuentran su propia voz"
    ]
  },
  {
    icon: MessageCircle,
    title: "El rol del mentor: inspiración, no imposición",
    content: [
      "Experiencia Miguel no solo enseña técnica. Propone un nuevo paradigma educativo:",
      "El docente no es el único que sabe. Es el arquitecto del pensamiento de sus estudiantes.",
      "Para muchos jóvenes, la escuela es su segunda —y a veces única— oportunidad para aprender a expresarse con dignidad."
    ]
  },
  {
    icon: Rocket,
    title: "¿Qué encontrarás en EXPERIENCIA MIGUEL?",
    skills: [
      "Fundamentos neurocientíficos de la conversación",
      "Técnicas prácticas para estructurar discursos poderosos",
      "Ejercicios para desarrollar pensamiento crítico",
      "Estrategias para debates formativos",
      "Metodología para formar ciudadanos elocuentes",
      "Un modelo pedagógico humanista aplicado al siglo XXI"
    ],
    highlight: "Este libro no enseña a 'hablar bonito'. Enseña a pensar con ética, claridad y valentía."
  }
];

export function BookDescription() {
  return (
    <section id="descripcion" className="py-24 bg-white/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
            Sobre el Libro
          </h2>
          <p className="text-xl text-stone-600 max-w-3xl mx-auto">
            Una obra transformadora que te guiará en tu camino de autodescubrimiento
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Imagen del libro */}
          <div className="relative">
            <div className="aspect-[3/4] rounded-2xl shadow-2xl overflow-hidden">
              <img
                src="/Screenshot_20260410-090848_1_.png"
                alt="Portada del libro Experiencia Miguel"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Contenido */}
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center border border-stone-200">
                  <BookOpen className="w-6 h-6 text-stone-900" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-2">
                    Contenido Profundo
                  </h3>
                  <p className="text-stone-600">
                    Capítulos diseñados para explorar aspectos fundamentales del crecimiento personal
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center border border-stone-200">
                  <Lightbulb className="w-6 h-6 text-stone-900" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-2">
                    Ejercicios Prácticos
                  </h3>
                  <p className="text-stone-600">
                    Herramientas y actividades para aplicar los conceptos en tu vida diaria
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center border border-stone-200">
                  <Users className="w-6 h-6 text-stone-900" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-2">
                    Comunidad Activa
                  </h3>
                  <p className="text-stone-600">
                    Comparte experiencias y aprende junto a otros lectores en el mismo camino
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center border border-stone-200">
                  <Target className="w-6 h-6 text-stone-900" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-2">
                    Resultados Medibles
                  </h3>
                  <p className="text-stone-600">
                    Sistema de seguimiento para observar tu evolución y celebrar tus logros
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link href="/auth">
                <Button size="lg" className="bg-stone-900 hover:bg-stone-800 text-white w-full sm:w-auto">
                  Comenzar tu Viaje
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Características adicionales */}
        <div className="mt-24 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-stone-50 border border-stone-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Headphones className="w-8 h-8 text-stone-700" />
            </div>
            <h4 className="text-lg font-semibold text-stone-900 mb-2">Audio Disponible</h4>
            <p className="text-stone-600 text-sm">
              Escucha el libro en formato audio mientras viajas o haces ejercicio
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-stone-50 border border-stone-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-stone-700" />
            </div>
            <h4 className="text-lg font-semibold text-stone-900 mb-2">Notas Personales</h4>
            <p className="text-stone-600 text-sm">
              Toma notas mientras lees y organiza tus reflexiones
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-stone-50 border border-stone-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-stone-700" />
            </div>
            <h4 className="text-lg font-semibold text-stone-900 mb-2">Progreso Visual</h4>
            <p className="text-stone-600 text-sm">
              Visualiza tu avance a través de cada capítulo del libro
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-stone-50 border border-stone-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-stone-700" />
            </div>
            <h4 className="text-lg font-semibold text-stone-900 mb-2">A tu Ritmo</h4>
            <p className="text-stone-600 text-sm">
              Avanza según tu tiempo y necesidades sin presiones
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}