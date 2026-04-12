export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient mesh con múltiples blobs animados - INTENSIFICADO */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-orange-100 to-rose-100" />
      
      {/* Blob 1 - Amber (más grande y vibrante) */}
      <div 
        className="absolute top-0 -left-4 w-[600px] h-[600px] bg-gradient-to-br from-amber-300/60 to-orange-300/60 rounded-full blur-2xl animate-blob"
        style={{ animationDelay: '0s' }}
      />
      
      {/* Blob 2 - Peach (más grande y vibrante) */}
      <div 
        className="absolute top-0 right-4 w-[600px] h-[600px] bg-gradient-to-br from-rose-300/50 to-pink-300/50 rounded-full blur-2xl animate-blob"
        style={{ animationDelay: '2s' }}
      />
      
      {/* Blob 3 - Orange (más grande y vibrante) */}
      <div 
        className="absolute -bottom-8 left-20 w-[600px] h-[600px] bg-gradient-to-br from-orange-300/55 to-amber-300/55 rounded-full blur-2xl animate-blob"
        style={{ animationDelay: '4s' }}
      />
      
      {/* Blob 4 - Coral (más grande y vibrante) */}
      <div 
        className="absolute bottom-20 right-20 w-[600px] h-[600px] bg-gradient-to-br from-coral-300/45 to-rose-300/45 rounded-full blur-2xl animate-blob"
        style={{ animationDelay: '6s' }}
      />
      
      {/* Blob 5 - Centro (nuevo blob para más dinamismo) */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-orange-200/40 to-amber-200/40 rounded-full blur-2xl animate-blob"
        style={{ animationDelay: '3s' }}
      />
      
      {/* Capa de difuminado más ligera para que los colores sean más visibles */}
      <div className="absolute inset-0 backdrop-blur-xl bg-white/10" />
    </div>
  );
}