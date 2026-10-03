import React, { useState, useRef, useEffect } from 'react';
import { Heart, Star, ListMusic, ChevronDown } from 'lucide-react';
import { DownloadsView } from './DownloadsView';

const DropdownItem = ({ id, title, icon: Icon, hoverBg, activeTab, onSelect }: any) => {
  return (
    <button 
      onClick={onSelect}
      className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === id ? 'bg-white/10 text-white' : `text-white/60 ${hoverBg} hover:text-white`}`}
    >
      <Icon className="w-5 h-5 mr-3 shrink-0" strokeWidth={2} />
      <span className="text-[15px] font-normal tracking-wide text-left whitespace-nowrap" style={{ WebkitTextStroke: '0' }}>
        {title}
      </span>
    </button>
  );
};

const StaggeredRollingText = ({ text }: { text: string }) => {
  return (
    <div className="flex items-center">
      {text.split('').map((char, i) => (
        <div key={i} className="relative h-[48px] overflow-hidden">
          <div 
            className="flex flex-col animate-char-roll"
            style={{ animationDelay: `${i * 0.03}s` }}
          >
            <span className="h-[48px] leading-none flex items-center whitespace-pre">{char === ' ' ? '\u00A0' : char}</span>
            <span className="h-[48px] leading-none flex items-center whitespace-pre">{char === ' ' ? '\u00A0' : char}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const LibraryDropdown = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: any) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const titles: any = {
    favorites: 'Canciones favoritas',
    licenses: 'Canciones con licencia',
    playlists: 'Listas de reproducción'
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

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
        @keyframes rollTextUpStagger {
          0%, 60% { transform: translateY(0); }
          80%, 100% { transform: translateY(-50%); }
        }
        .animate-char-roll {
          animation: rollTextUpStagger 2s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }
      `}</style>
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none"
      >
        <StaggeredRollingText text={titles[activeTab]} />
        <ChevronDown className={`w-10 h-10 text-white/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} strokeWidth={3} />
      </button>
      
      {isOpen && (
        <div 
        className={`absolute top-full mt-4 right-0 w-[280px] border rounded-xl p-1.5 z-[9999] backdrop-blur-3xl flex flex-col gap-1.5 font-sans ${getModalStyles()}`}
        style={{ WebkitTextStroke: '0', fontWeight: 'normal' }}
      >
          <DropdownItem 
            id="favorites" 
            title="Canciones favoritas" 
            icon={Heart}
            hoverBg={getHoverBg()}
            activeTab={activeTab}
            onSelect={() => { setActiveTab('library-favorites'); setIsOpen(false); }}
          />
          <DropdownItem 
            id="playlists" 
            title="Listas de reproducción" 
            icon={ListMusic}
            hoverBg={getHoverBg()}
            activeTab={activeTab}
            onSelect={() => { setActiveTab('library-playlists'); setIsOpen(false); }}
          />
          <DropdownItem 
            id="licenses" 
            title="Canciones con licencia" 
            icon={Star}
            hoverBg={getHoverBg()}
            activeTab={activeTab}
            onSelect={() => { setActiveTab('library-licenses'); setIsOpen(false); }}
          />
        </div>
      )}
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
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      <DownloadsView key={activeTab} 
        type={config.type as any}
        albums={albums} 
        title={<LibraryDropdown activeTab={activeTab} setActiveTab={setCurrentView} />}
        icon={config.icon}
        gradientClass={config.gradientClass}
        onPlayTrack={handlePlayTrack} 
        onSelectAlbum={handleSelectAlbum} 
      />
    </div>
  );
};
