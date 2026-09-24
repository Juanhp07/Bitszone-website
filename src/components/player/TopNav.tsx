import React from 'react';
import { Menu, Search } from 'lucide-react';

export const TopNav = ({ currentView, onViewChange, onToggleSidebar }: { currentView: string, onViewChange: (view: any) => void, onToggleSidebar: () => void }) => {
  return (
    <header className="h-20 w-full bg-black flex items-center justify-between px-8 relative z-20 shrink-0">
      <div className="flex items-center gap-6 w-[250px]">
        <button onClick={onToggleSidebar} className="text-white/70 hover:text-white transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 max-w-xl px-6">
        <div className="relative group">
          <Search className="w-4 h-4 text-white/40 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-white/70 transition-colors" />
          <input 
            type="text" 
            placeholder="Search" 
            className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 w-[250px]">
        <button className="px-5 py-2 rounded-full border border-white/20 text-sm font-medium hover:bg-white/10 transition-colors">
          Acceder
        </button>
      </div>
    </header>
  );
};
