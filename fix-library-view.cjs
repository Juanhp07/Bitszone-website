const fs = require('fs');

const code = `import React, { useState, useRef, useEffect } from 'react';
import { Heart, Star, ListMusic, ChevronDown } from 'lucide-react';
import { DownloadsView } from './DownloadsView';

const DropdownItem = ({ id, icon, title, colorClass, hoverBg, activeTab, onSelect }: any) => {
  return (
    <button 
      onClick={onSelect}
      className={\`group w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-colors \${activeTab === id ? 'bg-white/15 text-white' : \`text-white/80 \${hoverBg} hover:text-white\`}\`}
    >
      <div className={\`w-12 h-12 rounded-full bg-gradient-to-br \${colorClass} flex items-center justify-center shadow-lg shrink-0 text-white\`}>
        {icon}
      </div>
      <div className="relative h-7 overflow-hidden text-xl font-extrabold tracking-tight flex-1 text-left">
        <div className="flex flex-col transition-transform duration-300 group-hover:-translate-y-1/2">
          <span className="h-7 flex items-center">{title}</span>
          <span className="h-7 flex items-center text-white">{title}</span>
        </div>
      </div>
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
    if (activeTab === 'licenses') return 'bg-yellow-500/20 border-yellow-500/30 shadow-[0_20px_60px_-15px_rgba(234,179,8,0.4)]';
    if (activeTab === 'playlists') return 'bg-green-500/20 border-green-500/30 shadow-[0_20px_60px_-15px_rgba(34,197,94,0.4)]';
    return 'bg-[#a855f7]/20 border-[#a855f7]/30 shadow-[0_20px_60px_-15px_rgba(168,85,247,0.4)]';
  };

  const getHoverBg = () => {
    if (activeTab === 'licenses') return 'hover:bg-yellow-500/20';
    if (activeTab === 'playlists') return 'hover:bg-green-500/20';
    return 'hover:bg-[#a855f7]/20';
  };

  return (
    <div className="relative inline-flex items-center" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none"
      >
        <span>{titles[activeTab]}</span>
        <ChevronDown className={\`w-10 h-10 mt-2 transition-transform duration-300 \${isOpen ? 'rotate-180' : ''}\`} strokeWidth={3} />
      </button>
      
      {isOpen && (
        <div className={\`absolute top-full mt-4 left-0 w-[420px] border rounded-3xl p-3 z-[9999] backdrop-blur-3xl flex flex-col gap-2 font-sans \${getModalStyles()}\`}>
          <DropdownItem 
            id="favorites" 
            icon={<Heart className="w-6 h-6" fill="currentColor" />} 
            title="Canciones favoritas" 
            colorClass="from-pink-500 to-purple-600" 
            hoverBg={getHoverBg()}
            activeTab={activeTab}
            onSelect={() => { setActiveTab('favorites'); setIsOpen(false); }}
          />
          <DropdownItem 
            id="playlists" 
            icon={<ListMusic className="w-6 h-6" />} 
            title="Listas de reproducción" 
            colorClass="from-green-400 to-emerald-500" 
            hoverBg={getHoverBg()}
            activeTab={activeTab}
            onSelect={() => { setActiveTab('playlists'); setIsOpen(false); }}
          />
          <DropdownItem 
            id="licenses" 
            icon={<Star className="w-6 h-6" fill="currentColor" />} 
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
console.log('Updated LibraryView.tsx with rolling text, thick fonts, dynamic blur backgrounds and proper z-index overlay.');
