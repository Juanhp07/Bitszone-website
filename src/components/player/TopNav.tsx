import React from 'react';

export const TopNav = ({ currentView, onViewChange }: { currentView: string, onViewChange: (view: any) => void }) => {
  return (
    <nav className="w-full h-20 flex items-center justify-between px-8 bg-transparent shrink-0">
      {/* Left: Menu & Logo */}
      <div className="flex items-center gap-6 w-[250px]">
        <button className="text-white/70 hover:text-white transition-colors">
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"></path></svg>
        </button>
        <h1 className="text-xl font-bold tracking-[0.2em] text-white cursor-pointer" onClick={() => onViewChange('catalog')}>
          BITSZONE
        </h1>
      </div>

      {/* Center: Search */}
      <div className="flex-1 flex justify-center max-w-2xl">
        <div className="w-full max-w-md flex items-center bg-transparent border border-white/20 rounded-full px-4 py-2 hover:border-white/40 transition-colors focus-within:border-white/60">
          <svg className="w-4 h-4 text-white/50 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input 
            type="text" 
            placeholder="Search" 
            className="bg-transparent border-none outline-none text-sm text-white placeholder-white/40 w-full"
          />
        </div>
      </div>

      {/* Right: Acceder */}
      <div className="w-[250px] flex justify-end">
        <button className="px-6 py-2 rounded-full border border-white/20 text-sm font-medium text-white hover:bg-white/10 transition-colors">
          Acceder
        </button>
      </div>
    </nav>
  );
};
