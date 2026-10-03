const fs = require('fs');

const code = `import React, { useState, useRef, useEffect } from 'react';
import { Heart, Star, ListMusic, ChevronDown } from 'lucide-react';
import { DownloadsView } from './DownloadsView';

const DropdownItem = ({ id, title, hoverBg, activeTab, onSelect }: any) => {
  return (
    <button 
      onClick={onSelect}
      className={\`w-full flex items-center px-4 py-3 rounded-lg transition-colors \${activeTab === id ? 'bg-white/10 text-white' : \`text-white/60 \${hoverBg} hover:text-white\`}\`}
    >
      <span className="text-[15px] font-medium tracking-wide text-left">
        {title}
      </span>
    </button>
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getModalStyles = () => {
    if (activeTab === 'licenses') return 'bg-[#18181b]/95 border-yellow-500/10 shadow-2xl';
    if (activeTab === 'playlists') return 'bg-[#18181b]/95 border-green-500/10 shadow-2xl';
    return 'bg-[#18181b]/95 border-[#a855f7]/10 shadow-2xl';
  };

  const getHoverBg = () => {
    if (activeTab === 'licenses') return 'hover:bg-yellow-500/10';
    if (activeTab === 'playlists') return 'hover:bg-green-500/10';
    return 'hover:bg-[#a855f7]/10';
  };

  return (
    <div className="relative inline-flex items-center" ref={dropdownRef}>
      <style>{\`
        @keyframes rollTextUpFast {
          0%, 40% { transform: translateY(0); }
          50%, 100% { transform: translateY(-50%); }
        }
        .animate-roll-text-up-fast {
          animation: rollTextUpFast 2.5s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }
      \`}</style>
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none"
      >
        <div className="relative h-[48px] overflow-hidden">
          <div className="flex flex-col animate-roll-text-up-fast">
            <span className="h-[48px] leading-none flex items-center">{titles[activeTab]}</span>
            <span className="h-[48px] leading-none flex items-center">{titles[activeTab]}</span>
          </div>
        </div>
        <ChevronDown className={\`w-10 h-10 transition-transform duration-300 \${isOpen ? 'rotate-180' : ''}\`} strokeWidth={4} />
      </button>
      
      {isOpen && (
        <div className={\`absolute top-full mt-4 left-0 w-[240px] border rounded-xl p-1.5 z-[9999] backdrop-blur-xl flex flex-col font-sans \${getModalStyles()}\`}>
          <DropdownItem 
            id="favorites" 
            title="Canciones favoritas" 
            hoverBg={getHoverBg()}
            activeTab={activeTab}
            onSelect={() => { setActiveTab('library-favorites'); setIsOpen(false); }}
          />
          <DropdownItem 
            id="playlists" 
            title="Listas de reproducción" 
            hoverBg={getHoverBg()}
            activeTab={activeTab}
            onSelect={() => { setActiveTab('library-playlists'); setIsOpen(false); }}
          />
          <DropdownItem 
            id="licenses" 
            title="Canciones con licencia" 
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
  // Derive active tab from currentView
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
      <DownloadsView 
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
`;

fs.writeFileSync('src/components/player/LibraryView.tsx', code);
console.log('Updated LibraryView.tsx to use currentView, removed modal icons, thinned text, sped up animation.');
