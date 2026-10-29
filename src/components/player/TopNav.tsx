import React from 'react';
import { User } from 'lucide-react';

export const TopNav = ({ 
  currentView, 
  onViewChange, 
  onToggleSidebar, 
  isSidebarOpen,
  loading = false
}: { 
  currentView: string, 
  onViewChange: (view: any) => void, 
  onToggleSidebar: () => void, 
  isSidebarOpen: boolean,
  loading?: boolean
}) => {
  return (
    <header className="h-14 w-full bg-transparent flex items-center justify-between px-3 md:px-8 relative z-20 shrink-0" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Left: Menu & Brand Logo */}
      <div 
        className="flex items-center gap-3 transition-opacity duration-700 ease-out"
        style={{ opacity: loading ? 0 : 1 }}
      >
        <button 
          onClick={onToggleSidebar} 
          className="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors max-md:[--burger-shift:0px] max-md:[--burger-opacity:1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-lg p-1.5 cursor-pointer"
          title={isSidebarOpen ? "Ocultar menú lateral" : "Mostrar menú lateral"}
          aria-label={isSidebarOpen ? "Ocultar menú lateral" : "Mostrar menú lateral"}
          aria-expanded={isSidebarOpen}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="overflow-visible" aria-hidden="true">
            <line x1="4" y1="6" x2="20" y2="6" className="transition-transform duration-300" />
            <line x1="4" y1="12" x2="20" y2="12" className="transition-transform duration-300" />
            <line x1="4" y1="18" x2="20" y2="18" 
              className="transition-all duration-300 ease-in-out"
              style={{
                transform: isSidebarOpen ? 'translateX(0)' : 'translateX(var(--burger-shift, -16px))',
                opacity: isSidebarOpen ? 1 : 'var(--burger-opacity, 0)' as any
              }}
            />
          </svg>
        </button>

        <button 
          onClick={() => {
            if (currentView !== 'catalog') {
              onViewChange('catalog');
            } else {
              window.location.reload();
            }
          }}
          className="cursor-pointer hover:opacity-85 active:scale-95 border-none bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-lg py-1 px-1 flex items-center transition-transform"
          title="Bitszone - Inicio"
          aria-label="Bitszone - Ir al catálogo"
        >
          <span className="font-inter text-xl md:text-2xl leading-none tracking-[-0.03em] select-none">
            <span className="font-black text-white">Bits</span><span className="font-bold text-white/60">zone</span>
          </span>
        </button>
      </div>

      {/* Right: Acceder */}
      <div 
        className="flex items-center justify-end transition-opacity duration-700 ease-out"
        style={{ opacity: loading ? 0 : 1 }}
      >
        <a 
          href="/login" 
          aria-label="Acceder a tu cuenta"
          title="Acceder a tu cuenta"
          className="h-9 px-3.5 md:px-4 rounded-full border border-white/20 text-xs md:text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
        >
          <User className="w-4 h-4" aria-hidden="true" />
          <span className="hidden md:inline">Acceder</span>
        </a>
      </div>
    </header>
  );
};
