import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2, Trash2, Plus, Book, Edit, Home, Check, User } from "lucide-react";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { getAllLibros, createLibro, updateLibro, deleteLibroContent } from "@/services/libroService";
import { getAllCasas, createCasa, updateCasaNombre } from "@/services/casaService";
import { useCasa } from "@/contexts/CasaContext";
import type { User as UserType } from "@supabase/supabase-js";
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
type Section = "libros" | "casas" | "perfil";

export default function Settings() {
  const router = useRouter();
  const { casaId } = useCasa();
  const [user, setUser] = useState<UserType | null>(null);
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
  const [showEditCasaDialog, setShowEditCasaDialog] = useState(false);
  const [editingCasaId, setEditingCasaId] = useState<string | null>(null);
  const [editCasaName, setEditCasaName] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [profileData, setProfileData] = useState({
    full_name: "",
    avatar_url: ""
  });
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    contenido: "",
    autor: "",
    portada_url: "",
    audio_https: "",
    audioanalisis_https: "",
    orden: 0
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

  useEffect(() => {
    if (section === "perfil" && user) {
      loadProfile();
    }
  }, [section, user]);

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

  async function loadProfile() {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("full_name, avatar_url")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error loading profile:", error);
      return;
    }

    if (data) {
      setProfileData({
        full_name: data.full_name || "",
        avatar_url: data.avatar_url || ""
      });
    }
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
      audioanalisis_https: "",
      orden: 0
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
      audioanalisis_https: libro.audioanalisis_https || "",
      orden: libro.orden || 0
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
      audioanalisis_https: "",
      orden: 0
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

  async function handleEditCasa(casa: Tables<"casas">) {
    setEditingCasaId(casa.id);
    setEditCasaName(casa.casa_nombre);
    setShowEditCasaDialog(true);
    setMessage(null);
  }

  async function handleUpdateCasaNombre(e: React.FormEvent) {
    e.preventDefault();
    if (!editingCasaId || !editCasaName.trim()) {
      setMessage({ type: "error", text: "El nombre de la casa es obligatorio" });
      return;
    }

    setSaving(true);
    setMessage(null);

    const { success, error } = await updateCasaNombre(editingCasaId, editCasaName);

    if (error) {
      setMessage({ type: "error", text: "Error al actualizar el nombre de la casa" });
      console.error("Update casa nombre error:", error);
    } else {
      setMessage({ type: "success", text: "Nombre actualizado exitosamente" });
      await loadCasas();
      setEditingCasaId(null);
      setEditCasaName("");
      setShowEditCasaDialog(false);
    }

    setSaving(false);
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setLoadingProfile(true);
    setMessage(null);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url
      })
      .eq("id", user.id);

    if (error) {
      setMessage({ type: "error", text: "Error al actualizar el perfil" });
      console.error("Update profile error:", error);
    } else {
      setMessage({ type: "success", text: "Perfil actualizado exitosamente" });
      // Recargar contexto para reflejar cambios
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }

    setLoadingProfile(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      if (mode === "create") {
        const { data, error } = await createLibro(formData, user.id);
        
        if (error) {
          setMessage({ type: "error", text: "Error al crear el capítulo" });
          console.error("Create error:", error);
        } else {
          setMessage({ type: "success", text: "Capítulo creado exitosamente" });
          await loadLibros();
          handleCancelForm();
        }
      } else if (mode === "edit" && selectedLibroId) {
        const { data, error } = await updateLibro(selectedLibroId, formData);
        
        if (error) {
          setMessage({ type: "error", text: "Error al actualizar el capítulo" });
          console.error("Update error:", error);
        } else {
          setMessage({ type: "success", text: "Capítulo actualizado exitosamente" });
          await loadLibros();
          handleCancelForm();
        }
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error inesperado" });
      console.error("Submit error:", error);
    }

    setSaving(false);
  }

  async function confirmDelete() {
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
      setShowDeleteDialog(false);
      setSelectedLibroId(null);
    }

    setDeleting(false);
  }

  function handleChange(field: string, value: string) {
    if (field === "orden") {
      setFormData(prev => ({ ...prev, [field]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
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
              <Button
                variant={section === "perfil" ? "default" : "outline"}
                onClick={() => {
                  setSection("perfil");
                  setMode("list");
                }}
                className={section === "perfil" 
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" 
                  : "border-purple-300 text-purple-700 hover:bg-purple-50"}
              >
                <User className="mr-2 h-4 w-4" />
                Perfil
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
                    <Label htmlFor="orden" className="text-amber-900 font-semibold">
                      Orden de Presentación
                    </Label>
                    <Input
                      id="orden"
                      type="number"
                      value={formData.orden}
                      onChange={(e) => handleChange("orden", e.target.value)}
                      placeholder="0"
                      className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                      min="0"
                    />
                    <p className="text-sm text-amber-600">
                      Número que determina el orden de las tarjetas en la biblioteca (menor número = primero)
                    </p>
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
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditCasa(casa)}
                            className="text-amber-600 hover:text-amber-700 hover:bg-amber-100"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
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

        {/* Sección de Perfil */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {section === "perfil" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-amber-900">Mi Perfil</h1>
                  <p className="text-amber-700 mt-2">Actualiza tu información personal</p>
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

              <Card className="border-amber-200 shadow-lg max-w-2xl mx-auto">
                <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-purple-50 to-pink-50">
                  <CardTitle className="text-2xl text-amber-900 text-center">
                    Editar Perfil
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    {/* Avatar Display */}
                    <div className="flex flex-col items-center gap-4 pb-6 border-b border-amber-100">
                      <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                        {profileData.avatar_url ? (
                          <img 
                            src={profileData.avatar_url} 
                            alt="Avatar" 
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "";
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <User className="w-16 h-16 text-purple-400" />
                        )}
                      </div>
                      <p className="text-sm text-amber-600">
                        Imagen de perfil actual
                      </p>
                    </div>

                    {/* Full Name Field */}
                    <div className="space-y-2">
                      <Label htmlFor="full_name" className="text-amber-900 font-semibold">
                        Nombre Completo
                      </Label>
                      <Input
                        id="full_name"
                        value={profileData.full_name}
                        onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                        placeholder="Tu nombre completo"
                        className="border-amber-200 focus:border-purple-400 focus:ring-purple-400"
                      />
                    </div>

                    {/* Avatar URL Field */}
                    <div className="space-y-2">
                      <Label htmlFor="avatar_url" className="text-amber-900 font-semibold">
                        URL del Avatar
                      </Label>
                      <Input
                        id="avatar_url"
                        value={profileData.avatar_url}
                        onChange={(e) => setProfileData({ ...profileData, avatar_url: e.target.value })}
                        placeholder="https://ejemplo.com/mi-avatar.jpg"
                        type="url"
                        className="border-amber-200 focus:border-purple-400 focus:ring-purple-400"
                      />
                      <p className="text-sm text-amber-600">
                        URL de la imagen que deseas usar como avatar
                      </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                      <Button 
                        type="submit" 
                        disabled={loadingProfile}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                      >
                        {loadingProfile ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Guardar Cambios
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
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

        {/* Dialog para editar nombre de casa */}
        <Dialog open={showEditCasaDialog} onOpenChange={setShowEditCasaDialog}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-amber-900">Editar Nombre de Casa</DialogTitle>
              <DialogDescription className="text-amber-700">
                Modifica el nombre de tu comunidad o espacio
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateCasaNombre}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-casa-nombre">Nombre de la Casa *</Label>
                  <Input
                    id="edit-casa-nombre"
                    value={editCasaName}
                    onChange={(e) => setEditCasaName(e.target.value)}
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
                    setShowEditCasaDialog(false);
                    setEditingCasaId(null);
                    setEditCasaName("");
                  }}
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
                      Guardar Cambios
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
                onClick={confirmDelete}
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