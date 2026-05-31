import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { BookOpen, Settings, LogOut, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEO } from "@/components/SEO";
import { getAllLibros } from "@/services/libroService";
import type { Libro } from "@/services/libroService";

export default function Biblioteca() {
  const router = useRouter();
  const [libros, setLibros] = useState<Libro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLibros() {
      try {
        const { data, error } = await getAllLibros();
        if (error) {
          console.error("Error fetching libros:", error);
        } else {
          setLibros(data);
        }
      } catch (error) {
        console.error("Error fetching libros:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLibros();
  }, []);

  return (
    <>
      <SEO 
        title="Biblioteca - Experiencia Miguel"
        description="Explora tu biblioteca personal de libros"
      />
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-stone-900">Mi Biblioteca</h1>
            <div className="flex gap-4">
              <button
                onClick={() => router.push("/mensajes")}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <MessageSquare className="h-5 w-5" />
                Mensajes
              </button>
              <button
                onClick={() => router.push("/settings")}
                className="px-4 py-2 bg-stone-600 hover:bg-stone-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Settings className="h-5 w-5" />
                Settings
              </button>
              <button
                onClick={() => router.push("/auth")}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <LogOut className="h-5 w-5" />
                Salir
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900" />
            </div>
          ) : libros.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="h-16 w-16 text-stone-400 mx-auto mb-4" />
              <p className="text-xl text-stone-600">No hay libros disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {libros.map((libro) => (
                <Card
                  key={libro.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/lectura/${libro.casa_id}`)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                      {libro.titulo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {libro.descripcion && (
                      <p className="text-stone-600 line-clamp-3 mb-4">
                        {libro.descripcion}
                      </p>
                    )}
                    <div className="text-sm text-stone-500">
                      Orden: {libro.orden}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}