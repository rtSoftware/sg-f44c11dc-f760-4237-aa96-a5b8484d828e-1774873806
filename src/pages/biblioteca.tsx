import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ReactMarkdown from "react-markdown";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { authService } from "@/services/authService";
import { getAllLibros } from "@/services/libroService";
import { useCasa } from "@/contexts/CasaContext";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { Libro } from "@/services/libroService";
import { ArrowLeft, BookOpen, Headphones, User as UserIcon, Library, MessageCircle, FileText } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

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
    
    const { data, error } = await getAllLibros();
    
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

      <div className="min-h-screen">
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
            <div>
              {filteredLibros.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="h-16 w-16 text-stone-400 mb-4" />
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
                    key={libro.id}
                    className="group hover:shadow-lg transition-all duration-300 border-stone-200 hover:border-amber-300 cursor-pointer overflow-hidden"
                    onClick={() => router.push(`/lectura/${casaNombre}`)}
                  >
                    <CardContent className="p-0">
                      {libro.portada_url && (
                        <div className="relative h-64 w-full overflow-hidden bg-stone-100">
                          <img
                            src={libro.portada_url}
                            alt={libro.titulo}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                      )}
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-stone-900 mb-2 group-hover:text-amber-700 transition-colors">
                          {libro.titulo}
                        </h3>
                        {libro.autor && (
                          <p className="text-sm text-stone-600 mb-3">por {libro.autor}</p>
                        )}
                        <div className="flex items-center justify-between mt-4">
                          <Badge variant="outline" className="border-amber-300 text-amber-700">
                            <BookOpen className="w-3 h-3 mr-1" />
                            Leer
                          </Badge>
                          {libro.orden !== null && libro.orden !== undefined && (
                            <span className="text-xs text-stone-500">Orden: {libro.orden}</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : selectedLibro ? (
            // READER VIEW - Vista de Lectura del Capítulo Seleccionado
            <div className="space-y-8 max-w-4xl mx-auto">
              {/* Chapter Header */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200 overflow-hidden">
                <div className="p-8 sm:p-12">
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

                  {/* Audio de Análisis */}
                  {selectedLibro.audioanalisis_https && (
                    <div className="mt-8">
                      <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl p-6 border border-amber-300">
                        <h4 className="text-lg font-semibold text-amber-900 mb-3">
                          Mentorías
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          <a
                            href={selectedLibro.audioanalisis_https}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                          >
                            <Headphones className="w-5 h-5" />
                            Escuchar Análisis
                          </a>
                          
                          {selectedLibro.audio_https && (
                            <a
                              href={selectedLibro.audio_https}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                            >
                              <FileText className="w-5 h-5" />
                              PDF
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chapter Content */}
              {selectedLibro.contenido && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200 p-8 sm:p-12">
                  <div className="prose prose-amber prose-lg max-w-none select-text
                      prose-headings:text-amber-900 prose-headings:font-serif
                      prose-p:text-amber-800 prose-p:leading-relaxed
                      prose-strong:text-amber-900
                      prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline
                      prose-blockquote:border-l-amber-500 prose-blockquote:text-amber-700
                      prose-code:text-orange-700 prose-code:bg-amber-100
                      prose-pre:bg-amber-900 prose-pre:text-amber-50
                      prose-ul:text-amber-800 prose-ol:text-amber-800
                      prose-li:text-amber-800"
                  >
                    <ReactMarkdown>
                      {selectedLibro.contenido}
                    </ReactMarkdown>
                  </div>
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