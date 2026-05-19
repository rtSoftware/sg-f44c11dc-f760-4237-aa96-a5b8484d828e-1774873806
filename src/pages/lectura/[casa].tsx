import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { BookOpen, ArrowLeft, ChevronLeft, ChevronRight, Brain } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock, Headphones, FileText } from "lucide-react";
import Link from "next/link";
import { getCasaByNombre } from "@/services/casaService";
import { getLibrosPorCasa } from "@/services/libroService";
import { getNotasByLibroId } from "@/services/notasService";
import type { Tables } from "@/integrations/supabase/types";
import type { Casa } from "@/services/casaService";
import type { NotaWithLibro } from "@/services/notasService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type Libro = Tables<"libro">;

export default function LecturaCasa() {
  const router = useRouter();
  const { casa: casaNombre } = router.query;

  const [codigo, setCodigo] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");
  const [casa, setCasa] = useState<Casa | null>(null);
  const [libro, setLibro] = useState<Libro | null>(null);
  const [showBook, setShowBook] = useState(false);
  const [loading, setLoading] = useState(true);
  const [casaData, setCasaData] = useState<Casa | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [notas, setNotas] = useState<NotaWithLibro[]>([]);
  const [selectedNota, setSelectedNota] = useState<NotaWithLibro | null>(null);

  useEffect(() => {
    if (!casaNombre || typeof casaNombre !== "string") return;

    const fetchCasa = async () => {
      try {
        setLoading(true);
        const { data, error } = await getCasaByNombre(casaNombre);
        
        if (error || !data) {
          setError("Casa no encontrada");
          return;
        }

        setCasa(data);

        // Guardar casa_id en localStorage para que esté disponible en modo lectura
        if (typeof window !== "undefined") {
          localStorage.setItem("casa_id", data.id);
        }

        const { data: librosData, error: librosError } = await getLibrosPorCasa(data.id);
        if (librosError) {
          console.error("Error loading libros:", librosError);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching casa:", err);
        setError("Error al cargar la casa");
      } finally {
        setLoading(false);
      }
    };

    fetchCasa();
  }, [casaNombre]);

  useEffect(() => {
    async function fetchCasa() {
      if (!casaNombre || typeof casaNombre !== "string") return;
      
      try {
        const data = await getCasaByNombre(casaNombre);
        setCasaData(data);
        
        // Cargar notas del libro activo si existe
        if (data?.libro_id) {
          const notasData = await getNotasByLibroId(data.libro_id);
          setNotas(notasData);
        }
      } catch (error) {
        console.error("Error al cargar casa:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCasa();
  }, [casaNombre]);

  const handleCodigoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().slice(0, 6);
    setCodigo(value);
    setError("");
  };

  const handleValidarCodigo = async () => {
    if (codigo.trim().length === 0) {
      setError("Por favor ingresa un código");
      return;
    }

    if (!casa) {
      setError("Casa no válida");
      return;
    }

    try {
      setIsValidating(true);
      setError("");

      // Aceptar cualquier código - sin validación
      // Solo cargar el primer libro disponible de la casa
      const { data: libros, error: librosError } = await getLibrosPorCasa(casa.id);
      
      if (librosError || !libros || libros.length === 0) {
        setError("No hay libros disponibles en esta casa");
        return;
      }

      // Tomar el primer libro
      setLibro(libros[0]);
      setShowBook(true);
    } catch (err) {
      console.error("Error cargando libro:", err);
      setError("Error al cargar el libro");
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && codigo.trim().length > 0) {
      handleValidarCodigo();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="w-8 h-8 animate-spin text-stone-900" />
      </div>
    );
  }

  if (!casa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Card className="w-full max-w-md border-stone-200">
          <CardHeader>
            <CardTitle className="text-stone-900">Casa no encontrada</CardTitle>
            <CardDescription className="text-stone-600">
              La casa "{casaNombre}" no existe en el sistema.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (showBook && libro) {
    return (
      <>
        <SEO
          title={`${libro.titulo} - Lectura`}
          description={`Leyendo ${libro.titulo} en modo restringido`}
        />
        <div className="min-h-screen bg-white">
          {/* Header fijo minimalista */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-stone-200">
            <div className="max-w-4xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-stone-900" />
                  <h1 className="text-lg font-semibold text-stone-900">{libro.titulo}</h1>
                </div>
                <div className="flex items-center gap-2 text-sm text-stone-600">
                  <Lock className="w-4 h-4" />
                  <span>Modo Lectura</span>
                </div>
              </div>
              {libro.autor && (
                <p className="text-sm text-stone-600 mt-1 ml-8">por {libro.autor}</p>
              )}
            </div>
          </div>

          {/* Contenido del libro */}
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="prose prose-stone max-w-none">
              {libro.portada_url && (
                <div className="mb-8 flex justify-center">
                  <img
                    src={libro.portada_url}
                    alt={libro.titulo}
                    className="rounded-lg shadow-lg max-w-sm"
                  />
                </div>
              )}
              
              <div className="bg-stone-50 rounded-lg p-4 mb-4">
                <p className="text-xl font-semibold text-stone-900">{libro.titulo}</p>
                {libro.autor && <p className="text-base text-stone-600 mt-1">{libro.autor}</p>}
              </div>

              <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                {libro.audioanalisis_https && (
                  <a
                    href={libro.audioanalisis_https}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg shadow-sm transition-colors"
                  >
                    <Headphones className="w-4 h-4" />
                    Audio
                  </a>
                )}
                
                {libro.audio_https && (
                  <a
                    href={libro.audio_https}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-stone-800 hover:bg-stone-900 text-white font-medium rounded-lg shadow-sm transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    PDF
                  </a>
                )}

                <a
                  href={`/quiz/${libro.id}`}
                  className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors ${!libro.audioanalisis_https && !libro.audio_https ? "sm:col-span-3" : ""}`}
                >
                  <Brain className="w-4 h-4" />
                  Quiz
                </a>
              </div>

              <div className="mt-8">
                <div className="prose prose-stone prose-lg max-w-none
                    prose-headings:text-stone-900 prose-headings:font-bold
                    prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8
                    prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-6
                    prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-4
                    prose-p:text-stone-800 prose-p:leading-relaxed prose-p:mb-4
                    prose-a:text-amber-700 prose-a:underline hover:prose-a:text-amber-800
                    prose-strong:text-stone-900 prose-strong:font-semibold
                    prose-em:text-stone-700 prose-em:italic
                    prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4
                    prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4
                    prose-li:text-stone-800 prose-li:mb-2
                    prose-blockquote:border-l-4 prose-blockquote:border-amber-500 
                    prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-stone-700
                    prose-code:text-amber-800 prose-code:bg-stone-100 prose-code:px-1 prose-code:rounded
                    prose-pre:bg-stone-900 prose-pre:text-stone-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                    prose-img:rounded-lg prose-img:shadow-md prose-img:my-6
                    prose-hr:border-stone-300 prose-hr:my-8">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {libro.contenido || "Este libro aún no tiene contenido."}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={`Acceso a ${casa.casa_nombre} - Lectura`}
        description="Ingresa el código de acceso para leer el libro"
      />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-50 to-stone-100 px-4">
        <Card className="w-full max-w-md border-stone-200 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-stone-900 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-stone-900">Casa {casa.casa_nombre}</CardTitle>
            <CardDescription className="text-stone-600">
              Ingresa cualquier código para acceder al libro
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="codigo" className="text-sm font-medium text-stone-700">
                Código de acceso
              </label>
              <Input
                id="codigo"
                type="text"
                value={codigo}
                onChange={handleCodigoChange}
                onKeyPress={handleKeyPress}
                placeholder="Ingresa cualquier código"
                className="text-center text-lg tracking-widest uppercase font-mono border-stone-300"
                maxLength={6}
                autoFocus
              />
              <p className="text-xs text-stone-500">
                Cualquier combinación de caracteres es válida
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-900">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={() => router.push(`/quiz/${casaData?.libro_id}`)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Brain className="mr-2 h-4 w-4" />
              Quiz
            </Button>

            {/* Select de notas */}
            <div className="mt-4">
              <Select
                value={selectedNota?.id || ""}
                onValueChange={(notaId) => {
                  const nota = notas.find(n => n.id === notaId);
                  if (nota) setSelectedNota(nota);
                }}
              >
                <SelectTrigger className="w-full border-purple-200 focus:border-purple-400">
                  <SelectValue placeholder="Seleccionar nota..." />
                </SelectTrigger>
                <SelectContent>
                  {notas.length === 0 ? (
                    <SelectItem value="empty" disabled>
                      No hay notas para este libro
                    </SelectItem>
                  ) : (
                    notas.map((nota) => (
                      <SelectItem key={nota.id} value={nota.id}>
                        {nota.origen ? nota.origen.substring(0, 50) + "..." : "Nota sin origen"}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal para nota seleccionada */}
      <Dialog open={selectedNota !== null} onOpenChange={(open) => !open && setSelectedNota(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-700">
              Nota de lectura
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {selectedNota?.origen && (
              <blockquote className="border-l-4 border-purple-300 pl-4 italic text-stone-600 bg-purple-50 py-3 mb-6 rounded-r">
                {selectedNota.origen}
              </blockquote>
            )}
            <div className="prose prose-purple max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw as any]}
              >
                {selectedNota?.nota || ""}
              </ReactMarkdown>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}