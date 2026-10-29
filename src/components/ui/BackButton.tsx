import { ArrowLeft } from 'lucide-react';

/** Round glass back button that widens to show "Atrás" on hover (same as the album page) */
export const BackButton = ({ onClick, label = 'Atrás', className = '' }: { onClick: () => void; label?: string; className?: string }) => (
  <button
    onClick={onClick}
    className={`group flex items-center h-10 md:h-11 w-10 md:w-11 hover:w-[94px] md:hover:w-[102px] shrink-0 rounded-full bg-white/10 hover:bg-white/15 active:bg-white/20 backdrop-blur-2xl border border-white/20 hover:border-white/30 shadow-[0_8px_30px_rgba(0,0,0,0.35)] text-white/90 hover:text-white transition-[width,background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer overflow-hidden select-none ${className}`}
    title="Atrás"
    aria-label={label}
  >
    <div className="w-10 md:w-11 h-10 md:h-11 flex items-center justify-center shrink-0">
      <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-0.5" strokeWidth={2.2} aria-hidden="true" />
    </div>
    <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-75 text-sm font-medium tracking-wide pr-3 whitespace-nowrap">Atrás</span>
  </button>
);
