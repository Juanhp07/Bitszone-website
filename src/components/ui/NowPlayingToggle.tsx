import { Play, Pause, Loader2 } from 'lucide-react';
import { EqBars } from './EqBars';

/** Equalizer bars of the song that is playing. Hovering shows what a click does (pause / play) with a small pop. */
export const NowPlayingToggle = ({
  isPlaying,
  isLoading,
  onToggle,
  className = '',
}: {
  isPlaying: boolean;
  isLoading: boolean;
  onToggle: () => void;
  className?: string;
}) => {
  const layer = 'absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]';
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      title={isPlaying ? 'Pausar' : 'Reanudar'}
      aria-label={isPlaying ? 'Pausar' : 'Reanudar'}
      className={`group/eq relative w-9 h-9 md:w-10 md:h-10 shrink-0 rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ${className}`}
    >
      <span className={`${layer} ${isLoading ? 'opacity-0 scale-50' : 'opacity-100 scale-100 group-hover/eq:opacity-0 group-hover/eq:scale-50'}`}>
        <EqBars playing={isPlaying} className="h-5 md:h-6 shrink-0" barClassName="w-[3px] md:w-[4px] bg-[#e9d5ff]" />
      </span>
      <span className={`${layer} text-[#e9d5ff] ${isLoading ? 'opacity-0 scale-50' : 'opacity-0 scale-50 group-hover/eq:opacity-100 group-hover/eq:scale-100'}`}>
        {isPlaying ? <Pause className="w-5 h-5" fill="currentColor" aria-hidden="true" /> : <Play className="w-5 h-5 ml-0.5" fill="currentColor" aria-hidden="true" />}
      </span>
      <span className={`${layer} text-[#e9d5ff] ${isLoading ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
        <Loader2 className="w-5 h-5 animate-spin" aria-label="Cargando canción" />
      </span>
    </button>
  );
};
