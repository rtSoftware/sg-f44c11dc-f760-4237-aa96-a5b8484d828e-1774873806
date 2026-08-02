import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { BookOpen, ArrowLeft, ChevronLeft, ChevronRight, Brain, Loader2, Lock, Headphones, FileText, QrCode } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import QRCode from "react-qr-code";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { useCasa } from "@/contexts/CasaContext";
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
  const { casa: casaSlug, libro: libroIdFromQuery } = router.query;
  const { casaId, casaNombre } = useCasa();
  
  // Usar el parámetro de la URL como nombre de casa (prioridad sobre el contexto)
  const casaFromUrl = typeof casaSlug === "string" ? casaSlug : null;
  
  // Detectar si se viene desde biblioteca
  const fromBiblioteca = router.query.from === 'biblioteca';
  
  const [libros, setLibros] = useState<Libro[]>([]);
  const [libroId, setLibroId] = useState<string | null>(
    typeof libroIdFromQuery === "string" ? libroIdFromQuery : null
  );
  const [libro, setLibro] = useState<Libro | null>(null);
  const [showBook, setShowBook] = useState(false);
  const [loading, setLoading] = useState(true);
  const [codigo, setCodigo] = useState("");
  
  // Modo lectura: true si NO viene desde biblioteca (entrada directa)
  const [modoLectura, setModoLectura] = useState(!fromBiblioteca);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");
  const [casa, setCasa] = useState<Casa | null>(null);
  const [notas, setNotas] = useState<NotaWithLibro[]>([]);
  const [selectedNota, setSelectedNota] = useState<NotaWithLibro | null>(null);
  const [librosDisponibles, setLibrosDisponibles] = useState<Libro[]>([]);

  useEffect(() => {
    // Usar el parámetro de la URL, no el contexto
    if (!casaFromUrl) return;

    const fetchCasa = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("🏠 Buscando casa desde URL:", casaFromUrl);

        // 1. Obtener casa por nombre desde la URL
        const { data: casaData, error: casaError } = await getCasaByNombre(casaFromUrl);
        
        if (casaError || !casaData) {
          setError("Casa no encontrada");
          setLoading(false);
          return;
        }

        console.log("✅ Casa encontrada:", casaData.casa_nombre);
        setCasa(casaData);

        // 2. Verificar autenticación
        const { data: { user } } = await supabase.auth.getUser();
        const isAuthenticated = !!user;
        console.log("🔐 Usuario autenticado:", isAuthenticated);

        // 3. Obtener libros de la casa
        const { data: librosData, error: librosError } = await getLibrosPorCasa(casaData.id);
        
        if (librosError || !librosData) {
          setError("No se pudieron cargar los libros");
          setLoading(false);
          return;
        }

        setLibros(librosData);
        console.log(`📚 Total libros cargados: ${librosData.length}`);

        // 4. LÓGICA PRINCIPAL: Priorizar parámetro libro en URL
        if (libroIdFromQuery && typeof libroIdFromQuery === "string") {
          // Hay un libro específico en la URL (compartido o desde biblioteca)
          console.log("📖 Libro específico en URL:", libroIdFromQuery);
          const libroEspecifico = librosData.find(l => l.id === libroIdFromQuery);
          
          if (!libroEspecifico) {
            setError("Libro no encontrado en esta casa");
            setLoading(false);
            return;
          }

          setLibro(libroEspecifico);
          setLibrosDisponibles(librosData.filter(l => l.visible));
          
          // Si viene libro en URL, siempre mostrar - no pedir código
          console.log("📖 Acceso directo al libro desde URL compartida");
          setShowBook(true);
          setModoLectura(!fromBiblioteca); // true si es compartido, false si es desde biblioteca
        } else {
          // Entrada directa sin libro específico: cargar primer libro de la casa
          console.log("🔗 Entrada directa sin libro: Cargando primer libro de la casa");
          const librosOrdenados = [...librosData].sort((a, b) => a.orden - b.orden);
          const primerLibro = librosOrdenados[0];
          
          if (!primerLibro) {
            setError("Esta casa no tiene libros disponibles");
            setLoading(false);
            return;
          }

          console.log("📖 Primer libro encontrado:", primerLibro.titulo);
          setLibro(primerLibro);
          setLibrosDisponibles(librosOrdenados.filter(l => l.visible));
          setModoLectura(true); // Modo lectura externa: requiere código
          // showBook = false, se mostrará formulario de código
        }

        setLoading(false);
      } catch (err) {
        console.error("Error al cargar la casa:", err);
        setError("Error al cargar la información");
        setLoading(false);
      }
    };

    fetchCasa();
  }, [casaFromUrl, fromBiblioteca, libroIdFromQuery]);

  useEffect(() => {
    if (!libro) return;
    
    async function fetchNotas() {
      try {
        console.log("🔍 Cargando notas para libro:", libro.id);
        const notasData = await getNotasByLibroId(libro.id);
        console.log("✅ Notas cargadas:", notasData.length, notasData);
        setNotas(notasData);
      } catch (error) {
        console.error("❌ Error al cargar notas:", error);
      }
    }
    
    fetchNotas();
  }, [libro]);

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

    if (!libro) {
      setError("No hay libro disponible");
      return;
    }

    try {
      setIsValidating(true);
      setError("");

      // Aceptar cualquier código - simplemente permitir acceso
      // El libro correcto ya fue cargado desde el URL en useEffect
      setShowBook(true);
    } catch (err) {
      console.error("Error validando código:", err);
      setError("Error al validar el código");
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
              La casa "{casaFromUrl}" no existe en el sistema.
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
              {/* Header con navegación */}
              <div className="flex items-center justify-between mb-6">
                {fromBiblioteca && (
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/biblioteca')}
                    className="flex items-center gap-2 text-stone-600 hover:text-stone-900"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a Biblioteca
                  </Button>
                )}
                
                {!modoLectura && (
                  <div className="flex gap-2 ml-auto">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push('/dashboard')}
                    >
                      <BookOpen className="h-5 w-5" />
                    </Button>
                  </div>
                )}
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
              
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-3xl font-bold text-stone-900">{libro.titulo}</h1>
                </div>

                {/* Selector de libro - visible tanto en modo biblioteca como en modo lectura */}
                {showBook && librosDisponibles.length > 1 && libro && (
                  <div className="mb-6 flex items-center gap-4">
                    <label className="text-sm font-medium text-stone-700 whitespace-nowrap">
                      Cambiar a otro libro de esta casa:
                    </label>
                    <Select
                      value={libro.id}
                      onValueChange={(nuevoLibroId) => {
                        const nuevoLibro = librosDisponibles.find(l => l.id === nuevoLibroId);
                        if (nuevoLibro) {
                          setLibro(nuevoLibro);
                          setSelectedNota(null);
                        }
                      }}
                    >
                      <SelectTrigger className="w-[300px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {librosDisponibles.map((l) => (
                          <SelectItem key={l.id} value={l.id}>
                            {l.titulo} (Cap. {l.orden + 1})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {libro.descripcion && (
                  <div className="text-lg text-stone-600 mb-4 prose prose-stone max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw as any]}
                    >
                      {libro.descripcion}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

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

              {/* Código QR para compartir */}
              {casa && (
                <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl shadow-sm">
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <QrCode className="w-5 h-5 text-green-600" />
                        <h3 className="text-lg font-bold text-green-900">
                          Compartir este libro
                        </h3>
                      </div>
                      <p className="text-sm text-green-700 mb-3">
                        Escanea el código QR o comparte el enlace para que otros puedan leer este libro sin necesidad de crear una cuenta.
                      </p>
                      <div className="bg-white p-3 rounded border border-green-300">
                        <code className="text-xs text-green-800 break-all">
                          {typeof window !== "undefined" 
                            ? `${window.location.origin}/lectura/${casa.casa_nombre}?libro=${libro.id}`
                            : `https://experienciamiguel.com/lectura/${casa.casa_nombre}?libro=${libro.id}`
                          }
                        </code>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md">
                      <QRCode
                        value={typeof window !== "undefined" 
                          ? `${window.location.origin}/lectura/${casa.casa_nombre}?libro=${libro.id}`
                          : `https://experienciamiguel.com/lectura/${casa.casa_nombre}?libro=${libro.id}`
                        }
                        size={160}
                        level="M"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Renglón exclusivo para el Select de notas vinculadas al libro */}
              <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <label className="block text-base font-bold text-purple-900">
                    Notas vinculadas a este libro ({notas.length})
                  </label>
                </div>
                <Select
                  value={selectedNota?.id || ""}
                  onValueChange={(notaId) => {
                    console.log("📝 Nota seleccionada:", notaId);
                    const nota = notas.find(n => n.id === notaId);
                    if (nota) {
                      console.log("✅ Mostrando nota:", nota);
                      setSelectedNota(nota);
                    }
                  }}
                >
                  <SelectTrigger className="w-full bg-white border-purple-300 h-12 text-base">
                    <SelectValue placeholder="Seleccionar una nota..." />
                  </SelectTrigger>
                  <SelectContent>
                    {notas.length === 0 ? (
                      <SelectItem value="empty" disabled>
                        No hay notas para este libro
                      </SelectItem>
                    ) : (
                      notas.map((nota) => (
                        <SelectItem key={nota.id} value={nota.id}>
                          {nota.origen ? (nota.origen.length > 60 ? nota.origen.substring(0, 60) + "..." : nota.origen) : "Nota sin texto de origen"}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
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
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw as any]}
                  >
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
              onClick={handleValidarCodigo}
              disabled={isValidating || codigo.trim().length === 0}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white mt-4"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                "Acceder"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Modal para nota seleccionada */}
      <Dialog open={selectedNota !== null} onOpenChange={(open) => !open && setSelectedNota(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-purple-700">
              Nota del libro
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