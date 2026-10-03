const fs = require('fs');

const code = `import React, { useState, useRef, useEffect } from 'react';
import { Heart, Star, ListMusic, ChevronDown } from 'lucide-react';
import { DownloadsView } from './DownloadsView';

const DropdownItem = ({ id, icon, title, colorClass, hoverBg, activeTab, onSelect }: any) => {
  return (
    <button 
      onClick={onSelect}
      className={\`group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors \${activeTab === id ? 'bg-white/10 text-white' : \`text-white/70 \${hoverBg} hover:text-white\`}\`}
    >
      <div className={\`w-10 h-10 rounded-full bg-gradient-to-br \${colorClass} flex items-center justify-center shadow-md shrink-0 text-white\`}>
        {icon}
      </div>
      <span className="text-base font-semibold tracking-wide flex-1 text-left">
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
    if (activeTab === 'licenses') return 'bg-yellow-500/10 border-yellow-500/20 shadow-xl';
    if (activeTab === 'playlists') return 'bg-green-500/10 border-green-500/20 shadow-xl';
    return 'bg-[#a855f7]/10 border-[#a855f7]/20 shadow-xl';
  };

  const getHoverBg = () => {
    if (activeTab === 'licenses') return 'hover:bg-yellow-500/20';
    if (activeTab === 'playlists') return 'hover:bg-green-500/20';
    return 'hover:bg-[#a855f7]/20';
  };

  return (
    <div className="relative inline-flex items-center" ref={dropdownRef}>
      <style>{\`
        @keyframes rollTextUp {
          0%, 40% { transform: translateY(0); }
          50%, 100% { transform: translateY(-50%); }
        }
        .animate-roll-text-up {
          animation: rollTextUp 5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      \`}</style>
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none"
      >
        <div className="relative h-[1.1em] overflow-hidden flex items-center">
          <div className="flex flex-col animate-roll-text-up">
            <span className="h-[1.1em] flex items-center">{titles[activeTab]}</span>
            <span className="h-[1.1em] flex items-center">{titles[activeTab]}</span>
          </div>
        </div>
        <ChevronDown className={\`w-10 h-10 mt-1 transition-transform duration-300 \${isOpen ? 'rotate-180' : ''}\`} strokeWidth={4} />
      </button>
      
      {isOpen && (
        <div className={\`absolute top-full mt-4 left-0 w-[300px] border rounded-2xl p-2 z-[9999] backdrop-blur-md flex flex-col gap-1 font-sans \${getModalStyles()}\`}>
          <DropdownItem 
            id="favorites" 
            icon={<Heart className="w-5 h-5" fill="currentColor" />} 
            title="Canciones favoritas" 
            colorClass="from-pink-500 to-purple-600" 
            hoverBg={getHoverBg()}
            activeTab={activeTab}
            onSelect={() => { setActiveTab('favorites'); setIsOpen(false); }}
          />
          <DropdownItem 
            id="playlists" 
            icon={<ListMusic className="w-5 h-5" />} 
            title="Listas de reproducción" 
            colorClass="from-green-400 to-emerald-500" 
            hoverBg={getHoverBg()}
            activeTab={activeTab}
            onSelect={() => { setActiveTab('playlists'); setIsOpen(false); }}
          />
          <DropdownItem 
            id="licenses" 
            icon={<Star className="w-5 h-5" fill="currentColor" />} 
            title="Canciones con licencia" 
            colorClass="from-yellow-400 to-amber-500" 
            hoverBg={getHoverBg()}
            activeTab={activeTab}
            onSelect={() => { setActiveTab('licenses'); setIsOpen(false); }}
          />
        </div>
      )}
    </div>
  );
};

export const LibraryView = ({ albums, handlePlayTrack, handleSelectAlbum }: any) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'playlists' | 'licenses'>('favorites');

  const configs = {
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
        title={<LibraryDropdown activeTab={activeTab} setActiveTab={setActiveTab} />}
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
console.log('Updated LibraryView.tsx with modal fixes and main title infinite roll.');
