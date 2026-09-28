import React from "react";
import { Home, Library, DownloadCloud, HardDrive } from "lucide-react";
import { useDownloads } from "./DownloadsContext";

export const Sidebar = ({
  currentView,
  onViewChange,
}: {
  currentView: string;
  onViewChange: (view: any) => void;
}) => {
  const { totalBytes, newDownloadsCount } = useDownloads();

  // Start precisely at 5.00 GB available
  const baseAvailableGB = 5.0;
  const downloadedGB = totalBytes / (1024 * 1024 * 1024);
  const availableGB = Math.max(0, baseAvailableGB - downloadedGB);

  const totalUsedGB = 5.0 - availableGB;
  const availablePercent = (availableGB / 5.0) * 100;
  const usedPercent = (totalUsedGB / 5.0) * 100;

  return (
    <aside className="w-full h-full flex flex-col bg-transparent pt-20">
      <div className="flex-1 px-4 py-6 flex flex-col gap-2">
        <button
          onClick={() => onViewChange("catalog")}
          className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-colors ${
            currentView === "catalog"
              ? "text-white bg-white/10 shadow-sm"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <Home className="w-5 h-5" />
          Inicio
        </button>
        <button
          onClick={() => onViewChange("library")}
          className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-colors ${
            currentView === "library"
              ? "text-white bg-white/10 shadow-sm"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <Library className="w-5 h-5" />
          Biblioteca
        </button>
        <button
          onClick={() => onViewChange("downloads")}
          className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-colors relative ${
            currentView === "downloads"
              ? "text-white bg-white/10 shadow-sm"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <div className="relative">
            <DownloadCloud className="w-5 h-5" />
            {newDownloadsCount > 0 && currentView !== "downloads" && (
              <span
                key={newDownloadsCount}
                className="absolute -top-2 -right-2 flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-gradient-to-r from-[#a855f7] to-[#3b82f6] text-white text-[10px] font-bold animate-sparkle"
              >
                {newDownloadsCount}
              </span>
            )}
          </div>
          Mis descargas
        </button>
      </div>

      <div className="p-6">
        <button
          onClick={() => onViewChange("downloads")}
          className="relative w-full flex flex-col gap-3 p-4 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.02] transition-all duration-300 group overflow-hidden"
        >
          {/* Top row: Icon + Text */}
          <div className="flex flex-col items-start w-full relative z-10 gap-1">
             <div className="flex items-center gap-2 text-white/40 group-hover:text-white/70 transition-colors duration-300">
               <HardDrive className="w-3.5 h-3.5" />
               <span className="text-[11px] font-semibold capitalize tracking-wide">Almacenamiento</span>
             </div>
             <span className="text-white/80 text-[11px] font-medium tracking-wide font-mono pl-[22px]">
               {availableGB.toFixed(2)}GB <span className="text-white/40">de 5.00GB</span>
             </span>
          </div>
          
          {/* Modern Slim Progress Bar */}
          <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden relative z-10 shadow-inner">
             <div 
                className={`h-full rounded-full transition-all duration-700 relative ${
                  availablePercent >= 50
                    ? "bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_10px_rgba(52,211,153,0.4)]"
                    : availablePercent >= 15
                      ? "bg-gradient-to-r from-amber-500 to-yellow-400 shadow-[0_0_10px_rgba(251,191,36,0.4)]"
                      : "bg-gradient-to-r from-rose-500 to-red-400 shadow-[0_0_10px_rgba(244,63,94,0.4)]"
                }`}
                style={{ width: `${usedPercent}%` }}
             >
                {/* Shine effect on the bar */}
                <div className="absolute top-0 left-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
             </div>
          </div>
          
          {/* Subtle background glow based on usage */}
          <div 
             className={`absolute -bottom-6 -right-6 w-24 h-24 blur-3xl rounded-full opacity-10 transition-all duration-700 group-hover:opacity-30 ${
                availablePercent >= 50 ? "bg-green-500" : availablePercent >= 15 ? "bg-yellow-500" : "bg-red-500"
             }`} 
          />
        </button>
      </div>
    </aside>
  );
};
