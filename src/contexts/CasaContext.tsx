import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface CasaContextType {
  casaId: string | null;
  userId: string | null;
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  refreshCasaId: () => Promise<void>;
}

const CasaContext = createContext<CasaContextType | undefined>(undefined);

export function CasaProvider({ children }: { children: React.ReactNode }) {
  const [casaId, setCasaIdState] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function refreshCasaId() {
    setIsLoading(true);
    setError(null);

    try {
      // Obtener usuario autenticado
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        console.log("No authenticated user found");
        setCasaIdState(null);
        setUserId(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      console.log("User authenticated:", currentUser.id);
      setUser(currentUser);
      setUserId(currentUser.id);

      // Obtener casa_id desde el perfil del usuario
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("casa_id")
        .eq("id", currentUser.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setError(profileError as Error);
        setIsLoading(false);
        return;
      }

      if (!profile || !profile.casa_id) {
        console.error("Profile has no casa_id assigned");
        setError(new Error("No casa assigned to user"));
        setIsLoading(false);
        return;
      }

      console.log("Casa ID loaded from profile:", profile.casa_id);
      setCasaIdState(profile.casa_id);
      
      // Guardar en localStorage como backup
      if (typeof window !== "undefined") {
        localStorage.setItem("casa_id", profile.casa_id);
      }
      
    } catch (err) {
      console.error("Error in refreshCasaId:", err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refreshCasaId();

    // Escuchar cambios en la sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event);
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        refreshCasaId();
      } else if (event === "SIGNED_OUT") {
        setCasaIdState(null);
        setUserId(null);
        setUser(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("casa_id");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <CasaContext.Provider value={{ casaId, userId, user, isLoading, error, refreshCasaId }}>
      {children}
    </CasaContext.Provider>
  );
}

export function useCasa() {
  const context = useContext(CasaContext);
  if (context === undefined) {
    throw new Error("useCasa must be used within a CasaProvider");
  }
  return context;
}