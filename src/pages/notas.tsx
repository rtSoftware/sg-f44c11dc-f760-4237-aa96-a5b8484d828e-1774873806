import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { ThemeSwitch } from "@/components/ThemeSwitch";

export default function NotasPage() {
  const router = useRouter();
  const { casaId } = useCasa();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [notas, setNotas] = useState<NotaWithLibro[]>([]);
  const [libros, setLibros] = useState<Libro[]>([]);
  const [showNewNotaDialog, setShowNewNotaDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLibroFilter, setSelectedLibroFilter] = useState("all");
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
    if (router.query.libro_id && router.query.origen) {
      const { libro_id, origen } = router.query;
      setFormData({
        libro_id: libro_id as string,
        origen: origen as string,
        nota: "",
      });
      setShowNewNotaDialog(true);
      router.replace("/notas", undefined, { shallow: true });
    }
  }, [router.query]);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
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
    if (!user || !casaId) return;
    setSubmitting(true);
    try {
      await createNota({ ...formData, user_id: user.id, casa_id: casaId });
      await loadData();
      setFormData({ libro_id: "", origen: "", nota: "" });
      setShowNewNotaDialog(false);
    } catch (error) {
      console.error(error);
      alert("No se pudo crear la nota.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteNota(notaId: string) {
    if (!confirm("¿Estás seguro de que deseas eliminar esta nota?")) return;
    try {
      await deleteNota(notaId);
      await loadData();
    } catch (error) {
      console.error("Error deleting nota:", error);
    }
  }

  const filteredNotas = notas.filter(nota => {
    const matchesSearch = 
      nota.nota?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      nota.origen?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLibro = selectedLibroFilter === "all" || nota.libro_id === selectedLibroFilter;
    return matchesSearch && matchesLibro;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
      </div>
    );
  }

  return (
    <>
      <SEO title="Mis Notas - Experiencia Miguel" />
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
                <Button
                  onClick={() => setShowNewNotaDialog(true)}
                  className="bg-stone-900 hover:bg-stone-800 text-white"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Nota
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
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
            <Card className="bg-white border-stone-200 shadow-sm">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 mx-auto text-stone-400 mb-4" />
                <h2 className="text-2xl font-bold text-stone-900 mb-2">
                  No hay notas
                </h2>
                <p className="text-stone-600 mb-6">
                  {searchTerm || selectedLibroFilter !== "all"
                    ? "No se encontraron notas con los filtros aplicados."
                    : "Aún no has creado ninguna nota."}
                </p>
                {!(searchTerm || selectedLibroFilter !== "all") && (
                  <Button
                    onClick={() => setShowNewNotaDialog(true)}
                    className="bg-stone-900 hover:bg-stone-800 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Primera Nota
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredNotas.map((nota) => {
                const libro = libros.find((l) => l.id === nota.libro_id);
                return (
                  <Card
                    key={nota.id}
                    className="border border-stone-200 bg-white hover:border-stone-300 hover:shadow-lg transition-all duration-300 group"
                  >
                    <CardHeader className="border-b border-stone-100 pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {libro && (
                            <CardDescription className="text-stone-600 flex items-center gap-1 mb-1">
                              <BookOpen className="w-3 h-3" />
                              {libro.titulo}
                            </CardDescription>
                          )}
                          <p className="text-sm font-medium text-stone-500 mb-1">
                            Texto original:
                          </p>
                          <blockquote className="border-l-2 border-stone-300 pl-3 italic text-stone-600 bg-stone-50 py-2 text-sm line-clamp-3">
                            {nota.origen}
                          </blockquote>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteNota(nota.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 -mt-2 -mr-2"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4">
                      <p className="text-sm font-medium text-stone-500 mb-1">
                            Mi nota:
                      </p>
                      <p className="text-sm text-stone-900 whitespace-pre-wrap line-clamp-6">
                        {nota.nota}
                      </p>
                      <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                        <span>
                          {new Date(nota.created_at).toLocaleDateString("es-ES", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>

        {/* New Nota Dialog */}
        <Dialog open={showNewNotaDialog} onOpenChange={setShowNewNotaDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle className="text-stone-900">Nueva Nota</DialogTitle>
              <DialogDescription className="text-stone-600">
                Crea una nueva anotación personal
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateNota} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="libro_id" className="text-stone-900">Capítulo *</Label>
                <Select
                  value={formData.libro_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, libro_id: value })
                  }
                  required
                >
                  <SelectTrigger className="border-stone-300">
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

              <div className="space-y-2">
                <Label htmlFor="origen" className="text-stone-900">Texto Original *</Label>
                <Textarea
                  id="origen"
                  value={formData.origen}
                  onChange={(e) =>
                    setFormData({ ...formData, origen: e.target.value })
                  }
                  placeholder="Texto seleccionado del libro..."
                  className="min-h-[100px] resize-none border-stone-300 focus:border-stone-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nota" className="text-stone-900">Tu Nota *</Label>
                <Textarea
                  id="nota"
                  value={formData.nota}
                  onChange={(e) =>
                    setFormData({ ...formData, nota: e.target.value })
                  }
                  placeholder="Tus reflexiones..."
                  className="min-h-[150px] resize-none border-stone-300 focus:border-stone-500"
                  required
                  autoFocus
                />
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
                  className="border-stone-300 text-stone-700"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-stone-900 hover:bg-stone-800 text-white"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Guardar Nota
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