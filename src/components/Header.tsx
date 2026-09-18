import React from 'react';

export const Header = () => {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 md:px-12 md:py-8 max-w-[1440px] mx-auto">
      <div className="flex items-center gap-2">
        {/* Logo placeholder */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-accent to-brand-primary flex items-center justify-center">
          <div className="w-4 h-4 bg-canvas rounded-full"></div>
        </div>
        <span className="font-sora font-bold text-xl tracking-wide text-white">Bitszone</span>
      </div>
      
      <nav className="hidden md:flex items-center gap-8">
        <a href="#" className="font-inter text-sm font-medium text-white transition-colors">Inicio</a>
        <a href="#" className="font-inter text-sm font-medium text-[#A0A3BD] hover:text-white transition-colors">Mis Descargas</a>
      </nav>
    </header>
  );
};
