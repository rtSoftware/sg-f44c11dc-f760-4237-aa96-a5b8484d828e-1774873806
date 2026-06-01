import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { BookOpen, Settings, LogOut, FileText, Brain, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { useCasa } from "@/contexts/CasaContext";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown, Home, Loader2, User } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { casaNombre, casaId, fullName } = useCasa();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardBg, setDashboardBg] = useState<string>("");

  useEffect(() => {
    checkUser();
    loadDashboardBg();
  }, [casaId]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      router.push("/auth");
      return;
    }

    setUser(session.user);
    setLoading(false);
  };

  const loadDashboardBg = async () => {
    if (!casaId) return;
    
    try {
      const { data, error } = await supabase
        .from("casas")
        .select("casa_memo")
        .eq("id", casaId)
        .single();
      
      if (!error && data && data.casa_memo) {
        const memo = data.casa_memo as any;
        if (memo.dashboard_bg) {
          setDashboardBg(memo.dashboard_bg);
        }
      }
    } catch (error) {
      console.error("Error loading dashboard bg:", error);
    }
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
      
      <div className="min-h-screen">
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
              <div className="flex items-center gap-3">
                {/* User Account Popover */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex items-center gap-2 text-stone-700 hover:text-amber-700 hover:bg-amber-50"
                    >
                      <User className="w-5 h-5" />
                      <span className="font-medium">{fullName || "Usuario"}</span>
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-6" align="end">
                    <div>
                      <h4 className="font-semibold text-stone-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-amber-600" />
                        Información de tu cuenta
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-stone-100">
                          <span className="text-sm text-stone-600">Nombre:</span>
                          <span className="text-sm font-medium text-stone-900">
                            {user?.user_metadata?.full_name || "No especificado"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-stone-100">
                          <span className="text-sm text-stone-600">Email:</span>
                          <span className="text-sm font-medium text-stone-900 truncate max-w-[180px]" title={user?.email}>
                            {user?.email}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-stone-100">
                          <span className="text-sm text-stone-600 flex items-center gap-1">
                            <Home className="w-4 h-4" />
                            Casa:
                          </span>
                          <span className="text-sm font-medium text-blue-600">
                            {casaNombre || "No asignada"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-stone-100">
                          <span className="text-sm text-stone-600">Alias:</span>
                          <span className="text-sm font-medium text-stone-900">
                            {fullName || "No especificado"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-stone-600">Miembro desde:</span>
                          <span className="text-sm font-medium text-stone-900">
                            {user?.created_at ? new Date(user.created_at).toLocaleDateString("es-MX") : "Hoy"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-stone-300 hover:bg-stone-100"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                  <span className="sm:hidden">Salir</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main 
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 min-h-[calc(100vh-64px)] relative"
          style={dashboardBg ? {
            backgroundImage: `url(${dashboardBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          } : undefined}
        >
          {/* Overlay si hay imagen de fondo */}
          {dashboardBg && (
            <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />
          )}

          {/* Feature Cards Grid - extremadamente discretos y minimalistas */}
          <div className="relative z-10 grid gap-8 grid-cols-2 max-w-xs mx-auto pt-20">
            {/* Biblioteca Digital */}
            <Link href="/biblioteca">
              <div className="aspect-square flex items-center justify-center cursor-pointer group">
                <BookOpen className="h-16 w-16 text-stone-400/60 group-hover:text-stone-600 transition-colors duration-300" strokeWidth={1} />
              </div>
            </Link>

            {/* Notas */}
            <Link href="/notas">
              <div className="aspect-square flex items-center justify-center cursor-pointer group">
                <FileText className="h-16 w-16 text-stone-400/60 group-hover:text-stone-600 transition-colors duration-300" strokeWidth={1} />
              </div>
            </Link>

            {/* Ejercicios - Coming Soon */}
            <div className="aspect-square flex items-center justify-center cursor-not-allowed">
                <Brain className="h-16 w-16 text-stone-300/40" strokeWidth={1} />
            </div>

            {/* Mentorías - Coming Soon */}
            <div className="aspect-square flex items-center justify-center cursor-not-allowed">
                <MessageSquare className="h-16 w-16 text-stone-300/40" strokeWidth={1} />
            </div>
          </div>
        </main>

        {/* Icono Settings super discreto - esquina superior derecha */}
        <Link href="/settings">
          <button
            className="fixed top-4 right-4 w-6 h-6 flex items-center justify-center text-stone-300/40 hover:text-stone-400/60 transition-colors duration-300"
            title="Configuración"
          >
            <Settings className="w-4 h-4" strokeWidth={1} />
          </button>
        </Link>
      </div>
    </>
  );
}