import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { authService } from "@/services/authService";
import { getAllLibros } from "@/services/libroService";
import { useCasa } from "@/contexts/CasaContext";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Libro } from "@/services/libroService";
import { ArrowLeft, BookOpen, Headphones, User as UserIcon, Library, MessageCircle, FileText, Search, Brain } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type ViewMode = "grid" | "reader";

export default function Biblioteca() {
  const router = useRouter();
  const { casaId, casaNombre } = useCasa();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [libros, setLibros] = useState<Libro[]>([]);
  const [selectedLibro, setSelectedLibro] = useState<Libro | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [hasTextSelection, setHasTextSelection] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && casaId) {
      loadLibros();
    }
  }, [user, casaId]);

  useEffect(() => {
    function handleSelectionChange() {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim() || "";
      setHasTextSelection(selectedText.length > 0);
    }

    document.addEventListener("selectionchange", handleSelectionChange);

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, []);

  async function checkAuth() {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      router.push("/auth");
      return;
    }
    setUser(currentUser as any);
    setLoading(false);
  }

  async function loadLibros() {
    const { data, error } = await getAllLibros();
    
    if (error) {
      console.error("Error loading libros:", error);
      setLibros([]);
      return;
    }
    
    if (data) {
      // Eliminar duplicados si los hay (basado en el ID) y asegurar un orden consistente
      // A veces al hacer joins en Supabase, si hay relaciones 1:N mal configuradas, se duplican filas
      const uniqueLibros = Array.from(new Map(data.map(item => [item.id, item])).values());
      
      // Ordenar: primero por 'orden' (si existe), luego por fecha de creación o título
      const sortedLibros = uniqueLibros.sort((a, b) => {
        if (a.orden !== null && b.orden !== null && a.orden !== undefined && b.orden !== undefined) {
          return a.orden - b.orden;
        }
        if (a.orden !== null && a.orden !== undefined) return -1;
        if (b.orden !== null && b.orden !== undefined) return 1;
        
        return a.titulo.localeCompare(b.titulo);
      });
      
      setLibros(sortedLibros);
    } else {
      setLibros([]);
    }
  }

  async function handleLogout() {
    await authService.signOut();
    router.push("/");
  }

  function handleSelectLibro(libro: Libro) {
    setSelectedLibro(libro);
    setViewMode("reader");
  }

  function handleBackToGrid() {
    setSelectedLibro(null);
    setViewMode("grid");
  }

  function handleCreateNote() {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() || "";
    
    if (selectedText && selectedLibro) {
      router.push({
        pathname: "/notas",
        query: {
          libro_id: selectedLibro.id,
          origen: selectedText,
        },
      });
    }
  }

  const filteredLibros = libros.filter(libro => 
    libro.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (libro.autor && libro.autor.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900"></div>
          <p className="mt-4 text-stone-600">Cargando biblioteca...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Biblioteca | Experiencia Miguel"
        description="Explora la colección completa de libros"
      />

      <div className="min-h-screen bg-stone-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              {viewMode === "grid" ? (
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-stone-600 hover:text-stone-900 hover:bg-stone-100">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al Dashboard
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToGrid}
                  className="text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                >
                  <Library className="w-4 h-4 mr-2" />
                  Volver a la Biblioteca
                </Button>
              )}
              
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-sm text-stone-600">
                  <UserIcon className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-stone-300 text-stone-700 hover:bg-stone-100"
                >
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {viewMode === "grid" ? (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-3xl font-serif font-bold text-stone-900">
                  Tu Biblioteca {casaNombre ? `- Casa ${casaNombre}` : ''}
                </h2>
                
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    placeholder="Buscar libros..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-stone-300 focus-visible:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredLibros.length === 0 ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center bg-white rounded-xl border border-stone-200">
                    <BookOpen className="h-16 w-16 text-stone-300 mb-4" />
                    <h3 className="text-lg font-semibold text-stone-900 mb-2">
                      No hay libros disponibles
                    </h3>
                    <p className="text-stone-600">
                      {searchTerm
                        ? "No se encontraron libros que coincidan con tu búsqueda."
                        : "Aún no hay libros en tu biblioteca."}
                    </p>
                  </div>
                ) : (
                  filteredLibros.map((libro) => (
                    <Card
                      key={`libro-${libro.id}`}
                      className="group hover:shadow-lg transition-all duration-300 border-stone-200 hover:border-amber-300 cursor-pointer overflow-hidden flex flex-col h-full"
                      onClick={() => handleSelectLibro(libro)}
                    >
                      <CardContent className="p-0 flex-1 flex flex-col">
                        {libro.portada_url ? (
                          <div className="relative h-64 w-full overflow-hidden bg-stone-100 shrink-0">
                            <img
                              src={libro.portada_url}
                              alt={libro.titulo}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                        ) : (
                          <div className="relative h-64 w-full overflow-hidden bg-stone-200 shrink-0 flex items-center justify-center">
                            <BookOpen className="w-16 h-16 text-stone-400" />
                          </div>
                        )}
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="text-xl font-bold text-stone-900 mb-2 group-hover:text-amber-700 transition-colors line-clamp-2">
                            {libro.titulo}
                          </h3>
                          {libro.autor && (
                            <p className="text-sm text-stone-600 mb-4 line-clamp-1">por {libro.autor}</p>
                          )}
                          <div className="mt-auto pt-4 flex items-center justify-between">
                            <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 group-hover:bg-amber-100 transition-colors">
                              <BookOpen className="w-3 h-3 mr-1" />
                              Leer
                            </Badge>
                            {libro.orden !== null && libro.orden !== undefined && (
                              <span className="text-xs font-medium text-stone-500 bg-stone-100 px-2 py-1 rounded">
                                Orden {libro.orden}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          ) : selectedLibro ? (
            // READER VIEW
            <div className="space-y-8 max-w-4xl mx-auto">
              {/* Chapter Header */}
              <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                <div className="p-8 sm:p-12">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Cover Image */}
                    {selectedLibro.portada_url && (
                      <div className="w-full md:w-1/3 shrink-0">
                        <img
                          src={selectedLibro.portada_url}
                          alt={selectedLibro.titulo}
                          className="w-full rounded-lg shadow-md object-cover aspect-[3/4]"
                        />
                      </div>
                    )}

                    <div className="flex-1 space-y-6">
                      <div>
                        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 mb-2">
                          {selectedLibro.titulo}
                        </h1>
                        {selectedLibro.autor && (
                          <p className="text-lg text-stone-600">por {selectedLibro.autor}</p>
                        )}
                        {selectedLibro.orden !== null && selectedLibro.orden !== undefined && (
                          <Badge variant="secondary" className="mt-3">
                            Libro {selectedLibro.orden}
                          </Badge>
                        )}
                      </div>

                      {/* Description */}
                      {selectedLibro.descripcion && (
                        <p className="text-stone-700 leading-relaxed">
                          {selectedLibro.descripcion}
                        </p>
                      )}

                      {/* Audio y PDF */}
                      {(selectedLibro.audioanalisis_https || selectedLibro.audio_https) && (
                        <div className="pt-4 flex flex-wrap gap-3">
                          {selectedLibro.audioanalisis_https && (
                            <a
                              href={selectedLibro.audioanalisis_https}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg shadow-sm transition-colors"
                            >
                              <Headphones className="w-4 h-4" />
                              Escuchar Análisis
                            </a>
                          )}
                          
                          {selectedLibro.audio_https && (
                            <a
                              href={selectedLibro.audio_https}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-800 hover:bg-stone-900 text-white font-medium rounded-lg shadow-sm transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                              Ver PDF Original
                            </a>
                          )}
                        </div>
                      )}

                      {/* Botones de Audio, PDF y Quiz */}
                      <div className="pt-4 flex flex-wrap gap-3">
                        {selectedLibro.audioanalisis_https && (
                          <a
                            href={selectedLibro.audioanalisis_https}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg shadow-sm transition-colors"
                          >
                            <Headphones className="w-4 h-4" />
                            Escuchar Análisis
                          </a>
                        )}
                        
                        {selectedLibro.audio_https && (
                          <a
                            href={selectedLibro.audio_https}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-800 hover:bg-stone-900 text-white font-medium rounded-lg shadow-sm transition-colors"
                          >
                            <FileText className="w-4 h-4" />
                            Ver PDF Original
                          </a>
                        )}
                        
                        <Link href={`/quiz/${selectedLibro.id}`}>
                          <Button
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors"
                          >
                            <Brain className="w-4 h-4" />
                            Quiz
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chapter Content */}
              {selectedLibro.contenido && (
                <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 sm:p-12">
                  <div className="prose prose-stone prose-lg max-w-none
                      prose-headings:font-serif prose-headings:text-stone-900
                      prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-6 prose-h1:mt-8
                      prose-h2:text-2xl prose-h2:font-bold prose-h2:mb-4 prose-h2:mt-6
                      prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-3 prose-h3:mt-4
                      prose-p:text-stone-800 prose-p:leading-relaxed prose-p:mb-4
                      prose-a:text-amber-700 prose-a:underline hover:prose-a:text-amber-800
                      prose-strong:text-stone-900 prose-strong:font-bold
                      prose-em:text-stone-700 prose-em:italic
                      prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4
                      prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4
                      prose-li:text-stone-800 prose-li:mb-2
                      prose-blockquote:border-l-4 prose-blockquote:border-amber-400 
                      prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-stone-700 prose-blockquote:bg-amber-50/50 prose-blockquote:py-1
                      prose-code:text-stone-800 prose-code:bg-stone-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                      prose-pre:bg-stone-900 prose-pre:text-stone-100 prose-pre:p-4 prose-pre:rounded-lg prose-pre:overflow-x-auto
                      prose-img:rounded-xl prose-img:shadow-md prose-img:my-8 prose-img:mx-auto
                      prose-hr:border-stone-200 prose-hr:my-8">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                    >
                      {selectedLibro.contenido}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </main>

        {/* Floating Action Button */}
        {hasTextSelection && (
          <div className="fixed bottom-8 right-8 z-40 animate-in fade-in slide-in-from-bottom-5 duration-300">
            <Button
              size="lg"
              onClick={handleCreateNote}
              className="h-14 w-14 rounded-full shadow-lg bg-amber-600 hover:bg-amber-700 text-white hover:scale-105 transition-all duration-300"
              title="Crear nota con texto seleccionado"
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
          </div>
        )}
      </div>
    </>
  );
}