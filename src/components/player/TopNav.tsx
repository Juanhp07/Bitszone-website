import React, { useState } from 'react';
import { X } from 'lucide-react';
import { User } from 'lucide-react';
import { SpecularText } from '../ui/SpecularText';

export const TopNav = ({ currentView, onViewChange, onToggleSidebar, isSidebarOpen }: { currentView: string, onViewChange: (view: any) => void, onToggleSidebar: () => void, isSidebarOpen: boolean }) => {
    return (
    <header className="h-20 w-full bg-transparent flex items-center px-8 relative z-20 shrink-0">
      <style>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Left: Menu */}
      <div className="flex-1 flex items-center">
        <button onClick={onToggleSidebar} className="text-white/70 hover:text-white transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="overflow-visible">
            <line x1="4" y1="6" x2="20" y2="6" className="transition-transform duration-300" />
            <line x1="4" y1="12" x2="20" y2="12" className="transition-transform duration-300" />
            <line x1="4" y1="18" x2="20" y2="18" 
              className="transition-all duration-300 ease-in-out"
              style={{
                transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-16px)',
                opacity: isSidebarOpen ? 1 : 0
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
              fontSize: "42px",
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
        <a href="/login" className="px-5 py-2 rounded-full border border-white/20 text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2 text-white">
          <User className="w-4 h-4" />
          Acceder
        </a>
      </div>
    </header>
  );
};
