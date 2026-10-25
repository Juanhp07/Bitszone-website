import React from 'react';
import { X } from 'lucide-react';

interface DownloadProgressPillProps {
  onCancel: (e: React.MouseEvent) => void;
  downloadedCount?: number;
  totalCount?: number;
  size?: 'sm' | 'md';
  className?: string;
}

export const DownloadProgressPill: React.FC<DownloadProgressPillProps> = ({
  onCancel,
  downloadedCount = 0,
  totalCount = 0,
  size = 'sm',
  className = ''
}) => {
  const hasProgress = totalCount > 0 && downloadedCount > 0;
  const progressPercent = totalCount > 0 ? Math.min(100, Math.round((downloadedCount / totalCount) * 100)) : 0;

  return (
    <button
      onClick={onCancel}
      title="Cancelar descarga en curso"
      aria-label="Descargando álbum. Clic para cancelar descarga"
      className={`relative overflow-hidden w-max rounded-full border border-emerald-500/35 hover:border-red-500/40 bg-[#061811]/90 hover:bg-red-950/20 backdrop-blur-md flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.2)] hover:shadow-[0_0_12px_rgba(239,68,68,0.25)] transition-all duration-300 cursor-pointer group/dlpill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
        size === 'md' ? 'px-3 py-1.5 mt-2 md:mt-3' : 'px-2.5 py-1 mt-2'
      } ${className}`}
    >
      <style>{`
        @keyframes bzPillIndeterminate {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(60%); }
          100% { transform: translateX(230%); }
        }
        @keyframes bzPillShimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(250%); }
        }
      `}</style>

      {/* Base track: dark translucent emerald glass */}
      <div className="absolute inset-0 bg-emerald-950/40 pointer-events-none" />

      {/* Solid Green Loading Bar Layer */}
      {hasProgress ? (
        <div 
          className="absolute inset-y-0 left-0 bg-[#10b981] opacity-85 group-hover/dlpill:opacity-30 transition-all duration-500 ease-out rounded-full"
          style={{ width: `${Math.max(14, progressPercent)}%` }}
        />
      ) : (
        /* Indeterminate Solid Green Loading Bar */
        <div 
          className="absolute inset-y-0 w-2/5 bg-[#10b981] opacity-75 group-hover/dlpill:opacity-25 rounded-full pointer-events-none"
          style={{ animation: 'bzPillIndeterminate 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite' }}
        />
      )}

      {/* Specular Light Shimmer Reflection */}
      <div 
        className="absolute inset-y-0 w-full pointer-events-none opacity-35 group-hover/dlpill:opacity-0 transition-opacity"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
          animation: 'bzPillShimmer 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite'
        }}
      />

      {/* Normal label: DESCARGANDO... */}
      <span className={`relative z-10 font-bold tracking-wider uppercase text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] group-hover/dlpill:hidden flex items-center ${
        size === 'md' ? 'text-xs' : 'text-[9px]'
      }`}>
        Descargando...
      </span>

      {/* Hover state: CANCELAR */}
      <span className={`relative z-10 font-bold tracking-wider uppercase text-red-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] hidden group-hover/dlpill:flex items-center gap-1 ${
        size === 'md' ? 'text-xs' : 'text-[9px]'
      }`}>
        <X className={`${size === 'md' ? 'w-3.5 h-3.5' : 'w-3 h-3'} text-red-400`} />
        Cancelar
      </span>
    </button>
  );
};
