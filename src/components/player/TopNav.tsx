import React from 'react';

export const TopNav = ({ currentView, onViewChange }: { currentView: string, onViewChange: (view: any) => void }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 h-24 flex items-center justify-between px-10 z-40 bg-gradient-to-b from-[#05050A]/90 to-transparent">
      {/* Logo */}
      <div className="flex items-center gap-6">
        <h1 className="text-xl font-bold tracking-[0.3em] text-white cursor-pointer" onClick={() => onViewChange('catalog')}>
          <span className="text-[#a855f7]">BITS</span>ZONE
        </h1>
        <div className="hidden lg:flex items-center gap-4 ml-8 text-sm">
          <button className="text-white/60 hover:text-white transition-colors">Iniciar sesión</button>
          <button className="px-5 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/10">Registrarse</button>
        </div>
      </div>

      {/* Center Nav */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-white/[0.03] backdrop-blur-md rounded-full p-1 border border-white/5 shadow-2xl">
        <button 
          onClick={() => onViewChange('catalog')}
          className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${currentView === 'catalog' ? 'bg-white/10 text-white shadow-sm' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
        >
          Inicio
        </button>
        <button 
          onClick={() => onViewChange('downloads')}
          className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${currentView === 'downloads' ? 'bg-[#a855f7] text-white shadow-lg shadow-purple-500/20' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
        >
          Mis Descargas
        </button>
      </div>

      {/* Right Tools */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5">
          <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]"></div>
          <span className="text-xs text-white/70 font-medium">En línea</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5">
          <svg className="w-4 h-4 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
          <span className="text-xs text-white/70 font-medium">4.2 GB libres</span>
        </div>
        <button className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#a855f7] to-[#ec4899] flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </button>
      </div>
    </nav>
  );
};
