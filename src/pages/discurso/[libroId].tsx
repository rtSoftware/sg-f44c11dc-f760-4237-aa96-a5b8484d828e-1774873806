import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, Eye, Edit, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { getDiscursoByLibroId, saveDiscurso } from "@/services/discursoService";

export default function DiscursoEditor() {
  const router = useRouter();
  const { libroId } = router.query;
  const { toast } = useToast();
  const [markdown, setMarkdown] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Cargar discurso existente desde Supabase
    if (libroId && typeof libroId === "string") {
      loadDiscurso();
    }
  }, [libroId]);

  const loadDiscurso = async () => {
    try {
      setIsLoading(true);
      const discurso = await getDiscursoByLibroId(libroId as string);
      if (discurso) {
        setMarkdown(discurso.contenido);
      }
    } catch (error) {
      console.error("Error al cargar discurso:", error);
      toast({
        title: "Error al cargar",
        description: "No se pudo cargar el discurso",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!libroId || typeof libroId !== "string") return;
    
    setIsSaving(true);
    try {
      await saveDiscurso(libroId, markdown);
      toast({
        title: "Discurso guardado",
        description: "Los cambios se han guardado correctamente en la base de datos"
      });
    } catch (error) {
      console.error("Error al guardar:", error);
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar el discurso",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Cargando discurso...</p>
        </div>
      </div>
    );
  }

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
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Guardar
              </>
            )}
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
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw as any]}
                      >
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
          <CardContent>
            <div className="text-xs text-stone-600 space-y-1">
              <div><code># Título 1</code> - Encabezado principal</div>
              <div><code>## Título 2</code> - Encabezado secundario</div>
              <div><code>**negrita**</code> - Texto en negrita</div>
              <div><code>*cursiva*</code> - Texto en cursiva</div>
              <div><code>[texto](url)</code> - Enlace</div>
              <div><code>- item</code> - Lista con viñetas</div>
              <div><code>1. item</code> - Lista numerada</div>
              <div><code>&gt; cita</code> - Bloque de cita</div>
              
              <div className="pt-3 mt-3 border-t border-stone-300">
                <p className="font-semibold mb-2 text-stone-700">HTML con estilos inline:</p>
                <div className="space-y-1">
                  <div><code>&lt;span style="color: #2563eb; font-size: 20px; font-family: Georgia, serif; font-weight: bold"&gt;azul, grande, serif y negrita&lt;/span&gt;</code></div>
                  <div><code>&lt;p style="color: hsl(150, 60%, 35%); font-size: 18px; font-family: 'Lora', serif"&gt;Este párrafo completo va en verde, fuente Lora y 18px.&lt;/p&gt;</code></div>
                  <div><code>&lt;span style="font-size: 24px"&gt;más grande&lt;/span&gt;</code></div>
                  <div><code>&lt;span style="color: orange"&gt;texto naranja&lt;/span&gt;</code></div>
                  <div><code>&lt;mark style="background: yellow; color: black"&gt;texto resaltado&lt;/mark&gt;</code></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}