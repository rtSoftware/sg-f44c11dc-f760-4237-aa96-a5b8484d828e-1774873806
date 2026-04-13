import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2, Trash2, Plus, Book, Edit, Home, Check, User, Upload, X, Search } from "lucide-react";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { getAllLibros, createLibro, updateLibro, deleteLibroContent, moverLibroACasa, detectarLibrosHuerfanos, reasignarLibroHuerfano } from "@/services/libroService";
import { getAllCasas, createCasa, updateCasaNombre, getUsuariosPorCasa } from "@/services/casaService";
import { uploadPortada, deletePortada } from "@/services/storageService";
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
  const [usuariosPorCasa, setUsuariosPorCasa] = useState<Record<string, Array<{ id: string; email: string | null; full_name: string | null; avatar_url: string | null }>>>({});
  const [selectedLibroId, setSelectedLibroId] = useState<string | null>(null);
  const [showNewCasaDialog, setShowNewCasaDialog] = useState(false);
  const [newCasaName, setNewCasaName] = useState("");
  const [showEditCasaDialog, setShowEditCasaDialog] = useState(false);
  const [editingCasaId, setEditingCasaId] = useState<string | null>(null);
  const [editCasaName, setEditCasaName] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [profileData, setProfileData] = useState({
    full_name: "",
    avatar_url: ""
  });
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Estados para migración de libros
  const [showMoverLibroDialog, setShowMoverLibroDialog] = useState(false);
  const [libroAMover, setLibroAMover] = useState<Libro | null>(null);
  const [casaDestinoId, setCasaDestinoId] = useState<string>("");
  const [moviendoLibro, setMoviendoLibro] = useState(false);
  const [showHuerfanosDialog, setShowHuerfanosDialog] = useState(false);
  const [librosHuerfanos, setLibrosHuerfanos] = useState<Array<Libro & { user_casa_id: string | null }>>([]);
  const [loadingHuerfanos, setLoadingHuerfanos] = useState(false);
  const [reasignandoHuerfano, setReasignandoHuerfano] = useState(false);

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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);

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

  useEffect(() => {
    if (section === "casas" && casas.length > 0) {
      loadUsuariosParaCasas();
    }
  }, [section, casas]);

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

  async function loadUsuariosParaCasas() {
    const usuariosMap: Record<string, Array<{ id: string; email: string | null; full_name: string | null; avatar_url: string | null }>> = {};
    
    for (const casa of casas) {
      const { data, error } = await getUsuariosPorCasa(casa.id);
      if (!error && data) {
        usuariosMap[casa.id] = data;
      } else {
        usuariosMap[casa.id] = [];
      }
    }
    
    setUsuariosPorCasa(usuariosMap);
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
    setSelectedFile(null);
    setPreviewUrl("");
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
    setSelectedFile(null);
    setPreviewUrl(libro.portada_url || "");
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
    setSelectedFile(null);
    setPreviewUrl("");
    setMessage(null);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setMessage({ type: "error", text: "Tipo de archivo no permitido. Usa JPG, PNG o WebP." });
      return;
    }

    // NO validar tamaño aquí - la compresión se encargará de reducirlo
    setSelectedFile(file);
    
    // Crear preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveImage() {
    setSelectedFile(null);
    setPreviewUrl("");
    setFormData(prev => ({ ...prev, portada_url: "" }));
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

  async function handleMoverLibro(libro: Libro) {
    setLibroAMover(libro);
    setCasaDestinoId("");
    setShowMoverLibroDialog(true);
    setMessage(null);
  }

  async function confirmarMoverLibro(e: React.FormEvent) {
    e.preventDefault();
    if (!libroAMover || !casaDestinoId) return;

    setMoviendoLibro(true);
    setMessage(null);

    const { success, error } = await moverLibroACasa(libroAMover.id, casaDestinoId);

    if (error) {
      setMessage({ type: "error", text: `Error al mover el libro: ${error.message}` });
      console.error("Error moviendo libro:", error);
    } else {
      setMessage({ type: "success", text: "Libro movido exitosamente a la nueva casa" });
      await loadLibros();
      setShowMoverLibroDialog(false);
      setLibroAMover(null);
      setCasaDestinoId("");
    }

    setMoviendoLibro(false);
  }

  async function handleDetectarHuerfanos() {
    setLoadingHuerfanos(true);
    setShowHuerfanosDialog(true);
    setMessage(null);

    const { data, error } = await detectarLibrosHuerfanos();

    if (error) {
      setMessage({ type: "error", text: "Error al detectar libros huérfanos" });
      console.error("Error detectando huérfanos:", error);
      setLibrosHuerfanos([]);
    } else {
      setLibrosHuerfanos(data || []);
    }

    setLoadingHuerfanos(false);
  }

  async function handleReasignarHuerfano(libro: Libro & { user_casa_id: string | null }) {
    setReasignandoHuerfano(true);
    setMessage(null);

    const { success, error } = await reasignarLibroHuerfano(libro.id, libro.casa_id);

    if (error) {
      setMessage({ type: "error", text: `Error al reasignar libro: ${error.message}` });
      console.error("Error reasignando huérfano:", error);
    } else {
      setMessage({ type: "success", text: "Libro reasignado exitosamente" });
      // Recargar lista de huérfanos
      handleDetectarHuerfanos();
      await loadLibros();
    }

    setReasignandoHuerfano(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage(null);

    try {
      let portadaUrl = formData.portada_url;

      // Si hay un archivo seleccionado, subirlo primero
      if (selectedFile) {
        setUploadingImage(true);
        const { url, error: uploadError } = await uploadPortada(selectedFile, user.id);
        setUploadingImage(false);

        if (uploadError) {
          console.error("Upload error details:", uploadError);
          setMessage({ 
            type: "error", 
            text: `Error al subir la imagen: ${uploadError.message || "Error desconocido"}` 
          });
          setSaving(false);
          return;
        }

        if (url) {
          portadaUrl = url;
        }
      }

      const dataToSave = {
        ...formData,
        portada_url: portadaUrl
      };

      console.log("Saving libro data:", { mode, selectedLibroId, dataToSave });

      if (mode === "create") {
        const { data, error } = await createLibro(dataToSave, user.id);
        
        if (error) {
          console.error("Create error details:", error);
          setMessage({ 
            type: "error", 
            text: `Error al crear el capítulo: ${error.message || "Error desconocido"}` 
          });
        } else {
          console.log("Create successful:", data);
          setMessage({ type: "success", text: "Capítulo creado exitosamente" });
          await loadLibros();
          handleCancelForm();
        }
      } else if (mode === "edit" && selectedLibroId) {
        const { data, error } = await updateLibro(selectedLibroId, dataToSave);
        
        if (error) {
          console.error("Update error details:", error);
          setMessage({ 
            type: "error", 
            text: `Error al actualizar el capítulo: ${error.message || "Error desconocido"}` 
          });
        } else {
          console.log("Update successful:", data);
          setMessage({ type: "success", text: "Capítulo actualizado exitosamente" });
          await loadLibros();
          handleCancelForm();
        }
      }
    } catch (error) {
      console.error("Submit error details:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      setMessage({ type: "error", text: `Error inesperado: ${errorMessage}` });
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

  // Filtrar libros por título
  const filteredLibros = libros.filter(libro => 
    libro.titulo.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

              {section === "libros" && mode === "list" && libros.length > 0 && (
                <Button
                  onClick={handleDetectarHuerfanos}
                  variant="outline"
                  className="border-orange-300 text-orange-700 hover:bg-orange-50 ml-2"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Detectar Huérfanos
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

              {/* Barra de búsqueda */}
              {libros.length > 0 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-400" />
                  <Input
                    type="text"
                    placeholder="Buscar por título..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-amber-300 focus:border-amber-500 focus:ring-amber-500 bg-white"
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 text-amber-600 hover:text-amber-800 hover:bg-amber-100"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}

              {/* Contador de resultados */}
              {searchTerm && (
                <div className="text-sm text-amber-700">
                  {filteredLibros.length === 0 ? (
                    <span>No se encontraron resultados para "{searchTerm}"</span>
                  ) : (
                    <span>
                      {filteredLibros.length} {filteredLibros.length === 1 ? "resultado" : "resultados"} encontrado{filteredLibros.length === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
              )}

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
              ) : filteredLibros.length === 0 ? (
                <Card className="border-amber-200 shadow-lg">
                  <CardContent className="pt-6 text-center py-12">
                    <Search className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-amber-900 mb-2">
                      No se encontraron resultados
                    </h3>
                    <p className="text-amber-700 mb-6">
                      Intenta con otro término de búsqueda
                    </p>
                    <Button
                      onClick={() => setSearchTerm("")}
                      variant="outline"
                      className="border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      Limpiar búsqueda
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredLibros.map((libro) => (
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
                          {casas.length > 1 && (
                            <Button
                              onClick={() => handleMoverLibro(libro)}
                              variant="outline"
                              className="border-blue-300 text-blue-700 hover:bg-blue-50"
                            >
                              <Home className="h-4 w-4" />
                            </Button>
                          )}
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

                  {/* Sección de subida de imagen */}
                  <div className="space-y-4 p-6 bg-amber-50 rounded-lg border-2 border-dashed border-amber-300">
                    <Label className="text-amber-900 font-semibold flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Subir Imagen de Portada
                    </Label>
                    
                    {previewUrl ? (
                      <div className="space-y-4">
                        <div className="relative w-full max-w-md mx-auto">
                          <img 
                            src={previewUrl} 
                            alt="Vista previa" 
                            className="w-full h-64 object-cover rounded-lg shadow-md"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 shadow-lg"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-amber-700 text-center">
                          {selectedFile ? "Nueva imagen seleccionada" : "Imagen actual"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          onChange={handleFileSelect}
                          className="border-amber-300 cursor-pointer"
                        />
                        <p className="text-sm text-amber-600">
                          Formatos permitidos: JPG, PNG, WebP. Tamaño máximo: 5MB
                        </p>
                      </div>
                    )}

                    {uploadingImage && (
                      <div className="flex items-center gap-2 text-amber-700">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Subiendo imagen...</span>
                      </div>
                    )}
                  </div>

                  {/* Audio Principal Field */}
                  <div className="space-y-2">
                    <Label htmlFor="audio_https" className="text-amber-900 font-semibold">
                      URL PDF
                    </Label>
                    <Input
                      id="audio_https"
                      value={formData.audio_https}
                      onChange={(e) => setFormData({ ...formData, audio_https: e.target.value })}
                      placeholder="https://ejemplo.com/audio-capitulo.mp3"
                      type="url"
                      className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                    />
                    <p className="text-sm text-amber-600">
                      URL del archivo de audio principal del capítulo
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
                        {/* Sección de usuarios */}
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Usuarios ({usuariosPorCasa[casa.id]?.length || 0})
                          </h4>
                          {usuariosPorCasa[casa.id] && usuariosPorCasa[casa.id].length > 0 ? (
                            <div className="space-y-2 max-h-40 overflow-y-auto">
                              {usuariosPorCasa[casa.id].map((usuario) => (
                                <div 
                                  key={usuario.id} 
                                  className="flex items-center gap-2 p-2 bg-amber-50 rounded-md border border-amber-100"
                                >
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                                    {usuario.avatar_url ? (
                                      <img 
                                        src={usuario.avatar_url} 
                                        alt={usuario.full_name || usuario.email || "User"} 
                                        className="w-full h-full rounded-full object-cover"
                                        onError={(e) => {
                                          e.currentTarget.style.display = "none";
                                        }}
                                      />
                                    ) : (
                                      (usuario.full_name || usuario.email || "?").charAt(0).toUpperCase()
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-amber-900 truncate">
                                      {usuario.full_name || "Sin nombre"}
                                    </p>
                                    <p className="text-xs text-amber-600 truncate">
                                      {usuario.email || "Sin email"}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-amber-600 italic">
                              No hay usuarios en esta casa
                            </p>
                          )}
                        </div>
                        
                        <div className="text-center py-2 text-stone-600 text-sm border-t border-amber-100">
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

        {/* Dialog para mover libro a otra casa */}
        <Dialog open={showMoverLibroDialog} onOpenChange={setShowMoverLibroDialog}>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-amber-900">Mover Libro a Otra Casa</DialogTitle>
              <DialogDescription className="text-amber-700">
                Selecciona la casa de destino. El libro será reasignado automáticamente a un usuario válido de esa casa.
              </DialogDescription>
            </DialogHeader>
            {libroAMover && (
              <form onSubmit={confirmarMoverLibro}>
                <div className="space-y-4 py-4">
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm font-semibold text-amber-900">Libro seleccionado:</p>
                    <p className="text-sm text-amber-700">{libroAMover.titulo}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="casa-destino">Casa de Destino *</Label>
                    <select
                      id="casa-destino"
                      value={casaDestinoId}
                      onChange={(e) => setCasaDestinoId(e.target.value)}
                      className="w-full px-3 py-2 border border-amber-200 rounded-md focus:border-amber-400 focus:ring-amber-400"
                      required
                    >
                      <option value="">Selecciona una casa...</option>
                      {casas
                        .filter(casa => casa.id !== libroAMover.casa_id)
                        .map(casa => (
                          <option key={casa.id} value={casa.id}>
                            {casa.casa_nombre}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs text-blue-800">
                      ℹ️ El libro será transferido completamente a la nueva casa, incluyendo todas sus notas asociadas.
                    </p>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowMoverLibroDialog(false);
                      setLibroAMover(null);
                      setCasaDestinoId("");
                    }}
                    className="border-amber-300 text-amber-700 hover:bg-amber-50"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    disabled={moviendoLibro || !casaDestinoId}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                  >
                    {moviendoLibro ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Moviendo...
                      </>
                    ) : (
                      <>
                        <Home className="mr-2 h-4 w-4" />
                        Mover Libro
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog para detectar y reasignar libros huérfanos */}
        <Dialog open={showHuerfanosDialog} onOpenChange={setShowHuerfanosDialog}>
          <DialogContent className="bg-white max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-amber-900">Libros Huérfanos Detectados</DialogTitle>
              <DialogDescription className="text-amber-700">
                Libros cuyo creador ya no pertenece a la casa actual del libro
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {loadingHuerfanos ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                </div>
              ) : librosHuerfanos.length === 0 ? (
                <div className="text-center py-8">
                  <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-amber-900 mb-2">
                    ¡Ningún libro huérfano!
                  </h3>
                  <p className="text-amber-700">
                    Todos los libros están correctamente asignados a usuarios de sus casas.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {librosHuerfanos.map((libro) => {
                    const casaDelLibro = casas.find(c => c.id === libro.casa_id);
                    const casaDelUser = casas.find(c => c.id === libro.user_casa_id);
                    return (
                      <Card key={libro.id} className="border-orange-200">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="font-semibold text-amber-900">{libro.titulo}</h4>
                              <div className="mt-2 space-y-1 text-sm">
                                <p className="text-amber-700">
                                  📚 Casa del libro: <span className="font-medium">{casaDelLibro?.casa_nombre || "Desconocida"}</span>
                                </p>
                                <p className="text-orange-700">
                                  👤 Casa del creador: <span className="font-medium">{casaDelUser?.casa_nombre || "Sin casa"}</span>
                                </p>
                              </div>
                            </div>
                            <Button
                              onClick={() => handleReasignarHuerfano(libro)}
                              disabled={reasignandoHuerfano}
                              size="sm"
                              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                            >
                              {reasignandoHuerfano ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Check className="mr-2 h-4 w-4" />
                                  Reasignar
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowHuerfanosDialog(false)}
                className="border-amber-300 text-amber-700 hover:bg-amber-50"
              >
                Cerrar
              </Button>
            </DialogFooter>
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