import React from 'react';
import { Home, Library, DownloadCloud } from 'lucide-react';
import { useDownloads } from './DownloadsContext';

export const Sidebar = ({ currentView, onViewChange }: { currentView: string, onViewChange: (view: any) => void }) => {
  const { totalBytes } = useDownloads();
  
  // Base 4.20 GB available
  const baseAvailableGB = 4.20;
  const downloadedGB = totalBytes / (1024 * 1024 * 1024);
  const availableGB = Math.max(0, baseAvailableGB - downloadedGB);

  return (
    <aside className="w-full h-full flex flex-col bg-black">
      <div className="flex-1 px-4 py-6 flex flex-col gap-2">
        <button 
          onClick={() => onViewChange('catalog')}
          className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-colors ${
            currentView === 'catalog' ? 'text-white bg-white/10 shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Home className="w-5 h-5" />
          Inicio
        </button>
        <button 
          onClick={() => onViewChange('library')}
          className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-colors ${
            currentView === 'library' ? 'text-white bg-white/10 shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Library className="w-5 h-5" />
          Biblioteca
        </button>
        <button 
          onClick={() => onViewChange('downloads')}
          className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-colors ${
            currentView === 'downloads' ? 'text-white bg-white/10 shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <DownloadCloud className="w-5 h-5" />
          Mis descargas
        </button>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-center py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-medium tracking-wide">
          {availableGB.toFixed(2)}GB / 5GB disponibles
        </div>
      </div>
    </aside>
  );
};
