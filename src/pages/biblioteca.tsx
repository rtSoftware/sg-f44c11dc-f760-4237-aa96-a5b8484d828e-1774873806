import { useState, useEffect } from "react";
import { useRouter } from "next/link";
import { BookOpen, Settings, LogOut, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { authService } from "@/services/authService";
import { getAllLibros } from "@/services/libroService";
import { useCasa } from "@/contexts/CasaContext";
import type { Libro } from "@/services/libroService";
import Link from "next/link";

export default function Biblioteca() {
  const router = useRouter();
  const { casaNombre, casaId } = useCasa();
  const [libros, setLibros] = useState<Libro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLibros() {
      try {
        const { data, error } = await getAllLibros();
        if (error) {
          console.error("Error fetching libros:", error);
        } else {
          console.log("Libros cargados:", data.length);
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
        description="Explora tu biblioteca personal de libros"
      />
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl sm:text-4xl font-serif text-stone-900">
              Biblioteca {casaNombre}
            </h1>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-stone-300 hover:bg-stone-100"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Salir</span>
              </Button>
              <Button
                onClick={() => router.push('/dashboard')}
                variant="outline"
                size="sm"
                className="border-stone-300 hover:bg-stone-100"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Libros Grid */}
          {loading && (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900"></div>
            </div>
          )}

          {!loading && libros.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-stone-400 mb-4" />
              <p className="text-stone-600">No hay libros disponibles en tu casa</p>
            </div>
          )}

          {!loading && libros.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {libros.map((libro) => (
                <Card 
                  key={libro.id} 
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => {
                    if (casaNombre) {
                      // Navegar pasando el ID del libro para mostrar su contenido
                      router.push(`/lectura/${casaNombre}?libro=${libro.id}`);
                    }
                  }}
                >
                  <CardHeader>
                    <CardTitle className="text-xl">{libro.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {libro.portada_url && (
                      <img 
                        src={libro.portada_url} 
                        alt={libro.titulo}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <p className="text-stone-600 line-clamp-3 mb-4">
                      {libro.descripcion || "Sin descripción"}
                    </p>
                    <div className="text-sm text-stone-500">
                      <p>Capítulo {libro.orden + 1}</p>
                      {libro.autor && <p>Por {libro.autor}</p>}
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