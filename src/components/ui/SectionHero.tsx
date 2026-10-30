import type { ReactNode, ComponentType } from 'react';
import { motion } from 'framer-motion';

export type SectionType = 'downloads' | 'favorites' | 'licenses' | 'playlists';

// rgb of each section's accent: only used as a soft glow and a gradient tint, never as a flat block
const ACCENT: Record<SectionType, string> = {
  downloads: '59, 130, 246',
  favorites: '168, 85, 247',
  licenses: '250, 204, 21',
  playlists: '34, 197, 94',
};

/** Header of the library sections: glass icon tile over a soft accent glow, title, and stat pills. */
export const SectionHero = ({
  type,
  icon: Icon,
  kicker,
  title,
  stats,
  actions,
}: {
  type: SectionType;
  icon: ComponentType<{ className?: string }>;
  kicker: string;
  title: ReactNode;
  stats: { icon?: ReactNode; text: string }[];
  actions?: ReactNode;
}) => {
  const accent = ACCENT[type];
  return (
    <div className="relative px-4 md:px-8 pt-4 md:pt-8 pb-5 md:pb-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 z-40">
      <style>{`
        @keyframes heartBeat {
          0%, 100% { transform: scale(1); fill: transparent; }
          15% { transform: scale(1.25); fill: white; }
          30% { transform: scale(1.05); fill: white; }
          45% { transform: scale(1.25); fill: white; }
          60%, 80% { transform: scale(1); fill: transparent; }
        }
        .custom-icon-favorites {
          animation: heartBeat 2.5s ease-in-out infinite;
          transform-origin: center;
        }

        @keyframes starSpin {
          0% { transform: rotate(0deg) scale(1); fill: transparent; }
          15%, 35% { transform: rotate(144deg) scale(1.2); fill: white; }
          50%, 70% { transform: rotate(288deg) scale(1.2); fill: white; }
          85%, 100% { transform: rotate(360deg) scale(1); fill: transparent; }
        }
        .custom-icon-licenses {
          animation: starSpin 4s cubic-bezier(0.34, 1.56, 0.64, 1) infinite;
          transform-origin: center;
        }

        @keyframes playlistBeat {
          0%, 100% { transform: scale(1) rotate(0deg); }
          15% { transform: scale(1.2) rotate(-3deg); }
          30% { transform: scale(1.05) rotate(2deg); }
          45% { transform: scale(1.2) rotate(-1deg); }
          60%, 80% { transform: scale(1) rotate(0deg); }
        }
        @keyframes noteHeadFill {
          0%, 100% { fill: transparent; transform: scale(1); }
          15%, 45% { fill: white; transform: scale(1.12); }
          60%, 80% { fill: transparent; transform: scale(1); }
        }
        @keyframes linePulse1 {
          0%, 100% { transform: scaleX(1); opacity: 0.7; }
          15%, 35% { transform: scaleX(1.15); opacity: 1; }
          60%, 80% { transform: scaleX(1); opacity: 0.7; }
        }
        @keyframes linePulse2 {
          0%, 100% { transform: scaleX(1); opacity: 0.7; }
          25%, 45% { transform: scaleX(1.25); opacity: 1; }
          65%, 85% { transform: scaleX(1); opacity: 0.7; }
        }
        @keyframes linePulse3 {
          0%, 100% { transform: scaleX(1); opacity: 0.7; }
          35%, 55% { transform: scaleX(1.2); opacity: 1; }
          70%, 90% { transform: scaleX(1); opacity: 0.7; }
        }
        .custom-icon-playlists {
          animation: playlistBeat 2.5s ease-in-out infinite;
          transform-origin: center;
        }
        .custom-icon-playlists circle {
          animation: noteHeadFill 2.5s ease-in-out infinite;
          transform-origin: 18px 16px;
        }
        .custom-icon-playlists path:nth-of-type(1) {
          animation: linePulse1 2.5s ease-in-out infinite;
          transform-origin: left center;
        }
        .custom-icon-playlists path:nth-of-type(2) {
          animation: linePulse2 2.5s ease-in-out infinite;
          transform-origin: left center;
        }
        .custom-icon-playlists path:nth-of-type(3) {
          animation: linePulse3 2.5s ease-in-out infinite;
          transform-origin: left center;
        }

        @keyframes arrowSwipeDown {
          0% { transform: translateY(-4px); opacity: 0; }
          20% { transform: translateY(0px); opacity: 1; }
          80% { transform: translateY(4px); opacity: 1; }
          100% { transform: translateY(8px); opacity: 0; }
        }
        @keyframes cloudPulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        .custom-icon-downloads {
          fill: transparent !important;
          overflow: visible;
        }
        .custom-icon-downloads path[d*="A"],
        .custom-icon-downloads path[d*="a"] {
          animation: cloudPulse 2.5s ease-in-out infinite;
          transform-origin: center;
        }
        .custom-icon-downloads path:not([d*="A"]):not([d*="a"]),
        .custom-icon-downloads line,
        .custom-icon-downloads polyline {
          animation: arrowSwipeDown 1.8s ease-in-out infinite;
        }
      `}</style>
      {/* soft light of the section's colour behind the header */}
      <div
        aria-hidden="true"
        // reaches well above the hero so the rubber-band pull of the page never shows where the glow ends
        className="absolute inset-x-0 -top-24 h-[26rem] pointer-events-none"
        style={{ background: `radial-gradient(ellipse 70% 20rem at 18% 4.5rem,rgba(${accent}, 0.22), transparent 70%)` }}
      />
      <div className="relative flex items-center gap-4 md:gap-7 min-w-0 w-full md:w-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 210, damping: 20 }}
          className="relative w-20 h-20 md:w-40 md:h-40 shrink-0 rounded-[26px] md:rounded-[38px] flex items-center justify-center backdrop-blur-2xl overflow-hidden"
          style={{ background: `rgba(${accent}, 0.2)` }}
        >
          <Icon className={`relative w-9 h-9 md:w-16 md:h-16 text-white custom-icon-${type}`} />
        </motion.div>

        <div className="flex flex-col gap-1.5 md:gap-2.5 min-w-0">
          <span className="text-white/65 text-[11px] md:text-sm font-semibold tracking-[0.22em] uppercase">{kicker}</span>
          <div
            className="text-[26px] leading-tight md:text-4xl lg:text-5xl md:leading-none font-black text-white tracking-tight"
            style={{ textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
          >
            {title}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {stats.map((s, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.07] backdrop-blur-xl text-white/85 text-xs md:text-[13px] font-medium"
              >
                {s.icon}
                {s.text}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
      {actions && <div className="relative">{actions}</div>}
    </div>
  );
};

/** Empty section: a glass circle with the section's icon, what goes here and how to fill it. */
export const SectionEmpty = ({
  type,
  icon: Icon,
  title,
  text,
}: {
  type: SectionType;
  icon: ComponentType<{ className?: string }>;
  title: string;
  text: string;
}) => {
  const accent = ACCENT[type];
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center text-center gap-4 px-6 py-20 md:py-28"
    >
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center backdrop-blur-2xl"
        style={{ background: `rgba(${accent}, 0.18)` }}
      >
        <Icon className="w-10 h-10 text-white/90" />
      </div>
      <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">{title}</h3>
      <p className="text-white/55 text-sm md:text-base max-w-sm leading-relaxed">{text}</p>
    </motion.div>
  );
};
