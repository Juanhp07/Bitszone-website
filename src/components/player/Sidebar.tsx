import React from 'react';
import { Home, Library, DownloadCloud } from 'lucide-react';
import { useDownloads } from './DownloadsContext';

export const Sidebar = ({ currentView, onViewChange }: { currentView: string, onViewChange: (view: any) => void }) => {
  const { totalBytes, newDownloadsCount } = useDownloads();
  
  // Base 4.20 GB available
  const baseAvailableGB = 4.20;
  const downloadedGB = totalBytes / (1024 * 1024 * 1024);
  const availableGB = Math.max(0, baseAvailableGB - downloadedGB);
  
  const totalUsedGB = 5.0 - availableGB;
  const availablePercent = (availableGB / 5.0) * 100;
  const usedPercent = (totalUsedGB / 5.0) * 100;

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
          className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-colors relative ${
            currentView === 'downloads' ? 'text-white bg-white/10 shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <div className="relative">
            <DownloadCloud className="w-5 h-5" />
            {newDownloadsCount > 0 && currentView !== 'downloads' && (
              <span className="absolute -top-2 -right-2 flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-[#a855f7] text-white text-[10px] font-bold animate-bounce shadow-[0_0_10px_rgba(168,85,247,0.6)]">
                {newDownloadsCount}
              </span>
            )}
          </div>
          Mis descargas
        </button>
      </div>

      <div className="p-6">
        <button 
          onClick={() => onViewChange('downloads')}
          className="relative w-full flex items-center justify-center py-3 rounded-xl bg-white/5 border border-white/10 overflow-hidden hover:bg-white/10 transition-colors group"
        >
          {/* Progress fill */}
          <div 
            className={`absolute left-0 top-0 bottom-0 transition-all duration-500 ${
              availablePercent >= 50 ? 'bg-green-500/40' : 
              availablePercent >= 15 ? 'bg-yellow-500/40' : 
              'bg-red-500/40'
            }`} 
            style={{ width: `${usedPercent}%` }}
          />
          <span className="relative z-10 text-white/70 text-xs font-medium tracking-wide group-hover:text-white transition-colors">
            {availableGB.toFixed(2)}GB / 5GB libres
          </span>
        </button>
      </div>
    </aside>
  );
};
