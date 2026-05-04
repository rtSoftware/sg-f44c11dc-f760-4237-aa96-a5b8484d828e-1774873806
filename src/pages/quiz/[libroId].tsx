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
          router.push("/");
          return;
        }
        setLibro(libroData);

        const { data: quizData, error: quizError } = await getQuizByLibroId(libroId);
        if (quizError || !quizData) {
          router.push("/");
          return;
        }
        setQuiz(quizData);

        const { data: preguntasData, error: preguntasError } = await getPreguntasByQuizId(quizData.id);
        if (preguntasError || !preguntasData || preguntasData.length === 0) {
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

  const handleSelectAnswer = (value: string) => {
    setSelectedAnswer(parseInt(value));
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;

    const currentPregunta = preguntas[currentIndex];
    const nuevasRespuestas = [...respuestasUsuario];
    
    const existingIndex = nuevasRespuestas.findIndex(r => r.preguntaId === currentPregunta.id);
    if (existingIndex >= 0) {
      nuevasRespuestas[existingIndex] = {
        preguntaId: currentPregunta.id,
        respuestaSeleccionada: selectedAnswer,
      };
    } else {
      nuevasRespuestas.push({
        preguntaId: currentPregunta.id,
        respuestaSeleccionada: selectedAnswer,
      });
    }

    setRespuestasUsuario(nuevasRespuestas);

    if (currentIndex < preguntas.length - 1) {
      setCurrentIndex(currentIndex + 1);
      const nextPregunta = preguntas[currentIndex + 1];
      const nextRespuesta = nuevasRespuestas.find(r => r.preguntaId === nextPregunta.id);
      setSelectedAnswer(nextRespuesta?.respuestaSeleccionada || null);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      const prevPregunta = preguntas[currentIndex - 1];
      const prevRespuesta = respuestasUsuario.find(r => r.preguntaId === prevPregunta.id);
      setSelectedAnswer(prevRespuesta?.respuestaSeleccionada || null);
    }
  };

  const calcularResultados = () => {
    let correctas = 0;
    preguntas.forEach(pregunta => {
      const respuesta = respuestasUsuario.find(r => r.preguntaId === pregunta.id);
      if (respuesta && respuesta.respuestaSeleccionada === pregunta.respuesta_correcta) {
        correctas++;
      }
    });
    return {
      correctas,
      total: preguntas.length,
      porcentaje: Math.round((correctas / preguntas.length) * 100),
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin text-stone-900" />
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
    const resultados = calcularResultados();

    return (
      <>
        <SEO
          title={`Resultados - Quiz ${libro.titulo}`}
          description={`Resultados del cuestionario de ${libro.titulo}`}
        />
        <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full mb-4">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-stone-900 mb-2">¡Quiz Completado!</h1>
              <p className="text-lg text-stone-600">{libro.titulo}</p>
            </div>

            <Card className="border-stone-200 mb-8">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600 mb-2">
                    {resultados.porcentaje}%
                  </div>
                  <p className="text-xl text-stone-700 mb-4">
                    {resultados.correctas} de {resultados.total} correctas
                  </p>
                  <Progress value={resultados.porcentaje} className="h-3" />
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4 mb-8">
              {preguntas.map((pregunta, index) => {
                const respuesta = respuestasUsuario.find(r => r.preguntaId === pregunta.id);
                const esCorrecta = respuesta?.respuestaSeleccionada === pregunta.respuesta_correcta;

                return (
                  <Card key={pregunta.id} className={`border-2 ${esCorrecta ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <Badge variant="outline" className={`mb-2 ${esCorrecta ? "border-green-600 text-green-700" : "border-red-600 text-red-700"}`}>
                            Pregunta {pregunta.numero_pregunta}
                          </Badge>
                          <CardTitle className="text-lg text-stone-900">
                            {pregunta.texto_pregunta}
                          </CardTitle>
                        </div>
                        {esCorrecta ? (
                          <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600 shrink-0" />
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {(pregunta.respuestas as string[]).map((resp, idx) => {
                        const numeroRespuesta = idx + 1;
                        const esRespuestaCorrecta = numeroRespuesta === pregunta.respuesta_correcta;
                        const esRespuestaSeleccionada = numeroRespuesta === respuesta?.respuestaSeleccionada;

                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg border-2 ${
                              esRespuestaCorrecta && esRespuestaSeleccionada
                                ? "bg-green-100 border-green-400"
                                : esRespuestaCorrecta
                                ? "bg-green-100 border-green-400"
                                : esRespuestaSeleccionada
                                ? "bg-red-100 border-red-400"
                                : "bg-white border-stone-200"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-stone-700">{numeroRespuesta}.</span>
                              <span className={`flex-1 ${esRespuestaCorrecta ? "font-semibold text-green-900" : "text-stone-700"}`}>
                                {resp}
                              </span>
                              {esRespuestaCorrecta && esRespuestaSeleccionada && (
                                <Badge className="bg-green-600 text-white">Tu respuesta - Correcta</Badge>
                              )}
                              {esRespuestaCorrecta && !esRespuestaSeleccionada && (
                                <Badge className="bg-green-600 text-white">Correcta</Badge>
                              )}
                              {!esRespuestaCorrecta && esRespuestaSeleccionada && (
                                <Badge variant="destructive">Tu respuesta</Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

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

  const currentPregunta = preguntas[currentIndex];
  const progress = ((currentIndex + 1) / preguntas.length) * 100;

  return (
    <>
      <SEO
        title={`Quiz - ${libro.titulo}`}
        description={`Cuestionario sobre ${libro.titulo}`}
      />
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-stone-900">{libro.titulo}</h1>
                  <p className="text-sm text-stone-600">Quiz de Comprensión</p>
                </div>
              </div>
              <Badge variant="outline" className="border-purple-300 text-purple-700">
                {currentIndex + 1} / {preguntas.length}
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <Card className="border-stone-200 shadow-lg">
            <CardHeader>
              <div className="flex items-start gap-3">
                <Badge className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                  Pregunta {currentPregunta.numero_pregunta}
                </Badge>
              </div>
              <CardTitle className="text-2xl text-stone-900 mt-4">
                {currentPregunta.texto_pregunta}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={selectedAnswer?.toString() || ""} onValueChange={handleSelectAnswer}>
                {(currentPregunta.respuestas as string[]).map((respuesta, idx) => {
                  const numeroRespuesta = idx + 1;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedAnswer === numeroRespuesta
                          ? "border-purple-500 bg-purple-50"
                          : "border-stone-200 hover:border-purple-300 hover:bg-stone-50"
                      }`}
                      onClick={() => setSelectedAnswer(numeroRespuesta)}
                    >
                      <RadioGroupItem value={numeroRespuesta.toString()} id={`respuesta-${idx}`} />
                      <Label
                        htmlFor={`respuesta-${idx}`}
                        className="flex-1 cursor-pointer text-base text-stone-700"
                      >
                        <span className="font-semibold mr-2">{numeroRespuesta}.</span>
                        {respuesta}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>

              <div className="flex gap-4 pt-6">
                {currentIndex > 0 && (
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    className="border-stone-300"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Anterior
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={selectedAnswer === null}
                  className="ml-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                >
                  {currentIndex < preguntas.length - 1 ? (
                    <>
                      Siguiente
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  ) : (
                    <>
                      Ver Resultados
                      <Trophy className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
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