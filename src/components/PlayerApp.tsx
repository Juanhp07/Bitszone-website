import React, { useRef, useState, useCallback, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Volume2, BookOpen, Play, Pause, SkipBack, SkipForward } from 'lucide-react';

// Lista de artistas falsos para rellenar
const DUMMY_ARTISTS = [
  "Michael Jackson",
  "The Weeknd",
  "Daft Punk",
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
      <a href={href} onClick={onClick} className="inline-block py-4 cursor-pointer hover:font-bold transition-all duration-150 hover:translate-x-3 hover:scale-[1.03] origin-left text-inherit">
        {label}
      </a>
    );
  }

  return (
    <a 
      href={href} 
      onClick={onClick} 
      draggable={false}
      className="group/link-hover inline-block py-4 no-underline cursor-pointer hover:translate-x-3 hover:scale-[1.03] origin-left transition-all duration-150 align-bottom text-inherit"
    >
      <span className="sr-only">{label}</span>
      <span aria-hidden="true" className="relative inline-block overflow-hidden align-middle leading-[1.08]">
        {[...label].map((char, index) => (
          <span
            key={index}
            className="relative inline-block whitespace-pre transition-transform duration-200 ease-[cubic-bezier(0.625,0.05,0,1)] group-hover/link-hover:-translate-y-[1.2em] group-focus-visible/link-hover:-translate-y-[1.2em]"
            style={{ textShadow: "0 1.2em currentColor", transitionDelay: `${index * charStagger}s` }}
          >
            {char === " " ? " " : char}
          </span>
        ))}
      </span>
    </a>
  );
}

// ==========================================
// OptionWheel Component (React Bits)
// ==========================================
type Side = 'left' | 'right';

export interface OptionWheelProps {
  items?: string[];
  defaultSelected?: number;
  onChange?: (index: number, item: string) => void;
  textColor?: string;
  activeColor?: string;
  side?: Side;
  fontSize?: number;
  spacing?: number;
  curve?: number;
  tilt?: number;
  blur?: number;
  fade?: number;
  minOpacity?: number;
  smoothing?: number;
  inset?: number;
  loop?: boolean;
  draggable?: boolean;
  className?: string;
  logoRef?: React.RefObject<HTMLElement>;
}

