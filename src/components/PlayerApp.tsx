import React from 'react';
import { Search, Home, LayoutGrid, Radio, Play, SkipBack, SkipForward, Volume2, Shuffle, Repeat, Maximize2, LogIn, ChevronRight } from 'lucide-react';
import { SpecularText } from './ui/SpecularText';

export const PlayerApp = () => {
  return (
    <div className="flex h-screen w-full bg-[#0a0a0f] text-white overflow-hidden font-inter">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#121216] border-r border-white/5 flex flex-col h-full flex-shrink-0 relative z-10">
        <div className="p-6 pb-2">
          <SpecularText
            text="Bitszone"
            className="text-[22px] tracking-normal leading-none"
            style={{
              fontFamily: '"DM Serif Display", serif',
              fontStyle: "italic",
            }}
            specularColor="#5A1B5E"
            baseStrokeColor="transparent"
            strokeWidth={1}
            glowSize={30}
          />
        </div>

        <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          {/* Search Box */}
          <div className="relative group px-3">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A0A3BD] group-focus-within:text-white transition-colors" />
            <input 
              type="text" 
              placeholder="Buscar" 
              className="w-full bg-white/5 border border-white/10 rounded-md py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:border-white/20 focus:bg-white/10 transition-colors placeholder:text-[#A0A3BD]"
            />
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            <a href="/" className="flex items-center gap-3 px-3 py-2 text-[#A0A3BD] hover:text-white hover:bg-white/5 rounded-md transition-colors text-sm font-medium">
              <Home className="w-5 h-5" /> Inicio
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-white bg-white/10 rounded-md transition-colors text-sm font-medium">
              <LayoutGrid className="w-5 h-5" /> Novedades
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-[#A0A3BD] hover:text-white hover:bg-white/5 rounded-md transition-colors text-sm font-medium">
              <Radio className="w-5 h-5" /> Radio
            </a>
          </nav>
        </div>

        {/* Auth Button at bottom */}
        <div className="p-4 border-t border-white/5 bg-[#121216]">
          <button className="w-full flex items-center justify-center gap-2 bg-[#a855f7] hover:bg-[#9333ea] text-white py-2 rounded-md text-sm font-semibold transition-colors">
            <LogIn className="w-4 h-4" /> Iniciar sesión
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-y-auto pb-32 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        <div className="p-8 md:p-12 max-w-[1600px] mx-auto">
          <h1 className="text-3xl md:text-4xl font-sora font-bold mb-8">Novedades</h1>
          
          {/* Row 1: Big Featured Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { label: "DE GIRA", title: "Setlist: la residencia en Madrid", subtitle: "Bitszone Pop latino", img: "https://is1-ssl.mzstatic.com/image/thumb/Features125/v4/dd/7d/72/dd7d7259-d27f-5b3e-ce64-9e304d2cb40f/dj.rxzrauer.jpg/600x600bb.jpg" },
              { label: "PLAYLIST ACTUALIZADA", title: "EN EÑE", subtitle: "Bitszone Pop español", img: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/53/a7/7f/53a77fab-c54c-a57b-8130-248fc12d0c80/093624948995.jpg/600x600bb.jpg" },
              { label: "NUEVO EP", title: "EL GREEN PRINT: La Saga", subtitle: "Audio espacial", img: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/c3/09/a4/c309a4f8-33a0-abcb-83a2-710d63072de9/24CRGIM46412.rgb.jpg/600x600bb.jpg" }
            ].map((card, i) => (
              <div key={i} className="group cursor-pointer flex flex-col gap-2">
                <p className="text-[10px] font-semibold tracking-wider text-[#A0A3BD]">{card.label}</p>
                <h3 className="text-base font-semibold leading-tight">{card.title}</h3>
                <p className="text-sm text-[#A0A3BD] mb-1">{card.subtitle}</p>
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden relative">
                  <img src={card.img} alt={card.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors flex items-end p-4">
                    <button className="w-10 h-10 rounded-full bg-[#a855f7] flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all ml-auto shadow-lg">
                      <Play className="w-4 h-4 text-white ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Row 2: Albums / Square Cards */}
          <div className="flex items-center gap-1 mb-4 group cursor-pointer w-fit">
            <h2 className="text-xl font-sora font-semibold">El mundo de Bitszone</h2>
            <ChevronRight className="w-5 h-5 text-[#A0A3BD] group-hover:text-white transition-colors" />
          </div>
          
          <div className="flex overflow-x-auto gap-5 pb-8 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            {[
              { title: "Setlist", artist: "Bitszone Music", img: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/53/a7/7f/53a77fab-c54c-a57b-8130-248fc12d0c80/093624948995.jpg/600x600bb.jpg" },
              { title: "Imprescindibles", artist: "Bitszone Music", img: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/df/fe/a7/dffea722-e8d7-b2ac-2b31-e207fb738b8e/13UABIM36806.rgb.jpg/600x600bb.jpg" },
              { title: "Fijación Oral", artist: "Shakira", img: "https://is1-ssl.mzstatic.com/image/thumb/Features125/v4/0f/7a/74/0f7a7472-92fa-e77d-384a-1e4304705e83/dj.jbiruenb.png/600x600bb.jpg" },
              { title: "Vídeos imprescindibles", artist: "Bitszone Music", img: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/c3/09/a4/c309a4f8-33a0-abcb-83a2-710d63072de9/24CRGIM46412.rgb.jpg/600x600bb.jpg" },
              { title: "Canciones de amor", artist: "Bitszone Music", img: "https://is1-ssl.mzstatic.com/image/thumb/Features125/v4/dd/7d/72/dd7d7259-d27f-5b3e-ce64-9e304d2cb40f/dj.rxzrauer.jpg/600x600bb.jpg" },
            ].map((album, i) => (
              <div key={i} className="min-w-[180px] md:min-w-[220px] snap-start group cursor-pointer">
                <div className="w-full aspect-square rounded-lg overflow-hidden relative mb-3 shadow-lg">
                  <img src={album.img} alt={album.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <button className="w-10 h-10 rounded-full bg-[#a855f7] flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all ml-auto shadow-xl">
                      <Play className="w-4 h-4 text-white ml-1" />
                    </button>
                  </div>
                </div>
                <h3 className="text-sm font-semibold truncate text-white">{album.title}</h3>
                <p className="text-sm text-[#A0A3BD] truncate">{album.artist}</p>
              </div>
            ))}
          </div>

        </div>
      </main>

      {/* Bottom Sticky Player Bar (Glassmorphism) */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#1a1a24]/60 backdrop-blur-3xl border-t border-white/5 px-6 flex items-center justify-between z-50">
        
        {/* Progress Bar (Apple Music style across the very top of the bar) */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/10">
          <div className="h-full bg-white/60 w-1/3"></div>
        </div>

        {/* Left: Now Playing */}
        <div className="flex items-center gap-4 w-1/3">
          <div className="w-12 h-12 rounded-md overflow-hidden shadow-md">
            <img src="https://is1-ssl.mzstatic.com/image/thumb/Features125/v4/dd/7d/72/dd7d7259-d27f-5b3e-ce64-9e304d2cb40f/dj.rxzrauer.jpg/600x600bb.jpg" alt="Cover" className="w-full h-full object-cover" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white truncate">Numb</h4>
            <p className="text-xs text-[#A0A3BD] truncate">Linkin Park</p>
          </div>
        </div>

        {/* Center: Controls */}
        <div className="flex flex-col items-center justify-center w-1/3">
          <div className="flex items-center gap-6">
            <button className="text-[#A0A3BD] hover:text-white transition-colors">
              <Shuffle className="w-4 h-4" />
            </button>
            <button className="text-white hover:text-[#a855f7] transition-colors">
              <SkipBack className="w-5 h-5 fill-current" />
            </button>
            <button className="text-white hover:scale-105 transition-transform">
              <Play className="w-7 h-7 fill-current" />
            </button>
            <button className="text-white hover:text-[#a855f7] transition-colors">
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
            <button className="text-[#A0A3BD] hover:text-white transition-colors">
              <Repeat className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Volume & Extras */}
        <div className="flex items-center justify-end gap-4 w-1/3">
          <Volume2 className="w-4 h-4 text-[#A0A3BD]" />
          <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden cursor-pointer">
            <div className="w-2/3 h-full bg-white rounded-full"></div>
          </div>
          <button className="ml-4 text-[#A0A3BD] hover:text-white transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
