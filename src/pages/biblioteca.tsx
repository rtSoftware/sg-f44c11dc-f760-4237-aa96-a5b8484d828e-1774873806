import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { BookOpen, Settings, LogOut, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { signOut } from "@/services/authService";
import { getAllLibros } from "@/services/libroService";
import type { LibroWithCasa } from "@/services/libroService";

export default function Biblioteca() {
  const router = useRouter();
  const [libros, setLibros] = useState<LibroWithCasa[]>([]);
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
      await signOut();
      router.push("/auth");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <>
      <SEO 
        title="Biblioteca - Experiencia Miguel"
        description="Tu biblioteca personal de libros"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100">
        {/* Header */}
        <div className="bg-white border-b border-stone-200 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-stone-900">Mi Biblioteca</h1>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/mensajes")}
                  title="Mensajes"
                >
                  <MessageSquare className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push("/settings")}
                  title="Configuración"
                >
                  <Settings className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  title="Cerrar sesión"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900" />
            </div>
          ) : libros.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="mx-auto h-16 w-16 text-stone-400 mb-4" />
              <p className="text-xl text-stone-600">No hay libros disponibles</p>
              <p className="text-sm text-stone-500 mt-2">
                Agrega tu primer libro desde Configuración
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {libros.map((libro) => (
                <Card
                  key={libro.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/lectura/${libro.casa_nombre}`)}
                >
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-stone-900">
                      {libro.titulo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {libro.descripcion && (
                      <p className="text-stone-600 mb-4 line-clamp-3">
                        {libro.descripcion}
                      </p>
                    )}
                    <div className="flex items-center text-sm text-stone-500">
                      <BookOpen className="h-4 w-4 mr-2" />
                      <span>{libro.casa_nombre}</span>
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