const OptionWheel: React.FC<OptionWheelProps> = ({
  items = [],
  defaultSelected = 0,
  onChange,
  textColor = '#ffffff',
  activeColor = '#ffffff',
  side = 'left',
  fontSize = 2,
  spacing = 1.2,
  curve = 1,
  tilt = 6,
  blur = 0,
  fade = 0.15,
  minOpacity = 0.1,
  smoothing = 20,
  inset = 120, 
  loop = false,
  draggable = true,
  className = '',
  logoRef
}) => {
  const [selectedIndex, setSelectedIndex] = useState(defaultSelected);
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef(defaultSelected);
  const posRef = useRef(defaultSelected);
  const lastRef = useRef(0);
  const dragRef = useRef<{ y: number; start: number; id: number } | null>(null);
  const dragMovedRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedRef = useRef(defaultSelected);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const cfgRef = useRef({
    items,
    count: items.length,
    rowH: fontSize * spacing * 16,
    curve,
    tilt,
    blur,
    fade,
    minOpacity,
    smoothing,
    side,
    loop,
    draggable,
    logoRef
  });

  useEffect(() => {
    cfgRef.current = {
      items,
      count: items.length,
      rowH: fontSize * spacing * 16,
      curve,
      tilt,
      blur,
      fade,
      minOpacity,
      smoothing,
      side,
      loop,
      draggable,
      logoRef
    };
  }, [items, fontSize, spacing, curve, tilt, blur, fade, minOpacity, smoothing, side, loop, draggable, logoRef]);

  const runFrame = useCallback((now: number) => {
    const rawDt = (now - lastRef.current) / 1000;
    const dt = Math.max(0, Math.min(rawDt, 0.05)); 
    lastRef.current = now;
    const cfg = cfgRef.current;
    const tau = Math.max(cfg.smoothing, 1) / 1000;
    const k = 1 - Math.exp(-dt / tau);
    const target = targetRef.current;
    const cur = posRef.current;
    let next = cur + (target - cur) * k;
    let settled = false;

    if (Math.abs(target - next) < 0.001) {
      next = target;
      settled = true;
    }
    posRef.current = next;

    if (cfg.logoRef?.current) {
      // El logo desaparece más lentamente a medida que nos alejamos de la posición inicial (0)
      const logoOpacity = Math.max(0, 1 - (Math.abs(next) / 2.5));
      cfg.logoRef.current.style.opacity = String(logoOpacity);
      cfg.logoRef.current.style.transform = `translateY(${Math.abs(next) * -8}px)`; // Sube un poco al desaparecer
    }

    const els = itemRefs.current;
    const n = cfg.count;
    const mirror = cfg.side === 'right' ? -1 : 1;
    const tiltRad = (cfg.tilt * Math.PI) / 180;
    const R = tiltRad > 0.0005 ? cfg.rowH / tiltRad : 0;

    for (let i = 0; i < n; i++) {
      const el = els[i];
      if (!el) continue;
      let d = i - next;
      if (cfg.loop && n > 1) {
        d = ((d % n) + n) % n;
        if (d > n / 2) d -= n;
      }
      const dist = Math.abs(d);
      let x = 0;
      let y = d * cfg.rowH;
      let rot = 0;
      if (R > 0) {
        const ang = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, d * tiltRad));
        y = R * Math.sin(ang);
        x = -mirror * R * (1 - Math.cos(ang)) * cfg.curve;
        rot = (mirror * ang * 180) / Math.PI;
      }
      el.style.transform = `translate(${x.toFixed(2)}px, calc(${y.toFixed(2)}px - 50%)) rotate(${rot.toFixed(3)}deg)`;
      el.style.setProperty('--ow-opacity', String(Math.max(cfg.minOpacity, 1 - dist * cfg.fade)));
      el.style.filter = cfg.blur > 0 ? `blur(${(dist * cfg.blur).toFixed(2)}px)` : 'none';
      
      const colorP = Math.pow(Math.max(0, 1 - Math.min(dist, 1)), 3);
      el.style.setProperty('--ow-p', colorP.toFixed(4));
    }

    rafRef.current = settled ? null : requestAnimationFrame(runFrame);
  }, []);

  const startLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
    }
    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(runFrame);
  }, [runFrame]);

  const applyTarget = useCallback(
    (value: number, snap: boolean) => {
      const cfg = cfgRef.current;
      let v = value;
      if (!cfg.loop) v = Math.min(Math.max(v, 0), Math.max(cfg.count - 1, 0));
      if (snap) v = Math.round(v);
      targetRef.current = v;
      const idx = ((Math.round(v) % cfg.count) + cfg.count) % cfg.count;
      if (idx !== selectedRef.current) {
        selectedRef.current = idx;
        setSelectedIndex(idx);
        onChangeRef.current?.(idx, cfg.items[idx]);
      }
      startLoop();
    },
    [startLoop]
  );

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const cfg = cfgRef.current;
      const delta = e.deltaMode === 1 ? e.deltaY * 24 : e.deltaY;
      const step = Math.max(-0.5, Math.min(0.5, delta / (cfg.rowH * 1.5))); // Más lento
      applyTarget(targetRef.current + step, false);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = setTimeout(() => applyTarget(targetRef.current, true), 140);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, [applyTarget]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!cfgRef.current.draggable) return;
    dragRef.current = { y: e.clientY, start: targetRef.current, id: e.pointerId };
    dragMovedRef.current = false;
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag) return;
      const dy = e.clientY - drag.y;
      if (!dragMovedRef.current && Math.abs(dy) > 4) {
        dragMovedRef.current = true;
        rootRef.current?.setPointerCapture(drag.id);
      }
      if (dragMovedRef.current) applyTarget(drag.start - dy / cfgRef.current.rowH, false);
    },
    [applyTarget]
  );

  const handlePointerEnd = useCallback(() => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setIsDragging(false);
    if (dragMovedRef.current) applyTarget(targetRef.current, true);
  }, [applyTarget]);

  const handleItemClick = useCallback(
    (index: number) => {
      if (dragMovedRef.current) return;
      const cfg = cfgRef.current;
      const cur = targetRef.current;
      let d = index - (((cur % cfg.count) + cfg.count) % cfg.count);
      if (cfg.loop && cfg.count > 1) {
        if (d > cfg.count / 2) d -= cfg.count;
        else if (d < -cfg.count / 2) d += cfg.count;
      }
      applyTarget(cur + d, true);
    },
    [applyTarget]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      let delta: number | null = null;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') delta = -1;
      else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') delta = 1;
      if (delta == null) return;
      e.preventDefault();
      applyTarget(Math.round(targetRef.current) + delta, true);
    },
    [applyTarget]
  );

  useEffect(() => {
    applyTarget(targetRef.current, false);
  }, [items, fontSize, spacing, curve, tilt, blur, fade, minOpacity, side, loop, smoothing, applyTarget]);

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    },
    []
  );

  return (
    <div
      ref={rootRef}
      role="listbox"
      tabIndex={0}
      aria-label="Option wheel"
      className={`relative h-full w-full select-none overflow-hidden outline-none [touch-action:none] ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} ${className}`}
      style={
        {
          '--ow-text-color': textColor,
          '--ow-active-color': activeColor,
          '--ow-font-size': `${fontSize}rem`,
          '--ow-inset': `${inset}px`
        } as React.CSSProperties
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onKeyDown={handleKeyDown}
    >
      {items.map((label, index) => (
        <div
          key={`${label}-${index}`}
          ref={el => {
            itemRefs.current[index] = el;
          }}
          role="option"
          aria-selected={selectedIndex === index}
          className={`group/item absolute top-1/2 cursor-pointer whitespace-nowrap leading-none will-change-[transform,opacity,filter] [font-size:var(--ow-font-size)] left-[var(--ow-inset)] origin-left transition-[color,font-weight,opacity] duration-150 ${
            selectedIndex === index 
              ? 'font-bold drop-shadow-[0_0_12px_rgba(147,51,234,0.6)] hover:!text-[#a855f7] hover:drop-shadow-[0_0_16px_rgba(168,85,247,1)]' 
              : 'font-light hover:!text-white hover:!opacity-100 hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]'
          }`}
          style={{
            color: 'color-mix(in srgb, var(--ow-active-color) calc(var(--ow-p, 0) * 100%), var(--ow-text-color))'
          }}
        >
          <NavLinkHover 
            label={label} 
            onClick={(e) => {
              e.preventDefault();
              handleItemClick(index);
            }} 
          />
        </div>
      ))}
    </div>
  );
};


