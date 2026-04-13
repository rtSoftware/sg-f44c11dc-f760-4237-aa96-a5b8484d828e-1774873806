export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient mesh con múltiples blobs animados - Tierra y Azul Claro */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-100 via-blue-100 to-sky-100" />
      
      {/* Blob 1 - Tierra/Stone */}
      <div 
        className="absolute top-0 -left-4 w-[600px] h-[600px] bg-gradient-to-br from-stone-300/60 to-amber-200/60 rounded-full blur-2xl animate-blob"
        style={{ animationDelay: '0s' }}
      />
      
      {/* Blob 2 - Azul Cielo */}
      <div 
        className="absolute top-0 right-4 w-[600px] h-[600px] bg-gradient-to-br from-sky-300/50 to-blue-200/50 rounded-full blur-2xl animate-blob"
        style={{ animationDelay: '2s' }}
      />
      
      {/* Blob 3 - Tierra/Tan */}
      <div 
        className="absolute -bottom-8 left-20 w-[600px] h-[600px] bg-gradient-to-br from-amber-300/55 to-stone-200/55 rounded-full blur-2xl animate-blob"
        style={{ animationDelay: '4s' }}
      />
      
      {/* Blob 4 - Azul Claro */}
      <div 
        className="absolute bottom-20 right-20 w-[600px] h-[600px] bg-gradient-to-br from-cyan-200/45 to-sky-200/45 rounded-full blur-2xl animate-blob"
        style={{ animationDelay: '6s' }}
      />
      
      {/* Blob 5 - Centro Mezclado (tierra + azul) */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-stone-200/40 to-blue-100/40 rounded-full blur-2xl animate-blob"
        style={{ animationDelay: '3s' }}
      />
      
      {/* Capa de difuminado más ligera para que los colores sean más visibles */}
      <div className="absolute inset-0 backdrop-blur-xl bg-white/10" />
    </div>
  );
}