import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';

type Side = 'left' | 'right';

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

/* Animación de split-character */
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
      <a href={href} onClick={onClick} className="inline-block py-4 cursor-pointer transition-all duration-300 truncate max-w-full hover:translate-x-3 hover:scale-[1.03] origin-left text-inherit">
        {label}
      </a>
    );
  }

  return (
    <a 
      href={href} 
      onClick={onClick} 
      draggable={false}
      className="group/link-hover inline-block py-4 no-underline cursor-pointer hover:translate-x-3 hover:scale-[1.03] origin-left transition-all duration-300 max-w-full truncate align-bottom text-inherit"
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

interface WheelConfig {
  count: number;
  items: string[];
  rowH: number;
  curve: number;
  tilt: number;
  blur: number;
  fade: number;
  minOpacity: number;
  side: Side;
  loop: boolean;
  smoothing: number;
  draggable: boolean;
}

const OptionWheel = ({
  items = DUMMY_ARTISTS,
  defaultSelected = 0,
  onChange,
  textColor = '#a6a6a6',
  activeColor = '#ffffff',
  side = 'left' as Side,
  fontSize = 3,
  spacing = 1.4,
  curve = 1.2,
  tilt = 5,
  blur = 2,
  fade = 0.15,
  minOpacity = 0.05,
  smoothing = 200,
  inset = 80,
  loop = false,
  draggable = true,
  className = ''
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const posRef = useRef(defaultSelected);
  const targetRef = useRef(defaultSelected);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);
  const cfgRef = useRef<WheelConfig>({} as WheelConfig);
  const onChangeRef = useRef(onChange);
  const selectedRef = useRef(defaultSelected);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragRef = useRef<{ y: number; start: number; id: number } | null>(null);
  const dragMovedRef = useRef(false);
  const [selectedIndex, setSelectedIndex] = useState(defaultSelected);
  const [isDragging, setIsDragging] = useState(false);

  const remPx = typeof window !== 'undefined' ? parseFloat(getComputedStyle(document.documentElement).fontSize) || 16 : 16;

  onChangeRef.current = onChange;
  cfgRef.current = {
    count: items.length,
    items,
    rowH: Math.max(fontSize * spacing * remPx, 1),
    curve,
    tilt,
    blur,
    fade,
    minOpacity,
    side,
    loop,
    smoothing,
    draggable
  };

  const runFrame = useCallback((now: number) => {
    const dt = Math.min((now - lastRef.current) / 1000, 0.05);
    lastRef.current = now;
    const cfg = cfgRef.current;
    const tau = Math.max(cfg.smoothing, 1) / 1000;
    const k = 1 - Math.exp(-dt / tau);

    const target = targetRef.current;
    const cur = posRef.current;
    let next = cur + (target - cur) * k;
    const settled = Math.abs(target - next) < 0.001;
    if (settled) next = target;
    posRef.current = next;

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
      el.style.opacity = String(Math.max(cfg.minOpacity, 1 - dist * cfg.fade));
      el.style.filter = cfg.blur > 0 ? `blur(${(dist * cfg.blur).toFixed(2)}px)` : 'none';
      el.style.setProperty('--ow-p', Math.max(0, 1 - Math.min(dist, 1)).toFixed(4));
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
      const step = Math.max(-1, Math.min(1, delta / cfg.rowH));
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
          // Restaurado a top-1/2 como estaba antes (la rueda perfecta en el centro)
          className={`absolute top-1/2 cursor-pointer whitespace-nowrap leading-none will-change-[transform,opacity,filter] [font-size:var(--ow-font-size)] [color:color-mix(in_srgb,var(--ow-active-color)_calc(var(--ow-p,0)*100%),var(--ow-text-color))] left-[var(--ow-inset)] origin-left transition-all duration-300 ${
            selectedIndex === index ? 'font-bold drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]' : 'font-light'
          }`}
        >
          {/* Se usa el NavLinkHover aquí para mantener la animación de letras */}
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
    <div className="flex h-screen w-full bg-[#050505] text-white font-inter overflow-hidden relative">
      
      {/* Estilos en línea para la animación del título y del fondo (cargando y cargado) */}
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

      {/* Fondo circular desenfocado con origen en el borde izquierdo (left-[-600px] centra el circulo en el borde lateral) */}
      <div 
        className={`absolute top-1/2 left-[-600px] w-[1200px] h-[1200px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none z-0 ${loading ? 'loading-glow' : 'loaded-glow'}`}
      />

      {/* Lista de Artistas (Izquierda) */}
      <div className="w-[45%] min-w-[450px] max-w-[650px] h-full flex flex-col justify-start overflow-hidden z-10 bg-transparent">
        {loading ? (
          <div className="h-full w-full flex flex-col justify-center px-12">
            {/* Texto eliminado por solicitud del usuario (se reemplaza por la bolita brillante) */}
          </div>
        ) : (
          <OptionWheel 
            items={displayArtists} 
            fontSize={3.2} // Ajusta el tamaño de los artistas
            spacing={1.3}  // Espaciado vertical
            curve={1}      // Qué tanto se curvan
            tilt={5}       // Ángulo de inclinación del wheel
            inset={60}     // Padding desde la izquierda
            blur={0}       // Quitar el blur que rompía la legibilidad al hacer scroll
          />
        )}
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
