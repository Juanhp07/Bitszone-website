import React from 'react';
import { Menu, User } from 'lucide-react';

export const TopNav = ({ currentView, onViewChange, onToggleSidebar }: { currentView: string, onViewChange: (view: any) => void, onToggleSidebar: () => void }) => {
  return (
    <header className="h-20 w-full bg-black flex items-center px-8 relative z-20 shrink-0 border-b border-transparent">
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
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Center: Logo */}
      <div className="flex-1 flex items-center justify-center">
        <span 
          className="font-bold text-xl tracking-widest cursor-pointer"
          onClick={() => onViewChange('catalog')}
          style={{
            background: 'linear-gradient(45deg, #a855f7, #3b82f6, #a855f7)',
            backgroundSize: '200% 200%',
            animation: 'gradientMove 3s ease infinite',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          BITSZONE
        </span>
      </div>

      {/* Right: Acceder */}
      <div className="flex-1 flex items-center justify-end">
        <button className="px-5 py-2 rounded-full border border-white/20 text-sm font-medium hover:bg-white/10 transition-colors flex items-center gap-2 text-white">
          <User className="w-4 h-4" />
          Acceder
        </button>
      </div>
    </header>
  );
};
