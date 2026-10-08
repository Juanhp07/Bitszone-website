import React from 'react';
import { Home, Library, DownloadCloud } from 'lucide-react';
import { useDownloads } from './DownloadsContext';

/**
 * Phone-only primary navigation (hidden from `md` up, where the sidebar takes over).
 * Tabs navigate, they never act; labels stay visible; each target is at least 44px tall.
 */
export const MobileTabBar = ({ currentView, onViewChange }: { currentView: string; onViewChange: (view: string) => void }) => {
  const { newDownloadsCount } = useDownloads();

  const tabs = [
    { id: 'catalog', label: 'Inicio', icon: Home, active: ['catalog', 'album', 'artist'].includes(currentView) },
    { id: 'library', label: 'Biblioteca', icon: Library, active: currentView.startsWith('library') },
    { id: 'downloads', label: 'Descargas', icon: DownloadCloud, active: currentView === 'downloads', badge: newDownloadsCount },
  ];

  return (
    <nav
      aria-label="Navegación principal"
      className="md:hidden shrink-0 relative z-30 flex items-stretch border-t border-white/10 bg-black/70 backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map(({ id, label, icon: Icon, active, badge }) => (
        <button
          key={id}
          onClick={() => onViewChange(id)}
          aria-current={active ? 'page' : undefined}
          className={`flex-1 min-h-[56px] flex flex-col items-center justify-center gap-1 transition-colors ${active ? 'text-[#d8b4fe]' : 'text-white/55 active:text-white'}`}
        >
          <span className="relative">
            <Icon className="w-[22px] h-[22px]" strokeWidth={active ? 2.4 : 2} />
            {!!badge && !active && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#a855f7] text-white text-[10px] font-bold leading-[18px] text-center">
                {badge}
              </span>
            )}
          </span>
          <span className="text-[11px] font-semibold tracking-wide">{label}</span>
        </button>
      ))}
    </nav>
  );
};
