import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { BookOpen, Settings, LogOut, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { logout } from "@/services/authService";
import { getAllLibros } from "@/services/libroService";
import type { Libro } from "@/services/libroService";

export default function Biblioteca() {
  const router = useRouter();
  const [libros, setLibros] = useState<Libro[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLibros() {
      try {
        const data = await getAllLibros();
        setLibros(data);
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
      await logout();
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
      
      <div 
        className="min-h-screen relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/biblioteca-bg.jpg')",
        }}
      >
        {/* Overlay oscuro para mejorar legibilidad */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Contenido principal */}
        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header con título */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white drop-shadow-lg mb-2">
              Mi Biblioteca
            </h1>
            <p className="text-xl text-white/90 drop-shadow-md">
              Tus libros disponibles
            </p>
          </div>

          {/* Grid de libros */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white" />
            </div>
          ) : libros.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="mx-auto h-16 w-16 text-white/70 mb-4" />
              <p className="text-xl text-white/80">No hay libros disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-32">
              {libros.map((libro) => (
                <Card
                  key={libro.id}
                  className="cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white/95 backdrop-blur-sm border-2 border-stone-200"
                  onClick={() => router.push(`/lectura/${libro.casa_nombre}`)}
                >
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-stone-900 line-clamp-2">
                      {libro.titulo}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {libro.descripcion && (
                      <p className="text-stone-600 line-clamp-3 mb-4">
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

        {/* Tarjetas de navegación al pie - Solo iconos cuadrados */}
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent py-6">
          <div className="container mx-auto px-4">
            <div className="flex justify-center gap-4">
              {/* Mensajes */}
              <button
                onClick={() => router.push("/mensajes")}
                className="w-16 h-16 bg-white/95 hover:bg-white rounded-lg shadow-lg flex items-center justify-center transition-all hover:scale-110 group"
                title="Mensajes"
              >
                <MessageSquare className="h-7 w-7 text-purple-600 group-hover:text-purple-700" />
              </button>

              {/* Biblioteca (activo) */}
              <button
                className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg flex items-center justify-center scale-110"
                title="Biblioteca (página actual)"
              >
                <BookOpen className="h-7 w-7 text-white" />
              </button>

              {/* Settings */}
              <button
                onClick={() => router.push("/settings")}
                className="w-16 h-16 bg-white/95 hover:bg-white rounded-lg shadow-lg flex items-center justify-center transition-all hover:scale-110 group"
                title="Configuración"
              >
                <Settings className="h-7 w-7 text-stone-600 group-hover:text-stone-900" />
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-16 h-16 bg-white/95 hover:bg-red-50 rounded-lg shadow-lg flex items-center justify-center transition-all hover:scale-110 group"
                title="Cerrar sesión"
              >
                <LogOut className="h-7 w-7 text-red-600 group-hover:text-red-700" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}