export const PlayerApp = ({ supabaseUrl, supabaseAnonKey }: { supabaseUrl?: string, supabaseAnonKey?: string }) => {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const logoRef = useRef<HTMLHeadingElement>(null);

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
  
  // Combinar los de la DB con los falsos, filtrar y ordenar
  const sortedArtists = Array.from(new Set([...dbArtists, ...DUMMY_ARTISTS]))
    .filter(name => name !== 'Dua Lipa' && name !== 'Rosalía')
    .sort((a, b) => a.localeCompare(b));

  const displayArtists = [
    'ARTISTAS',
    ...sortedArtists
  ];

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

      {/* Rueda de Opciones (Sidebar Izquierdo) */}
      <div 
        className="w-[45%] min-w-[450px] max-w-[650px] h-full flex flex-col justify-start overflow-hidden z-10 bg-transparent relative"
        style={{
          maskImage: 'linear-gradient(to right, black 0%, black 80%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, black 0%, black 80%, transparent 100%)'
        }}
      >
        <h1 
          ref={logoRef}
          className="absolute top-12 left-[120px] text-3xl md:text-4xl tracking-[0.2em] font-bold select-none pointer-events-none animate-gradient-text text-transparent bg-clip-text z-20 will-change-[opacity,transform] transition-[opacity,transform] duration-75"
          style={{
            backgroundImage: 'linear-gradient(to right, #9333ea, #ffffff, #9333ea)',
          }}
        >
          BITSZONE
        </h1>

        {loading ? (
          <div className="h-full w-full flex flex-col justify-center px-12">
            {/* Vacio durante la carga */}
          </div>
        ) : (
          <OptionWheel 
            items={displayArtists} 
            textColor="#ffffff"
            activeColor="#9333ea"
            fontSize={3.2}
            spacing={1.3}
            curve={1}
            tilt={5}
            inset={120} 
            blur={0.8} 
            fade={0.25} 
            smoothing={20}
            logoRef={logoRef}
          />
        )}
      </div>

      {/* Contenido Principal (Derecha) */}
      <div className="flex-1 h-full flex items-center justify-center relative z-0">
        <div className="absolute inset-0 bg-noise opacity-[0.03] pointer-events-none mix-blend-overlay"></div>

        {/* Playback Controls (Poweramp Style + Liquid Glass) */}
        <div className="relative flex items-center justify-center w-[600px] h-80 -ml-[25%] z-20">
          
          {/* Waveform (barras gruesas, super redondeadas y degradado vertical) */}
          <div 
            className="absolute inset-0 flex items-center justify-between gap-[8px] pointer-events-none px-4"
            style={{
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)'
            }}
          >
            {Array.from({ length: 45 }).map((_, i) => {
              // Altura exagerada y orgánica
              const height = 30 + Math.abs(Math.sin(i * 0.4) * 60 + Math.cos(i * 0.9) * 20);
              const isPlayed = i < 18; // Progreso
              return (
                <div 
                  key={i} 
                  className={`flex-1 rounded-full transition-colors duration-300 ${
                    isPlayed 
                      ? 'bg-[#a855f7] drop-shadow-[0_0_16px_rgba(168,85,247,0.9)]' 
                      : 'bg-white/20'
                  }`} 
                  style={{ height: `${Math.min(100, height)}%` }} 
                />
              );
            })}
          </div>

          {/* Botones (Ultra Liquid Glass con blur en línea) */}
          <div className="flex items-center gap-8 z-10">
            <button 
              className="w-16 h-16 bg-white/[0.05] border border-white/20 rounded-full flex items-center justify-center hover:scale-105 hover:bg-white/10 hover:border-white/30 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              style={{ backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}
            >
              <SkipBack className="w-7 h-7 text-white" fill="currentColor" />
            </button>
            
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-28 h-28 bg-white/[0.05] border border-white/20 rounded-full flex items-center justify-center hover:scale-105 hover:bg-white/10 hover:border-white/30 transition-all shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
              style={{ backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}
            >
              {isPlaying ? (
                <Pause className="w-12 h-12 text-white" fill="currentColor" />
              ) : (
                <Play className="w-12 h-12 ml-2 text-white" fill="currentColor" />
              )}
            </button>

            <button 
              className="w-16 h-16 bg-white/[0.05] border border-white/20 rounded-full flex items-center justify-center hover:scale-105 hover:bg-white/10 hover:border-white/30 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
              style={{ backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}
            >
              <SkipForward className="w-7 h-7 text-white" fill="currentColor" />
            </button>
          </div>
        </div>

        {/* Controles Laterales Derechos */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 flex flex-col items-center gap-10 z-20">
          
          {/* Botón de Letras */}
          <button className="flex flex-col items-center gap-2 group text-white/50 hover:text-white transition-colors">
            <BookOpen className="w-5 h-5 group-hover:text-[#a855f7] transition-colors" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Letra</span>
          </button>

          {/* Control de Volumen */}
          <div className="flex flex-col items-center gap-4">
            <div className="h-32 w-1.5 bg-white/10 rounded-full relative overflow-hidden group cursor-pointer shadow-lg">
              {/* Nivel de volumen actual (ej. 60%) */}
              <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-[#9333ea] rounded-full group-hover:bg-[#a855f7] transition-colors" />
            </div>
            <button className="text-white/50 hover:text-white transition-colors group">
              <Volume2 className="w-5 h-5 group-hover:text-[#a855f7] transition-colors" />
            </button>
          </div>
          
        </div>
      </div>

    </div>
  );
};
