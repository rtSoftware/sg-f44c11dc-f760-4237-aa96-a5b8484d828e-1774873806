import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, LogOut, Loader2, User, Settings } from "lucide-react";
import Link from "next/link";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push("/auth");
      return;
    }

    setUser(session.user);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-amber-600 animate-spin mx-auto mb-4" />
          <p className="text-stone-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="Dashboard - Experiencia Miguel"
        description="Panel principal de la comunidad Experiencia Miguel"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100">
        {/* Header */}
        <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-stone-900">
                    Experiencia Miguel
                  </h1>
                  <p className="text-xs text-stone-600">Comunidad de Oratoria</p>
                </div>
              </div>

              {/* User Menu */}
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-lg">
                  <User className="w-4 h-4 text-stone-600" />
                  <span className="text-sm text-stone-700">
                    {user?.user_metadata?.full_name || user?.email}
                  </span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-stone-300 hover:bg-stone-100"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-4xl font-bold text-stone-900 mb-4">
              ¡Bienvenido a la Comunidad! 👋
            </h2>
            <p className="text-xl text-stone-600">
              Estás dentro de <span className="text-amber-600 font-semibold">Experiencia Miguel</span>
            </p>
          </div>

          {/* Coming Soon Card */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-amber-600" />
              </div>
              
              <h3 className="text-2xl font-bold text-stone-900 mb-4">
                Bienvenido a tu Panel de Control
              </h3>
              
              <p className="text-stone-600 mb-8 leading-relaxed">
                Accede a todo el contenido de Experiencia Miguel
              </p>

              {/* Main Action: Biblioteca */}
              <Link href="/biblioteca">
                <Button 
                  size="lg"
                  className="mb-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-lg px-8 py-6 h-auto"
                >
                  <BookOpen className="w-6 h-6 mr-3" />
                  Ir a la Biblioteca
                </Button>
              </Link>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <h4 className="font-semibold text-stone-900 mb-2">📚 Biblioteca Digital</h4>
                  <p className="text-sm text-stone-600">Acceso completo al libro</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 opacity-50">
                  <h4 className="font-semibold text-stone-900 mb-2">👥 Comunidad</h4>
                  <p className="text-sm text-stone-600">Próximamente</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 opacity-50">
                  <h4 className="font-semibold text-stone-900 mb-2">🎯 Ejercicios</h4>
                  <p className="text-sm text-stone-600">Próximamente</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 opacity-50">
                  <h4 className="font-semibold text-stone-900 mb-2">🎓 Mentorías</h4>
                  <p className="text-sm text-stone-600">Próximamente</p>
                </div>
              </div>

              <div className="pt-6 border-t border-stone-200">
                <p className="text-sm text-stone-500">
                  ¿Necesitas configurar el contenido? Ve a Configuración usando el botón en la esquina inferior derecha.
                </p>
              </div>
            </div>
          </div>

          {/* User Info Card */}
          <div className="max-w-2xl mx-auto mt-8">
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <h4 className="font-semibold text-stone-900 mb-4">Información de tu cuenta</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-stone-100">
                  <span className="text-sm text-stone-600">Nombre:</span>
                  <span className="text-sm font-medium text-stone-900">
                    {user?.user_metadata?.full_name || "No especificado"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-stone-100">
                  <span className="text-sm text-stone-600">Email:</span>
                  <span className="text-sm font-medium text-stone-900">{user?.email}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-stone-600">Miembro desde:</span>
                  <span className="text-sm font-medium text-stone-900">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString("es-MX") : "Hoy"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Floating Settings Button */}
        <Link href="/settings">
          <Button
            size="icon"
            className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            title="Configuración"
          >
            <Settings className="w-5 h-5 text-white" />
          </Button>
        </Link>
      </div>
    </>
  );
}