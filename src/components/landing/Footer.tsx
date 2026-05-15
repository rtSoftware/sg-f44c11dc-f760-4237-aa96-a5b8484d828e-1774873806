import Link from "next/link";
import { BookOpen, Mail, MapPin, Phone, Github, Twitter, Linkedin, Settings } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/router";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useToast } from "@/hooks/use-toast";

export function Footer() {
  const router = useRouter();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [attempts, setAttempts] = useState(0);
  const currentYear = new Date().getFullYear();

  const validarPin = (input: string): boolean => {
    const hoy = new Date();
    const dd = String(hoy.getDate()).padStart(2, "0");
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const ddRev = dd[1] + dd[0];
    const mmRev = mm[1] + mm[0];
    const esperado = ddRev + mmRev;
    const centro = input.slice(1, 5);
    return centro === esperado;
  };

  const handlePinChange = (value: string) => {
    setPin(value);
    
    // Auto-submit cuando se completen los 6 dígitos
    if (value.length === 6) {
      if (validarPin(value)) {
        // Éxito
        setOpen(false);
        setPin("");
        setAttempts(0);
        router.push("/settings");
      } else {
        // Fallo
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts === 1) {
          toast({
            title: "PIN incorrecto",
            description: "1 intento restante",
            variant: "destructive"
          });
          setPin("");
        } else {
          toast({
            title: "Acceso denegado",
            variant: "destructive"
          });
          setOpen(false);
          setPin("");
          setAttempts(0);
        }
      }
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setPin("");
      setAttempts(0);
    }
  };

  return (
    <footer className="bg-white/90 backdrop-blur-sm border-t border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-stone-900" />
              <span className="text-xl font-bold text-stone-900">Experiencia Miguel</span>
            </div>
            <p className="text-sm text-stone-600">
              Transformando vidas a través de la lectura reflexiva y el crecimiento personal.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="font-semibold text-stone-900 mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/#descripcion" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                  Sobre el Libro
                </Link>
              </li>
              <li>
                <Link href="/#precios" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                  Precios
                </Link>
              </li>
              <li>
                <Link href="/#contacto" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/auth" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                  Iniciar Sesión
                </Link>
              </li>
            </ul>
          </div>

          {/* Recursos */}
          <div>
            <h3 className="font-semibold text-stone-900 mb-4">Recursos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/biblioteca" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                  Biblioteca Digital
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <a href="#" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                  Guía de Estudio
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
                  Preguntas Frecuentes
                </a>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-stone-900 mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:tapiara@iasos.com.mx" className="text-stone-600 hover:text-amber-800 transition-colors flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  tapiara@iasos.com.mx
                </a>
              </li>
              <li>
                <a href="tel:+525549193378" className="text-stone-600 hover:text-amber-800 transition-colors flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  55 49 19 33 78
                </a>
              </li>
              <li className="text-stone-600 flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>Reforma 296, Col Juárez<br />Ciudad de México</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-stone-200">
          <p className="text-center text-sm text-stone-600">
            © {currentYear} Experiencia Miguel. Todos los derechos reservados.
          </p>
        </div>
      </div>

      {/* Botón flotante discreto para acceso admin */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 p-3 rounded-full bg-stone-800/30 hover:bg-stone-800/50 transition-all duration-300 opacity-30 hover:opacity-100"
        aria-label="Acceso administrador"
      >
        <Settings className="h-5 w-5 text-stone-400" />
      </button>

      {/* Modal de PIN */}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center space-y-6 py-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Acceso Restringido</h3>
              <p className="text-sm text-muted-foreground">Ingrese el PIN de 6 dígitos</p>
            </div>
            
            <InputOTP
              maxLength={6}
              value={pin}
              onChange={handlePinChange}
              autoFocus
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            
            <p className="text-xs text-muted-foreground">
              El PIN se genera automáticamente basado en la fecha actual
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
}