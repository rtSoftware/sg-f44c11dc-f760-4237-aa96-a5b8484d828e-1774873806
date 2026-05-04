import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  BookOpen,
  Loader2,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Trophy,
} from "lucide-react";
import { getLibroById } from "@/services/libroService";
import { getQuizByLibroId, getPreguntasByQuizId } from "@/services/quizService";
import type { Tables } from "@/integrations/supabase/types";
import Link from "next/link";

type Libro = Tables<"libro">;
type Quiz = Tables<"quiz">;
type QuizPregunta = Tables<"quiz_pregunta">;

interface RespuestaUsuario {
  preguntaId: string;
  respuestaSeleccionada: number;
}

export default function QuizUsuario() {
  const router = useRouter();
  const { libroId } = router.query;

  const [loading, setLoading] = useState(true);
  const [libro, setLibro] = useState<Libro | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [preguntas, setPreguntas] = useState<QuizPregunta[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [respuestasUsuario, setRespuestasUsuario] = useState<RespuestaUsuario[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!libroId || typeof libroId !== "string") return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const { data: libroData, error: libroError } = await getLibroById(libroId);
        if (libroError || !libroData) {
          console.error("Error loading libro:", libroError);
          router.push("/");
          return;
        }
        setLibro(libroData);

        const { data: quizData, error: quizError } = await getQuizByLibroId(libroId);
        if (quizError || !quizData) {
          console.error("Error loading quiz:", quizError);
          router.push("/");
          return;
        }
        setQuiz(quizData);

        const { data: preguntasData, error: preguntasError } = await getPreguntasByQuizId(quizData.id);
        if (preguntasError || !preguntasData || preguntasData.length === 0) {
          console.error("Error loading preguntas:", preguntasError);
          router.push("/");
          return;
        }
        
        setPreguntas(preguntasData.sort((a, b) => a.numero_pregunta - b.numero_pregunta));
      } catch (error) {
        console.error("Error loading quiz:", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [libroId]);

  useEffect(() => {
    const preguntaActual = preguntas[currentIndex];
    if (preguntaActual) {
      const respuestaExistente = respuestasUsuario.find(
        (r) => r.preguntaId === preguntaActual.id
      );
      setSelectedAnswer(respuestaExistente?.respuestaSeleccionada ?? null);
    }
  }, [currentIndex, preguntas, respuestasUsuario]);

  const handleNext = () => {
    if (selectedAnswer !== null && currentIndex < preguntas.length - 1) {
      saveRespuesta();
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      if (selectedAnswer !== null) {
        saveRespuesta();
      }
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleFinish = () => {
    if (selectedAnswer !== null) {
      saveRespuesta();
    }
    setShowResults(true);
  };

  const saveRespuesta = () => {
    if (selectedAnswer === null) return;

    const preguntaActual = preguntas[currentIndex];
    setRespuestasUsuario((prev) => {
      const filtered = prev.filter((r) => r.preguntaId !== preguntaActual.id);
      return [
        ...filtered,
        { preguntaId: preguntaActual.id, respuestaSeleccionada: selectedAnswer },
      ];
    });
  };

  const calcularResultados = () => {
    let correctas = 0;
    preguntas.forEach((pregunta) => {
      const respuestaUsuario = respuestasUsuario.find(
        (r) => r.preguntaId === pregunta.id
      );
      if (respuestaUsuario && respuestaUsuario.respuestaSeleccionada === pregunta.respuesta_correcta) {
        correctas++;
      }
    });
    return correctas;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-stone-600 mx-auto mb-4" />
          <p className="text-stone-600">Cargando quiz...</p>
        </div>
      </div>
    );
  }

  if (!libro || !quiz || preguntas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Card className="w-full max-w-md border-stone-200">
          <CardHeader>
            <CardTitle className="text-stone-900">Quiz no disponible</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-stone-600 mb-4">Este libro aún no tiene preguntas disponibles.</p>
            <Link href="/">
              <Button className="w-full bg-stone-900 hover:bg-stone-800">
                Volver al Inicio
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showResults) {
    const correctas = calcularResultados();
    const porcentaje = Math.round((correctas / preguntas.length) * 100);

    return (
      <>
        <SEO
          title={`Resultados Quiz - ${libro.titulo} | Experiencia Miguel`}
          description="Revisa tus resultados del quiz"
        />
        <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 py-12 px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-stone-200 shadow-xl mb-8">
              <CardHeader className="text-center pb-8 bg-gradient-to-r from-purple-50 to-indigo-50">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-amber-600" />
                <CardTitle className="text-3xl font-bold text-stone-900 mb-2">
                  ¡Quiz Completado!
                </CardTitle>
                <div className="flex items-center justify-center gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-purple-600">{porcentaje}%</p>
                    <p className="text-sm text-stone-600 mt-1">Puntaje</p>
                  </div>
                  <div className="h-16 w-px bg-stone-300" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-stone-900">
                      {correctas}/{preguntas.length}
                    </p>
                    <p className="text-sm text-stone-600 mt-1">Correctas</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-stone-900">
                  Revisión de Respuestas
                </h3>
                <div className="space-y-6">
                  {preguntas.map((pregunta, index) => {
                    const respuestaUsuario = respuestasUsuario.find(
                      (r) => r.preguntaId === pregunta.id
                    );
                    const esCorrecta =
                      respuestaUsuario?.respuestaSeleccionada === pregunta.respuesta_correcta;
                      
                    const opciones = (pregunta.respuestas as string[]) || [];

                    return (
                      <div
                        key={pregunta.id}
                        className={`p-4 rounded-lg border-2 ${
                          esCorrecta
                            ? "border-green-200 bg-green-50"
                            : "border-red-200 bg-red-50"
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          {esCorrecta ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-stone-900 mb-2">
                              {index + 1}. {pregunta.texto_pregunta}
                            </p>
                            <div className="space-y-2">
                              {opciones.map((respuestaTexto, idx) => {
                                const num = idx + 1;
                                const esRespuestaCorrecta = num === pregunta.respuesta_correcta;
                                const esRespuestaUsuario = num === respuestaUsuario?.respuestaSeleccionada;

                                if (!respuestaTexto) return null;

                                const mostrarRespuesta = esRespuestaCorrecta || esRespuestaUsuario;

                                if (!mostrarRespuesta) return null;

                                return (
                                  <div
                                    key={num}
                                    className={`p-3 rounded ${
                                      esRespuestaCorrecta && esRespuestaUsuario
                                        ? "bg-green-100 border border-green-300"
                                        : esRespuestaCorrecta
                                        ? "bg-green-100 border border-green-300"
                                        : "bg-red-100 border border-red-300"
                                    }`}
                                  >
                                    <div className="flex items-start gap-2">
                                      <span className="text-sm font-medium text-stone-700">
                                        {respuestaTexto}
                                      </span>
                                      <div className="ml-auto flex gap-1 flex-shrink-0">
                                        {esRespuestaCorrecta && esRespuestaUsuario ? (
                                          <Badge className="bg-green-600 text-white text-xs">
                                            Tu respuesta - Correcta
                                          </Badge>
                                        ) : esRespuestaCorrecta ? (
                                          <Badge className="bg-green-600 text-white text-xs">
                                            Correcta
                                          </Badge>
                                        ) : esRespuestaUsuario ? (
                                          <Badge variant="destructive" className="text-xs">
                                            Tu respuesta
                                          </Badge>
                                        ) : null}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full border-stone-300">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Inicio
                </Button>
              </Link>
              <Button
                onClick={() => {
                  setShowResults(false);
                  setCurrentIndex(0);
                  setRespuestasUsuario([]);
                  setSelectedAnswer(null);
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              >
                Intentar de Nuevo
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const preguntaActual = preguntas[currentIndex];
  const progreso = ((currentIndex + 1) / preguntas.length) * 100;
  const opciones = (preguntaActual?.respuestas as string[]) || [];

  return (
    <>
      <SEO
        title={`Quiz - ${libro?.titulo} | Experiencia Miguel`}
        description={`Pon a prueba tus conocimientos sobre ${libro?.titulo}`}
      />
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="border-stone-200 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center gap-3 mb-4">
                <BookOpen className="w-6 h-6 text-purple-600" />
                <div className="flex-1">
                  <CardTitle className="text-2xl font-bold text-stone-900">
                    {libro?.titulo}
                  </CardTitle>
                  {libro?.autor && (
                    <p className="text-sm text-stone-600 mt-1">por {libro.autor}</p>
                  )}
                </div>
                <Badge variant="outline" className="border-purple-300 text-purple-700">
                  {currentIndex + 1} / {preguntas.length}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-stone-600">
                  <span>Progreso</span>
                  <span>{Math.round(progreso)}%</span>
                </div>
                <Progress value={progreso} className="h-2" />
              </div>
            </CardHeader>

            <CardContent className="p-8">
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-stone-900 mb-6">
                  {preguntaActual?.texto_pregunta}
                </h3>

                <RadioGroup
                  value={selectedAnswer?.toString() || ""}
                  onValueChange={(value) => setSelectedAnswer(parseInt(value))}
                  className="space-y-3"
                >
                  {opciones.map((respuestaTexto, idx) => {
                    const num = idx + 1;

                    if (!respuestaTexto) return null;

                    return (
                      <div
                        key={num}
                        className={`flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                          selectedAnswer === num
                            ? "border-purple-500 bg-purple-50"
                            : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                        }`}
                        onClick={() => setSelectedAnswer(num)}
                      >
                        <RadioGroupItem value={num.toString()} id={`option-${num}`} className="mt-1" />
                        <Label
                          htmlFor={`option-${num}`}
                          className="flex-1 cursor-pointer text-stone-700 leading-relaxed"
                        >
                          {respuestaTexto}
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  variant="outline"
                  className="flex-1 border-stone-300"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Anterior
                </Button>

                {currentIndex < preguntas.length - 1 ? (
                  <Button
                    onClick={handleNext}
                    disabled={selectedAnswer === null}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                  >
                    Siguiente
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleFinish}
                    disabled={selectedAnswer === null}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                  >
                    Finalizar
                    <CheckCircle2 className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <Link href="/">
              <Button variant="ghost" className="text-stone-600 hover:text-stone-900">
                Cancelar Quiz
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}