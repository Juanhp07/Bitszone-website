import React, { useState, useRef } from 'react';
import { 
  FileWarning, HardDrive, 
  Speaker, WifiOff, Tags, Trash2, DownloadCloud, ShieldCheck, Wifi, Cloud
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { TiltCard } from './ui/tilt-card';

// Datos estilo Raycast
const categories = ["Reproducción", "Descargas"];
const categoryLabels = {
  "Reproducción": "Reproducción",
  "Descargas": "Descargas y Espacio"
};

const LargeWifiOff = ({ className, strokeWidth = 1 }: { className?: string, strokeWidth?: number }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 20h.01" strokeWidth={strokeWidth} />
    <path d="M8.5 16.429a5 5 0 0 1 7 0" strokeWidth={strokeWidth} />
    <path d="M5 12.859a10 10 0 0 1 14 0" strokeWidth={strokeWidth} />
    <path d="M2 8.82a15 15 0 0 1 20 0" strokeWidth={strokeWidth} />
    <line x1="2" y1="2" x2="22" y2="22" strokeWidth={strokeWidth * 2} className="drop-shadow-lg" />
  </svg>
);


// Global Keyframes para animaciones de SVG complejas
const IconStyles = () => (
  <style dangerouslySetInnerHTML={{__html: `
    .group:hover .animate-drop-arrow {
      animation: dropArrow 1.2s ease-in-out infinite;
    }
    @keyframes dropArrow {
      0% { transform: translateY(0); opacity: 1; }
      30% { transform: translateY(8px); opacity: 0; }
      31% { transform: translateY(-8px); opacity: 0; }
      50% { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(0); opacity: 1; }
    }
    
    .wifi-arc { opacity: 1; }
    .group:hover .wifi-arc-1 { animation: wifiReveal 0.4s ease-out forwards; animation-delay: 0s; opacity: 0; }
    .group:hover .wifi-arc-2 { animation: wifiReveal 0.4s ease-out forwards; animation-delay: 0.15s; opacity: 0; }
    .group:hover .wifi-arc-3 { animation: wifiReveal 0.4s ease-out forwards; animation-delay: 0.3s; opacity: 0; }
    .group:hover .wifi-arc-4 { animation: wifiReveal 0.4s ease-out forwards; animation-delay: 0.45s; opacity: 0; }
    .wifi-slash { opacity: 1; }
    .group:hover .wifi-slash { animation: slashReveal 0.8s ease-out forwards; animation-delay: 0.6s; opacity: 0; }

    @keyframes wifiReveal {
      0% { opacity: 0; transform: translateY(4px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    @keyframes slashReveal {
      0% { stroke-dasharray: 50; stroke-dashoffset: 50; opacity: 1; }
      100% { stroke-dasharray: 50; stroke-dashoffset: 0; opacity: 1; }
    }
  `}} />
);

// Custom Animated Icons with line-drawing and transforms
const AnimatedCloudOff = () => (
  <div className="relative w-5 h-5 flex items-center justify-center">
    <Cloud size={20} strokeWidth={2.5} className="text-white drop-shadow-md" />
    <svg width="20" height="20" viewBox="0 0 24 24" className="absolute inset-0 pointer-events-none" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="2" x2="22" y2="22" className="[stroke-dasharray:30] [stroke-dashoffset:30] group-hover:[stroke-dashoffset:0] transition-all duration-500 ease-out" />
    </svg>
  </div>
);

const AnimatedSpeaker = () => (
  <div className="relative w-5 h-5 flex items-center justify-center">
    <Speaker size={20} strokeWidth={2.5} className="text-white group-hover:scale-110 drop-shadow-md transition-transform duration-300" />
    <div className="absolute -right-1 top-1 w-1.5 h-1.5 rounded-full bg-white opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
  </div>
);

const AnimatedWifiOff = () => (
  <div className="relative w-5 h-5 flex items-center justify-center">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md">
      <path d="M12 20h.01" className="wifi-arc wifi-arc-1" />
      <path d="M8.5 16.429a5 5 0 0 1 7 0" className="wifi-arc wifi-arc-2" />
      <path d="M5 12.859a10 10 0 0 1 14 0" className="wifi-arc wifi-arc-3" />
      <path d="M2 8.82a15 15 0 0 1 20 0" className="wifi-arc wifi-arc-4" />
      <line x1="2" y1="2" x2="22" y2="22" className="wifi-slash" />
    </svg>
  </div>
);

const AnimatedHardDrive = () => (
  <div className="relative w-5 h-5 flex items-center justify-center">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md">
      <path d="M22 12H2" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
      <path d="M6 16h.01" className="group-hover:opacity-0 transition-opacity duration-300" />
      <path d="M10 16h.01" className="group-hover:opacity-0 transition-opacity duration-300" />
      <circle cx="6" cy="16" r="1" fill="white" stroke="none" className="opacity-0 group-hover:opacity-100 group-hover:animate-ping" />
    </svg>
  </div>
);

const AnimatedTags = () => (
  <div className="relative w-5 h-5 flex items-center justify-center">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md group-hover:rotate-12 transition-transform duration-300">
      <path d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l8-8c.94-.94.94-2.48 0-3.42L12.4 2.56a2 2 0 0 0-1.41-.56z" className="[stroke-dasharray:60] [stroke-dashoffset:60] group-hover:[stroke-dashoffset:0] transition-all duration-700 ease-out" />
      <path d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l8-8c.94-.94.94-2.48 0-3.42L12.4 2.56a2 2 0 0 0-1.41-.56z" className="opacity-30 group-hover:opacity-0" />
      <circle cx="6.5" cy="9.5" r="1.5" className="fill-white" />
    </svg>
  </div>
);

const AnimatedTrash = () => (
  <div className="relative w-5 h-5 flex items-center justify-center">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md">
      <g className="origin-[18px_6px] group-hover:rotate-[15deg] group-hover:-translate-y-1 transition-all duration-500 ease-out">
        <path d="M3 6h18" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      </g>
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  </div>
);

const AnimatedClock = () => (
  <div className="relative w-5 h-5 flex items-center justify-center">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" className="group-hover:rotate-[360deg] transition-transform duration-1000 origin-[12px_12px]" />
    </svg>
  </div>
);

const AnimatedDownload = () => (
  <div className="relative w-5 h-5 flex items-center justify-center">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md">
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <g className="animate-drop-arrow">
        <path d="M12 12v9" />
        <path d="m8 17 4 4 4-4" />
      </g>
    </svg>
  </div>
);

const AnimatedWifi = () => (
  <div className="relative w-5 h-5 flex items-center justify-center">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-md">
      <path d="M12 20h.01" className="wifi-arc wifi-arc-1" />
      <path d="M8.5 16.429a5 5 0 0 1 7 0" className="wifi-arc wifi-arc-2" />
      <path d="M5 12.859a10 10 0 0 1 14 0" className="wifi-arc wifi-arc-3" />
      <path d="M2 8.82a15 15 0 0 1 20 0" className="wifi-arc wifi-arc-4" />
    </svg>
  </div>
);

const benefitsData = {
  "Reproducción": [
    {
      id: "r1",
      title: "Archivos Fantasma",
      description: "Visualiza al instante qué pistas están listas para escucharse offline y cuáles siguen en la nube.",
      icon: <AnimatedCloudOff />,
      gradient: "from-purple-500/30 to-purple-500/10",
      border: "rgba(168,85,247,0.5)",
      glowColor: "radial-gradient(circle at 50% 120%, rgba(168,85,247,0.25) 0%, transparent 70%)",
      visual: (
        <div className="relative flex items-center justify-center">
          <FileWarning size={110} className="text-purple-500/30 absolute blur-[8px]" />
          <FileWarning size={110} strokeWidth={1} className="text-purple-400/80 drop-shadow-[0_0_30px_rgba(168,85,247,0.6)]" />
        </div>
      )
    },
    {
      id: "r2",
      title: "Alta Fidelidad",
      description: "Disfruta de audio sin compresión incluso sin conexión. Tus pistas mantienen el formato original.",
      icon: <AnimatedSpeaker />,
      gradient: "from-blue-500/30 to-blue-500/10",
      border: "rgba(59,130,246,0.5)",
      glowColor: "radial-gradient(circle at 50% 120%, rgba(59,130,246,0.25) 0%, transparent 70%)",
      visual: (
        <div className="relative flex items-center justify-center">
          <Speaker size={110} className="text-blue-500/30 absolute blur-[8px]" />
          <Speaker size={110} strokeWidth={1} className="text-blue-400/80 drop-shadow-[0_0_30px_rgba(59,130,246,0.6)]" />
        </div>
      )
    },
    {
      id: "r3",
      title: "Cero Cortes",
      description: "Transición automática al modo offline cuando pierdes la señal. La música nunca se detiene.",
      icon: <AnimatedWifiOff />,
      gradient: "from-green-500/30 to-green-500/10",
      border: "rgba(34,197,94,0.5)",
      glowColor: "radial-gradient(circle at 50% 120%, rgba(34,197,94,0.25) 0%, transparent 70%)",
      visual: (
        <div className="relative flex flex-col items-center justify-center">
          <LargeWifiOff className="w-[110px] h-[110px] text-green-500/30 absolute blur-[8px]" strokeWidth={1} />
          <LargeWifiOff className="w-[110px] h-[110px] text-green-400/80 drop-shadow-[0_0_30px_rgba(34,197,94,0.6)]" strokeWidth={1} />
        </div>
      )
    }
  ],
  "Descargas": [
    {
      id: "d1",
      title: "Licencias Vigentes",
      description: "Recibe notificaciones antes de que expiren tus descargas para mantener tu música activa.",
      icon: <AnimatedClock />,
      gradient: "from-emerald-500/30 to-emerald-500/10",
      border: "rgba(16,185,129,0.5)",
      glowColor: "radial-gradient(circle at 50% 120%, rgba(16,185,129,0.25) 0%, transparent 70%)",
      visual: (
        <div className="relative flex items-center justify-center">
           <ShieldCheck size={110} className="text-emerald-500/30 absolute blur-[8px]" />
           <ShieldCheck size={110} strokeWidth={1} className="text-emerald-400/80 drop-shadow-[0_0_30px_rgba(16,185,129,0.6)]" />
        </div>
      )
    },
    {
      id: "d2",
      title: "Cola de Descargas",
      description: "Encola álbumes enteros y deja que se descarguen en segundo plano sin interrumpir tu música.",
      icon: <AnimatedDownload />,
      gradient: "from-cyan-500/30 to-cyan-500/10",
      border: "rgba(6,182,212,0.5)",
      glowColor: "radial-gradient(circle at 50% 120%, rgba(6,182,212,0.25) 0%, transparent 70%)",
      visual: (
        <div className="relative flex items-center justify-center">
           <DownloadCloud size={110} className="text-cyan-500/30 absolute blur-[8px]" />
           <DownloadCloud size={110} strokeWidth={1} className="text-cyan-400/80 drop-shadow-[0_0_30px_rgba(6,182,212,0.6)]" />
        </div>
      )
    },
    {
      id: "g1",
      title: "Control de Espacio",
      description: "Monitorea cuánto almacenamiento ocupa tu biblioteca y adminístralo fácilmente sin complicaciones.",
      icon: <AnimatedHardDrive />,
      gradient: "from-orange-500/30 to-orange-500/10",
      border: "rgba(249,115,22,0.5)",
      glowColor: "radial-gradient(circle at 50% 120%, rgba(249,115,22,0.25) 0%, transparent 70%)",
      visual: (
        <div className="relative flex flex-col items-center justify-center">
           <HardDrive size={110} className="text-orange-500/30 absolute blur-[8px]" />
           <HardDrive size={110} strokeWidth={1} className="text-orange-400/80 drop-shadow-[0_0_30px_rgba(249,115,22,0.6)]" />
        </div>
      )
    }
  ]
};

export const ProblemSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState(categories[0]);
  const [expandedIndex, setExpandedIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  // IMMERSIVE SCROLL REVEALS
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 85%", "start 15%"]
  });

  const headerY = useTransform(scrollYProgress, [0, 1], [150, 0]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.8], [0, 1]);
  const headerScale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);

  const dockY = useTransform(scrollYProgress, [0.1, 1], [100, 0]);
  const dockOpacity = useTransform(scrollYProgress, [0.1, 0.9], [0, 1]);

  const cardsY = useTransform(scrollYProgress, [0.2, 1], [200, 0]);
  const cardsOpacity = useTransform(scrollYProgress, [0.2, 1], [0, 1]);
  const cardsScale = useTransform(scrollYProgress, [0.2, 1], [0.9, 1]);

  const handleTabChange = (newTab: string) => {
    if (newTab === activeTab) return;
    const currentIndex = categories.indexOf(activeTab);
    const newIndex = categories.indexOf(newTab);
    setDirection(newIndex > currentIndex ? 1 : -1);
    setActiveTab(newTab);
    setExpandedIndex(0);
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 150 : -150,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -150 : 150,
      opacity: 0,
    })
  };

  return (
    <section ref={sectionRef} className="py-32 md:py-48 w-full max-w-[1440px] mx-auto relative z-10 flex flex-col items-center">
      <IconStyles />
      {/* Header Central con el título animado (Parallax Scroll) */}
      <motion.div 
        style={{ y: headerY, opacity: headerOpacity, scale: headerScale }}
        className="text-center w-full max-w-[1200px] mx-auto mb-16 px-6"
      >
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-sora font-bold text-white leading-[1.2] text-center flex flex-col md:inline-block items-center justify-center">
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

      {/* Segmented Control Animado al Scroll (Glassmorphism NavBar) */}
      <motion.div 
        style={{ y: dockY, opacity: dockOpacity }}
        className="flex items-center gap-1.5 py-1.5 px-1.5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_0_0_1px_rgba(255,255,255,0.03)] transition-all duration-300 bg-[rgba(10,0,20,0.3)] backdrop-blur-[20px] mb-14"
      >
          {categories.map((cat) => {
            const isActive = activeTab === cat;
            return (
              <button
                key={cat}
                onClick={() => handleTabChange(cat)}
                className={`relative cursor-pointer text-[14px] md:text-[15px] font-semibold px-8 py-2.5 min-w-[110px] md:min-w-[160px] rounded-full transition-colors duration-300 ${
                  isActive ? 'text-white' : 'text-[#8b8d98] hover:text-[#e0e0e0]'
                }`}
              >
                <span className="relative z-10">{categoryLabels[cat as keyof typeof categoryLabels]}</span>
                {isActive && (
                  <motion.div
                    layoutId="liquid-pill"
                    className="absolute inset-0 w-full h-full rounded-full -z-10 bg-gradient-to-b from-[rgba(168,85,247,0.15)] to-transparent backdrop-blur-[12px] shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_12px_rgba(0,0,0,0.4)]"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                      mass: 0.8
                    }}
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
  
      {/* Raycast Style Cards Grid con animaciones Stagger al hacer scroll */}
      <motion.div 
        style={{ y: cardsY, opacity: cardsOpacity, scale: cardsScale }}
        className="w-full max-w-[1200px] px-6"
      >
        <div className="w-full relative min-h-[440px] lg:min-h-[520px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeTab}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-end w-full absolute inset-0"
            >
              {(() => {
                const cards = benefitsData[activeTab as keyof typeof benefitsData];
                return cards.map((cardData, index) => {
                  const isExpanded = expandedIndex === index;
                  return (
                    <div
                      className={`relative w-full transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer ${
                        isExpanded ? 'h-[440px] lg:h-[520px]' : 'h-[320px] lg:h-[380px]'
                      }`}
                      onMouseEnter={() => setExpandedIndex(index)}
                      onClick={() => setExpandedIndex(index)}
                      key={`card-${cardData.id}`}
                    >
                       <TiltCard
                        effect="evade"
                        scale={isExpanded ? 1.02 : 1.01}
                        perspective={1200}
                        tiltLimit={isExpanded ? 10 : 5}
                        spotlight={isExpanded}
                        spotlightColor={cardData.border.replace("0.5", "0.2")}
                        className={`w-full h-full relative backdrop-blur-[32px] overflow-hidden rounded-[32px] group flex flex-col p-8 transition-all duration-[600ms] ${
                          isExpanded ? 'ring-1 ring-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.4)]' : 'ring-1 ring-white/[0.02] shadow-md hover:ring-white/[0.05]'
                        }`}
                        style={{ background: `linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(10,5,20,0.1) 20%, rgba(10,5,20,0.2) 50%, rgba(10,5,20,0.4) 100%), ${cardData.glowColor}` }}
                      >
                         <div className={`absolute inset-0 transition-opacity duration-700 opacity-50 group-hover:opacity-100 ${isExpanded ? 'opacity-100' : 'opacity-40'}`} style={{ background: cardData.glowColor }} />
                         
                         {/* Header: Title */}
                         <div className="relative z-10 w-full flex items-center justify-start gap-4 mb-4">
                           <div className="w-12 h-12 rounded-[14px] bg-white/[0.04] flex items-center justify-center p-[4px] backdrop-blur-3xl" style={{ boxShadow: `inset 0 0 0 1px ${cardData.border}` }}>
                              <div className={`w-full h-full rounded-[10px] bg-gradient-to-b ${cardData.gradient} flex items-center justify-center`}>
                                {cardData.icon}
                              </div>
                           </div>
                           <h3 className="text-[20px] lg:text-[22px] font-sora font-semibold text-white/95 tracking-tight drop-shadow-sm">{cardData.title}</h3>
                         </div>

                         {/* Center: Visual Graphic (Bottom-aligned) */}
                         <div className={`flex-1 relative w-full flex items-end justify-center pb-2 transition-transform duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${isExpanded ? '-translate-y-16 scale-[1.15]' : 'translate-y-2 scale-95 opacity-80 group-hover:opacity-100'}`}>
                           {cardData.visual}
                         </div>

                         {/* Bottom: Description */}
                         <div className={`w-full relative z-10 transition-all duration-[600ms] ease-[cubic-bezier(0.22,1,0.36,1)] overflow-hidden flex items-end ${isExpanded ? 'max-h-[120px] opacity-100 translate-y-0' : 'max-h-0 opacity-0 translate-y-6'}`}>
                           <p className="text-[#a1a1aa] text-[14px] lg:text-[15px] leading-[1.6] font-inter font-medium">{cardData.description}</p>
                         </div>
                      </TiltCard>
                    </div>
                  )
                });
              })()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
};
