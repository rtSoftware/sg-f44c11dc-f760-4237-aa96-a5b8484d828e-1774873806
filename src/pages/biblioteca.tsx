import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { BookOpen, Settings, LogOut, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { authService } from "@/services/authService";
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

  const handleLogout = async () => {
    try {
      await authService.signOut();
      router.push("/auth");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <>
      <SEO
        title="Biblioteca - Experiencia Miguel"
        description="Explora la biblioteca de libros disponibles"
      />
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
        {/* Header */}
        <div className="bg-white border-b border-stone-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-stone-900">Biblioteca</h1>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/mensajes")}
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/settings")}
                >
                  <Settings className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900" />
            </div>
          ) : libros.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-stone-400" />
              <h3 className="mt-2 text-sm font-semibold text-stone-900">
                No hay libros disponibles
              </h3>
              <p className="mt-1 text-sm text-stone-500">
                Contacta al administrador para agregar libros
              </p>
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
                    <CardTitle className="flex items-start gap-2">
                      <BookOpen className="h-5 w-5 text-stone-600 flex-shrink-0 mt-1" />
                      <span className="line-clamp-2">{libro.titulo}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {libro.descripcion && (
                      <p className="text-sm text-stone-600 line-clamp-3">
                        {libro.descripcion}
                      </p>
                    )}
                    {libro.orden && (
                      <p className="text-xs text-stone-500 mt-2">
                        Orden: {libro.orden}
                      </p>
                    )}
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