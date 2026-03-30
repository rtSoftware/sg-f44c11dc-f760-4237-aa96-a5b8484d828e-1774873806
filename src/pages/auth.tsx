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
      // Guardar el ID del usuario recién creado
      setNewUserId(data.user.id);
      
      // Cargar casas disponibles
      const { data: casasData, error: casasError } = await getAllCasas();
      
      if (casasError || !casasData || casasData.length === 0) {
        setError("Error al cargar las casas disponibles");
        setLoading(false);
        return;
      }
      
      setCasas(casasData);
      setLoading(false);
      
      // Mostrar selector de casa
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

    // Actualizar el perfil con el casa_id seleccionado
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

    // Guardar casa_id en localStorage
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
      
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-stone-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl mb-4">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-stone-900 mb-2">
              Experiencia Miguel
            </h1>
            <p className="text-stone-600">
              {isLogin ? "Bienvenido de nuevo" : "Únete a la comunidad"}
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-stone-200 p-8">
            {/* Toggle Tabs */}
            <div className="flex gap-2 mb-6 p-1 bg-stone-100 rounded-lg">
              <button
                onClick={() => {
                  setIsLogin(true);
                  setError("");
                  setSuccess("");
                }}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  isLogin
                    ? "bg-white text-amber-600 shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError("");
                  setSuccess("");
                }}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  !isLogin
                    ? "bg-white text-amber-600 shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Registrarse
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">{success}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-stone-700">
                    Nombre Completo
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Tu nombre completo"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="pl-10 h-12 border-stone-300 focus:border-amber-500 focus:ring-amber-500"
                      required={!isLogin}
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-stone-700">
                  Correo Electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 h-12 border-stone-300 focus:border-amber-500 focus:ring-amber-500"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-stone-700">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 h-12 border-stone-300 focus:border-amber-500 focus:ring-amber-500"
                    required
                    disabled={loading}
                    minLength={6}
                  />
                </div>
                {!isLogin && (
                  <p className="text-xs text-stone-500">
                    Mínimo 6 caracteres
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>{isLogin ? "Iniciar Sesión" : "Crear Cuenta"}</>
                )}
              </Button>
            </form>

            {/* Footer Links */}
            <div className="mt-6 text-center">
              <button
                onClick={() => router.push("/")}
                className="text-sm text-stone-600 hover:text-amber-600 transition-colors"
              >
                ← Volver a inicio
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <p className="text-center text-sm text-stone-600 mt-6">
            Al crear una cuenta, aceptas nuestros términos de servicio y política de privacidad
          </p>
        </div>
      </div>

      {/* Dialog de selección de casa después del registro */}
      <Dialog open={showCasaSelector} onOpenChange={setShowCasaSelector}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-amber-900 flex items-center gap-2">
              <Home className="h-6 w-6" />
              Selecciona tu Casa
            </DialogTitle>
            <DialogDescription className="text-amber-700">
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
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedCasaId === casa.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-stone-200 hover:border-amber-300 hover:bg-amber-50"
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
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold"
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