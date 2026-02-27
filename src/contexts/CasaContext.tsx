import { createContext, useContext, useEffect, useState } from "react";
import { getCasaId, initializeCasa, setCasaId } from "@/services/casaService";

interface CasaContextType {
  casaId: string | null;
  isLoading: boolean;
  error: Error | null;
  refreshCasaId: () => Promise<void>;
}

const CasaContext = createContext<CasaContextType | undefined>(undefined);

export function CasaProvider({ children }: { children: React.ReactNode }) {
  const [casaId, setCasaIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  async function refreshCasaId() {
    setIsLoading(true);
    setError(null);

    try {
      // Primero intentar obtener de localStorage
      const storedCasaId = getCasaId();
      if (storedCasaId) {
        setCasaIdState(storedCasaId);
        setIsLoading(false);
        return;
      }

      // Si no existe, inicializar
      const result = await initializeCasa();
      if (result.success && result.casa_id) {
        setCasaId(result.casa_id);
        setCasaIdState(result.casa_id);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refreshCasaId();
  }, []);

  return (
    <CasaContext.Provider value={{ casaId, isLoading, error, refreshCasaId }}>
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