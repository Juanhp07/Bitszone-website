import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { Check, Cloud, CloudOff, Wifi, WifiOff, Download, Clock, AudioLines, HardDrive, Ghost } from 'lucide-react';
import { TiltCard } from './ui/tilt-card';

/*
 * Sección 3 — "Hay una función para eso."
 * Dock con dos categorías y tres cards por categoría. Cada card muestra primero una
 * mini interfaz viva del Web Player y su ícono; título y descripción aparecen al hacer
 * hover (en táctil se muestran siempre). Las animaciones internas solo corren mientras
 * la sección está en pantalla; la entrada de las cards está atada al scroll.
 */

const COVER = {
  meteora: 'https://is1-ssl.mzstatic.com/image/thumb/Features125/v4/dd/7d/72/dd7d7259-d27f-5b3e-ce64-9e304d2cb40f/dj.rxzrauer.jpg/500x500bb.jpg',
  thriller: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/32/4f/fd/324ffda2-9e51-8f6a-0c2d-c6fd2b41ac55/074643811224.jpg/500x500bb.jpg',
  calm: 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/04/31/61/0431617b-8479-58fe-3cc3-9fbfef175a71/20UMGIM06593.rgb.jpg/500x500bb.jpg',
  face: 'https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/d2/d8/d6/d2d8d6ad-85d4-7024-9726-e1f312beb522/603497889754.jpg/500x500bb.jpg',
  hollywood: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/6c/13/27/6c13279a-399b-2631-3cb2-6233a91d7a53/19UMGIM78325.rgb.jpg/500x500bb.jpg',
  ahora: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/ac/f9/f2/acf9f236-eae7-023a-120d-6c071797512d/cover.jpg/500x500bb.jpg',
  ws: 'https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/29/df/5c/29df5c2d-3dee-1e74-9a38-0740459035f6/25CRGIM48251.rgb.jpg/500x500bb.jpg',
};

/** Ticks a counter every `ms` while `live` is true. */
const useTicker = (live: boolean, ms: number) => {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setN(v => v + 1), ms);
    return () => clearInterval(id);
  }, [live, ms]);
  return n;
};

/* ------------------------------------------------------------------ */
/* Card shell                                                          */
/* ------------------------------------------------------------------ */

/**
 * A fixed card position. It never unmounts when the tab changes, so its scroll-linked
 * entrance (and the page layout) stays put; only the card inside cross-fades.
 */
const Slot = ({ index, progress, children }: { index: number; progress: MotionValue<number>; children: React.ReactNode }) => {
  const start = 0.04 + index * 0.06;
  const y = useTransform(progress, [start, start + 0.3], [140, 0]);
  const opacity = useTransform(progress, [start, start + 0.22], [0, 1]);
  const rotateX = useTransform(progress, [start, start + 0.3], [14, 0]);
  const scale = useTransform(progress, [start, start + 0.3], [0.94, 1]);

  return (
    <motion.div
      style={{ y, opacity, rotateX, scale, transformPerspective: 1200 }}
      className="relative h-[440px] lg:h-[480px] shrink-0 w-[82vw] max-w-[380px] sm:w-[56vw] lg:w-auto lg:max-w-none snap-center"
    >
      {children}
    </motion.div>
  );
};

