import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { BookOpen, Settings, LogOut, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { authService } from "@/services/authService";
import { getAllLibros } from "@/services/libroService";
import { useCasa } from "@/contexts/CasaContext";
import type { Libro } from "@/services/libroService";

export default function Biblioteca() {
  const router = useRouter();
  const { casaNombre } = useCasa();
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
                      router.push(`/lectura/${casaNombre}`);
                    }
                  }}
                >
                  <CardHeader>
                    <CardTitle className="text-xl">{libro.titulo}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-stone-600 line-clamp-3 mb-4">
                      {libro.descripcion || "Sin descripción"}
                    </p>
                    <div className="text-sm text-stone-500">
                      <p>Casa: {casaNombre || "Sin casa"}</p>
                      <p>Orden: {libro.orden}</p>
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