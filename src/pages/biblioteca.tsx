import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { authService } from "@/services/authService";
import { getAllLibros } from "@/services/libroService";
import { useCasa } from "@/contexts/CasaContext";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Libro } from "@/services/libroService";
import { ArrowLeft, BookOpen, Headphones, User as UserIcon, Library, MessageCircle } from "lucide-react";
import Link from "next/link";

type ViewMode = "grid" | "reader";

export default function Biblioteca() {
  const router = useRouter();
  const { casaId } = useCasa();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [libros, setLibros] = useState<Libro[]>([]);
  const [selectedLibro, setSelectedLibro] = useState<Libro | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [hasTextSelection, setHasTextSelection] = useState(false);

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
    console.log("=== loadLibros START ===");
    console.log("Current casaId from context:", casaId);
    console.log("Current user:", user?.id);
    
    if (!casaId) {
      console.error("loadLibros - No casaId available from context!");
      setLibros([]);
      return;
    }
    
    const { data, error } = await getAllLibros(casaId);
    
    console.log("loadLibros result:", { 
      data: data?.length ? `${data.length} libros` : "no libros", 
      error 
    });
    
    if (error) {
      console.error("Error loading libros:", error);
      setLibros([]);
      return;
    }
    
    if (data && data.length > 0) {
      console.log("Libros loaded:", data.map(l => ({ 
        id: l.id, 
        titulo: l.titulo, 
        casa_id: l.casa_id 
      })));
    }
    
    setLibros(data || []);
    console.log("=== loadLibros END ===");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
          <p className="mt-4 text-amber-800">Cargando biblioteca...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Biblioteca | Experiencia Miguel"
        description="Explora la colección completa de capítulos de Experiencia Miguel"
      />

      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-amber-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              {viewMode === "grid" ? (
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-amber-700 hover:text-amber-900 hover:bg-amber-100">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver al Dashboard
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToGrid}
                  className="text-amber-700 hover:text-amber-900 hover:bg-amber-100"
                >
                  <Library className="w-4 h-4 mr-2" />
                  Volver a la Biblioteca
                </Button>
              )}
              
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 text-sm text-amber-700">
                  <UserIcon className="w-4 h-4" />
                  <span>{user?.email}</span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-amber-300 text-amber-700 hover:bg-amber-100"
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
            // GRID VIEW - Selector de Capítulos
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-amber-900 mb-2 font-serif">
                  Biblioteca Digital
                </h1>
                <p className="text-lg text-amber-700">
                  Selecciona un capítulo para comenzar tu lectura
                </p>
              </div>

              {libros.length === 0 ? (
                <Card className="bg-white/90 backdrop-blur-sm border-amber-200">
                  <CardContent className="p-12 text-center">
                    <BookOpen className="w-16 h-16 mx-auto text-amber-400 mb-4" />
                    <h2 className="text-2xl font-bold text-amber-900 mb-2">
                      No hay libros disponibles
                    </h2>
                    <p className="text-amber-700 mb-6">
                      Los libros aún no han sido configurados en esta biblioteca.
                    </p>
                    <Link href="/settings">
                      <Button className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white">
                        Ir a Configuración
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {libros.map((libro) => (
                    <Card
                      key={libro.id}
                      className="border-amber-200 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 group"
                      onClick={() => handleSelectLibro(libro)}
                    >
                      <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50">
                        {libro.portada_url ? (
                          <div className="mb-4 -mt-6 -mx-6">
                            <img
                              src={libro.portada_url}
                              alt={libro.titulo}
                              className="w-full h-48 object-cover rounded-t-lg"
                            />
                          </div>
                        ) : (
                          <div className="mb-4 -mt-6 -mx-6 h-48 bg-gradient-to-br from-amber-200 to-orange-300 rounded-t-lg flex items-center justify-center">
                            <BookOpen className="w-16 h-16 text-white opacity-50" />
                          </div>
                        )}
                        <CardTitle className="text-xl text-amber-900 line-clamp-2 group-hover:text-orange-700 transition-colors">
                          {libro.titulo}
                        </CardTitle>
                        {libro.autor && (
                          <CardDescription className="text-amber-700 mt-1">
                            por {libro.autor}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="pt-4">
                        {libro.descripcion && (
                          <p className="text-sm text-amber-800 line-clamp-4 mb-4">
                            {libro.descripcion}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-sm text-amber-600">
                          <div className="flex items-center gap-2">
                            {libro.audio_https && (
                              <span className="flex items-center gap-1">
                                <Headphones className="w-4 h-4" />
                                Audio
                              </span>
                            )}
                          </div>
                          <span className="text-orange-600 font-semibold group-hover:underline">
                            Leer ahora →
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : selectedLibro ? (
            // READER VIEW - Vista de Lectura del Capítulo Seleccionado
            <div className="space-y-8 max-w-4xl mx-auto">
              {/* Chapter Header */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200 overflow-hidden">
                <div className="p-8 sm:p-12">
                  {/* Title and Author */}
                  <div className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold text-amber-900 mb-4 font-serif">
                      {selectedLibro.titulo}
                    </h1>
                    {selectedLibro.autor && (
                      <p className="text-xl text-amber-700 font-medium">
                        por {selectedLibro.autor}
                      </p>
                    )}
                  </div>

                  {/* Cover Image */}
                  {selectedLibro.portada_url && (
                    <div className="mb-8">
                      <img
                        src={selectedLibro.portada_url}
                        alt={selectedLibro.titulo}
                        className="max-w-md mx-auto rounded-lg shadow-lg"
                      />
                    </div>
                  )}

                  {/* Description */}
                  {selectedLibro.descripcion && (
                    <div className="mb-8">
                      <p className="text-lg text-amber-800 leading-relaxed text-center italic">
                        {selectedLibro.descripcion}
                      </p>
                    </div>
                  )}

                  <Separator className="bg-amber-200" />

                  {/* Audio Players */}
                  {(selectedLibro.audio_https || selectedLibro.audioanalisis_https) && (
                    <div className="mt-8 space-y-6">
                      <h3 className="text-2xl font-bold text-amber-900 flex items-center gap-2">
                        <Headphones className="w-6 h-6" />
                        Audio del Capítulo
                      </h3>

                      {selectedLibro.audio_https && (
                        <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-6 border border-amber-300">
                          <h4 className="text-lg font-semibold text-amber-900 mb-3">
                            Audio Principal
                          </h4>
                          <audio
                            controls
                            className="w-full"
                            preload="metadata"
                          >
                            <source src={selectedLibro.audio_https} type="audio/mpeg" />
                            Tu navegador no soporta el elemento de audio.
                          </audio>
                        </div>
                      )}

                      {selectedLibro.audioanalisis_https && (
                        <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-6 border border-amber-300">
                          <h4 className="text-lg font-semibold text-amber-900 mb-3">
                            Audio de Análisis
                          </h4>
                          <a
                            href={selectedLibro.audioanalisis_https}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                          >
                            <Headphones className="w-5 h-5" />
                            Escuchar Análisis
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Chapter Content */}
              {selectedLibro.contenido && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200 p-8 sm:p-12">
                  <div 
                    className="prose prose-amber prose-lg max-w-none select-text
                      prose-headings:text-amber-900 prose-headings:font-serif
                      prose-p:text-amber-800 prose-p:leading-relaxed
                      prose-strong:text-amber-900
                      prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline
                      prose-blockquote:border-l-amber-500 prose-blockquote:text-amber-700
                      prose-code:text-orange-700 prose-code:bg-amber-100
                      prose-pre:bg-amber-900 prose-pre:text-amber-50"
                    dangerouslySetInnerHTML={{ 
                      __html: formatMarkdownContent(selectedLibro.contenido) 
                    }}
                  />
                </div>
              )}
            </div>
          ) : null}
        </main>

        {/* Floating Action Button - Centered vertically, extreme right - Only visible when text is selected */}
        {hasTextSelection && (
          <div className="fixed top-1/2 right-6 -translate-y-1/2 z-40 animate-in fade-in slide-in-from-right-5 duration-300">
            <Button
              size="lg"
              onClick={handleCreateNote}
              className="h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-2 border-white hover:scale-110 transition-all duration-300"
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

// Simple Markdown-like formatter
function formatMarkdownContent(content: string): string {
  if (!content) return "";
  
  let html = content;
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  
  // Italic
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>');
  
  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>');
  html = html.replace(/\n/g, '<br>');
  
  // Wrap in paragraphs
  html = '<p>' + html + '</p>';
  
  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p><br><\/p>/g, '');
  
  return html;
}