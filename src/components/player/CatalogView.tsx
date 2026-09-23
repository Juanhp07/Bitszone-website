import React from 'react';

export const CatalogView = ({ onViewChange }: { onViewChange: (view: any) => void }) => {
  return (
    <div className="w-full h-full pt-32 px-12 overflow-y-auto pb-40 relative z-10">
      <div className="max-w-[1400px] mx-auto">
        
        <header className="mb-12">
          <p className="text-[#a855f7] text-xs font-bold tracking-widest uppercase mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#a855f7]"></span> DIRECTORIO SONORA V4.8 • STREAM & VAULT
          </p>
          <h2 className="text-5xl font-black text-white tracking-tight mb-4">EXPLORA TU UNIVERSO SONORO</h2>
          <p className="text-white/60 text-lg max-w-2xl leading-relaxed">
            Descubre álbumes esenciales y guarda tu música favorita para escuchar sin límites, con o sin conexión en calidad máster autenticada.
          </p>
        </header>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-12 overflow-x-auto pb-4">
          <button className="px-5 py-2 rounded-full bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30 text-sm font-semibold flex items-center gap-2 shrink-0">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"></path><path d="M12 5l7 7-7 7"></path></svg> Para ti
          </button>
          <button className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/80 border border-white/5 text-sm font-medium shrink-0 transition-colors">
            Tendencias
          </button>
          <button className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/80 border border-white/5 text-sm font-medium shrink-0 transition-colors">
            Rock & Alternativo
          </button>
          <button className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white/80 border border-white/5 text-sm font-medium shrink-0 transition-colors">
            Electrónica
          </button>
        </div>

        {/* Álbumes Destacados */}
        <section className="mb-16">
          <h3 className="text-xs text-white/40 font-bold uppercase tracking-widest mb-2">SELECCIÓN CURADA</h3>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white font-serif italic">Álbumes Destacados</h2>
            <div className="flex gap-2">
              <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"></path></svg>
              </button>
              <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"></path></svg>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div 
              onClick={() => onViewChange('album')}
              className="group cursor-pointer"
            >
              <div className="aspect-square bg-[#0a0a10] rounded-2xl mb-4 overflow-hidden relative border border-white/5">
                <img src="/mj.png" alt="Cover" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" />
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white/80 font-medium flex items-center gap-1.5 border border-white/10">
                  <svg className="w-3 h-3 text-[#a855f7]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  24-bit Flac
                </div>
              </div>
              <h4 className="text-white font-bold text-lg mb-1">Prism Waves</h4>
              <p className="text-white/50 text-sm mb-2">AudioLux</p>
              <div className="flex items-center justify-between text-xs text-white/30 font-medium">
                <span>2025 • Ambient Electrónica</span>
                <span>11 Pistas</span>
              </div>
            </div>
            {/* Placeholder cards to match layout */}
            {[1, 2, 3].map((i) => (
               <div key={i} className="group cursor-pointer">
                 <div className="aspect-square bg-white/5 rounded-2xl mb-4 border border-white/5"></div>
                 <div className="h-5 w-3/4 bg-white/10 rounded mb-2"></div>
                 <div className="h-4 w-1/2 bg-white/5 rounded"></div>
               </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};
