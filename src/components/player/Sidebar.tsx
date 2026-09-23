import React from 'react';

export const Sidebar = ({ currentView, onViewChange }: { currentView: string, onViewChange: (view: any) => void }) => {
  return (
    <aside className="w-64 h-full flex flex-col bg-transparent border-r border-white/10 shrink-0">
      <div className="flex-1 px-4 py-8 flex flex-col gap-2">
        <button 
          onClick={() => onViewChange('catalog')}
          className={`flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-colors ${
            currentView === 'catalog' ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          Inicio
        </button>
        <button 
          className="flex items-center gap-4 px-4 py-3 rounded-lg font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          Biblioteca
        </button>
        <button 
          onClick={() => onViewChange('downloads')}
          className={`flex items-center gap-4 px-4 py-3 rounded-lg font-medium transition-colors ${
            currentView === 'downloads' ? 'text-white bg-white/10' : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          Mis descargas
        </button>
      </div>

      <div className="p-6 border-t border-white/10">
        <div className="flex items-center justify-center py-3 rounded-xl border border-white/20 text-white/70 text-sm font-medium">
          4.2GB disponible
        </div>
      </div>
    </aside>
  );
};
