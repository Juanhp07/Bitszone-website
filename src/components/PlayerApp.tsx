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
    <div className="flex h-screen w-full bg-white text-black font-inter overflow-hidden">
      
      {/* Lista de Artistas (Izquierda) */}
      <div className="w-1/3 max-w-md h-full flex flex-col justify-center px-12 border-r border-gray-100">
        <div className="flex flex-col gap-6 w-full max-w-[250px]">
          {loading ? (
            <p className="text-gray-400">Cargando artistas...</p>
          ) : (
            displayArtists.map((artist, i) => (
              <button 
                key={i}
                className="text-left text-2xl font-light text-gray-800 hover:text-black hover:translate-x-2 transition-all duration-300 w-full"
                style={{ fontFamily: '"DM Serif Display", serif' }}
              >
                {artist}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Contenido Principal (Derecha) */}
      <div className="flex-1 h-full flex items-center justify-center bg-[#fafafa]">
        <h1 
          className="text-4xl md:text-6xl tracking-[0.2em] font-light text-gray-300 select-none"
        >
          BITSZONE
        </h1>
      </div>

    </div>
  );
};
