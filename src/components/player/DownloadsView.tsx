import React from 'react';

export const DownloadsView = () => {
  return (
    <div className="w-full h-full pt-32 px-12 overflow-y-auto pb-40 relative z-10">
      <div className="max-w-[1000px] mx-auto">
        <header className="mb-10">
          <p className="text-[#a855f7] text-xs font-bold tracking-widest uppercase mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#a855f7]"></span> IHC VERIFIED VAULT <span className="text-white/30 font-normal">v2.4 • Modo Sin Conexión</span>
          </p>
          <h2 className="text-5xl font-black text-white tracking-tight mb-4 uppercase">Mis Descargas</h2>
          <p className="text-white/60 text-lg max-w-2xl leading-relaxed">
            Tu música verificada para escuchar en cualquier lugar sin interrupciones, sin datos móviles y con licencia local garantizada en modo avión.
          </p>
        </header>

        {/* Storage Widget */}
        <div className="w-full bg-gradient-to-br from-[#1a1025] to-[#0a0510] rounded-3xl p-8 border border-[#a855f7]/20 shadow-[0_0_50px_rgba(168,85,247,0.05)] mb-12">
          <div className="flex justify-between items-end mb-6">
            <div>
              <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-1">Gestión de Almacenamiento Local</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-4xl font-bold text-white">1.2 GB</h3>
                <span className="text-white/50 text-sm">ocupados por Bitszone • <span className="text-white">3.8 GB disponibles</span> <span className="text-white/30 text-xs">(64 GB totales)</span></span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 rounded-lg bg-white/10 text-white/80 text-xs font-medium border border-white/5">Memoria interna</button>
              <button className="px-4 py-2 rounded-lg bg-transparent text-white/40 text-xs font-medium border border-transparent hover:bg-white/5">Tarjeta SD externa</button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden mb-3 flex">
            <div className="h-full bg-gradient-to-r from-[#a855f7] to-[#d8b4fe] w-[18%]"></div>
            <div className="h-full bg-white/10 w-[5%]"></div>
          </div>
          
          <div className="flex justify-between text-[10px] text-white/40 font-medium">
            <div className="flex gap-4">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#d8b4fe]"></span> Audio Bitszone (Hi-Res 320k)</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-white/10"></span> Otras apps y sistema</span>
            </div>
            <span>24% asignado a audio offline</span>
          </div>
        </div>

        {/* Tracks List */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-full bg-[#a855f7] text-white text-xs font-bold">Todas las descargas (42)</button>
            <button className="px-4 py-2 rounded-full bg-white/5 text-white/60 hover:text-white text-xs font-medium">Álbumes guardados (3)</button>
          </div>
          <div className="w-64 relative">
             <input type="text" placeholder="Filtrar por pista o artista..." className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white focus:outline-none focus:border-[#a855f7]/50" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {/* Track 1 */}
          <div className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-white/5">
             <img src="/mj.png" className="w-12 h-12 rounded-lg object-cover" />
             <div className="flex-1">
               <h4 className="text-white font-medium text-sm flex items-center gap-2">Hyperluminal Drift <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-white/60">FLAC</span></h4>
               <p className="text-white/50 text-xs">Kavinsky • Reborn Edition</p>
             </div>
             <div className="text-right px-8 border-r border-white/5">
               <p className="text-white/80 text-sm font-medium">18.4 MB</p>
               <p className="text-white/40 text-[10px]">320 kbps CBR</p>
             </div>
             <div className="px-4 w-40 flex justify-end">
               <span className="text-green-400 text-xs font-medium flex items-center gap-1.5"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg> Disponible sin conexión</span>
             </div>
             <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors">
               <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
             </button>
          </div>
        </div>

      </div>
    </div>
  );
};
