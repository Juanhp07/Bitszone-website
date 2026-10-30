import React, { useState, useRef, useEffect } from 'react';
import { Heart, Star, ListMusic, ChevronDown } from 'lucide-react';
import { DownloadsView } from './DownloadsView';
import { PlaylistsGrid } from './PlaylistsGrid';
import { PopoverMenu } from '../ui/PopoverMenu';

const DropdownItem = ({ id, title, icon: Icon, hoverBg, activeTab, onSelect }: any) => {
  return (
    <button 
      onClick={onSelect}
      className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer ${activeTab === id ? 'bg-white/10 text-white' : `text-white/60 ${hoverBg} hover:text-white`}`}
      title={`Cambiar a ${title}`}
      aria-label={`Ver sección de ${title}`}
    >
      <Icon className="w-5 h-5 mr-3 shrink-0" strokeWidth={2} aria-hidden="true" />
      <span className="text-[15px] font-normal tracking-wide text-left whitespace-nowrap" style={{ WebkitTextStroke: '0' }}>
        {title}
      </span>
    </button>
  );
};

// Letters are grouped per word so a long title can wrap between words on narrow screens
// (each letter is its own rolling column, which would otherwise never wrap).
const StaggeredRollingText = ({ text }: { text: string }) => {
  let i = 0;
  return (
    <div key={text} className="flex flex-wrap items-center gap-x-[0.25em] gap-y-1">
      {text.split(' ').map((word, w) => (
        <div key={w} className="flex items-center">
          {word.split('').map((char) => {
            const delay = (i++) * 0.03;
            return (
              <div key={`${w}-${delay}`} className="relative h-[1.1em] overflow-hidden">
                <div
                  className="flex flex-col animate-char-roll"
                  style={{ animationDelay: `${delay}s` }}
                >
                  <span className="h-[1.1em] leading-none flex items-center whitespace-pre">{char}</span>
                  <span className="h-[1.1em] leading-none flex items-center whitespace-pre">{char}</span>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

const LibraryDropdown = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: any) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [anchor, setAnchor] = useState<{ x: number; y: number; x2: number } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const titles: any = {
    favorites: 'Canciones favoritas',
    licenses: 'Canciones con licencia',
    playlists: 'Listas de reproducción'
  };

  const getModalStyles = () => {
    if (activeTab === 'licenses') return 'bg-black/30 border-yellow-500/20 shadow-2xl';
    if (activeTab === 'playlists') return 'bg-black/30 border-green-500/20 shadow-2xl';
    return 'bg-black/30 border-[#a855f7]/20 shadow-2xl';
  };

  const getHoverBg = () => {
    if (activeTab === 'licenses') return 'hover:bg-yellow-500/10';
    if (activeTab === 'playlists') return 'hover:bg-green-500/10';
    return 'hover:bg-[#a855f7]/10';
  };

  return (
    <div className="relative inline-flex items-center" ref={dropdownRef}>
      <style>{`
        @keyframes charRollIn {
          from { transform: translateY(50%); }
          to { transform: translateY(0); }
        }
        .animate-char-roll {
          animation: charRollIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
      
      <button 
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setAnchor({ x: Math.max(r.left, Math.min(e.clientX - 28, r.right - 24)), y: r.bottom + 8, x2: r.right });
          setIsOpen(!isOpen);
        }}
        title={isOpen ? "Cerrar menú de biblioteca" : "Cambiar sección de biblioteca"}
        aria-label={isOpen ? "Cerrar menú de biblioteca" : "Cambiar sección de biblioteca"}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex items-center gap-2 md:gap-3 min-w-0 text-left hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-lg p-1 cursor-pointer"
      >
        <StaggeredRollingText text={titles[activeTab]} />
        <ChevronDown className={`w-6 h-6 md:w-10 md:h-10 shrink-0 text-white/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} strokeWidth={3} />
      </button>
      
      <PopoverMenu
        open={isOpen}
        anchor={isOpen ? anchor : null}
        width={270}
        onClose={() => setIsOpen(false)}
        items={[
          { label: 'Canciones favoritas', icon: <Heart className="w-4 h-4" />, active: activeTab === 'favorites', onSelect: () => setActiveTab('library-favorites') },
          { label: 'Listas de reproducción', icon: <ListMusic className="w-4 h-4" />, active: activeTab === 'playlists', onSelect: () => setActiveTab('library-playlists') },
          { label: 'Canciones con licencia', icon: <Star className="w-4 h-4" />, active: activeTab === 'licenses', onSelect: () => setActiveTab('library-licenses') },
        ]}
      />
    </div>
  );
};

export const LibraryView = ({ albums, handlePlayTrack, handleSelectAlbum, currentView, setCurrentView }: any) => {
  let activeTab = 'favorites';
  if (currentView === 'library-playlists') activeTab = 'playlists';
  if (currentView === 'library-licenses') activeTab = 'licenses';

  const configs: any = {
    favorites: {
      type: 'favorites',
      icon: Heart,
      gradientClass: 'from-pink-500 to-purple-600'
    },
    playlists: {
      type: 'playlists',
      icon: ListMusic,
      gradientClass: 'from-green-400 to-emerald-500'
    },
    licenses: {
      type: 'licenses',
      icon: Star,
      gradientClass: 'from-yellow-400 to-amber-500'
    }
  };

  const config = configs[activeTab];

  return (
    <div className="flex-1 flex flex-col h-full overflow-x-clip relative">
      {activeTab === 'playlists' ? (
        <PlaylistsGrid
          title={<LibraryDropdown activeTab={activeTab} setActiveTab={setCurrentView} />}
          onOpen={handleSelectAlbum}
          onPlayTrack={handlePlayTrack}
        />
      ) : (
      <DownloadsView key={activeTab} 
        type={config.type as any}
        albums={albums} 
        title={<LibraryDropdown activeTab={activeTab} setActiveTab={setCurrentView} />}
        icon={config.icon}
        gradientClass={config.gradientClass}
        onPlayTrack={handlePlayTrack} 
        onSelectAlbum={handleSelectAlbum} 
      />
      )}
    </div>
  );
};
