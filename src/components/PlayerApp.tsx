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

/* Animación de split-character extraída del componente que enviaste */
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
      <a href={href} onClick={onClick} className="block cursor-pointer">
        {label}
      </a>
    );
  }

  return (
    <a href={href} onClick={onClick} className="group/link-hover inline-block no-underline cursor-pointer">
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
      
      {/* Lista de Artistas (Izquierda) */}
      <div className="w-1/3 min-w-[350px] h-full flex flex-col justify-center px-12 border-r border-white/10 overflow-y-auto">
        <div className="flex flex-col gap-8 w-full py-20">
          {loading ? (
            <p className="text-gray-500">Cargando artistas...</p>
          ) : (
            displayArtists.map((artist, i) => (
              <div key={i} className="text-4xl md:text-5xl lg:text-6xl font-light text-white tracking-tight">
                <NavLinkHover label={artist} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Contenido Principal (Derecha) */}
      <div className="flex-1 h-full flex items-center justify-center bg-[#050505]">
        <h1 className="text-4xl md:text-6xl lg:text-8xl tracking-[0.2em] font-light text-white/5 select-none pointer-events-none">
          BITSZONE
        </h1>
      </div>

    </div>
  );
};