const FeatureCard = ({
  icon, title, description, children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) => {
  return (
      <TiltCard
        effect="evade"
        scale={1.02}
        perspective={1200}
        tiltLimit={8}
        spotlight
        spotlightColor="rgba(192,132,252,0.2)"
        className="fx-card group w-full h-full rounded-[32px] cursor-pointer"
      >
        <div className="fx-icon-tile absolute top-6 left-6 z-20">{icon}</div>

        <div className="fx-visual absolute inset-0 z-10 flex items-center justify-center px-6 pt-16 pb-10">
          {children}
        </div>

        <div className="fx-scrim absolute inset-x-0 bottom-0 h-[55%] z-10 pointer-events-none" />
        <div className="fx-text absolute inset-x-0 bottom-0 z-20 px-7 pb-7">
          <h3 className="font-sora text-[20px] lg:text-[22px] font-semibold text-white tracking-tight">{title}</h3>
          <p className="mt-1.5 text-[14px] lg:text-[15px] leading-[1.6] text-[#a1a1aa] font-inter">{description}</p>
        </div>
      </TiltCard>
  );
};

/* ------------------------------------------------------------------ */
/* Live mini-UIs                                                       */
/* ------------------------------------------------------------------ */

/** Signal drops, the player flips to offline, the track never stops. */
const OfflineDemo = ({ live }: { live: boolean }) => {
  const t = useTicker(live, 2400);
  const phase = t % 3; // 0 wifi · 1 sin señal · 2 offline
  const status = [
    { label: 'Conectado por WiFi', icon: <Wifi size={13} />, cls: 'text-white/80 bg-white/[0.06]' },
    { label: 'Sin señal', icon: <WifiOff size={13} />, cls: 'text-[#fda4af] bg-[rgba(244,63,94,0.12)]' },
    { label: 'Modo offline activo', icon: <Check size={13} />, cls: 'text-[#f0abfc] bg-[rgba(217,70,239,0.14)]' },
  ][phase];

  return (
    <div className="w-full max-w-[460px]">
      <div className="flex justify-center mb-5">
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-semibold ring-1 ring-white/10 ${status.cls}`}
        >
          {status.icon}{status.label}
        </motion.div>
      </div>

      <div className="fx-panel p-4 flex items-center gap-4">
        <img src={COVER.meteora} alt="" className="w-[68px] h-[68px] rounded-[10px] object-cover shadow-[0_10px_24px_rgba(0,0,0,0.5)]" loading="lazy" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-white truncate">Somewhere I Belong</p>
              <p className="text-[12px] text-white/50 truncate">LINKIN PARK · Meteora</p>
            </div>
            <div className={`fx-eq ${live ? 'is-live' : ''}`} aria-hidden="true">
              <i /><i /><i /><i /><i />
            </div>
          </div>
          <div className="mt-3 h-[4px] rounded-full bg-white/10 overflow-hidden">
            <div className={`fx-progress h-full rounded-full ${live ? 'is-live' : ''}`} />
          </div>
          <div className="mt-1.5 flex justify-between text-[10.5px] text-white/40 font-jetbrains">
            <span>1:24</span><span>3:33</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Countdown pills + the real expiry toast the app shows. */
const LicensesDemo = ({ live }: { live: boolean }) => {
  const t = useTicker(live, 3200);
  const showToast = t % 2 === 1;
  const rows = [
    { cover: COVER.thriller, title: 'Billie Jean', artist: 'Michael Jackson', days: 28 },
    { cover: COVER.calm, title: 'Best Years', artist: '5 Seconds of Summer', days: 12 },
    { cover: COVER.ws, title: 'Here I Go Again', artist: 'Whitesnake', days: 3 },
  ];
  return (
    <div className="relative w-full max-w-[400px] mb-4">
      <div className="fx-panel p-2.5 space-y-1">
        {rows.map(r => {
          const pct = r.days / 30;
          const warn = r.days <= 3;
          return (
            <div key={r.title} className="flex items-center gap-3 rounded-[12px] px-2.5 py-1.5 hover:bg-white/[0.03] transition-colors">
              <img src={r.cover} alt="" className="w-9 h-9 rounded-[7px] object-cover" loading="lazy" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-white truncate">{r.title}</p>
                <p className="text-[11px] text-white/45 truncate">{r.artist}</p>
              </div>
              <div className="relative w-8 h-8 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                  <circle
                    cx="18" cy="18" r="15" fill="none" strokeWidth="3" strokeLinecap="round"
                    stroke={warn ? '#fbbf24' : '#c084fc'}
                    strokeDasharray={`${pct * 94.2} 94.2`}
                    className={warn && live ? 'fx-pulse' : ''}
                  />
                </svg>
                <span className={`absolute inset-0 grid place-items-center text-[10px] font-bold ${warn ? 'text-amber-300' : 'text-white/80'}`}>{r.days}d</span>
              </div>
            </div>
          );
        })}
      </div>

      <motion.div
        initial={false}
        animate={showToast ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 14, scale: 0.96 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-[4%] right-[4%] -bottom-6 flex items-center gap-2.5 rounded-[14px] px-3.5 py-2.5 bg-[rgba(24,16,36,0.92)] ring-1 ring-amber-300/25 shadow-[0_18px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl"
      >
        <Clock size={14} className="text-amber-300 shrink-0" />
        <span className="text-[12px] text-white/85 leading-snug">La licencia de 'Here I Go Again' expirará en 3 días</span>
      </motion.div>
    </div>
  );
};

/** A live spectrum — original-quality audio. */
const FidelityDemo = ({ live }: { live: boolean }) => (
  <div className="w-full max-w-[340px]">
    <div className={`fx-spectrum ${live ? 'is-live' : ''}`} aria-hidden="true">
      {Array.from({ length: 28 }, (_, i) => (
        <i key={i} style={{ animationDelay: `${-((i * 137) % 900) / 1000}s`, animationDuration: `${0.7 + ((i * 53) % 60) / 100}s` }} />
      ))}
    </div>
    <div className="mt-4 flex items-center justify-center gap-2">
      <span className="fx-tag">Calidad original</span>
      <span className="fx-tag">Sin recompresión</span>
    </div>
  </div>
);

/** Which tracks are really on the device and which are still in the cloud. */
const GhostDemo = ({ live }: { live: boolean }) => {
  const rows = [
    { title: 'In the Air Tonight', ok: true },
    { title: 'Brujería', ok: false },
    { title: "Hollywood's Bleeding", ok: true },
    { title: 'Persona Ideal', ok: false },
  ];
  return (
    <div className="relative w-full max-w-[320px] fx-panel p-2 overflow-hidden">
      <div className={`fx-scan ${live ? 'is-live' : ''}`} />
      {rows.map(r => (
        <div
          key={r.title}
          className={`flex items-center justify-between gap-3 rounded-[10px] px-3 py-2.5 ${r.ok ? '' : 'opacity-45 [outline:1px_dashed_rgba(255,255,255,0.14)] -outline-offset-2'}`}
        >
          <span className="text-[13px] text-white font-medium truncate">{r.title}</span>
          {r.ok
            ? <span className="flex items-center gap-1 text-[10.5px] font-semibold text-[#e9d5ff]"><Check size={12} />Offline</span>
            : <span className="flex items-center gap-1 text-[10.5px] font-semibold text-white/60"><Cloud size={12} />Nube</span>}
        </div>
      ))}
    </div>
  );
};

/** Background queue — whole albums downloading one after another. */
const QueueDemo = ({ live }: { live: boolean }) => {
  const t = useTicker(live, 70);
  const items = [
    { cover: COVER.face, title: 'Face Value', tracks: 12, speed: 1.6 },
    { cover: COVER.hollywood, title: "Hollywood's Bleeding", tracks: 17, speed: 1.1 },
    { cover: COVER.ahora, title: 'Ahora Más Que Nunca', tracks: 10, speed: 0.8 },
  ];
  const cycle = 160; // ticks per full loop
  const step = t % cycle;
  return (
    <div className="w-full max-w-[340px] fx-panel p-2.5 space-y-1">
      {items.map((it, i) => {
        const raw = Math.max(0, step - i * 18) * it.speed;
        const pct = Math.min(100, Math.round(raw));
        const done = pct >= 100;
        return (
          <div key={it.title} className="flex items-center gap-3 rounded-[12px] px-2 py-2">
            <img src={it.cover} alt="" className="w-10 h-10 rounded-[8px] object-cover" loading="lazy" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12.5px] font-semibold text-white truncate">{it.title} <span className="font-normal text-white/35">· {it.tracks}</span></p>
                <span className={`text-[10.5px] font-jetbrains ${done ? 'text-[#e9d5ff]' : 'text-white/45'}`}>
                  {done ? <Check size={13} /> : `${pct}%`}
                </span>
              </div>
              <div className="mt-1.5 h-[3px] rounded-full bg-white/10 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[#7c3aed] to-[#FF9FFC] transition-[width] duration-100 ease-linear" style={{ width: `${pct}%` }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Storage gauge split by genre. */
const StorageDemo = ({ live }: { live: boolean }) => {
  const segs = [
    { label: 'Rock', gb: 1.42, color: '#a855f7' },
    { label: 'Salsa', gb: 0.94, color: '#FF9FFC' },
    { label: 'Pop', gb: 0.61, color: '#6366f1' },
    { label: 'Otros', gb: 0.27, color: '#94a3b8' },
  ];
  const total = 5;
  const used = segs.reduce((a, s) => a + s.gb, 0);
  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-3">
        <p className="font-sora text-[28px] lg:text-[34px] font-bold text-white leading-none">
          {used.toFixed(2)}GB <span className="text-[14px] font-inter font-medium text-white/40">de {total.toFixed(2)}GB</span>
        </p>
        <span className="text-[12px] text-white/45 hidden sm:block">{(total - used).toFixed(2)}GB libres</span>
      </div>
      <div className="flex h-[12px] w-full gap-[3px] rounded-full overflow-hidden bg-white/[0.06]">
        {segs.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ width: 0 }}
            animate={{ width: live ? `${(s.gb / total) * 100}%` : 0 }}
            transition={{ duration: 1.1, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            style={{ background: s.color }}
            className="h-full first:rounded-l-full"
          />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        {segs.map(s => (
          <span key={s.label} className="flex items-center gap-2 text-[12px] text-white/60">
            <i className="w-2 h-2 rounded-full" style={{ background: s.color }} />
            {s.label} <span className="text-white/35 font-jetbrains">{s.gb.toFixed(2)}GB</span>
          </span>
        ))}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

const categories = ['Reproducción', 'Descargas'] as const;
type Category = typeof categories[number];
const categoryLabels: Record<Category, string> = {
  'Reproducción': 'Reproducción',
  'Descargas': 'Descargas y Espacio',
};

const cardsFor = (cat: Category, live: boolean) => cat === 'Reproducción'
  ? [
      { key: 'r1', icon: <CloudOff />, title: 'Cero cortes', description: 'Si pierdes la señal, Bitszone pasa solo a modo offline. La canción sigue exactamente donde iba.', visual: <OfflineDemo live={live} /> },
      { key: 'r2', icon: <AudioLines />, title: 'Alta fidelidad', description: 'Tus pistas offline conservan el archivo original, sin compresión extra.', visual: <FidelityDemo live={live} /> },
      { key: 'r3', icon: <Ghost />, title: 'Archivos fantasma', description: 'Distingue de un vistazo lo que está en tu equipo de lo que sigue en la nube.', visual: <GhostDemo live={live} /> },
    ]
  : [
      { key: 'd1', icon: <Clock />, title: 'Licencias vigentes', description: 'Cada descarga dura 30 días. Te avisamos antes de que expire para que nunca te quedes sin tu música.', visual: <LicensesDemo live={live} /> },
      { key: 'd2', icon: <Download />, title: 'Cola de descargas', description: 'Encola álbumes completos y se descargan en segundo plano mientras escuchas.', visual: <QueueDemo live={live} /> },
      { key: 'd3', icon: <HardDrive />, title: 'Control de espacio', description: 'Mira cuánto ocupa tu biblioteca por género y libera espacio cuando lo necesites.', visual: <StorageDemo live={live} /> },
    ];

export const ProblemSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const live = useInView(sectionRef, { amount: 0.15 });
  const [activeTab, setActiveTab] = useState<Category>(categories[0]);
  const [direction, setDirection] = useState(0);

  // Header + dock: same "fly through space" language as the rest of the landing.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start 95%', 'end 5%'] });
  const headerY = useTransform(scrollYProgress, [0, 0.3, 0.75, 1], [140, 0, 0, -260]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.22, 0.8, 1], [0, 1, 1, 0]);
  const headerScale = useTransform(scrollYProgress, [0, 0.3], [0.7, 1]);
  const dockY = useTransform(scrollYProgress, [0.05, 0.4, 0.75, 1], [200, 0, 0, -220]);
  const dockOpacity = useTransform(scrollYProgress, [0.05, 0.32, 0.8, 1], [0, 1, 1, 0]);
  const dockScale = useTransform(scrollYProgress, [0.05, 0.4], [0.6, 1]);
  const gridExitY = useTransform(scrollYProgress, [0.8, 1], [0, -160]);
  const gridExitOpacity = useTransform(scrollYProgress, [0.82, 1], [1, 0]);

  // Card entrance: scrubbed by the grid's own travel through the viewport.
  const { scrollYProgress: gridProgress } = useScroll({ target: gridRef, offset: ['start end', 'center center'] });

  const handleTabChange = (tab: Category) => {
    if (tab === activeTab) return;
    setDirection(categories.indexOf(tab) > categories.indexOf(activeTab) ? 1 : -1);
    setActiveTab(tab);
    trackRef.current?.scrollTo({ left: 0, behavior: 'smooth' }); // phones: back to the first card
  };

  // Old and new cards overlap inside the same slot, so this is a true cross-fade.
  const slide = {
    enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0, filter: 'blur(6px)' }),
    center: { x: 0, opacity: 1, filter: 'blur(0px)' },
    exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0, filter: 'blur(6px)', transition: { duration: 0.22 } }),
  };

  return (
    <section ref={sectionRef} className="py-32 md:py-48 w-full max-w-[1280px] mx-auto relative z-10 flex flex-col items-center px-[20px] md:px-[48px]">
      <style>{CSS}</style>

      <motion.div style={{ y: headerY, opacity: headerOpacity, scale: headerScale }} className="text-center w-full max-w-[1100px] mx-auto mb-14">
        <h2 className="text-[1.75rem] sm:text-4xl md:text-5xl lg:text-6xl font-sora font-bold text-white leading-[1.2] text-center flex flex-col md:inline-block items-center justify-center">
          <span>Hay una función para eso.</span>
          <br className="hidden md:block" />
          <span className="inline-flex items-center flex-wrap justify-center mt-2 md:mt-0">
            <span className="mr-3">Controla tu</span>
            <span className="text-scroller">
              <span className="scroller-inner">
                <span className="scroller-word text-transparent bg-clip-text bg-gradient-to-r from-[#d8b4fe] to-[#a855f7]">biblioteca offline.</span>
                <span className="scroller-word text-transparent bg-clip-text bg-gradient-to-r from-[#d8b4fe] to-[#a855f7]">experiencia sonora.</span>
                <span className="scroller-word text-transparent bg-clip-text bg-gradient-to-r from-[#d8b4fe] to-[#a855f7]">colección musical.</span>
                <span className="scroller-word text-transparent bg-clip-text bg-gradient-to-r from-[#d8b4fe] to-[#a855f7]">gestión de pistas.</span>
                <span className="scroller-word text-transparent bg-clip-text bg-gradient-to-r from-[#d8b4fe] to-[#a855f7]">biblioteca offline.</span>
              </span>
            </span>
          </span>
        </h2>
      </motion.div>

      {/* Dock — segmented control con píldora líquida */}
      <motion.div
        style={{ y: dockY, opacity: dockOpacity, scale: dockScale }}
        className="flex items-center gap-1.5 py-1.5 px-1.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(255,255,255,0.03)] bg-[rgba(10,0,20,0.3)] backdrop-blur-[20px] mb-14"
      >
        {categories.map(cat => {
          const isActive = activeTab === cat;
          return (
            <button
              key={cat}
              onClick={() => handleTabChange(cat)}
              className={`relative cursor-pointer text-[13px] sm:text-[14px] md:text-[15px] font-semibold px-[16px] sm:px-8 py-2.5 min-w-0 sm:min-w-[110px] md:min-w-[160px] rounded-full whitespace-nowrap transition-colors duration-300 ${isActive ? 'text-white' : 'text-[#8b8d98] hover:text-[#e0e0e0]'}`}
            >
              <span className="relative z-10">{categoryLabels[cat]}</span>
              {isActive && (
                <motion.div
                  layoutId="liquid-pill"
                  className="absolute inset-0 w-full h-full rounded-full -z-10 bg-gradient-to-b from-[rgba(168,85,247,0.15)] to-transparent backdrop-blur-[12px] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.4)]"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 400, damping: 30, mass: 0.8 }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-t-full bg-[#a855f7] shadow-[0_0_8px_rgba(168,85,247,0.8)]">
                    <div className="absolute w-12 h-6 rounded-full blur-md -top-2 -left-2 bg-[rgba(168,85,247,0.4)]" />
                    <div className="absolute w-8 h-6 rounded-full blur-md -top-1 bg-[rgba(168,85,247,0.4)]" />
                    <div className="absolute w-4 h-4 rounded-full blur-sm top-0 left-2 bg-[rgba(168,85,247,0.4)]" />
                  </div>
                </motion.div>
              )}
            </button>
          );
        })}
      </motion.div>

      {/* The track and its three slots are permanent: switching tabs only cross-fades the
          card inside each slot, so nothing resizes or re-runs the scroll entrance. */}
      <motion.div ref={gridRef} style={{ y: gridExitY, opacity: gridExitOpacity }} className="w-full">
        <div
          ref={trackRef}
          className="fx-track flex lg:grid lg:grid-cols-3 gap-4 lg:gap-6 w-auto lg:w-full overflow-x-auto overflow-y-hidden lg:overflow-visible snap-x snap-mandatory -mx-[20px] px-[20px] md:-mx-[48px] md:px-[48px] lg:mx-0 lg:px-0 pb-2 lg:pb-0"
        >
          {cardsFor(activeTab, live).map((c, i) => (
            <Slot key={i} index={i} progress={gridProgress}>
              <AnimatePresence custom={direction} initial={false}>
                <motion.div
                  key={c.key}
                  custom={direction}
                  variants={slide}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                  className="absolute inset-0"
                >
                  <FeatureCard icon={c.icon} title={c.title} description={c.description}>
                    {c.visual}
                  </FeatureCard>
                </motion.div>
              </AnimatePresence>
            </Slot>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

const CSS = `
/* Bootstrap's reboot gives every <p> a 16px bottom margin */
.fx-card p{margin-bottom:0}
.fx-card{
  background:
    radial-gradient(circle at 50% 120%,rgba(168,85,247,0.22),transparent 70%),
    linear-gradient(180deg,rgba(255,255,255,0.04),rgba(10,5,20,0.15) 30%,rgba(10,5,20,0.4));
  -webkit-backdrop-filter:blur(32px);backdrop-filter:blur(32px);
}
.fx-icon-tile{display:grid;place-items:center;width:48px;height:48px;border-radius:14px;padding:4px;color:#fff;
  background:rgba(255,255,255,0.04);box-shadow:inset 0 0 0 1px rgba(168,85,247,0.5)}
.fx-icon-tile svg{width:100%;height:100%;padding:9px;border-radius:10px;
  background:linear-gradient(180deg,rgba(168,85,247,0.3),rgba(168,85,247,0.1));
  filter:drop-shadow(0 2px 4px rgba(0,0,0,0.4))}
.fx-visual{transition:transform .6s cubic-bezier(.22,1,.36,1)}
.fx-scrim{opacity:0;transition:opacity .5s;
  background:linear-gradient(180deg,transparent,rgba(9,4,18,0.85) 45%,rgba(9,4,18,0.96))}
.fx-text{opacity:0;transform:translateY(22px);
  transition:opacity .5s cubic-bezier(.22,1,.36,1),transform .6s cubic-bezier(.22,1,.36,1)}
.group:hover .fx-visual{transform:translateY(-58px) scale(.92)}
.group:hover .fx-scrim{opacity:1}
.group:hover .fx-text{opacity:1;transform:none}
/* below lg the cards become a swipeable row */
.fx-track{scrollbar-width:none;-webkit-overflow-scrolling:touch}
.fx-track::-webkit-scrollbar{display:none}
/* touch devices have no hover: show the copy and keep the visual clear of it */
@media (hover:none){
  .fx-visual{transform:translateY(-58px) scale(.92)}
  .fx-scrim,.fx-text{opacity:1;transform:none}
}
.fx-panel{border-radius:18px;background:linear-gradient(180deg,rgba(32,16,51,0.85),rgba(14,9,24,0.9));
  box-shadow:inset 0 0 0 1px rgba(255,255,255,0.07),0 20px 40px -20px rgba(0,0,0,0.8)}
.fx-tag{font-size:11px;font-weight:600;color:rgba(255,255,255,0.7);padding:5px 10px;border-radius:999px;
  background:rgba(255,255,255,0.05);box-shadow:inset 0 0 0 1px rgba(255,255,255,0.08)}

/* now-playing equaliser */
.fx-eq{display:flex;align-items:flex-end;gap:2px;height:16px}
.fx-eq i{width:3px;height:30%;border-radius:2px;background:#e9d5ff}
.fx-eq.is-live i{animation:fx-eq .9s ease-in-out infinite}
.fx-eq i:nth-child(2){animation-delay:-.3s}.fx-eq i:nth-child(3){animation-delay:-.6s}
.fx-eq i:nth-child(4){animation-delay:-.15s}.fx-eq i:nth-child(5){animation-delay:-.45s}
@keyframes fx-eq{0%,100%{height:25%}50%{height:100%}}

.fx-progress{width:38%;background:linear-gradient(90deg,#7c3aed,#FF9FFC)}
.fx-progress.is-live{animation:fx-progress 14s linear infinite}
@keyframes fx-progress{from{width:38%}to{width:92%}}

/* spectrum */
.fx-spectrum{display:flex;align-items:center;justify-content:center;gap:4px;height:120px}
.fx-spectrum i{flex:1;max-width:7px;height:20%;border-radius:4px;
  background:linear-gradient(180deg,#FF9FFC,#a855f7 60%,#4c1d95)}
.fx-spectrum.is-live i{animation-name:fx-bar;animation-iteration-count:infinite;animation-timing-function:ease-in-out;animation-direction:alternate}
@keyframes fx-bar{0%{height:14%}35%{height:72%}70%{height:38%}100%{height:92%}}

/* ghost-file scan line */
.fx-scan{position:absolute;left:0;right:0;height:40px;top:-40px;pointer-events:none;
  background:linear-gradient(180deg,transparent,rgba(216,180,254,0.12),transparent)}
.fx-scan.is-live{animation:fx-scan 3.2s cubic-bezier(.45,0,.55,1) infinite}
@keyframes fx-scan{0%{top:-40px}70%,100%{top:100%}}

.fx-pulse{animation:fx-pulse 1.6s ease-in-out infinite}
@keyframes fx-pulse{0%,100%{opacity:1}50%{opacity:.35}}

@media (prefers-reduced-motion:reduce){
  .fx-eq i,.fx-progress,.fx-spectrum i,.fx-scan,.fx-pulse{animation:none!important}
  .fx-visual,.fx-text,.fx-scrim{transition:none}
}
`;
