import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Mail, Lock, User, AlertCircle, Loader2, Home } from "lucide-react";
import { getAllCasas } from "@/services/casaService";
import type { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { AnimatedBackground } from "@/components/AnimatedBackground";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Estados para selección de casa después del registro
  const [showCasaSelector, setShowCasaSelector] = useState(false);
  const [casas, setCasas] = useState<Tables<"casas">[]>([]);
  const [selectedCasaId, setSelectedCasaId] = useState<string>("");
  const [newUserId, setNewUserId] = useState<string | null>(null);
  const [assigningCasa, setAssigningCasa] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: ""
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      router.push("/dashboard");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
    setSuccess("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.fullName.trim()) {
      setError("Por favor ingresa tu nombre completo");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      setNewUserId(data.user.id);
      
      const { data: casasData, error: casasError } = await getAllCasas();
      
      if (casasError || !casasData || casasData.length === 0) {
        setError("Error al cargar las casas disponibles");
        setLoading(false);
        return;
      }
      
      setCasas(casasData);
      setLoading(false);
      setShowCasaSelector(true);
    }
  };

  const handleAssignCasa = async () => {
    if (!newUserId || !selectedCasaId) {
      setError("Por favor selecciona una casa");
      return;
    }

    setAssigningCasa(true);
    setError("");

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ casa_id: selectedCasaId })
      .eq("id", newUserId);

    if (updateError) {
      setError("Error al asignar la casa. Por favor intenta de nuevo.");
      console.error("Error assigning casa:", updateError);
      setAssigningCasa(false);
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("casa_id", selectedCasaId);
    }

    setSuccess("¡Registro completado exitosamente! Redirigiendo...");
    
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <>
      <SEO
        title="Autenticación - Experiencia Miguel"
        description="Accede a la comunidad de Experiencia Miguel"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center p-4">
        <AnimatedBackground />
        
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm border-stone-200 shadow-xl relative z-10">
          <CardHeader className="space-y-1 text-center border-b border-stone-100 pb-6">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-stone-100 rounded-full">
                <BookOpen className="w-8 h-8 text-stone-900" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-stone-900">
              {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
            </CardTitle>
            <CardDescription className="text-stone-600">
              {isLogin
                ? "Accede a tu biblioteca personal"
                : "Únete a Experiencia Miguel"}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-stone-900">Nombre Completo</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Tu nombre"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required={!isLogin}
                    disabled={loading}
                    className="border-stone-300 focus:border-stone-500"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-stone-900">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="border-stone-300 focus:border-stone-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-stone-900">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={loading}
                  className="border-stone-300 focus:border-stone-500"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-stone-900 hover:bg-stone-800 text-white mt-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isLogin ? "Iniciando sesión..." : "Creando cuenta..."}
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    {isLogin ? "Iniciar Sesión" : "Crear Cuenta"}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="text-sm text-stone-600 hover:text-stone-900 hover:underline"
                disabled={loading}
              >
                {isLogin
                  ? "¿No tienes cuenta? Regístrate"
                  : "¿Ya tienes cuenta? Inicia sesión"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showCasaSelector} onOpenChange={setShowCasaSelector}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-stone-900 flex items-center gap-2">
              <Home className="h-6 w-6" />
              Selecciona tu Casa
            </DialogTitle>
            <DialogDescription className="text-stone-600">
              Elige la comunidad a la que deseas pertenecer
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">{success}</p>
              </div>
            )}

            <RadioGroup value={selectedCasaId} onValueChange={setSelectedCasaId}>
              <div className="space-y-3">
                {casas.map((casa) => (
                  <div
                    key={casa.id}
                    className={`flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedCasaId === casa.id
                        ? "border-stone-900 bg-stone-50"
                        : "border-stone-200 hover:border-stone-300 hover:bg-stone-50"
                    }`}
                    onClick={() => setSelectedCasaId(casa.id)}
                  >
                    <RadioGroupItem value={casa.id} id={casa.id} />
                    <Label
                      htmlFor={casa.id}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-semibold text-stone-900">
                        {casa.casa_nombre}
                      </div>
                      <div className="text-sm text-stone-600">
                        Creada: {new Date(casa.created_at).toLocaleDateString()}
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>

            <Button
              onClick={handleAssignCasa}
              disabled={!selectedCasaId || assigningCasa}
              className="w-full h-12 bg-stone-900 hover:bg-stone-800 text-white font-semibold"
            >
              {assigningCasa ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Asignando...
                </>
              ) : (
                <>
                  <Home className="w-5 h-5 mr-2" />
                  Unirme a esta Casa
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}