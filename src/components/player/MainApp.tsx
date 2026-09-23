import React, { useState } from 'react';
import { TopNav } from './TopNav';
import { MiniPlayer } from './MiniPlayer';
import { CatalogView } from './CatalogView';
import { AlbumView } from './AlbumView';
import { DownloadsView } from './DownloadsView';
import { ImmersivePlayer } from './ImmersivePlayer';

export const MainApp = ({ supabaseUrl, supabaseAnonKey }: { supabaseUrl?: string, supabaseAnonKey?: string }) => {
  const [currentView, setCurrentView] = useState<'catalog' | 'album' | 'downloads'>('catalog');
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);

  return (
    <div className="w-full h-screen bg-[#05050A] text-white font-sans overflow-hidden relative">
      <div className="absolute inset-0 bg-noise opacity-[0.02] pointer-events-none"></div>

      <TopNav currentView={currentView} onViewChange={setCurrentView} />

      {/* View Router */}
      <div className="w-full h-full relative z-10">
        {currentView === 'catalog' && <CatalogView onViewChange={setCurrentView} />}
        {currentView === 'album' && <AlbumView onViewChange={setCurrentView} />}
        {currentView === 'downloads' && <DownloadsView />}
      </div>

      <MiniPlayer onExpand={() => setIsPlayerExpanded(true)} />

      <ImmersivePlayer 
        supabaseUrl={supabaseUrl} 
        supabaseAnonKey={supabaseAnonKey} 
        isExpanded={isPlayerExpanded}
        onClose={() => setIsPlayerExpanded(false)}
      />
    </div>
  );
};
