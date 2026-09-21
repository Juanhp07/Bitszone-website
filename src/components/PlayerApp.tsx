import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Lista de artistas falsos para rellenar
const DUMMY_ARTISTS = [
  "The Weeknd",
  "Dua Lipa",
  "Daft Punk",
  "Rosalía",
  "Arctic Monkeys",
  "Gorillaz",
  "Tame Impala"
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
  onClick?: () => void;
}) {
  const isReducedMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;

  if (isReducedMotion) {
    return (
      <a href={href} onClick={onClick} className="block cursor-pointer opacity-50 hover:opacity-100 hover:font-bold transition-all duration-300">
        {label}
      </a>
    );
  }

  return (
    <a 
      href={href} 
      onClick={onClick} 
      className="group/link-hover inline-block no-underline cursor-pointer opacity-40 hover:opacity-100 font-light hover:font-bold transition-all duration-300"
    >
      <span className="sr-only">{label}</span>
      <span aria-hidden="true" className="relative inline-block overflow-hidden align-middle leading-[1.08]">
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

  // Extraer artistas únicos de la base de datos
  const dbArtists = Array.from(new Set(tracks.map(t => t.artist)));
  
  // Combinar los de la DB con los falsos, asegurando que no haya duplicados
  const displayArtists = Array.from(new Set([...dbArtists, ...DUMMY_ARTISTS]));

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-white font-inter overflow-hidden">
      
      {/* Estilos en línea para la animación del título BITSZONE */}
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
      `}</style>

      {/* Lista de Artistas (Izquierda) */}
      <div 
        className="w-[40%] min-w-[350px] max-w-[500px] h-full flex flex-col justify-center px-12 overflow-y-auto"
        style={{
          // Degradado sutil morado en el borde derecho en lugar de una línea sólida
          background: 'linear-gradient(to right, transparent 80%, rgba(139, 92, 246, 0.05) 100%)'
        }}
      >
        <div className="flex flex-col gap-8 w-full py-20">
          {loading ? (
            <p className="text-gray-500">Cargando artistas...</p>
          ) : (
            displayArtists.map((artist, i) => {
              // Calcular el desplazamiento en X para crear el efecto de medio círculo
              // Usamos Math.sin para crear la curva. En el medio (PI/2) es el máximo.
              const progress = i / (displayArtists.length - 1 || 1);
              const curveOffset = Math.sin(progress * Math.PI) * 60; // 60px max offset

              return (
                <div 
                  key={i} 
                  className="text-4xl md:text-5xl lg:text-6xl text-white tracking-tight"
                  style={{
                    transform: `translateX(${curveOffset}px)`,
                    transition: 'transform 0.3s ease'
                  }}
                >
                  <NavLinkHover label={artist} />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Contenido Principal (Derecha) */}
      <div className="flex-1 h-full flex items-center justify-center bg-[#050505] relative">
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
