import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// Lista de artistas falsos para rellenar
const DUMMY_ARTISTS = [
  "The Weeknd",
  "Dua Lipa",
  "Daft Punk",
  "Rosalía",
  "Arctic Monkeys",
  "Gorillaz",
  "Tame Impala",
  "Daft Punk",
  "The Strokes",
  "Kendrick Lamar"
];

/* Animación de split-character */
function NavLinkHover({
  label,
  href,
  charStagger = 0.015,
  onClick,
}: {
  label: string;
  href?: string;
  charStagger?: number;
  onClick?: (e: React.MouseEvent) => void;
}) {
  const isReducedMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;

  if (isReducedMotion) {
    return (
      <a href={href} onClick={onClick} className="block cursor-pointer opacity-50 hover:opacity-100 hover:font-bold transition-all duration-300 truncate max-w-full">
        {label}
      </a>
    );
  }

  return (
    <a 
      href={href} 
      onClick={onClick} 
      draggable={false}
      className="group/link-hover inline-block no-underline cursor-pointer opacity-40 hover:opacity-100 font-light hover:font-bold transition-all duration-300 max-w-full truncate align-bottom"
    >
      <span className="sr-only">{label}</span>
      <span aria-hidden="true" className="relative inline-block overflow-hidden align-middle leading-[1.08] truncate max-w-full">
        {[...label].map((char, index) => (
          <span
            key={index}
            className="relative inline-block whitespace-pre transition-transform duration-500 ease-[cubic-bezier(0.625,0.05,0,1)] group-hover/link-hover:-translate-y-[1.2em] group-focus-visible/link-hover:-translate-y-[1.2em]"
            style={{ textShadow: "0 1.2em currentColor", transitionDelay: `${index * charStagger}s` }}
          >
            {char === " " ? " " : char}
          </span>
        ))}
      </span>
    </a>
  );
}

export const PlayerApp = ({ supabaseUrl, supabaseAnonKey }: { supabaseUrl?: string, supabaseAnonKey?: string }) => {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Drag to scroll refs and state
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);

  // Fetch from Supabase
  useEffect(() => {
    const fetchTracks = async () => {
      if (!supabaseUrl || !supabaseAnonKey) {
        setLoading(false);
        return;
      }
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data, error } = await supabase.from('tracks').select('*').order('id', { ascending: true });
      if (data && data.length > 0) {
        setTracks(data);
      }
      setLoading(false);
    };
    fetchTracks();
  }, [supabaseUrl, supabaseAnonKey]);

  // Manejo de drag para hacer scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartY(e.pageY - scrollRef.current.offsetTop);
    setScrollTop(scrollRef.current.scrollTop);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const y = e.pageY - scrollRef.current.offsetTop;
    const walk = (y - startY) * 1.5; // Velocidad de arrastre
    scrollRef.current.scrollTop = scrollTop - walk;
  };

  // Prevenir click en el enlace si el usuario estaba arrastrando
  const handleLinkClick = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
    }
  };

  // Extraer artistas únicos de la base de datos
  const dbArtists = Array.from(new Set(tracks.map(t => t.artist)));
  
  // Combinar los de la DB con los falsos, asegurando que no haya duplicados
  const displayArtists = Array.from(new Set([...dbArtists, ...DUMMY_ARTISTS]));

  return (
    <div className="flex h-screen w-full bg-[#050505] text-white font-inter overflow-hidden relative">
      
      {/* Estilos en línea para la animación del título y ocultar scrollbar */}
      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-text {
          background-size: 200% auto;
          animation: gradientMove 2s ease-in-out infinite;
        }
        
        /* Ocultar scrollbar nativo */
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Fondo Curvo del Sidebar (Independiente para no cortar el texto al hacer scroll) */}
      <div 
        className="absolute top-0 left-0 h-full w-[45%] min-w-[450px] max-w-[650px] pointer-events-none z-0"
        style={{
          background: 'linear-gradient(to right, #0a0a0a, rgba(139, 92, 246, 0.08))',
          // Curva mucho más suave (15% de profundidad horizontal)
          borderRadius: '0 15% 15% 0 / 0 50% 50% 0',
        }}
      />

      {/* Lista de Artistas (Izquierda) */}
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="w-[45%] min-w-[450px] max-w-[650px] h-full flex flex-col justify-start px-12 overflow-y-auto overflow-x-hidden no-scrollbar cursor-grab active:cursor-grabbing z-10 bg-transparent"
      >
        <div className="flex flex-col gap-6 w-full py-32">
          {loading ? (
            <p className="text-gray-500">Cargando artistas...</p>
          ) : (
            displayArtists.map((artist, i) => {
              const progress = i / (displayArtists.length - 1 || 1);
              // Multiplicador reducido a 25 para una curva mínima en los textos
              const curveOffset = Math.sin(progress * Math.PI) * 25; 

              return (
                <div 
                  key={i} 
                  // Tamaño de texto reducido a 3xl/4xl/5xl
                  className="text-3xl md:text-4xl lg:text-5xl text-white tracking-tight whitespace-nowrap"
                  style={{
                    transform: `translateX(${curveOffset}px)`,
                    transition: 'transform 0.3s ease',
                    width: `calc(100% - ${curveOffset}px)`,
                  }}
                >
                  <NavLinkHover label={artist} onClick={handleLinkClick} />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Contenido Principal (Derecha) */}
      <div className="flex-1 h-full flex items-center justify-center relative z-0">
        <h1 
          className="text-4xl md:text-6xl lg:text-8xl tracking-[0.2em] font-bold select-none pointer-events-none animate-gradient-text text-transparent bg-clip-text"
          style={{
            backgroundImage: 'linear-gradient(to right, #333333, #a78bfa, #333333)'
          }}
        >
          BITSZONE
        </h1>
      </div>

    </div>
  );
};
