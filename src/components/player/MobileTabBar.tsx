import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Home, Library, DownloadCloud, Menu } from 'lucide-react';
import { useDownloads } from './DownloadsContext';

/**
 * Primary navigation for phones and tablets (hidden from `lg` up, where the sidebar takes over).
 * Floating liquid-glass pill like iOS: the selection bubble springs between tabs, and you can
 * press and slide a finger across the bar — the bubble follows and the tab under the finger
 * opens on release. Each target stays at least 44px tall.
 */
export const MobileTabBar = ({ currentView, onViewChange, onOpenMenu, menuOpen = false }: { currentView: string; onViewChange: (view: string) => void; onOpenMenu: () => void; menuOpen?: boolean }) => {
  const { newDownloadsCount } = useDownloads();
  const barRef = useRef<HTMLDivElement>(null);
  const [pressIndex, setPressIndex] = useState<number | null>(null);

  const tabs = [
    { id: 'catalog', label: 'Inicio', icon: Home, active: !menuOpen && ['catalog', 'album', 'artist'].includes(currentView) },
    { id: 'library', label: 'Biblioteca', icon: Library, active: !menuOpen && currentView.startsWith('library') },
    { id: 'downloads', label: 'Descargas', icon: DownloadCloud, active: !menuOpen && currentView === 'downloads', badge: newDownloadsCount },
    { id: 'menu', label: 'Menú', icon: Menu, active: menuOpen },
  ];
  // the last tab is not a page: it opens the drawer (settings, shortcuts, account)
  const go = (id: string) => (id === 'menu' ? onOpenMenu() : onViewChange(id));
  const activeIndex = Math.max(0, tabs.findIndex((t) => t.active));
  const bubbleIndex = pressIndex ?? activeIndex;

  const indexAt = (clientX: number) => {
    const rect = barRef.current?.getBoundingClientRect();
    if (!rect) return activeIndex;
    const ratio = (clientX - rect.left) / rect.width;
    return Math.min(tabs.length - 1, Math.max(0, Math.floor(ratio * tabs.length)));
  };

  return (
    <nav
      aria-label="Navegación principal"
      className="lg:hidden shrink-0 relative z-30 px-4 pt-2"
      style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}
    >
      <div
        ref={barRef}
        className="relative flex items-stretch w-full max-w-[560px] mx-auto rounded-full p-1.5 bg-white/[0.08] backdrop-blur-2xl backdrop-saturate-[1.8] border border-white/[0.14] shadow-[inset_0_1px_0_rgba(255,255,255,0.18),inset_0_-1px_0_rgba(255,255,255,0.04),0_12px_32px_rgba(0,0,0,0.45)] touch-none select-none"
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); setPressIndex(indexAt(e.clientX)); }}
        onPointerMove={(e) => { if (pressIndex !== null) setPressIndex(indexAt(e.clientX)); }}
        onPointerUp={(e) => {
          if (pressIndex === null) return;
          const target = indexAt(e.clientX);
          setPressIndex(null);
          go(tabs[target].id);
        }}
        onPointerCancel={() => setPressIndex(null)}
      >
        {/* Selection bubble: springs to the active tab, grows like a lens while pressed */}
        <motion.span
          aria-hidden="true"
          className="absolute top-1.5 bottom-1.5 rounded-full bg-white/[0.16] border border-white/[0.18] shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_4px_14px_rgba(0,0,0,0.25)]"
          style={{ width: `calc((100% - 12px) / ${tabs.length})`, left: 6 }}
          animate={{
            x: `${bubbleIndex * 100}%`,
            scaleX: pressIndex !== null ? 1.1 : 1,
            scaleY: pressIndex !== null ? 1.12 : 1,
          }}
          transition={{ type: 'spring', stiffness: 520, damping: 34, mass: 0.8 }}
        />

        {tabs.map(({ id, label, icon: Icon, active, badge }, i) => {
          const lit = i === bubbleIndex;
          return (
            <button
              key={id}
              type="button"
              // Navigation happens on pointer-up of the bar; keyboard still works through onClick
              onClick={(e) => { if (e.detail === 0) go(id); }}
              aria-current={active ? 'page' : undefined}
              aria-label={label}
              className="relative z-10 flex-1 min-h-[52px] flex flex-col items-center justify-center gap-0.5 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            >
              <motion.span
                className="relative"
                animate={{ scale: pressIndex === i ? 1.15 : 1, y: pressIndex === i ? -1 : 0 }}
                transition={{ type: 'spring', stiffness: 600, damping: 30 }}
              >
                <Icon className={`w-[22px] h-[22px] transition-colors duration-200 ${lit ? 'text-[#d8b4fe]' : 'text-white/60'}`} strokeWidth={lit ? 2.4 : 2} />
                {!!badge && !active && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#a855f7] text-white text-[10px] font-bold leading-[18px] text-center">
                    {badge}
                  </span>
                )}
              </motion.span>
              <span className={`text-[10.5px] font-semibold tracking-wide transition-colors duration-200 ${lit ? 'text-white' : 'text-white/55'}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
