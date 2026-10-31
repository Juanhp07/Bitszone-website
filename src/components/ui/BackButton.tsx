import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';

/** Round glass button that widens to show its label on hover. Defaults to the "Atrás" back button (same as the album page). */
export const BackButton = ({ onClick, label = 'Atrás', className = '', dark = false, icon, text = 'Atrás', hoverWidth = 'hover:w-[94px] md:hover:w-[102px]', reverse = false }: {
  onClick: () => void; label?: string; className?: string;
  /** darker glass with a stronger border, for busy or bright backgrounds */ dark?: boolean;
  icon?: ReactNode; text?: string;
  /** full literal Tailwind classes for the width when hovered (the label's width) */ hoverWidth?: string;
  /** label opens to the left of the icon, for buttons anchored to the right edge */ reverse?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`group flex items-center h-10 md:h-11 w-10 md:w-11 ${hoverWidth} ${reverse ? 'flex-row-reverse' : ''} shrink-0 rounded-full ${dark ? 'bg-black/35 hover:bg-black/50 active:bg-black/60 border border-white/40 hover:border-white/60' : 'bg-white/10 hover:bg-white/15 active:bg-white/20 border border-white/20 hover:border-white/30'} backdrop-blur-2xl shadow-[0_8px_30px_rgba(0,0,0,0.35)] text-white/90 hover:text-white transition-[width,background-color,border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer overflow-hidden select-none [@media(hover:none)]:!w-10 md:[@media(hover:none)]:!w-11 ${className}`}
    // touch screens keep hover stuck after a tap, so there the button stays a plain circle
    title={hoverWidth ? undefined : text}
    aria-label={label}
  >
    <div className="w-10 md:w-11 h-10 md:h-11 flex items-center justify-center shrink-0">
      {icon ?? <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-0.5" strokeWidth={2.2} aria-hidden="true" />}
    </div>
    <span className={`opacity-0 group-hover:opacity-100 [@media(hover:none)]:hidden transition-opacity duration-200 delay-75 text-sm font-medium tracking-wide ${reverse ? 'pl-3' : 'pr-3'} whitespace-nowrap`}>{text}</span>
  </button>
);
