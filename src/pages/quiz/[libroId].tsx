import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Wand2,
  AlertCircle,
  Edit,
  CheckCircle,
} from "lucide-react";
import { getLibroById } from "@/services/libroService";
import {
  getQuizByLibroId,
  createQuiz,
  getPreguntasByQuizId,
  createPregunta,
  updatePregunta,
  deletePregunta,
  generarPreguntasIA,
  deleteAllPreguntas,
} from "@/services/quizService";
import type { Tables } from "@/integrations/supabase/types";

type Libro = Tables<"libro">;
type Quiz = Tables<"quiz">;
type QuizPregunta = Tables<"quiz_pregunta">;

interface PreguntaForm {
  id?: string;
  numero_pregunta: number;
  texto_pregunta: string;
  respuestas: string[];
  respuesta_correcta: number;
}

export default function EditarQuiz() {
  const router = useRouter();
  const { libroId } = router.query;
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingIA, setGeneratingIA] = useState(false);
  const [libro, setLibro] = useState<Libro | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [preguntas, setPreguntas] = useState<QuizPregunta[]>([]);
  const [editingPregunta, setEditingPregunta] = useState<PreguntaForm | null>(null);
  const [showPreguntaDialog, setShowPreguntaDialog] = useState(false);

  useEffect(() => {
    if (!libroId || typeof libroId !== "string") return;

    const fetchData = async () => {
      try {
        setLoading(true);

        // Obtener libro
        const { data: libroData, error: libroError } = await getLibroById(libroId);
        if (libroError || !libroData) {
          toast({
            title: "Error",
            description: "No se pudo cargar el libro.",
            variant: "destructive",
          });
          router.push("/settings");
          return;
        }
        setLibro(libroData);

        // Obtener o crear quiz
        let { data: quizData, error: quizError } = await getQuizByLibroId(libroId);
        
        if (quizError || !quizData) {
          // Crear quiz si no existe
          const { data: newQuiz, error: createError } = await createQuiz(
            libroId,
            `Quiz: ${libroData.titulo}`,
            `Cuestionario sobre el libro ${libroData.titulo}`
          );
          
          if (createError || !newQuiz) {
            toast({
              title: "Error",
              description: "No se pudo crear el quiz.",
              variant: "destructive",
            });
            return;
          }
          quizData = newQuiz;
        }
        setQuiz(quizData);

        // Obtener preguntas
        const { data: preguntasData } = await getPreguntasByQuizId(quizData.id);
        setPreguntas(preguntasData || []);
      } catch (error) {
        console.error("Error loading quiz data:", error);
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar los datos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [libroId]);

  const handleNuevaPregunta = () => {
    const nextNumero = preguntas.length + 1;
    if (nextNumero > 9) {
      toast({
        title: "Límite alcanzado",
        description: "Solo puedes crear un máximo de 9 preguntas por quiz.",
        variant: "destructive",
      });
      return;
    }

    setEditingPregunta({
      numero_pregunta: nextNumero,
      texto_pregunta: "",
      respuestas: ["", "", "", "", ""],
      respuesta_correcta: 1,
    });
    setShowPreguntaDialog(true);
  };

  const handleEditarPregunta = (pregunta: QuizPregunta) => {
    setEditingPregunta({
      id: pregunta.id,
      numero_pregunta: pregunta.numero_pregunta,
      texto_pregunta: pregunta.texto_pregunta,
      respuestas: pregunta.respuestas as string[],
      respuesta_correcta: pregunta.respuesta_correcta,
    });
    setShowPreguntaDialog(true);
  };

  const handleGuardarPregunta = async () => {
    if (!editingPregunta || !quiz) return;

    // Validaciones
    if (!editingPregunta.texto_pregunta.trim()) {
      toast({
        title: "Error",
        description: "Debes escribir el texto de la pregunta.",
        variant: "destructive",
      });
      return;
    }

    const respuestasValidas = editingPregunta.respuestas.filter(r => r.trim());
    if (respuestasValidas.length !== 5) {
      toast({
        title: "Error",
        description: "Debes completar las 5 opciones de respuesta.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      if (editingPregunta.id) {
        // Actualizar pregunta existente
        const { error } = await updatePregunta(editingPregunta.id, {
          texto_pregunta: editingPregunta.texto_pregunta,
          respuestas: editingPregunta.respuestas,
          respuesta_correcta: editingPregunta.respuesta_correcta,
        });

        if (error) throw error;

        toast({
          title: "Pregunta actualizada",
          description: "Los cambios se guardaron correctamente.",
        });
      } else {
        // Crear nueva pregunta
        const { error } = await createPregunta(
          quiz.id,
          editingPregunta.numero_pregunta,
          editingPregunta.texto_pregunta,
          editingPregunta.respuestas,
          editingPregunta.respuesta_correcta
        );

        if (error) throw error;

        toast({
          title: "Pregunta creada",
          description: "La pregunta se agregó correctamente.",
        });
      }

      // Recargar preguntas
      const { data: preguntasData } = await getPreguntasByQuizId(quiz.id);
      setPreguntas(preguntasData || []);
      setShowPreguntaDialog(false);
      setEditingPregunta(null);
    } catch (error) {
      console.error("Error saving pregunta:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la pregunta.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEliminarPregunta = async (preguntaId: string) => {
    if (!quiz) return;

    try {
      const { error } = await deletePregunta(preguntaId);
      if (error) throw error;

      toast({
        title: "Pregunta eliminada",
        description: "La pregunta se eliminó correctamente.",
      });

      // Recargar preguntas
      const { data: preguntasData } = await getPreguntasByQuizId(quiz.id);
      setPreguntas(preguntasData || []);
    } catch (error) {
      console.error("Error deleting pregunta:", error);
      toast({
        title: "Error",
        description: "No se pudo eliminar la pregunta.",
        variant: "destructive",
      });
    }
  };

  const handleGenerarIA = async () => {
    if (!libro || !quiz) return;

    if (!libro.contenido || libro.contenido.trim().length < 100) {
      toast({
        title: "Contenido insuficiente",
        description: "El libro debe tener contenido suficiente para generar preguntas.",
        variant: "destructive",
      });
      return;
    }

    try {
      setGeneratingIA(true);

      // Eliminar preguntas existentes si hay
      if (preguntas.length > 0) {
        await deleteAllPreguntas(quiz.id);
      }

      // Generar preguntas con IA
      const { data: preguntasGeneradas, error } = await generarPreguntasIA(libro.contenido, 9);

      if (error || !preguntasGeneradas) {
        throw new Error("Error al generar preguntas");
      }

      // Crear las preguntas en la base de datos
      for (let i = 0; i < preguntasGeneradas.length; i++) {
        const pregunta = preguntasGeneradas[i];
        await createPregunta(
          quiz.id,
          i + 1,
          pregunta.texto_pregunta,
          pregunta.respuestas,
          pregunta.respuesta_correcta
        );
      }

      toast({
        title: "¡Preguntas generadas!",
        description: `Se generaron ${preguntasGeneradas.length} preguntas automáticamente.`,
      });

      // Recargar preguntas
      const { data: preguntasData } = await getPreguntasByQuizId(quiz.id);
      setPreguntas(preguntasData || []);
    } catch (error) {
      console.error("Error generating questions with IA:", error);
      toast({
        title: "Error",
        description: "No se pudieron generar las preguntas automáticamente.",
        variant: "destructive",
      });
    } finally {
      setGeneratingIA(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin text-stone-900" />
      </div>
    );
  }

  if (!libro || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Card className="w-full max-w-md border-stone-200">
          <CardHeader>
            <CardTitle className="text-stone-900">Error</CardTitle>
            <CardDescription className="text-stone-600">
              No se pudo cargar el quiz.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`Editar Quiz - ${libro.titulo}`}
        description={`Editar cuestionario del libro ${libro.titulo}`}
      />
      <div className="min-h-screen bg-stone-50">
        {/* Header */}
        <div className="bg-white border-b border-stone-200">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  onClick={() => router.push("/settings")}
                  className="text-stone-600 hover:text-stone-900"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Volver a Settings
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-stone-900">Editar Quiz</h1>
                  <p className="text-sm text-stone-600 mt-1">{libro.titulo}</p>
                </div>
              </div>
              <Badge variant="outline" className="border-purple-300 text-purple-700">
                {preguntas.length}/9 preguntas
              </Badge>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Actions */}
          <div className="flex gap-4 mb-6">
            <Button
              onClick={handleNuevaPregunta}
              disabled={preguntas.length >= 9}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nueva Pregunta
            </Button>
            <Button
              onClick={handleGenerarIA}
              disabled={generatingIA || !libro.contenido}
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              {generatingIA ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  Generar con IA
                </>
              )}
            </Button>
          </div>

          {/* Info Alert */}
          {!libro.contenido && (
            <Alert className="mb-6 bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4 text-amber-700" />
              <AlertDescription className="text-amber-900">
                El libro no tiene contenido. Agrega contenido al libro para poder generar preguntas automáticamente con IA.
              </AlertDescription>
            </Alert>
          )}

          {/* Preguntas List */}
          <div className="space-y-4">
            {preguntas.length === 0 ? (
              <Card className="border-stone-200">
                <CardContent className="py-12 text-center">
                  <AlertCircle className="w-12 h-12 text-stone-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">
                    No hay preguntas
                  </h3>
                  <p className="text-stone-600 mb-4">
                    Crea preguntas manualmente o genera automáticamente con IA.
                  </p>
                </CardContent>
              </Card>
            ) : (
              preguntas.map((pregunta, index) => (
                <Card key={pregunta.id} className="border-stone-200 hover:border-purple-300 transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="border-purple-300 text-purple-700">
                            Pregunta {pregunta.numero_pregunta}
                          </Badge>
                          {pregunta.veces_acertada > 0 && (
                            <Badge variant="outline" className="border-green-300 text-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {pregunta.veces_acertada} aciertos
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg text-stone-900">
                          {pregunta.texto_pregunta}
                        </CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditarPregunta(pregunta)}
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEliminarPregunta(pregunta.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(pregunta.respuestas as string[]).map((respuesta, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded-lg border ${
                            idx + 1 === pregunta.respuesta_correcta
                              ? "bg-green-50 border-green-300"
                              : "bg-stone-50 border-stone-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-stone-700">{idx + 1}.</span>
                            <span className={idx + 1 === pregunta.respuesta_correcta ? "text-green-900 font-medium" : "text-stone-700"}>
                              {respuesta}
                            </span>
                            {idx + 1 === pregunta.respuesta_correcta && (
                              <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Dialog para crear/editar pregunta */}
      <Dialog open={showPreguntaDialog} onOpenChange={setShowPreguntaDialog}>
        <DialogContent className="max-w-2xl bg-white border-stone-200 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-stone-900">
              {editingPregunta?.id ? "Editar Pregunta" : "Nueva Pregunta"}
            </DialogTitle>
            <DialogDescription className="text-stone-600">
              Completa todos los campos para {editingPregunta?.id ? "actualizar" : "crear"} la pregunta.
            </DialogDescription>
          </DialogHeader>

          {editingPregunta && (
            <div className="space-y-6 py-4">
              {/* Texto de la pregunta */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700">
                  Pregunta {editingPregunta.numero_pregunta}
                </label>
                <Textarea
                  value={editingPregunta.texto_pregunta}
                  onChange={(e) =>
                    setEditingPregunta({ ...editingPregunta, texto_pregunta: e.target.value })
                  }
                  placeholder="Escribe la pregunta..."
                  rows={3}
                  className="border-stone-300"
                />
              </div>

              {/* Respuestas */}
              <div className="space-y-4">
                <label className="text-sm font-medium text-stone-700">
                  Opciones de respuesta (5 requeridas)
                </label>
                {editingPregunta.respuestas.map((respuesta, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="respuesta_correcta"
                        checked={editingPregunta.respuesta_correcta === idx + 1}
                        onChange={() =>
                          setEditingPregunta({ ...editingPregunta, respuesta_correcta: idx + 1 })
                        }
                        className="w-4 h-4 text-green-600"
                      />
                      <span className="text-sm font-medium text-stone-700">{idx + 1}.</span>
                    </div>
                    <Input
                      value={respuesta}
                      onChange={(e) => {
                        const newRespuestas = [...editingPregunta.respuestas];
                        newRespuestas[idx] = e.target.value;
                        setEditingPregunta({ ...editingPregunta, respuestas: newRespuestas });
                      }}
                      placeholder={`Opción ${idx + 1}`}
                      className="flex-1 border-stone-300"
                    />
                  </div>
                ))}
                <p className="text-xs text-stone-500">
                  Marca la opción correcta con el radio button
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPreguntaDialog(false);
                setEditingPregunta(null);
              }}
              className="border-stone-300 text-stone-700 hover:bg-stone-100"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleGuardarPregunta}
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}