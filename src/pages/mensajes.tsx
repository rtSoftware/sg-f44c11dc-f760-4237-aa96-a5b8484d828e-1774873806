import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Check, 
  CheckCheck,
  Trash2,
  Eye,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  getMensajes, 
  marcarComoLeido, 
  marcarComoRespondido 
} from "@/services/mensajesService";
import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

type Mensaje = Tables<"mensajes">;

export default function MensajesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMensaje, setSelectedMensaje] = useState<Mensaje | null>(null);

  useEffect(() => {
    checkAuth();
    loadMensajes();
  }, []);

  async function checkAuth() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/auth");
    }
  }

  async function loadMensajes() {
    setLoading(true);
    const { data, error } = await getMensajes();
    
    if (error) {
      console.error("Error cargando mensajes:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los mensajes",
        variant: "destructive"
      });
    } else {
      setMensajes(data || []);
    }
    
    setLoading(false);
  }

  async function handleMarcarLeido(mensaje: Mensaje) {
    const { error } = await marcarComoLeido(mensaje.id);
    
    if (error) {
      toast({
        title: "Error",
        description: "No se pudo marcar como leído",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Marcado como leído",
        description: "El mensaje ha sido marcado como leído"
      });
      loadMensajes();
    }
  }

  async function handleMarcarRespondido(mensaje: Mensaje) {
    const { error } = await marcarComoRespondido(mensaje.id);
    
    if (error) {
      toast({
        title: "Error",
        description: "No se pudo marcar como respondido",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Marcado como respondido",
        description: "El mensaje ha sido marcado como respondido"
      });
      loadMensajes();
    }
  }

  function formatFecha(fecha: string) {
    return new Date(fecha).toLocaleString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  const mensajesNoLeidos = mensajes.filter(m => !m.leido).length;
  const mensajesPendientes = mensajes.filter(m => !m.respondido).length;

  return (
    <>
      <Head>
        <title>Mensajes | Experiencia Miguel</title>
      </Head>

      <div className="min-h-screen bg-stone-50 py-8">
        <div className="container max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <Link href="/settings">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver a Configuración
              </Button>
            </Link>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-serif font-bold text-stone-900">
                  Mensajes de Contacto
                </h1>
                <p className="text-stone-600 mt-2">
                  Gestiona los mensajes recibidos desde el formulario de contacto
                </p>
              </div>

              <div className="flex gap-4">
                <Card className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="text-2xl font-bold text-stone-900">{mensajesNoLeidos}</p>
                      <p className="text-xs text-stone-600">No leídos</p>
                    </div>
                  </div>
                </Card>

                <Card className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-stone-900">{mensajesPendientes}</p>
                      <p className="text-xs text-stone-600">Pendientes</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          {/* Layout con dos columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de mensajes */}
            <div className="space-y-4">
              {loading ? (
                <Card>
                  <CardContent className="py-8 text-center text-stone-600">
                    Cargando mensajes...
                  </CardContent>
                </Card>
              ) : mensajes.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-stone-600">
                    No hay mensajes aún
                  </CardContent>
                </Card>
              ) : (
                mensajes.map((mensaje) => (
                  <Card 
                    key={mensaje.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedMensaje?.id === mensaje.id ? "ring-2 ring-amber-500" : ""
                    } ${!mensaje.leido ? "bg-amber-50" : ""}`}
                    onClick={() => setSelectedMensaje(mensaje)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-stone-900 flex items-center gap-2">
                            {mensaje.nombre}
                            {!mensaje.leido && (
                              <Badge variant="secondary" className="bg-amber-500 text-white">
                                Nuevo
                              </Badge>
                            )}
                            {mensaje.respondido && (
                              <Badge variant="secondary" className="bg-green-500 text-white">
                                <CheckCheck className="h-3 w-3 mr-1" />
                                Respondido
                              </Badge>
                            )}
                          </h3>
                          <p className="text-sm text-stone-600 mt-1">{mensaje.email}</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-stone-700 line-clamp-2 mb-2">
                        {mensaje.mensaje}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-stone-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatFecha(mensaje.fecha)}
                        </span>
                        {mensaje.dir_ip && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {mensaje.dir_ip}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Detalle del mensaje seleccionado */}
            <div className="lg:sticky lg:top-8 h-fit">
              {selectedMensaje ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Detalle del Mensaje</span>
                      <div className="flex gap-2">
                        {!selectedMensaje.leido && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarcarLeido(selectedMensaje)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Marcar leído
                          </Button>
                        )}
                        {!selectedMensaje.respondido && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleMarcarRespondido(selectedMensaje)}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Marcar respondido
                          </Button>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-stone-700">Nombre</label>
                      <p className="text-stone-900 mt-1">{selectedMensaje.nombre}</p>
                    </div>

                    <Separator />

                    <div>
                      <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </label>
                      <a 
                        href={`mailto:${selectedMensaje.email}`}
                        className="text-amber-600 hover:text-amber-700 mt-1 block"
                      >
                        {selectedMensaje.email}
                      </a>
                    </div>

                    {selectedMensaje.telefono && (
                      <>
                        <Separator />
                        <div>
                          <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Teléfono
                          </label>
                          <a 
                            href={`tel:${selectedMensaje.telefono}`}
                            className="text-amber-600 hover:text-amber-700 mt-1 block"
                          >
                            {selectedMensaje.telefono}
                          </a>
                        </div>
                      </>
                    )}

                    <Separator />

                    <div>
                      <label className="text-sm font-semibold text-stone-700">Mensaje</label>
                      <p className="text-stone-900 mt-1 whitespace-pre-wrap">
                        {selectedMensaje.mensaje}
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Fecha de envío
                      </label>
                      <p className="text-stone-600 mt-1">
                        {formatFecha(selectedMensaje.fecha)}
                      </p>
                    </div>

                    {selectedMensaje.dir_ip && (
                      <>
                        <Separator />
                        <div>
                          <label className="text-sm font-semibold text-stone-700 flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            Dirección IP
                          </label>
                          <p className="text-stone-600 mt-1 font-mono text-sm">
                            {selectedMensaje.dir_ip}
                          </p>
                        </div>
                      </>
                    )}

                    <Separator />

                    <div className="flex gap-2">
                      <Badge variant={selectedMensaje.leido ? "secondary" : "default"}>
                        {selectedMensaje.leido ? "Leído" : "No leído"}
                      </Badge>
                      <Badge variant={selectedMensaje.respondido ? "secondary" : "outline"}>
                        {selectedMensaje.respondido ? "Respondido" : "Pendiente"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center text-stone-600">
                    <Mail className="h-12 w-12 mx-auto mb-4 text-stone-400" />
                    <p>Selecciona un mensaje para ver sus detalles</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}