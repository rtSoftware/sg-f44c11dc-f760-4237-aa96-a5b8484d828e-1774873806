import { Brain, MessageCircle, Users, Lightbulb, Target, Rocket } from "lucide-react";

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
    <section className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-6xl font-black text-stone-900 mb-6">
            Vivimos en la era del ruido
          </h2>
          <p className="text-xl md:text-2xl text-stone-600 max-w-3xl mx-auto leading-relaxed font-light">
            Mensajes, notificaciones, opiniones, datos infinitos… y, sin embargo, cada vez menos personas saben pensar en voz alta con claridad, lógica y profundidad.
          </p>
          <div className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200/50 max-w-3xl mx-auto">
            <p className="text-lg text-stone-800 font-medium">
              <span className="font-black text-amber-800">Experiencia Miguel</span> no es solo un libro de oratoria.<br />
              Es un manual para recuperar la habilidad que define nuestra inteligencia: <span className="font-bold text-orange-700">la oralidad consciente.</span>
            </p>
          </div>
        </div>

        <div className="space-y-16">
          {sections.map((section, index) => (
            <div key={index} className="group">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <section.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-stone-900 leading-tight pt-2">
                  {section.title}
                </h3>
              </div>

              <div className="ml-18 space-y-4">
                {section.content && section.content.map((paragraph, pIndex) => (
                  <p key={pIndex} className="text-lg text-stone-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}

                {section.skills && (
                  <ul className="space-y-3 mt-6">
                    {section.skills.map((skill, sIndex) => (
                      <li key={sIndex} className="flex items-start gap-3 text-lg">
                        <span className="flex-shrink-0 w-2 h-2 bg-amber-500 rounded-full mt-2.5" />
                        <span className="text-stone-800">{skill}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {section.highlight && (
                  <div className="mt-6 p-5 bg-stone-900 rounded-xl border-l-4 border-amber-500">
                    <p className="text-lg text-amber-50 font-medium italic">
                      {section.highlight}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 p-10 bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl shadow-2xl">
          <h3 className="text-4xl md:text-5xl font-black text-amber-400 mb-6 text-center">
            La oratoria no es un lujo.<br />Es una necesidad democrática.
          </h3>
          
          <div className="space-y-4 mb-8">
            <p className="text-xl text-stone-200 text-center">
              Una sociedad que no sabe dialogar se polariza.
            </p>
            <p className="text-xl text-stone-200 text-center">
              Una generación que no sabe argumentar es manipulable.
            </p>
            <p className="text-xl text-stone-200 text-center">
              Una mente que no sabe expresar lo que piensa termina obedeciendo lo que otros dictan.
            </p>
          </div>

          <p className="text-2xl text-amber-300 font-bold text-center mb-8">
            La palabra es el vehículo de la libertad.
          </p>

          <div className="p-6 bg-amber-500/10 backdrop-blur-sm rounded-2xl border border-amber-500/30">
            <p className="text-xl text-amber-100 text-center font-medium">
              ¿Estamos formando personas capaces de conducir su propio destino…<br />
              o simples repetidores de discursos que no comprenden?
            </p>
          </div>
        </div>

        <div className="mt-16 text-center space-y-6">
          <h3 className="text-4xl md:text-5xl font-black text-stone-900">
            La verdadera transformación comienza cuando aprendes a pensar en voz alta
          </h3>
          
          <div className="flex flex-wrap justify-center gap-4 pt-6">
            <div className="px-6 py-3 bg-amber-100 rounded-full border-2 border-amber-300">
              <p className="text-lg font-bold text-amber-900">👉 Recupera tu voz</p>
            </div>
            <div className="px-6 py-3 bg-orange-100 rounded-full border-2 border-orange-300">
              <p className="text-lg font-bold text-orange-900">👉 Ordena tu pensamiento</p>
            </div>
            <div className="px-6 py-3 bg-amber-100 rounded-full border-2 border-amber-300">
              <p className="text-lg font-bold text-amber-900">👉 Eleva tu influencia</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}