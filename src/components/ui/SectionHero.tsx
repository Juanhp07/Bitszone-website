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
      {/* soft light of the section's colour behind the header */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-72 pointer-events-none"
        style={{ background: `radial-gradient(ellipse 70% 100% at 18% 0%, rgba(${accent}, 0.22), transparent 70%)` }}
      />
      <div className="relative flex items-center gap-4 md:gap-7 min-w-0 w-full md:w-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 210, damping: 20 }}
          className="relative w-20 h-20 md:w-40 md:h-40 shrink-0 rounded-[26px] md:rounded-[38px] flex items-center justify-center backdrop-blur-2xl overflow-hidden"
          style={{ background: `rgba(${accent}, 0.2)` }}
        >
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
