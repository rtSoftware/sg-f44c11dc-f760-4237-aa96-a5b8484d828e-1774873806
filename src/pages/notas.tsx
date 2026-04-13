import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Plus, Loader2, BookOpen, Trash2, FileText, Search } from "lucide-react";
import Link from "next/link";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useCasa } from "@/contexts/CasaContext";
import {
  getNotasByUserAndCasa,
  createNota,
  deleteNota,
  type NotaWithLibro,
  type CreateNotaData,
} from "@/services/notasService";
import { getAllLibros, type Libro } from "@/services/libroService";

export default function NotasPage() {
  const router = useRouter();
  const { casaId } = useCasa();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notas, setNotas] = useState<NotaWithLibro[]>([]);
  const [libros, setLibros] = useState<Libro[]>([]);
  const [showNewNotaDialog, setShowNewNotaDialog] = useState(false);
  const [formData, setFormData] = useState({
    libro_id: "",
    origen: "",
    nota: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && casaId) {
      loadData();
    }
  }, [user, casaId]);

  useEffect(() => {
    // Detectar parámetros de query para precargar formulario
    if (router.query.libro_id && router.query.origen) {
      const { libro_id, origen } = router.query;
      
      setFormData({
        libro_id: libro_id as string,
        origen: origen as string,
        nota: "",
      });
      
      setShowNewNotaDialog(true);
      
      // Limpiar query params de la URL sin recargar
      router.replace("/notas", undefined, { shallow: true });
    }
  }, [router.query]);

  async function checkAuth() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/auth");
      return;
    }

    setUser(session.user);
    setLoading(false);
  }

  async function loadData() {
    if (!user || !casaId) return;

    try {
      const [notasData, librosResponse] = await Promise.all([
        getNotasByUserAndCasa(user.id, casaId),
        getAllLibros(),
      ]);

      setNotas(notasData);
      if (librosResponse.data) {
        setLibros(librosResponse.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }

  async function handleCreateNota(e: React.FormEvent) {
    e.preventDefault();
    console.log("=== START handleCreateNota ===");
    console.log("User:", user?.id);
    console.log("Casa ID:", casaId);
    console.log("Form Data:", formData);
    
    if (!user || !casaId) {
      console.error("Missing user or casaId:", { user: user?.id, casaId });
      alert("Error: No hay usuario o casa activa");
      return;
    }

    setSubmitting(true);

    try {
      const notaData: CreateNotaData = {
        ...formData,
        user_id: user.id,
        casa_id: casaId,
      };

      console.log("Prepared nota data:", notaData);
      console.log("Calling createNota...");

      const result = await createNota(notaData);

      console.log("Nota created successfully:", result);

      // Recargar notas
      console.log("Reloading data...");
      await loadData();

      // Resetear formulario y cerrar dialog
      setFormData({ libro_id: "", origen: "", nota: "" });
      setShowNewNotaDialog(false);
      
      console.log("=== END handleCreateNota SUCCESS ===");
    } catch (error) {
      console.error("=== ERROR in handleCreateNota ===");
      console.error("Error type:", typeof error);
      console.error("Error object:", error);
      console.error("Error string:", String(error));
      
      if (error && typeof error === 'object') {
        console.error("Error keys:", Object.keys(error));
        console.error("Error JSON:", JSON.stringify(error, null, 2));
      }
      
      // Mostrar mensaje de error más descriptivo
      let errorMessage = "Error desconocido al crear la nota";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String((error as any).message);
      }
      
      alert(`No se pudo crear la nota.\n\n${errorMessage}\n\nPor favor, revisa la consola del navegador (F12) para más detalles.`);
    } finally {
      setSubmitting(false);
      console.log("=== END handleCreateNota (finally) ===");
    }
  }

  async function handleDeleteNota(notaId: string) {
    if (!confirm("¿Estás seguro de que deseas eliminar esta nota?")) return;

    try {
      await deleteNota(notaId);
      await loadData();
    } catch (error) {
      console.error("Error deleting nota:", error);
      alert("Error al eliminar la nota. Por favor intenta de nuevo.");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
        <AnimatedBackground />

        {/* Header */}
        <header className="bg-white/90 backdrop-blur-sm border-b border-stone-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="w-6 h-6 text-stone-900" />
                <h1 className="text-xl font-bold text-stone-900">Mis Notas</h1>
              </div>
              <div className="flex items-center gap-3">
                <ThemeSwitch />
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="border-stone-300 text-stone-700 hover:bg-stone-100">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input
                  type="text"
                  placeholder="Buscar en notas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-stone-300 focus:border-stone-500"
                />
              </div>
            </div>
            <Select value={selectedLibroFilter} onValueChange={setSelectedLibroFilter}>
              <SelectTrigger className="w-full sm:w-64 border-stone-300">
                <SelectValue placeholder="Filtrar por libro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los libros</SelectItem>
                {libros.map((libro) => (
                  <SelectItem key={libro.id} value={libro.id}>
                    {libro.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes Grid */}
          {filteredNotas.length === 0 ? (
            <Card className="bg-white border-stone-200">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-stone-400 mb-4" />
                <h2 className="text-2xl font-bold text-stone-900 mb-2">
                  No hay notas disponibles
                </h2>
                <p className="text-stone-600 mb-6">
                  {searchTerm || selectedLibroFilter !== "all"
                    ? "No se encontraron notas con los filtros aplicados."
                    : "Aún no has creado ninguna nota. Comienza a tomar notas mientras lees."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredNotas.map((nota) => {
                const libro = libros.find((l) => l.id === nota.libro_id);
                return (
                  <Card
                    key={nota.id}
                    className="border-stone-200 bg-white hover:shadow-lg transition-all duration-300 group"
                  >
                    <CardHeader className="border-b border-stone-100">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg text-stone-900 line-clamp-2">
                            {nota.titulo || "Sin título"}
                          </CardTitle>
                          {libro && (
                            <CardDescription className="text-stone-600 mt-1 flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              {libro.titulo}
                            </CardDescription>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNota(nota.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm text-stone-700 line-clamp-4 whitespace-pre-wrap">
                        {nota.contenido}
                      </p>
                      <div className="mt-4 flex items-center justify-between text-xs text-stone-500">
                        <span>
                          {new Date(nota.created_at).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        {nota.pagina_numero && (
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            Pág. {nota.pagina_numero}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Mis Notas - Experiencia Miguel"
        description="Gestiona tus notas y anotaciones personales"
      />

      <div className="min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-stone-900">
                      Mis Notas
                    </h1>
                    <p className="text-xs text-stone-600">
                      {notas.length} {notas.length === 1 ? "nota" : "notas"}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setShowNewNotaDialog(true)}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Nota
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {notas.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900 mb-4">
                No tienes notas aún
              </h2>
              <p className="text-stone-600 mb-8">
                Comienza a crear notas sobre los capítulos del libro
              </p>
              <Button
                onClick={() => setShowNewNotaDialog(true)}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Crear Primera Nota
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {notas.map((nota) => (
                <Card
                  key={nota.id}
                  className="border-amber-200 hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Libro Reference */}
                        {nota.libro && (
                          <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="w-4 h-4 text-amber-600" />
                            <span className="text-sm font-semibold text-amber-700">
                              {nota.libro.titulo}
                            </span>
                          </div>
                        )}

                        {/* Origen (texto seleccionado) */}
                        <div className="mb-4">
                          <p className="text-sm font-medium text-stone-500 mb-1">
                            Texto original:
                          </p>
                          <blockquote className="border-l-4 border-amber-300 pl-4 italic text-stone-700 bg-amber-50 py-2 rounded-r">
                            {nota.origen}
                          </blockquote>
                        </div>

                        {/* Nota del usuario */}
                        <div>
                          <p className="text-sm font-medium text-stone-500 mb-1">
                            Mi nota:
                          </p>
                          <p className="text-stone-800 whitespace-pre-wrap">
                            {nota.nota}
                          </p>
                        </div>

                        {/* Fecha */}
                        <p className="text-xs text-stone-400 mt-4">
                          {new Date(nota.created_at).toLocaleDateString(
                            "es-MX",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNota(nota.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>

        {/* New Nota Dialog */}
        <Dialog open={showNewNotaDialog} onOpenChange={setShowNewNotaDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nueva Nota</DialogTitle>
              <DialogDescription>
                Crea una nueva anotación personal sobre el contenido del libro
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateNota} className="space-y-6">
              {/* Libro Select */}
              <div className="space-y-2">
                <Label htmlFor="libro_id">Capítulo del Libro *</Label>
                <Select
                  value={formData.libro_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, libro_id: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un capítulo" />
                  </SelectTrigger>
                  <SelectContent>
                    {libros.map((libro) => (
                      <SelectItem key={libro.id} value={libro.id}>
                        {libro.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Origen (texto original) */}
              <div className="space-y-2">
                <Label htmlFor="origen">Texto Original *</Label>
                <Textarea
                  id="origen"
                  value={formData.origen}
                  onChange={(e) =>
                    setFormData({ ...formData, origen: e.target.value })
                  }
                  placeholder="Pega aquí el texto que seleccionaste del libro..."
                  className="min-h-[100px] resize-none"
                  required
                />
                <p className="text-xs text-stone-500">
                  El fragmento del libro sobre el que estás haciendo la nota
                </p>
              </div>

              {/* Nota */}
              <div className="space-y-2">
                <Label htmlFor="nota">Tu Nota *</Label>
                <Textarea
                  id="nota"
                  value={formData.nota}
                  onChange={(e) =>
                    setFormData({ ...formData, nota: e.target.value })
                  }
                  placeholder="Escribe tus reflexiones, ideas o comentarios..."
                  className="min-h-[150px] resize-none"
                  required
                  autoFocus
                />
                <p className="text-xs text-stone-500">
                  Tus pensamientos, análisis o conclusiones sobre el texto
                </p>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowNewNotaDialog(false);
                    setFormData({ libro_id: "", origen: "", nota: "" });
                  }}
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Nota
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}