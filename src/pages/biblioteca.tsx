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
        description="Explora tu biblioteca personal de libros"
      />
      <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-stone-900 flex items-center gap-3">
              <BookOpen className="h-10 w-10 text-purple-600" />
              Mi Biblioteca
            </h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => router.push("/mensajes")}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Mensajes
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push("/settings")}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <LogOut className="h-4 w-4" />
                Salir
              </Button>
            </div>
          </div>

          {/* Libros Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {libros.map((libro) => (
                <Card
                  key={libro.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer border-stone-200"
                  onClick={() => router.push(`/lectura/${libro.casa_nombre}`)}
                >
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                    <CardTitle className="text-xl text-stone-900 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                      {libro.titulo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {libro.descripcion && (
                      <p className="text-stone-600 text-sm mb-3 line-clamp-3">
                        {libro.descripcion}
                      </p>
                    )}
                    <div className="flex justify-between items-center text-xs text-stone-500">
                      <span>Casa: {libro.casa_nombre}</span>
                      {libro.orden && <span>Orden: {libro.orden}</span>}
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