import React from 'react';
import { Play } from 'lucide-react';

export const AlbumView = ({ onViewChange }: { onViewChange: (view: any) => void }) => {
  return (
    <div className="w-full h-full pt-32 px-12 overflow-y-auto pb-40 relative z-10 flex gap-12">
      <div className="w-[30%] max-w-[400px] shrink-0">
        <button onClick={() => onViewChange('catalog')} className="text-white/50 hover:text-white flex items-center gap-2 text-sm font-medium mb-8 transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"></path><polyline points="12 19 5 12 12 5"></polyline></svg>
          Volver
        </button>
        <div className="w-full aspect-square rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(168,85,247,0.15)] border border-white/10 relative">
          <img src="/mj.png" alt="Cover" className="w-full h-full object-cover" />
          <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white/80 font-medium flex items-center gap-1.5 border border-white/10 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-[#a855f7]"></span> Master Hi-Res
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-[900px] pt-12">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/70 flex items-center gap-1.5">
               <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
               Álbum Oficial • Calidad Lossless 24-bit / 96kHz
            </span>
          </div>
          <h1 className="text-6xl font-serif italic text-white mb-4">Prism Waves <span className="text-[#a855f7]/60 font-sans not-italic text-5xl font-light">(Deluxe Edition)</span></h1>
          <p className="text-lg text-white/70 flex items-center gap-4">
            <span className="font-semibold text-white">AudioLux</span>
            <span>•</span>
            <span>2026</span>
            <span>•</span>
            <span>12 canciones, 48 min 22 s</span>
            <span>•</span>
            <span className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-md text-xs border border-white/5">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              412 MB tamaño total offline
            </span>
          </p>
        </div>

        <div className="flex items-center gap-4 mb-12">
          <button className="flex items-center gap-2 px-8 py-4 rounded-full bg-[#a855f7] hover:bg-[#9333ea] text-white font-bold transition-all shadow-lg hover:shadow-purple-500/30 hover:scale-105">
            <Play fill="currentColor" className="w-5 h-5" /> Reproducir Todo
          </button>
          <button className="flex items-center gap-2 px-6 py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-medium border border-white/10 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Descargar Álbum (412 MB)
          </button>
          <button className="w-14 h-14 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 transition-colors text-white/70 hover:text-white">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          </button>
        </div>

        {/* Tracklist Table */}
        <div className="w-full">
           <div className="grid grid-cols-[50px_1fr_100px_100px_150px] gap-4 px-4 py-3 text-xs font-medium text-white/40 tracking-widest uppercase border-b border-white/5 mb-2">
             <div>#</div>
             <div>Título • Artista</div>
             <div className="text-right">Calidad</div>
             <div className="text-right">Duración</div>
             <div className="text-right">Estado</div>
           </div>
           
           {/* Track 1 */}
           <div className="grid grid-cols-[50px_1fr_100px_100px_150px] gap-4 px-4 py-4 items-center hover:bg-white/5 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-white/5">
             <div className="text-white/50 text-sm font-medium group-hover:text-white">01</div>
             <div>
               <h4 className="text-white font-medium mb-0.5">Resonancia Prismática</h4>
               <p className="text-white/50 text-xs">AudioLux</p>
             </div>
             <div className="text-right text-xs text-white/40">24-bit Flac</div>
             <div className="text-right text-sm text-white/60 tabular-nums">03:45</div>
             <div className="flex justify-end">
               <span className="px-3 py-1 rounded-full border border-green-500/30 text-green-400 text-[10px] flex items-center gap-1.5 bg-green-500/10">
                 <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Descargada
               </span>
             </div>
           </div>
           
           {/* Track 2 (Downloading) */}
           <div className="grid grid-cols-[50px_1fr_100px_100px_150px] gap-4 px-4 py-4 items-center bg-white/[0.02] rounded-xl transition-colors group cursor-pointer border border-[#a855f7]/20 relative overflow-hidden">
             <div className="absolute bottom-0 left-0 h-0.5 bg-[#a855f7] w-[68%]"></div>
             <div className="text-[#a855f7] text-sm font-medium">02</div>
             <div>
               <h4 className="text-white font-medium mb-0.5 flex items-center gap-2">Pulso Cósmico <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7]"></span></h4>
               <p className="text-white/50 text-xs">AudioLux feat. Kaelen</p>
             </div>
             <div className="text-right"><span className="text-[10px] border border-white/10 px-2 py-0.5 rounded text-white/40">Lossless</span></div>
             <div className="text-right text-sm text-white/60 tabular-nums">04:18</div>
             <div className="flex justify-end">
               <span className="text-[#a855f7] text-[10px] flex items-center gap-1.5 font-medium">
                 <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg> 68% • 18/26MB
               </span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
