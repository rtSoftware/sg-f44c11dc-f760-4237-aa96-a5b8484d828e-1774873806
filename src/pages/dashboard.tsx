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
        <header className="bg-white border-b border-stone-200 relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif text-stone-900">
                  {casaNombre || "Dashboard"}
                </h1>
                {fullName && (
                  <p className="text-sm text-stone-600 mt-1">
                    Bienvenido, {fullName}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => router.push('/settings')}
                  variant="ghost"
                  size="sm"
                  className="text-stone-600 hover:text-stone-900"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.push("/auth");
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-stone-600 hover:text-stone-900"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Salir</span>
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
      </div>
    </>
  );
}