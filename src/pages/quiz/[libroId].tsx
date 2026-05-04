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
  BookOpen,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  FileJson,
  AlertCircle,
  Save,
} from "lucide-react";
import { getLibroById } from "@/services/libroService";
import {
  getQuizByLibroId,
  createQuiz,
  getPreguntasByQuizId,
  createPregunta,
  updatePregunta,
  deletePregunta,
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
  const [libro, setLibro] = useState<Libro | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [preguntas, setPreguntas] = useState<QuizPregunta[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingPregunta, setEditingPregunta] = useState<PreguntaForm | null>(null);
  const [showSemiAutoDialog, setShowSemiAutoDialog] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [procesandoJson, setProcesandoJson] = useState(false);
  const [showPreguntaDialog, setShowPreguntaDialog] = useState(false);

  const ejemploJson = `{
  "preguntas": [
    {
      "numero_pregunta": 1,
      "texto_pregunta": "¿Cuál es el tema principal del libro?",
      "respuestas": [
        "Respuesta correcta aquí",
        "Respuesta incorrecta 1",
        "Respuesta incorrecta 2",
        "Respuesta incorrecta 3",
        "Respuesta incorrecta 4"
      ],
      "respuesta_correcta": 1
    },
    {
      "numero_pregunta": 2,
      "texto_pregunta": "¿Qué concepto clave se desarrolla en el capítulo 1?",
      "respuestas": [
        "Respuesta incorrecta 1",
        "Respuesta correcta aquí",
        "Respuesta incorrecta 2",
        "Respuesta incorrecta 3",
        "Respuesta incorrecta 4"
      ],
      "respuesta_correcta": 2
    }
  ]
}`;

  const handleProcesarJsonSemiAuto = async () => {
    if (!quiz) return;

    try {
      setProcesandoJson(true);

      // Parsear el JSON
      let parsedData;
      try {
        parsedData = JSON.parse(jsonInput);
      } catch (parseError) {
        toast({
          title: "Error",
          description: "El JSON ingresado no es válido. Verifica la sintaxis.",
          variant: "destructive",
        });
        return;
      }

      // Validar estructura
      if (!parsedData.preguntas || !Array.isArray(parsedData.preguntas)) {
        toast({
          title: "Error",
          description: "El JSON debe contener un array 'preguntas'.",
          variant: "destructive",
        });
        return;
      }

      if (parsedData.preguntas.length === 0 || parsedData.preguntas.length > 9) {
        toast({
          title: "Error",
          description: "Debes proporcionar entre 1 y 9 preguntas.",
          variant: "destructive",
        });
        return;
      }

      // Validar cada pregunta
      for (let i = 0; i < parsedData.preguntas.length; i++) {
        const p = parsedData.preguntas[i];
        if (!p.numero_pregunta || !p.texto_pregunta || !p.respuestas || !p.respuesta_correcta) {
          toast({
            title: "Error",
            description: `La pregunta ${i + 1} tiene campos faltantes.`,
            variant: "destructive",
          });
          return;
        }
        if (!Array.isArray(p.respuestas) || p.respuestas.length !== 5) {
          toast({
            title: "Error",
            description: `La pregunta ${i + 1} debe tener exactamente 5 respuestas.`,
            variant: "destructive",
          });
          return;
        }
        if (p.respuesta_correcta < 1 || p.respuesta_correcta > 5) {
          toast({
            title: "Error",
            description: `La pregunta ${i + 1} tiene una respuesta_correcta inválida (debe ser 1-5).`,
            variant: "destructive",
          });
          return;
        }
      }

      // Eliminar preguntas existentes
      if (preguntas.length > 0) {
        const { error: deleteError } = await deleteAllPreguntas(quiz.id);
        if (deleteError) {
          throw new Error("Error al eliminar preguntas existentes");
        }
      }

      // Guardar las preguntas
      for (const p of parsedData.preguntas) {
        const { error } = await createPregunta(
          quiz.id,
          p.numero_pregunta,
          p.texto_pregunta,
          p.respuestas,
          p.respuesta_correcta
        );
        
        if (error) {
          throw new Error(`Error al guardar pregunta ${p.numero_pregunta}`);
        }
      }

      toast({
        title: "Preguntas importadas",
        description: `Se importaron ${parsedData.preguntas.length} preguntas exitosamente.`,
      });

      // Recargar preguntas
      const { data: preguntasData } = await getPreguntasByQuizId(quiz.id);
      setPreguntas(preguntasData || []);
      
      // Cerrar diálogo
      setShowSemiAutoDialog(false);
      setJsonInput("");

    } catch (error) {
      console.error("Error procesando JSON:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudieron importar las preguntas.",
        variant: "destructive",
      });
    } finally {
      setProcesandoJson(false);
    }
  };

  useEffect(() => {
    if (showSemiAutoDialog && !jsonInput) {
      setJsonInput(ejemploJson);
    }
  }, [showSemiAutoDialog]);

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
        const { data: existingQuiz, error: quizError } = await getQuizByLibroId(libroId);
        let quizData = existingQuiz;
        
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
              onClick={() => setShowSemiAutoDialog(true)}
              disabled={procesandoJson}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
            >
              <FileJson className="w-5 h-5 mr-2" />
              Semi-auto
            </Button>
          </div>

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
                              <CheckCircle2 className="w-3 h-3 mr-1" />
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
                              <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />
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

      {/* Dialog de Importación JSON Semi-auto */}
      <Dialog open={showSemiAutoDialog} onOpenChange={setShowSemiAutoDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileJson className="w-6 h-6 text-blue-600" />
              Importar Preguntas desde JSON
            </DialogTitle>
            <DialogDescription>
              Pega el JSON con las preguntas y respuestas. El formato de ejemplo muestra la estructura correcta.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700">
                JSON de Preguntas
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="w-full h-96 p-4 font-mono text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Pega tu JSON aquí..."
              />
              <p className="text-xs text-stone-500">
                Formato: JSON con array "preguntas", cada pregunta debe tener numero_pregunta, texto_pregunta, respuestas (array de 5), y respuesta_correcta (1-5)
              </p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-amber-900 mb-2">📋 Instrucciones:</h4>
              <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
                <li>Cada pregunta debe tener exactamente 5 respuestas</li>
                <li>La respuesta_correcta debe ser un número del 1 al 5</li>
                <li>Puedes importar entre 1 y 9 preguntas</li>
                <li>Las preguntas existentes serán reemplazadas</li>
              </ul>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowSemiAutoDialog(false);
                setJsonInput("");
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleProcesarJsonSemiAuto}
              disabled={procesandoJson || !jsonInput.trim()}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
            >
              {procesandoJson ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <FileJson className="w-5 h-5 mr-2" />
                  Importar Preguntas
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}