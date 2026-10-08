import React, { useState } from 'react';
import { X } from 'lucide-react';
import { User } from 'lucide-react';
import { SpecularText } from '../ui/SpecularText';

export const TopNav = ({ currentView, onViewChange, onToggleSidebar, isSidebarOpen }: { currentView: string, onViewChange: (view: any) => void, onToggleSidebar: () => void, isSidebarOpen: boolean }) => {
    return (
    <header className="h-16 md:h-20 w-full bg-transparent flex items-center px-3 md:px-8 relative z-20 shrink-0" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Left: Menu */}
      <div className="flex-1 flex items-center">
        <button onClick={onToggleSidebar} aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"} aria-expanded={isSidebarOpen} className="w-11 h-11 -ml-1 md:ml-0 md:w-auto md:h-auto flex items-center justify-center text-white/70 hover:text-white transition-colors max-md:[--burger-shift:0px] max-md:[--burger-opacity:1]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="overflow-visible">
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
      </div>

      {/* Center: Logo */}
      <div className="flex-1 flex items-center justify-center">
        
        <button 
          onClick={() => window.location.reload()}
          className="cursor-pointer hover:opacity-80 hover:scale-105 active:scale-95 transition-all duration-300 border-none bg-transparent"
          aria-label="Recargar página"
        >
          <SpecularText
            text="Bitszone"
            className="pe-2"
            style={{
              fontSize: "clamp(30px, 8vw, 42px)",
              fontFamily: '"DM Serif Display", serif',
              fontStyle: "italic",
            }}
            specularColor="#5A1B5E"
            baseStrokeColor="transparent"
            strokeWidth={1.5}
            glowSize={50}
          />
        </button>

      </div>

      {/* Right: Acceder */}
      <div className="flex-1 flex items-center justify-end">
        <a href="/login" aria-label="Acceder" className="w-11 h-11 md:w-auto md:h-auto justify-center md:px-5 md:py-2 rounded-full border border-white/20 text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2 text-white">
          <User className="w-[18px] h-[18px] md:w-4 md:h-4" />
          <span className="hidden md:inline">Acceder</span>
        </a>
      </div>
    </header>
  );
};
