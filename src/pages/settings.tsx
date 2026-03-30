import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2, Trash2, Plus, Book, Edit, Home, Check } from "lucide-react";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { getAllLibros, createLibro, updateLibro, deleteLibroContent } from "@/services/libroService";
import { getAllCasas, createCasa } from "@/services/casaService";
import { useCasa } from "@/contexts/CasaContext";
import type { User } from "@supabase/supabase-js";
import type { Libro } from "@/services/libroService";
import type { Tables } from "@/integrations/supabase/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type FormMode = "list" | "create" | "edit";
type Section = "libros" | "casas";

export default function Settings() {
  const router = useRouter();
  const { casaId } = useCasa();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [mode, setMode] = useState<FormMode>("list");
  const [section, setSection] = useState<Section>("libros");
  const [libros, setLibros] = useState<Libro[]>([]);
  const [casas, setCasas] = useState<Tables<"casas">[]>([]);
  const [selectedLibroId, setSelectedLibroId] = useState<string | null>(null);
  const [showNewCasaDialog, setShowNewCasaDialog] = useState(false);
  const [newCasaName, setNewCasaName] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    contenido: "",
    autor: "",
    portada_url: "",
    audio_https: "",
    audioanalisis_https: ""
  });

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadLibros();
      loadCasas();
    }
  }, [user]);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push("/auth");
      return;
    }

    setUser(session.user);
    setLoading(false);
  }

  async function loadLibros() {
    const { data, error } = await getAllLibros();
    
    if (error) {
      console.error("Error loading libros:", error);
      setLibros([]);
      return;
    }

    setLibros(data || []);
  }

  async function loadCasas() {
    const { data, error } = await getAllCasas();
    
    if (error) {
      console.error("Error loading casas:", error);
      setCasas([]);
      return;
    }

    setCasas(data || []);
  }

  function handleNewLibro() {
    setMode("create");
    setSelectedLibroId(null);
    setFormData({
      titulo: "",
      descripcion: "",
      contenido: "",
      autor: "",
      portada_url: "",
      audio_https: "",
      audioanalisis_https: ""
    });
    setMessage(null);
  }

  function handleEditLibro(libro: Libro) {
    setMode("edit");
    setSelectedLibroId(libro.id);
    setFormData({
      titulo: libro.titulo || "",
      descripcion: libro.descripcion || "",
      contenido: libro.contenido || "",
      autor: libro.autor || "",
      portada_url: libro.portada_url || "",
      audio_https: libro.audio_https || "",
      audioanalisis_https: libro.audioanalisis_https || ""
    });
    setMessage(null);
  }

  function handleCancelForm() {
    setMode("list");
    setSelectedLibroId(null);
    setFormData({
      titulo: "",
      descripcion: "",
      contenido: "",
      autor: "",
      portada_url: "",
      audio_https: "",
      audioanalisis_https: ""
    });
    setMessage(null);
  }

  async function handleCreateCasa(e: React.FormEvent) {
    e.preventDefault();
    if (!newCasaName.trim()) {
      setMessage({ type: "error", text: "El nombre de la casa es obligatorio" });
      return;
    }

    setSaving(true);
    setMessage(null);

    const { success, error } = await createCasa(newCasaName);

    if (error) {
      setMessage({ type: "error", text: "Error al crear la casa" });
      console.error("Create casa error:", error);
    } else {
      setMessage({ type: "success", text: "Casa creada exitosamente" });
      await loadCasas();
      setNewCasaName("");
      setShowNewCasaDialog(false);
    }

    setSaving(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    if (!formData.titulo.trim()) {
      setMessage({ type: "error", text: "El título es obligatorio" });
      return;
    }

    setSaving(true);
    setMessage(null);

    if (mode === "create") {
      const { data, error } = await createLibro(formData, user.id);

      if (error) {
        setMessage({ type: "error", text: "Error al crear el capítulo" });
        console.error("Create error:", error);
      } else {
        setMessage({ type: "success", text: "Capítulo creado exitosamente" });
        await loadLibros();
        setTimeout(() => handleCancelForm(), 1500);
      }
    } else if (mode === "edit" && selectedLibroId) {
      const { data, error } = await updateLibro(selectedLibroId, formData);

      if (error) {
        setMessage({ type: "error", text: "Error al actualizar el capítulo" });
        console.error("Update error:", error);
      } else {
        setMessage({ type: "success", text: "Capítulo actualizado exitosamente" });
        await loadLibros();
        setTimeout(() => handleCancelForm(), 1500);
      }
    }

    setSaving(false);
  }

  async function handleDelete() {
    if (!selectedLibroId) return;

    setDeleting(true);
    setMessage(null);

    const { success, error } = await deleteLibroContent(selectedLibroId);

    if (error) {
      setMessage({ type: "error", text: "Error al eliminar el capítulo" });
      console.error("Delete error:", error);
    } else {
      setMessage({ type: "success", text: "Capítulo eliminado exitosamente" });
      await loadLibros();
      setTimeout(() => handleCancelForm(), 1500);
    }

    setDeleting(false);
    setShowDeleteDialog(false);
  }

  function handleChange(field: string, value: string) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Configuración - Experiencia Miguel"
        description="Gestión de contenido de la biblioteca"
      />
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <header className="bg-white border-b border-amber-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center mb-4">
              <Link href="/dashboard" className="flex items-center gap-2 text-amber-900 hover:text-amber-700 transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span className="font-semibold">Volver al Dashboard</span>
              </Link>
              
              {section === "libros" && mode === "list" && (
                <Button
                  onClick={handleNewLibro}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Capítulo
                </Button>
              )}

              {section === "casas" && (
                <Button
                  onClick={() => setShowNewCasaDialog(true)}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Casa
                </Button>
              )}
            </div>

            {/* Navegación de secciones */}
            <div className="flex gap-2">
              <Button
                variant={section === "libros" ? "default" : "outline"}
                onClick={() => {
                  setSection("libros");
                  setMode("list");
                }}
                className={section === "libros" 
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white" 
                  : "border-amber-300 text-amber-700 hover:bg-amber-50"}
              >
                <Book className="mr-2 h-4 w-4" />
                Capítulos
              </Button>
              <Button
                variant={section === "casas" ? "default" : "outline"}
                onClick={() => {
                  setSection("casas");
                  setMode("list");
                }}
                className={section === "casas" 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white" 
                  : "border-blue-300 text-blue-700 hover:bg-blue-50"}
              >
                <Home className="mr-2 h-4 w-4" />
                Casas
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {section === "libros" && mode === "list" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-amber-900">Capítulos</h1>
                  <p className="text-amber-700 mt-2">Administra el contenido de tu biblioteca</p>
                </div>
              </div>

              {libros.length === 0 ? (
                <Card className="border-amber-200 shadow-lg">
                  <CardContent className="pt-6 text-center py-12">
                    <Book className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-amber-900 mb-2">
                      No hay libros configurados
                    </h3>
                    <p className="text-amber-700 mb-6">
                      Crea tu primer libro para comenzar a compartir contenido con tu comunidad
                    </p>
                    <Button
                      onClick={handleNewLibro}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Crear Primer Libro
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {libros.map((libro) => (
                    <Card key={libro.id} className="border-amber-200 shadow-lg hover:shadow-xl transition-shadow">
                      <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl text-amber-900 line-clamp-2">
                              {libro.titulo}
                            </CardTitle>
                            {libro.autor && (
                              <CardDescription className="text-amber-700 mt-1">
                                por {libro.autor}
                              </CardDescription>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        {libro.descripcion && (
                          <p className="text-sm text-amber-800 mb-4 line-clamp-3">
                            {libro.descripcion}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleEditLibro(libro)}
                            className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              setSelectedLibroId(libro.id);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {(mode === "create" || mode === "edit") && (
            <Card className="border-amber-200 shadow-lg">
              <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50">
                <CardTitle className="text-2xl text-amber-900">
                  {mode === "create" ? "Crear Nuevo Libro" : "Editar Libro"}
                </CardTitle>
                <CardDescription className="text-amber-700">
                  {mode === "create" 
                    ? "Completa los datos del nuevo libro para tu biblioteca"
                    : "Modifica los datos del libro seleccionado"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="titulo" className="text-amber-900 font-semibold">
                      Título del Libro <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => handleChange("titulo", e.target.value)}
                      placeholder="Capítulo 1: Introducción"
                      className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="autor" className="text-amber-900 font-semibold">
                      Autor
                    </Label>
                    <Input
                      id="autor"
                      value={formData.autor}
                      onChange={(e) => handleChange("autor", e.target.value)}
                      placeholder="Nombre del autor"
                      className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descripcion" className="text-amber-900 font-semibold">
                      Descripción Breve
                    </Label>
                    <Textarea
                      id="descripcion"
                      value={formData.descripcion}
                      onChange={(e) => handleChange("descripcion", e.target.value)}
                      placeholder="Una breve descripción del capítulo..."
                      rows={3}
                      className="border-amber-200 focus:border-amber-400 focus:ring-amber-400 resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contenido" className="text-amber-900 font-semibold">
                      Contenido Completo
                    </Label>
                    <Textarea
                      id="contenido"
                      value={formData.contenido}
                      onChange={(e) => handleChange("contenido", e.target.value)}
                      placeholder="El contenido completo del capítulo en formato texto o Markdown..."
                      rows={15}
                      className="border-amber-200 focus:border-amber-400 focus:ring-amber-400 font-mono text-sm resize-y"
                    />
                    <p className="text-sm text-amber-600">
                      Puedes usar Markdown para dar formato al contenido
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="portada_url" className="text-amber-900 font-semibold">
                      URL de la Portada
                    </Label>
                    <Input
                      id="portada_url"
                      value={formData.portada_url}
                      onChange={(e) => handleChange("portada_url", e.target.value)}
                      placeholder="https://ejemplo.com/portada.jpg"
                      type="url"
                      className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="audio_https" className="text-amber-900 font-semibold">
                      URL del Audio Principal
                    </Label>
                    <Input
                      id="audio_https"
                      value={formData.audio_https}
                      onChange={(e) => handleChange("audio_https", e.target.value)}
                      placeholder="https://streaming.ejemplo.com/audio-capitulo.mp3"
                      type="url"
                      className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                    />
                    <p className="text-sm text-amber-600">
                      URL HTTPS al servidor de streaming para el audio del capítulo
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="audioanalisis_https" className="text-amber-900 font-semibold">
                      URL del Audio de Análisis
                    </Label>
                    <Input
                      id="audioanalisis_https"
                      value={formData.audioanalisis_https}
                      onChange={(e) => handleChange("audioanalisis_https", e.target.value)}
                      placeholder="https://streaming.ejemplo.com/audio-analisis.mp3"
                      type="url"
                      className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                    />
                    <p className="text-sm text-amber-600">
                      URL HTTPS al servidor de streaming para el audio de análisis
                    </p>
                  </div>

                  {message && (
                    <div className={`p-4 rounded-lg ${
                      message.type === "success" 
                        ? "bg-green-50 text-green-800 border border-green-200" 
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}>
                      {message.text}
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCancelForm}
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={saving}
                      className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {mode === "create" ? "Crear Capítulo" : "Guardar Cambios"}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </main>

        {/* Sección de Casas */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {section === "casas" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-amber-900">Gestión de Casas</h1>
                  <p className="text-amber-700 mt-2">Administra tus comunidades y espacios</p>
                </div>
              </div>

              {message && (
                <div className={`p-4 rounded-lg ${
                  message.type === "success" 
                    ? "bg-green-50 text-green-800 border border-green-200" 
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}>
                  {message.text}
                </div>
              )}

              {casas.length === 0 ? (
                <Card className="border-amber-200 shadow-lg">
                  <CardContent className="pt-6 text-center py-12">
                    <Home className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-amber-900 mb-2">
                      No hay casas configuradas
                    </h3>
                    <p className="text-amber-700 mb-6">
                      Crea tu primera casa para comenzar a organizar tus comunidades
                    </p>
                    <Button
                      onClick={() => setShowNewCasaDialog(true)}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Crear Primera Casa
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {casas.map((casa) => (
                    <Card 
                      key={casa.id} 
                      className={`border-2 shadow-lg hover:shadow-xl transition-all ${
                        casa.id === casaId 
                          ? "border-blue-500 bg-blue-50" 
                          : "border-amber-200"
                      }`}
                    >
                      <CardHeader className={`border-b ${
                        casa.id === casaId 
                          ? "border-blue-200 bg-gradient-to-r from-blue-100 to-indigo-100" 
                          : "border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50"
                      }`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl text-amber-900 flex items-center gap-2">
                              <Home className="h-5 w-5" />
                              {casa.casa_nombre}
                              {casa.id === casaId && (
                                <span className="ml-2 px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
                                  Tu Casa
                                </span>
                              )}
                            </CardTitle>
                            <CardDescription className="text-amber-700 mt-1">
                              Creada: {new Date(casa.created_at).toLocaleDateString()}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="text-center py-2 text-stone-600 text-sm">
                          {casa.id === casaId ? (
                            <span className="font-semibold text-blue-600">
                              Esta es tu casa activa
                            </span>
                          ) : (
                            <span className="text-stone-500">
                              Comunidad registrada
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>

        {/* Dialog para crear nueva casa */}
        <Dialog open={showNewCasaDialog} onOpenChange={setShowNewCasaDialog}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-amber-900">Crear Nueva Casa</DialogTitle>
              <DialogDescription className="text-amber-700">
                Ingresa el nombre para tu nueva comunidad o espacio
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCasa}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="casa-nombre">Nombre de la Casa *</Label>
                  <Input
                    id="casa-nombre"
                    value={newCasaName}
                    onChange={(e) => setNewCasaName(e.target.value)}
                    placeholder="Ej: Mi Comunidad de Lectura"
                    className="border-amber-200 focus:border-amber-400"
                    required
                    autoFocus
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowNewCasaDialog(false);
                    setNewCasaName("");
                  }}
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={saving}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Crear Casa
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-amber-900">¿Eliminar este libro?</AlertDialogTitle>
              <AlertDialogDescription className="text-amber-700">
                Esta acción no se puede deshacer. El libro, incluyendo título, descripción, 
                contenido completo y URLs de audio serán eliminados permanentemente.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-amber-300 text-amber-700 hover:bg-amber-50">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}