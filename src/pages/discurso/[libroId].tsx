import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, Eye, Edit, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function DiscursoEditor() {
  const router = useRouter();
  const { libroId } = router.query;
  const { toast } = useToast();
  const [markdown, setMarkdown] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Cargar discurso existente si hay uno guardado
    if (libroId) {
      const saved = localStorage.getItem(`discurso_${libroId}`);
      if (saved) {
        setMarkdown(saved);
      }
    }
  }, [libroId]);

  const handleSave = () => {
    setIsSaving(true);
    try {
      if (libroId) {
        localStorage.setItem(`discurso_${libroId}`, markdown);
        toast({
          title: "Discurso guardado",
          description: "Los cambios se han guardado correctamente"
        });
      }
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar el discurso",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
        </div>

        {/* Editor con Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Editor de Discurso - Libro {libroId}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="edit" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Editar
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Vista Previa
                </TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="mt-4">
                <Textarea
                  value={markdown}
                  onChange={(e) => setMarkdown(e.target.value)}
                  placeholder="Escribe tu discurso en formato Markdown aquí...

Ejemplos:
# Título Principal
## Subtítulo
### Sección

**Texto en negrita**
*Texto en cursiva*

- Lista item 1
- Lista item 2

1. Lista numerada
2. Segundo item

> Cita o nota importante

[Enlace](https://ejemplo.com)
"
                  className="min-h-[600px] font-mono"
                />
              </TabsContent>

              <TabsContent value="preview" className="mt-4">
                <Card className="min-h-[600px] p-6 bg-white">
                  <div className="prose prose-purple max-w-none">
                    {markdown ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {markdown}
                      </ReactMarkdown>
                    ) : (
                      <p className="text-gray-400 italic">
                        No hay contenido para previsualizar. Escribe algo en la pestaña "Editar".
                      </p>
                    )}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Guía rápida de Markdown */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Guía Rápida de Markdown</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><code># Título</code> - Título principal</p>
                <p><code>## Subtítulo</code> - Subtítulo</p>
                <p><code>**negrita**</code> - <strong>Texto en negrita</strong></p>
                <p><code>*cursiva*</code> - <em>Texto en cursiva</em></p>
              </div>
              <div>
                <p><code>- item</code> - Lista con viñetas</p>
                <p><code>1. item</code> - Lista numerada</p>
                <p><code>&gt; cita</code> - Cita o nota</p>
                <p><code>[texto](url)</code> - Enlace</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}