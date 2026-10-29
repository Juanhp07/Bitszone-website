import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Library, DownloadCloud, HardDrive, Keyboard, Settings, User, LogOut, ChevronLeft } from "lucide-react";
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
  drawerOnRight = false,
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
  /** phone drawer opens from the right, so its close chevron points right */
  drawerOnRight?: boolean;
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
    <aside className={`w-full h-full flex flex-col bg-transparent px-3.5 ${isMobile ? 'pt-[max(1rem,env(safe-area-inset-top))]' : 'pt-3'}`}>
      {/* Sidebar Header: Brand Logo & Menu Toggle */}
      <div className="pt-1 pb-3 flex items-center justify-between shrink-0 h-14 overflow-hidden">
        <div
          className="flex items-center overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={{
            maxWidth: isCollapsed ? '0px' : '160px',
            opacity: isCollapsed ? 0 : 1,
            transform: isCollapsed ? 'translateX(-8px)' : 'translateX(0)'
          }}
        >
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
        </div>

        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="w-11 h-11 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 rounded-xl cursor-pointer shrink-0"
            title={isCollapsed ? "Expandir menú lateral" : "Contraer menú lateral"}
            aria-label={isCollapsed ? "Expandir menú lateral" : "Contraer menú lateral"}
          >
            <ChevronLeft
              className={`w-5 h-5 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                isCollapsed || drawerOnRight ? "rotate-180" : "rotate-0"
              }`}
              strokeWidth={2.2}
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      {/* Main Navigation Items */}
      <div className="flex-1 flex flex-col py-2 gap-1.5 overflow-hidden">
        <button
          onClick={() => onViewChange("catalog")}
          className={`flex items-center w-full h-11 rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer overflow-hidden ${
            ['catalog', 'album', 'artist'].includes(currentView)
              ? "text-white bg-white/10 shadow-sm"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
          title="Inicio"
          aria-label="Inicio - Ir al catálogo"
        >
          <div className="w-11 h-11 flex items-center justify-center shrink-0">
            <Home className="w-5 h-5 shrink-0" aria-hidden="true" />
          </div>
          <div
            className="flex-1 min-w-0 pr-3 flex items-center overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={{
              opacity: isCollapsed ? 0 : 1,
              transform: isCollapsed ? 'translateX(-8px)' : 'translateX(0)',
              maxWidth: isCollapsed ? '0px' : '180px'
            }}
          >
            <span className="truncate">Inicio</span>
          </div>
        </button>

        <button
          onClick={() => onViewChange("library")}
          className={`flex items-center w-full h-11 rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer overflow-hidden ${
            currentView.startsWith('library')
              ? "text-white bg-white/10 shadow-sm"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
          title="Biblioteca"
          aria-label="Biblioteca - Ir a tu biblioteca"
        >
          <div className="w-11 h-11 flex items-center justify-center shrink-0">
            <Library className="w-5 h-5 shrink-0" aria-hidden="true" />
          </div>
          <div
            className="flex-1 min-w-0 pr-3 flex items-center overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={{
              opacity: isCollapsed ? 0 : 1,
              transform: isCollapsed ? 'translateX(-8px)' : 'translateX(0)',
              maxWidth: isCollapsed ? '0px' : '180px'
            }}
          >
            <span className="truncate">Biblioteca</span>
          </div>
        </button>

        <button
          onClick={() => onViewChange("downloads")}
          className={`flex items-center w-full h-11 rounded-xl font-medium transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer overflow-hidden ${
            currentView === "downloads"
              ? "text-white bg-white/10 shadow-sm"
              : "text-white/60 hover:text-white hover:bg-white/5"
          }`}
          title="Mis descargas"
          aria-label="Mis descargas"
        >
          <div className="w-11 h-11 flex items-center justify-center shrink-0 relative">
            <DownloadCloud className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span
              className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#f0abfc] shadow-[0_0_8px_rgba(232,121,249,1)] transition-opacity duration-200 pointer-events-none"
              style={{ opacity: newDownloadsCount > 0 && currentView !== "downloads" && isCollapsed ? 1 : 0 }}
            />
          </div>
          <div
            className="flex-1 min-w-0 pr-3 flex items-center justify-between overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={{
              opacity: isCollapsed ? 0 : 1,
              transform: isCollapsed ? 'translateX(-8px)' : 'translateX(0)',
              maxWidth: isCollapsed ? '0px' : '180px'
            }}
          >
            <span className="truncate">Mis descargas</span>
            {newDownloadsCount > 0 && currentView !== "downloads" && (
              <span
                className="text-[#f0abfc] text-[13px] font-extrabold tracking-wider ml-2"
                style={{ textShadow: '0 0 10px rgba(232, 121, 249, 1), 0 0 20px rgba(232, 121, 249, 0.8)' }}
              >
                {newDownloadsCount}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Bottom Section */}
      <div className="mt-auto flex flex-col pb-4" style={isMobile ? { paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' } : undefined}>
        {/* Buttons (Acceder / Atajos / Configuración) */}
        <div className="pb-3 flex flex-col gap-1 overflow-hidden">
          {account ? (
            <>
              <button
                onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setAccountMenu({ x: r.right + 8, y: r.top }); }}
                aria-haspopup="menu"
                aria-label={`Cuenta de ${account.name}`}
                title={account.name}
                className="flex items-center w-full h-11 rounded-xl font-medium transition-colors text-white/60 hover:text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer overflow-hidden"
              >
                <div className="w-11 h-11 flex items-center justify-center shrink-0">
                  <span className="w-6 h-6 rounded-full bg-white/10 overflow-hidden flex items-center justify-center shrink-0">
                    {account.avatarUrl ? <img src={account.avatarUrl} alt="" className="w-full h-full object-cover" /> : <User className="w-4 h-4" aria-hidden="true" />}
                  </span>
                </div>
                <div
                  className="flex-1 min-w-0 pr-3 flex items-center overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                  style={{
                    opacity: isCollapsed ? 0 : 1,
                    transform: isCollapsed ? 'translateX(-8px)' : 'translateX(0)',
                    maxWidth: isCollapsed ? '0px' : '180px'
                  }}
                >
                  <span className="truncate">{account.name}</span>
                </div>
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
             className="flex items-center w-full h-11 rounded-xl font-medium transition-colors text-white/60 hover:text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer overflow-hidden"
             title="Acceder a tu cuenta"
             aria-label="Acceder a tu cuenta"
           >
             <div className="w-11 h-11 flex items-center justify-center shrink-0">
               <User className="w-5 h-5 shrink-0" aria-hidden="true" />
             </div>
             <div
               className="flex-1 min-w-0 pr-3 flex items-center overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
               style={{
                 opacity: isCollapsed ? 0 : 1,
                 transform: isCollapsed ? 'translateX(-8px)' : 'translateX(0)',
                 maxWidth: isCollapsed ? '0px' : '180px'
               }}
             >
               <span className="truncate">Acceder</span>
             </div>
           </a>
          )}

           {!isMobile && (
             <button 
               onClick={onToggleShortcuts}
               className={`flex items-center w-full h-11 rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer overflow-hidden ${
                 isShortcutsOpen ? "text-white bg-white/10" : "text-white/60 hover:text-white hover:bg-white/5"
               }`}
               title="Atajos de teclado"
               aria-label="Atajos de teclado"
               aria-expanded={isShortcutsOpen}
             >
               <div className="w-11 h-11 flex items-center justify-center shrink-0">
                 <Keyboard className="w-5 h-5 shrink-0" aria-hidden="true" />
               </div>
               <div
                 className="flex-1 min-w-0 pr-3 flex items-center overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                 style={{
                   opacity: isCollapsed ? 0 : 1,
                   transform: isCollapsed ? 'translateX(-8px)' : 'translateX(0)',
                   maxWidth: isCollapsed ? '0px' : '180px'
                 }}
               >
                 <span className="truncate">Atajos</span>
               </div>
             </button>
           )}
           
           <button 
             onClick={onToggleConfig}
             className="flex items-center w-full h-11 rounded-xl font-medium transition-colors text-white/60 hover:text-white hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer overflow-hidden"
             title="Configuración"
             aria-label="Configuración"
           >
             <div className="w-11 h-11 flex items-center justify-center shrink-0">
               <Settings className="w-5 h-5 shrink-0" aria-hidden="true" />
             </div>
             <div
               className="flex-1 min-w-0 pr-3 flex items-center overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
               style={{
                 opacity: isCollapsed ? 0 : 1,
                 transform: isCollapsed ? 'translateX(-8px)' : 'translateX(0)',
                 maxWidth: isCollapsed ? '0px' : '180px'
               }}
             >
               <span className="truncate">Configuración</span>
             </div>
           </button>
        </div>

        {/* Storage display */}
        <div 
          role="button"
          tabIndex={0}
          title={`Almacenamiento: ${availableGB.toFixed(2)}GB disponibles de 5.00GB`}
          aria-label={`Almacenamiento: ${availableGB.toFixed(2)}GB disponibles de 5.00GB`}
          className="w-full pt-3 pb-1 border-t border-white/[0.08] relative group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 overflow-hidden" 
          onClick={() => onViewChange("downloads")}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onViewChange("downloads")}
        >
          <div className="flex items-center w-full h-11">
            <div className="w-11 h-11 flex flex-col items-center justify-center shrink-0">
              <HardDrive className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
              {/* Mini progress bar under icon when collapsed */}
              <div 
                className="w-6 h-1 bg-white/10 rounded-full overflow-hidden mt-1 shadow-inner transition-opacity duration-300"
                style={{ opacity: isCollapsed ? 1 : 0 }}
              >
                <div
                  className={`h-full rounded-full ${
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

            {/* Text details when expanded */}
            <div 
              className="flex-1 min-w-0 pr-2 flex flex-col justify-center overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{
                opacity: isCollapsed ? 0 : 1,
                transform: isCollapsed ? 'translateX(-8px)' : 'translateX(0)',
                maxWidth: isCollapsed ? '0px' : '180px'
              }}
            >
              <span className="text-[11px] font-bold text-white/40 tracking-[0.1em] uppercase">Almacenamiento</span>
              <span className="text-xs font-bold text-white/80">
                {availableGB.toFixed(2)}GB <span className="text-white/40 font-medium">de 5.00GB</span>
              </span>
            </div>
          </div>

          {/* Full Storage Bar when expanded */}
          <div 
            className="overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={{
              maxHeight: isCollapsed ? '0px' : '20px',
              opacity: isCollapsed ? 0 : 1,
              marginTop: isCollapsed ? '0px' : '6px'
            }}
          >
            <div className="mx-2 h-2.5 bg-white/5 rounded-full overflow-hidden relative shadow-inner">
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
                <div className="absolute top-0 left-0 bottom-0 w-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
