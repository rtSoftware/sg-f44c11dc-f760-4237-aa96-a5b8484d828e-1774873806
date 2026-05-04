import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, BookOpen, Lock, Brain, Headphones, FileText } from "lucide-react";
import Link from "next/link";
import { getCasaByNombre } from "@/services/casaService";
import { getLibrosPorCasa } from "@/services/libroService";
import type { Tables } from "@/integrations/supabase/types";

type Libro = Tables<"libro">;
type Casa = Tables<"casas">;

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
      } catch (err) {
        console.error("Error fetching casa:", err);
        setError("Error al cargar la casa");
      } finally {
        setLoading(false);
      }
    };

    fetchCasa();
  }, [casaNombre]);

  const handleCodigoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().slice(0, 6);
    setCodigo(value);
    setError("");
  };

  const handleValidarCodigo = async () => {
    if (codigo.length !== 6) {
      setError("El código debe tener exactamente 6 caracteres");
      return;
    }

    if (!casa) {
      setError("Casa no válida");
      return;
    }

    // Validación del código según las reglas
    const primerCaracter = codigo[0].toLowerCase();
    const segundoCaracter = codigo[1];
    const ultimosCaracteres = codigo.slice(4, 6); // Posiciones 5 y 6 (índices 4 y 5)

    // Regla 1: Primer carácter debe ser vocal
    const vocales: { [key: string]: number } = {
      'a': 1,
      'e': 2,
      'i': 3,
      'o': 4,
      'u': 5
    };

    if (!(primerCaracter in vocales)) {
      setError("El primer carácter debe ser una vocal (a, e, i, o, u)");
      return;
    }

    // Regla 2: Segundo carácter debe corresponder al orden de la vocal
    const ordenVocal = vocales[primerCaracter];
    if (segundoCaracter !== ordenVocal.toString()) {
      setError(`El segundo carácter debe ser ${ordenVocal} (correspondiente a la vocal '${primerCaracter}')`);
      return;
    }

    // Regla 3: Últimos dos caracteres corresponden al orden del libro
    const ordenLibro = parseInt(ultimosCaracteres);
    if (isNaN(ordenLibro)) {
      setError("Los dos últimos caracteres deben ser números");
      return;
    }

    try {
      setIsValidating(true);
      setError("");

      // Obtener todos los libros de la casa
      const { data: libros, error: librosError } = await getLibrosPorCasa(casa.id);
      
      if (librosError || !libros || libros.length === 0) {
        setError("No hay libros disponibles en esta casa");
        return;
      }

      // Buscar libro con el orden especificado
      let libroEncontrado = libros.find(l => l.orden === ordenLibro);

      // Si no existe, tomar el primer libro
      if (!libroEncontrado) {
        libroEncontrado = libros[0];
      }

      setLibro(libroEncontrado);
      setShowBook(true);
    } catch (err) {
      console.error("Error validando código:", err);
      setError("Error al validar el código");
    } finally {
      setIsValidating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && codigo.length === 6) {
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
              
              <div className="bg-stone-50 rounded-lg p-6 mb-6">
                <div className="space-y-1 text-stone-700">
                  <p className="text-xl font-semibold text-stone-900">{libro.titulo}</p>
                  {libro.autor && <p className="text-base text-stone-600">{libro.autor}</p>}
                </div>
              </div>

              <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
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

                <Link href={`/quiz/${libro.id}`} className={!libro.audioanalisis_https && !libro.audio_https ? "sm:col-span-3" : ""}>
                  <Button
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors"
                  >
                    <Brain className="w-4 h-4" />
                    Quiz
                  </Button>
                </Link>
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
              Ingresa el código de 6 caracteres para acceder al libro
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
                placeholder="Ej: A1XX01"
                className="text-center text-lg tracking-widest uppercase font-mono border-stone-300"
                maxLength={6}
                autoFocus
              />
              <p className="text-xs text-stone-500">
                Formato: Vocal + Número + 2 caracteres + Orden (2 dígitos)
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertDescription className="text-red-900">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleValidarCodigo}
              disabled={codigo.length !== 6 || isValidating}
              className="w-full bg-stone-900 hover:bg-stone-800 text-white"
              size="lg"
            >
              {isValidating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-5 w-5" />
                  Acceder al Libro
                </>
              )}
            </Button>

            <div className="pt-4 border-t border-stone-200">
              <p className="text-xs text-stone-500 text-center">
                Este es un acceso restringido. Solo podrás leer el libro asignado.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}