import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Library, DownloadCloud, HardDrive, Keyboard, Settings, User, LogOut } from "lucide-react";
import { PopoverMenu } from "../ui/PopoverMenu";
import { useDownloads } from "./DownloadsContext";

export const Sidebar = ({
  currentView,
  onViewChange,
  onToggleShortcuts,
  onToggleConfig,
  onToggleSidebar,
  isShortcutsOpen,
  isMobile = false,
  isCollapsed = false,
  account = null,
  onSignOut
}: {
  currentView: string;
  onViewChange: (view: any) => void;
  onToggleShortcuts: () => void;
  onToggleConfig: () => void;
  onToggleSidebar?: () => void;
  isShortcutsOpen: boolean;
  isMobile?: boolean;
  isCollapsed?: boolean;
  account?: { name: string; avatarUrl?: string | null } | null;
  onSignOut?: () => void;
}) => {
  const { totalBytes, newDownloadsCount } = useDownloads();
  const [accountMenu, setAccountMenu] = useState<{ x: number; y: number } | null>(null);

  // Start precisely at 5.00 GB available
  const baseAvailableGB = 5.0;
  const downloadedGB = totalBytes / (1024 * 1024 * 1024);
  const availableGB = Math.max(0, baseAvailableGB - downloadedGB);

  const totalUsedGB = 5.0 - availableGB;
  const availablePercent = (availableGB / 5.0) * 100;
  const usedPercent = (totalUsedGB / 5.0) * 100;

  return (
    <aside className={`w-full h-full flex flex-col bg-transparent ${isMobile ? 'pt-[max(1rem,env(safe-area-inset-top))]' : 'pt-3'}`}>
      {/* Sidebar Header: Brand Logo & Menu Toggle */}
      <div className={`pt-1 pb-3 flex items-center shrink-0 ${isCollapsed ? 'justify-center px-2' : 'justify-between px-5'}`}>
        {!isCollapsed && (
          <button
            onClick={() => {
              if (currentView !== 'catalog') {
                onViewChange('catalog');
              } else {
                window.location.reload();
              }
            }}
            className="cursor-pointer hover:opacity-85 active:scale-95 border-none bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-lg py-1 px-1 flex items-center transition-transform"
            title="Bitszone - Inicio"
            aria-label="Bitszone - Ir al catálogo"
          >
            <span className="font-inter font-bold text-2xl text-white tracking-tight select-none">
              Bitszone
            </span>
          </button>
        )}

        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className={`flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer ${
              isCollapsed ? 'w-11 h-11 rounded-xl' : 'w-10 h-10 rounded-lg p-1.5'
            }`}
            title={isCollapsed ? "Expandir menú lateral" : "Ocultar menú lateral"}
            aria-label={isCollapsed ? "Expandir menú lateral" : "Ocultar menú lateral"}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </button>
        )}
      </div>

      <div className={`flex-1 flex flex-col py-2 ${isCollapsed ? 'px-2.5 items-center gap-2' : 'px-4 gap-1.5'}`}>
        <button
          onClick={() => onViewChange("catalog")}
          className={`flex items-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer ${
            ['catalog', 'album', 'artist'].includes(currentView)
              ? "text-white bg-white/10 shadow-sm"
              : "text-white/60 hover:text-white hover:bg-white/5"
          } ${
            isCollapsed ? "justify-center w-11 h-11 p-0" : "gap-4 px-4 py-3 w-full"
          }`}
          title="Inicio"
          aria-label="Inicio - Ir al catálogo"
        >
          <Home className="w-5 h-5 shrink-0" aria-hidden="true" />
          {!isCollapsed && <span>Inicio</span>}
        </button>

        <button
          onClick={() => onViewChange("library")}
          className={`flex items-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer ${
            currentView.startsWith('library')
              ? "text-white bg-white/10 shadow-sm"
              : "text-white/60 hover:text-white hover:bg-white/5"
          } ${
            isCollapsed ? "justify-center w-11 h-11 p-0" : "gap-4 px-4 py-3 w-full"
          }`}
          title="Biblioteca"
          aria-label="Biblioteca - Ir a tu biblioteca"
        >
          <Library className="w-5 h-5 shrink-0" aria-hidden="true" />
          {!isCollapsed && <span>Biblioteca</span>}
        </button>

        <button
          onClick={() => onViewChange("downloads")}
          className={`flex items-center rounded-xl font-medium transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer ${
            currentView === "downloads"
              ? "text-white bg-white/10 shadow-sm"
              : "text-white/60 hover:text-white hover:bg-white/5"
          } ${
            isCollapsed ? "justify-center w-11 h-11 p-0" : "gap-4 px-4 py-3 w-full"
          }`}
          title="Mis descargas"
          aria-label="Mis descargas"
        >
          <div className="relative flex items-center justify-center">
            <DownloadCloud className="w-5 h-5 shrink-0" aria-hidden="true" />
            {newDownloadsCount > 0 && currentView !== "downloads" && isCollapsed && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#f0abfc] shadow-[0_0_8px_rgba(232,121,249,1)]" />
            )}
          </div>
          {!isCollapsed && (
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
                        className="text-[#f0abfc] text-[13px] leading-none mt-[1px] font-extrabold tracking-wider absolute"
                        style={{ textShadow: '0 0 10px rgba(232, 121, 249, 1), 0 0 20px rgba(232, 121, 249, 0.8), 0 0 40px rgba(168, 85, 247, 0.6)' }}
                      >
                        {newDownloadsCount}
                      </motion.span>
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </button>
      </div>

      <div className="mt-auto flex flex-col pb-4" style={isMobile ? { paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' } : undefined}>
        {/* Buttons (Acceder / Atajos / Configuración) */}
        <div className={`pb-3 flex flex-col relative ${isCollapsed ? 'px-2.5 items-center gap-2' : 'px-4 gap-1'}`}>
           {account ? (
             <>
               <button
                 onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setAccountMenu({ x: r.left, y: r.top - 8 }); }}
                 aria-haspopup="menu"
                 aria-label={`Cuenta de ${account.name}`}
                 title={account.name}
                 className={`flex items-center rounded-xl font-medium transition-colors text-white/60 hover:text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer ${
               isCollapsed ? 'justify-center w-11 h-11 p-0' : 'gap-4 px-4 py-3 w-full'
             } cursor-pointer`}
               >
                 <span className="w-6 h-6 rounded-full bg-white/10 overflow-hidden flex items-center justify-center shrink-0">
                   {account.avatarUrl ? <img src={account.avatarUrl} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4" aria-hidden="true" />}
                 </span>
                 {!isCollapsed && <span className="truncate">{account.name}</span>}
               </button>
               <PopoverMenu
                 open={!!accountMenu}
                 anchor={accountMenu}
                 width={200}
                 onClose={() => setAccountMenu(null)}
                 items={[{ label: 'Cerrar sesión', icon: <LogOut className="w-4 h-4" />, danger: true, onSelect: () => onSignOut?.() }]}
               />
             </>
           ) : (
           <a 
             href="/login"
             className={`flex items-center rounded-xl font-medium transition-colors text-white/60 hover:text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer ${
               isCollapsed ? 'justify-center w-11 h-11 p-0' : 'gap-4 px-4 py-3 w-full'
             }`}
             title="Acceder a tu cuenta"
             aria-label="Acceder a tu cuenta"
           >
             <User className="w-5 h-5 shrink-0" aria-hidden="true" />
             {!isCollapsed && <span>Acceder</span>}
           </a>
           )}

           {!isMobile && (
             <button 
               onClick={onToggleShortcuts}
               className={`flex items-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer ${
                 isShortcutsOpen ? "text-white bg-white/10" : "text-white/60 hover:text-white hover:bg-white/5"
               } ${
                 isCollapsed ? 'justify-center w-11 h-11 p-0' : 'gap-4 px-4 py-3 w-full'
               }`}
               title="Atajos de teclado"
               aria-label="Atajos de teclado"
               aria-expanded={isShortcutsOpen}
             >
               <Keyboard className="w-5 h-5 shrink-0" aria-hidden="true" />
               {!isCollapsed && <span>Atajos</span>}
             </button>
           )}
           
           <button 
             onClick={onToggleConfig}
             className={`flex items-center rounded-xl font-medium transition-colors text-white/60 hover:text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer ${
               isCollapsed ? 'justify-center w-11 h-11 p-0' : 'gap-4 px-4 py-3 w-full'
             }`}
             title="Configuración"
             aria-label="Configuración"
           >
             <Settings className="w-5 h-5 shrink-0" aria-hidden="true" />
             {!isCollapsed && <span>Configuración</span>}
           </button>
        </div>

        {/* Storage display */}
        {isCollapsed ? (
          <div
            role="button"
            tabIndex={0}
            title={`Almacenamiento: ${availableGB.toFixed(2)}GB disponibles de 5.00GB`}
            aria-label={`Almacenamiento: ${availableGB.toFixed(2)}GB disponibles de 5.00GB`}
            className="w-full pt-3 pb-2 border-t border-white/[0.08] flex flex-col items-center justify-center cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
            onClick={() => onViewChange("downloads")}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onViewChange("downloads")}
          >
            <div className="w-11 h-11 rounded-xl flex flex-col items-center justify-center group-hover:bg-white/5 transition-colors">
              <HardDrive className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
              <div className="w-6 h-1 bg-white/10 rounded-full overflow-hidden mt-1 shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    availablePercent >= 50
                      ? "bg-gradient-to-r from-[#a855f7] to-[#d946ef]"
                      : availablePercent >= 15
                        ? "bg-amber-500"
                        : "bg-rose-500"
                  }`}
                  style={{ width: `${usedPercent}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div 
            role="button"
            tabIndex={0}
            title="Ver almacenamiento en Mis descargas"
            aria-label={`Almacenamiento: ${availableGB.toFixed(2)}GB disponibles de 5.00GB`}
            className="w-full pt-5 pb-2 border-t border-white/[0.08] relative group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400" 
            onClick={() => onViewChange("downloads")}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onViewChange("downloads")}
          >
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
        )}
      </div>
    </aside>
  );
};
