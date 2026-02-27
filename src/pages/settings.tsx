import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { getLibroContent, upsertLibroContent } from "@/services/libroService";
import type { User } from "@supabase/supabase-js";

export default function Settings() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    loadLibroContent();
  }, []);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push("/auth");
      return;
    }

    setUser(session.user);
    setLoading(false);
  }

  async function loadLibroContent() {
    const { data, error } = await getLibroContent();
    
    if (error) {
      console.error("Error loading content:", error);
      return;
    }

    if (data) {
      setFormData({
        titulo: data.titulo || "",
        descripcion: data.descripcion || "",
        contenido: data.contenido || "",
        autor: data.autor || "",
        portada_url: data.portada_url || "",
        audio_https: data.audio_https || "",
        audioanalisis_https: data.audioanalisis_https || ""
      });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage(null);

    const { data, error } = await upsertLibroContent(formData, user.id);

    if (error) {
      setMessage({ type: "error", text: "Error al guardar el contenido" });
      console.error("Save error:", error);
    } else {
      setMessage({ type: "success", text: "Contenido guardado exitosamente" });
    }

    setSaving(false);
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
        description="Configuración del contenido de la biblioteca"
      />
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
        <header className="bg-white border-b border-amber-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <Link href="/dashboard" className="flex items-center gap-2 text-amber-900 hover:text-amber-700 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-semibold">Volver al Dashboard</span>
            </Link>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="border-amber-200 shadow-lg">
            <CardHeader className="border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50">
              <CardTitle className="text-2xl text-amber-900">Configuración del Libro</CardTitle>
              <CardDescription className="text-amber-700">
                Administra el contenido que se mostrará en la biblioteca
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="titulo" className="text-amber-900 font-semibold">
                    Título del Libro
                  </Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => handleChange("titulo", e.target.value)}
                    placeholder="Experiencia Miguel"
                    className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
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
                    placeholder="Una breve descripción del libro..."
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
                    placeholder="El contenido completo del libro en formato texto o Markdown..."
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
                    placeholder="https://streaming.ejemplo.com/audio-libro.mp3"
                    type="url"
                    className="border-amber-200 focus:border-amber-400 focus:ring-amber-400"
                  />
                  <p className="text-sm text-amber-600">
                    URL HTTPS al servidor de streaming para el audio del libro
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
                  <Link href="/dashboard">
                    <Button type="button" variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50">
                      Cancelar
                    </Button>
                  </Link>
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
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
}