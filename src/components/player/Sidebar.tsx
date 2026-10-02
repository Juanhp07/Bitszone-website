import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Library, DownloadCloud, HardDrive, Keyboard, Settings } from "lucide-react";
import { useDownloads } from "./DownloadsContext";

export const Sidebar = ({
  currentView,
  onViewChange,
  onToggleShortcuts,
  onToggleConfig,
  isShortcutsOpen
}: {
  currentView: string;
  onViewChange: (view: any) => void;
  onToggleShortcuts: () => void;
  onToggleConfig: () => void;
  isShortcutsOpen: boolean;
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
            ['catalog', 'album', 'artist'].includes(currentView)
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
          className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-colors relative w-full ${
            currentView === "downloads"
              ? "text-white bg-white/10 shadow-sm"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
        >
          <DownloadCloud className="w-5 h-5 shrink-0" />
          <div className="flex-1 flex items-center justify-between min-w-0">
            <span className="truncate">Mis descargas</span>
            <AnimatePresence>
              {newDownloadsCount > 0 && currentView !== "downloads" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative flex items-center justify-center h-6 min-w-[24px] ml-2"
                >
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={newDownloadsCount}
                      initial={{ y: 25, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -25, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10, mass: 1 }}
                      className="text-[#f0abfc] text-lg font-extrabold tracking-wider absolute"
                      style={{ textShadow: '0 0 10px rgba(232, 121, 249, 1), 0 0 20px rgba(232, 121, 249, 0.8), 0 0 40px rgba(168, 85, 247, 0.6)' }}
                    >
                      {newDownloadsCount}
                    </motion.span>
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </button>
      </div>

      <div className="mt-auto flex flex-col pb-4">
        {/* Buttons (Atajos / Configuración) */}
        <div className="px-4 pb-4 flex flex-col gap-1 relative">
           <button 
             onClick={onToggleShortcuts}
             className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-colors ${isShortcutsOpen ? "text-white bg-white/10" : "text-white/60 hover:text-white hover:bg-white/5"}`}
           >
             <Keyboard className="w-5 h-5 shrink-0" />
             <span>Atajos</span>
           </button>
           
           <button 
             onClick={onToggleConfig}
             className="flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-colors text-white/60 hover:text-white hover:bg-white/5"
           >
             <Settings className="w-5 h-5 shrink-0" />
             <span>Configuración</span>
           </button>
        </div>

        {/* Storage display */}
        <div className="w-full pt-5 pb-2 border-t border-white/[0.08] relative group cursor-pointer" onClick={() => onViewChange("downloads")}>
           <div className="px-6 flex flex-col items-start w-full relative z-10 gap-1 mb-3">
             <div className="flex items-center gap-2 text-white/40 group-hover:text-white/70 transition-colors duration-300">
               <HardDrive className="w-4 h-4" />
               <span className="text-[11px] font-bold capitalize tracking-[0.1em]">Almacenamiento</span>
             </div>
             <span className="text-white/80 text-xs font-bold tracking-wide pl-[24px]">
               {availableGB.toFixed(2)}GB <span className="text-white/40 font-medium">de 5.00GB</span>
             </span>
          </div>
          
          <div className="mx-6 h-3.5 bg-white/5 rounded-full overflow-hidden relative shadow-inner">
             <div 
                className={`h-full rounded-full transition-all duration-700 relative animated-storage-bar ${
                  availablePercent >= 50
                    ? "bg-gradient-to-r from-[#a855f7] via-[#d946ef] to-[#a855f7] shadow-[0_0_12px_rgba(168,85,247,0.6)]"
                    : availablePercent >= 15
                      ? "bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
                      : "bg-gradient-to-r from-rose-500 via-red-400 to-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]"
                }`}
                style={{ width: `${usedPercent}%` }}
             >
                {/* Shine effect on the bar */}
                <div className="absolute top-0 left-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
             </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
