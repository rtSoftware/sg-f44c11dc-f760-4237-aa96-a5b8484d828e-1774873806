export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Gradient mesh con múltiples blobs animados */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50" />
      
      {/* Blob 1 - Amber */}
      <div 
        className="absolute top-0 -left-4 w-96 h-96 bg-gradient-to-br from-amber-200/40 to-orange-200/40 rounded-full blur-3xl animate-blob"
        style={{ animationDelay: '0s' }}
      />
      
      {/* Blob 2 - Peach */}
      <div 
        className="absolute top-0 right-4 w-96 h-96 bg-gradient-to-br from-rose-200/30 to-pink-200/30 rounded-full blur-3xl animate-blob"
        style={{ animationDelay: '2s' }}
      />
      
      {/* Blob 3 - Orange */}
      <div 
        className="absolute -bottom-8 left-20 w-96 h-96 bg-gradient-to-br from-orange-200/35 to-amber-200/35 rounded-full blur-3xl animate-blob"
        style={{ animationDelay: '4s' }}
      />
      
      {/* Blob 4 - Coral */}
      <div 
        className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-coral-200/25 to-rose-200/25 rounded-full blur-3xl animate-blob"
        style={{ animationDelay: '6s' }}
      />
      
      {/* Capa de difuminado adicional para suavizar */}
      <div className="absolute inset-0 backdrop-blur-3xl bg-white/30" />
    </div>
  );
}