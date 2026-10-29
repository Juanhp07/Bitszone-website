import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Library, DownloadCloud, HardDrive, Keyboard, Settings, User, ChevronLeft, LayoutDashboard } from "lucide-react";
import { useDownloads } from "./DownloadsContext";
import { useAdminEdit } from "../admin/AdminEditContext";
import { AdminPencil } from "../admin/AdminEditWidgets";

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
  onOpenProfile,
  isAdmin = false,
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
  onOpenProfile?: () => void;
  isAdmin?: boolean;
}) => {
  const { totalBytes, newDownloadsCount } = useDownloads();
  const { getButtonText, isEditMode } = useAdminEdit();

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
            maxWidth: isCollapsed ? '0px' : '220px',
            opacity: isCollapsed ? 0 : 1,
            transform: isCollapsed ? 'translateX(-8px)' : 'translateX(0)'
          }}
        >
          <div className="flex items-center gap-2">
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
            {isAdmin && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/25 text-purple-200 border border-purple-400/35 shadow-[0_0_12px_rgba(168,85,247,0.25)] select-none">
                ADMIN
              </span>
            )}
          </div>
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
            className="flex-1 min-w-0 pr-3 flex items-center justify-between overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={{
              opacity: isCollapsed ? 0 : 1,
              transform: isCollapsed ? 'translateX(-8px)' : 'translateX(0)',
              maxWidth: isCollapsed ? '0px' : '180px'
            }}
          >
            <span className="truncate">{getButtonText('sidebar.home', 'Inicio')}</span>
            {isAdmin && isEditMode && (
              <AdminPencil
                target={{
                  type: 'button',
                  key: 'sidebar.home',
                  label: getButtonText('sidebar.home', 'Inicio'),
                  defaultLabel: 'Inicio',
                }}
                size="xs"
                title="Editar texto del botón Inicio"
              />
            )}
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
            className="flex-1 min-w-0 pr-3 flex items-center justify-between overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
            style={{
              opacity: isCollapsed ? 0 : 1,
              transform: isCollapsed ? 'translateX(-8px)' : 'translateX(0)',
              maxWidth: isCollapsed ? '0px' : '180px'
            }}
          >
            <span className="truncate">{getButtonText('sidebar.library', 'Biblioteca')}</span>
            {isAdmin && isEditMode && (
              <AdminPencil
                target={{
                  type: 'button',
                  key: 'sidebar.library',
                  label: getButtonText('sidebar.library', 'Biblioteca'),
                  defaultLabel: 'Biblioteca',
                }}
                size="xs"
                title="Editar texto del botón Biblioteca"
              />
            )}
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
            <div className="flex items-center min-w-0 gap-1">
              <span className="truncate">{getButtonText('sidebar.downloads', 'Mis descargas')}</span>
              {newDownloadsCount > 0 && currentView !== "downloads" && (
                <span
                  className="text-[#f0abfc] text-[13px] font-extrabold tracking-wider ml-1"
                  style={{ textShadow: '0 0 10px rgba(232, 121, 249, 1), 0 0 20px rgba(232, 121, 249, 0.8)' }}
                >
                  {newDownloadsCount}
                </span>
              )}
            </div>
            {isAdmin && isEditMode && (
              <AdminPencil
                target={{
                  type: 'button',
                  key: 'sidebar.downloads',
                  label: getButtonText('sidebar.downloads', 'Mis descargas'),
                  defaultLabel: 'Mis descargas',
                }}
                size="xs"
                title="Editar texto del botón Mis descargas"
              />
            )}
          </div>
        </button>

        {/* Botón Dashboard para Administradores */}
        {isAdmin && (
          <button
            onClick={() => onViewChange("dashboard")}
            className={`flex items-center w-full h-11 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer overflow-hidden ${
              currentView === "dashboard"
                ? "text-white bg-gradient-to-r from-purple-600/40 via-purple-600/30 to-indigo-600/25 border border-purple-400/50 shadow-[0_0_20px_rgba(168,85,247,0.35)]"
                : "text-purple-200 bg-purple-500/[0.08] hover:bg-purple-500/[0.18] border border-purple-500/25 hover:border-purple-400/40 hover:text-white shadow-sm"
            }`}
            title="Dashboard"
            aria-label="Dashboard"
          >
            <div className="w-11 h-11 flex items-center justify-center shrink-0">
              <LayoutDashboard className={`w-5 h-5 shrink-0 transition-colors ${currentView === "dashboard" ? "text-purple-300" : "text-purple-400"}`} aria-hidden="true" />
            </div>
            <div
              className="flex-1 min-w-0 pr-3 flex items-center justify-between overflow-hidden whitespace-nowrap transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
              style={{
                opacity: isCollapsed ? 0 : 1,
                transform: isCollapsed ? 'translateX(-8px)' : 'translateX(0)',
                maxWidth: isCollapsed ? '0px' : '180px'
              }}
            >
              <span className="truncate font-semibold tracking-wide">{getButtonText('sidebar.dashboard', 'Dashboard')}</span>
              {isAdmin && isEditMode && (
                <AdminPencil
                  target={{
                    type: 'button',
                    key: 'sidebar.dashboard',
                    label: getButtonText('sidebar.dashboard', 'Dashboard'),
                    defaultLabel: 'Dashboard',
                  }}
                  size="xs"
                  title="Editar texto del botón Dashboard"
                />
              )}
            </div>
          </button>
        )}
      </div>

      {/* Bottom Section */}
      <div className="mt-auto flex flex-col pb-4" style={isMobile ? { paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' } : undefined}>
        {/* Buttons (Acceder / Atajos / Configuración) */}
        <div className="pb-3 flex flex-col gap-1 overflow-hidden">
          {account ? (
            <>
              <button
                onClick={() => onOpenProfile?.()}
                aria-haspopup="dialog"
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
