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
  "The Strokes",
  "Kendrick Lamar",
  "Coldplay",
  "Radiohead",
  "Nirvana",
  "Queen",
  "Muse",
  "The Killers",
  "Florence + The Machine",
  "Paramore",
  "Red Hot Chili Peppers"
];

/* Animación de split-character original (Hovers normales) */
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
      <a href={href} onClick={onClick} className="inline-block py-4 cursor-pointer opacity-50 hover:opacity-100 hover:font-bold transition-all duration-300 truncate max-w-full hover:translate-x-3 hover:scale-[1.03] origin-left text-white">
        {label}
      </a>
    );
  }

  return (
    <a 
      href={href} 
      onClick={onClick} 
      draggable={false}
      className="group/link-hover inline-block py-4 no-underline cursor-pointer opacity-40 hover:opacity-100 font-light hover:font-bold hover:translate-x-3 hover:scale-[1.03] origin-left transition-all duration-300 max-w-full truncate align-bottom text-white"
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

  // Refs para el scroll normal con inercia
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  
  const velocityRef = useRef(0);
  const lastMouseYRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animationRef = useRef<number>();

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

  // Aplica la inercia cuando sueltas el mouse
  const startMomentum = () => {
    const applyInertia = () => {
      if (!scrollRef.current) return;
      if (Math.abs(velocityRef.current) > 0.1) {
        scrollRef.current.scrollTop -= velocityRef.current;
        velocityRef.current *= 0.95; // Fricción
        animationRef.current = requestAnimationFrame(applyInertia);
      }
    };
    animationRef.current = requestAnimationFrame(applyInertia);
  };

  // Manejo de drag para hacer scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    
    setIsDragging(true);
    setStartY(e.pageY - scrollRef.current.offsetTop);
    setScrollTop(scrollRef.current.scrollTop);
    
    lastMouseYRef.current = e.pageY;
    lastTimeRef.current = Date.now();
    velocityRef.current = 0;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    
    const y = e.pageY - scrollRef.current.offsetTop;
    const walk = (y - startY) * 1.5; // Velocidad de arrastre
    scrollRef.current.scrollTop = scrollTop - walk;

    // Calcular velocidad para la inercia
    const now = Date.now();
    const dt = now - lastTimeRef.current;
    if (dt > 0) {
      const dy = e.pageY - lastMouseYRef.current;
      velocityRef.current = (dy / dt) * 18; 
    }
    lastMouseYRef.current = e.pageY;
    lastTimeRef.current = now;
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      startMomentum();
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      startMomentum();
    }
  };

  // Prevenir click en el enlace si el usuario estaba arrastrando
  const handleLinkClick = (e: React.MouseEvent) => {
    if (isDragging || Math.abs(velocityRef.current) > 2) {
      e.preventDefault();
    }
  };

  // Extraer artistas únicos de la base de datos
  const dbArtists = Array.from(new Set(tracks.map(t => t.artist)));
  
  // Combinar los de la DB con los falsos
  const displayArtists = Array.from(new Set([...dbArtists, ...DUMMY_ARTISTS]));

  return (
    <div className="flex h-screen w-full bg-[#050505] text-white font-inter overflow-hidden relative">
      
      {/* Estilos en línea */}
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

        @keyframes loadingPulse {
          0% { transform: translateY(-50%) scale(0.3); opacity: 0.6; }
          50% { transform: translateY(-50%) scale(0.5); opacity: 1; }
          100% { transform: translateY(-50%) scale(0.3); opacity: 0.6; }
        }
        .loading-glow {
          animation: loadingPulse 1.5s infinite ease-in-out;
        }
        @keyframes expandGlow {
          0% { transform: translateY(-50%) scale(0.5); }
          100% { transform: translateY(-50%) scale(1.2); }
        }
        .loaded-glow {
          animation: expandGlow 1.2s forwards cubic-bezier(0.16, 1, 0.3, 1);
        }
      `}</style>

      {/* Fondo circular desenfocado con origen en el borde izquierdo */}
      <div 
        className={`absolute top-1/2 left-[-600px] w-[1200px] h-[1200px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none z-0 ${loading ? 'loading-glow' : 'loaded-glow'}`}
      />

      {/* Lista de Artistas (Izquierda) con Scroll Normal e Inercia */}
      <div 
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="w-[45%] min-w-[450px] max-w-[650px] h-full flex flex-col justify-start px-12 overflow-y-auto overflow-x-hidden no-scrollbar cursor-grab active:cursor-grabbing z-10 bg-transparent"
        style={{
          // Máscara de gradiente para difuminar los bordes superior e inferior al hacer scroll
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'
        }}
      >
        <div className="flex flex-col w-full py-32">
          {loading ? (
            <div className="h-full w-full flex flex-col justify-center px-12">
            </div>
          ) : (
            displayArtists.map((artist, i) => {
              const progress = i / (displayArtists.length - 1 || 1);
              const curveOffset = Math.sin(progress * Math.PI) * 40; 

              return (
                <div 
                  key={i} 
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
