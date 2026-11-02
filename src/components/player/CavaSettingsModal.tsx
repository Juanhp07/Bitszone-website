import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cardStyle, titleStyle } from '../auth/authUi';
import {
  X,
  Palette,
  Sliders,
  Layers,
  Activity,
  RotateCcw,
  Check,
} from 'lucide-react';
import type {
  CavaSettings,
  CavaBarThickness,
  CavaColorTheme,
  CavaFillType,
  CavaGravity,
  CavaGlow,
  CavaDistribution,
} from './cavaTypes';

export type CavaSettingsTabId = 'appearance' | 'geometry' | 'distribution' | 'physics';

interface CavaSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CavaSettings;
  onUpdateSettings: (updater: (prev: CavaSettings) => CavaSettings) => void;
  onReset: () => void;
}

// --------------------------------------------------------------------------
// Subcomponent: iOS/Glass Toggle Switch
// --------------------------------------------------------------------------
const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  badge?: string;
}> = ({ checked, onChange, label, description, badge }) => (
  <div
    role="button"
    tabIndex={0}
    onClick={() => onChange(!checked)}
    onKeyDown={(e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onChange(!checked);
      }
    }}
    className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl transition-colors cursor-pointer select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
  >
    <div className="flex-1 pr-4 min-w-0">
      <div className="flex items-center gap-2.5">
        <span className="text-sm sm:text-base font-semibold text-white/90 group-hover:text-white transition-colors">
          {label}
        </span>
        {badge && (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {badge}
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs sm:text-sm text-white/60 group-hover:text-white/75 transition-colors mt-1">
          {description}
        </p>
      )}
    </div>
    <div
      aria-checked={checked}
      role="switch"
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out ${
        checked ? 'bg-purple-500' : 'bg-white/15'
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </div>
  </div>
);

export const CavaSettingsModal: React.FC<CavaSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onReset,
}) => {
  const [activeTab, setActiveTab] = useState<CavaSettingsTabId>('appearance');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Close reset confirmation dialog or modal on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showResetConfirm) {
          e.stopPropagation();
          e.stopImmediatePropagation();
          setShowResetConfirm(false);
        } else {
          e.stopPropagation();
          e.stopImmediatePropagation();
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [isOpen, showResetConfirm, onClose]);

  const tabs: { id: CavaSettingsTabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'appearance', label: 'Color y Acabado', icon: Palette },
    { id: 'geometry', label: 'Geometría y Varitas', icon: Sliders },
    { id: 'distribution', label: 'Distribución y Mezcla', icon: Layers },
    { id: 'physics', label: 'Física y Respuesta', icon: Activity },
  ];

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ backgroundColor: 'rgba(0,0,0,0)', backdropFilter: 'blur(0px)' }}
        animate={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(20px)' }}
        exit={{ backgroundColor: 'rgba(0,0,0,0)', backdropFilter: 'blur(0px)', transition: { duration: 0.3 } }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-5 md:p-8 select-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cava-settings-title"
        onClick={onClose}
      >
        {/* Modal Card */}
        <motion.div
          id="cava-settings-modal-card"
          initial={{ opacity: 0, scale: 0.92, y: 32 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12, transition: { duration: 0.2 } }}
          transition={{ type: 'spring', stiffness: 160, damping: 22, mass: 0.9, opacity: { duration: 0.35 } }}
          onClick={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          className="relative w-full max-w-6xl h-[90dvh] md:h-[88vh] rounded-3xl overflow-hidden text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.45)] flex flex-col"
          style={{ ...cardStyle, border: 'none', boxShadow: '0 30px 80px -20px rgba(0, 0, 0, 0.65)', background: 'rgba(0, 0, 0, 0.3)', backdropFilter: 'none', WebkitBackdropFilter: 'none' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-7 md:px-10 py-5 md:py-6 border-b border-white/[0.07] shrink-0 bg-black/20">
            <h2 id="cava-settings-title" className="text-2xl md:text-3xl text-white font-bold tracking-tight" style={titleStyle}>
              Ajustes de Inmersión
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="super-blur-btn w-10 h-10 rounded-full flex items-center justify-center text-white/85 hover:text-white cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 group"
              title="Cerrar ajustes (Esc)"
              aria-label="Cerrar ajustes"
            >
              <X className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
            </button>
          </div>

          {/* Modal Content - Dual Column on desktop */}
          <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
            {/* Navigation Tabs (Sidebar on desktop / horizontal bar on mobile) */}
            <div className="w-full md:w-64 lg:w-72 shrink-0 border-b md:border-b-0 md:border-r border-white/[0.07] bg-white/[0.01] p-3 md:p-4 lg:p-5 overflow-x-auto md:overflow-y-auto min-h-0 scrollbar-hide flex md:flex-col gap-1.5 md:gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-auto md:w-full flex items-center gap-3.5 pl-2.5 pr-5 py-2 md:py-2.5 rounded-full text-left transition-[background-color,color,box-shadow] duration-300 cursor-pointer whitespace-nowrap shrink-0 group ${
                      isActive
                        ? 'bg-white/[0.14] backdrop-blur-xl text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)]'
                        : 'hover:bg-white/[0.06] text-white/65 hover:text-white'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 transition-[background-color,color,transform] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                        isActive ? 'bg-white/20 text-white scale-105' : 'bg-white/[0.06] text-white/60 group-hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm md:text-base font-semibold tracking-tight">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Content Panel */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-6 md:p-9 hover-subtle-scrollbar">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-8"
              >
                {/* ========================================================= */}
                {/* 1. COLOR Y ACABADO */}
                {/* ========================================================= */}
                {activeTab === 'appearance' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                        <Palette className="w-6 h-6 text-purple-400" />
                        Paleta de Color y Relleno
                      </h3>
                      <p className="text-sm md:text-base text-white/60 mt-1">
                        Personaliza los gradientes cromáticos, resplandor neón y acabado visual de las varitas.
                      </p>
                    </div>

                    {/* Temas de Color */}
                    <div className="space-y-3">
                      <label className="text-sm font-semibold uppercase tracking-wider text-white/70">
                        Temas de Color
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[
                          { id: 'dynamic' as CavaColorTheme, label: 'Dinámico del Álbum', desc: 'Sincronizado con la portada', preview: 'from-purple-500 via-pink-400 to-white' },
                          { id: 'bitszone' as CavaColorTheme, label: 'Lila Bitszone', desc: 'Neón morado característico', preview: 'from-purple-600 via-fuchsia-500 to-white' },
                          { id: 'cyan' as CavaColorTheme, label: 'Ciberpunk Cyan', desc: 'Aguamarina eléctrico', preview: 'from-sky-600 via-cyan-400 to-white' },
                          { id: 'fire' as CavaColorTheme, label: 'Fuego Solar', desc: 'Rojo y ámbar radiante', preview: 'from-red-600 via-amber-500 to-yellow-200' },
                          { id: 'emerald' as CavaColorTheme, label: 'Esmeralda', desc: 'Verde menta jade', preview: 'from-emerald-700 via-emerald-400 to-white' },
                          { id: 'monochrome' as CavaColorTheme, label: 'Monocromo CAVA', desc: 'Blanco puro minimalista', preview: 'from-zinc-600 via-zinc-300 to-white' },
                        ].map((th) => {
                          const active = settings.colorTheme === th.id;
                          return (
                            <button
                              key={th.id}
                              onClick={() => onUpdateSettings(prev => ({ ...prev, colorTheme: th.id }))}
                              className={`p-4 rounded-2xl border text-left transition-[background-color,border-color,color] duration-300 cursor-pointer ${
                                active
                                  ? 'bg-white/[0.14] border-white/40 text-white backdrop-blur-xl'
                                  : 'bg-white/[0.04] hover:bg-white/[0.09] border-white/[0.08] text-white/70'
                              }`}
                            >
                              <div className={`w-full h-3 rounded-full bg-gradient-to-r ${th.preview} mb-3 shadow-sm`} />
                              <div className="flex items-center justify-between w-full">
                                <span className="text-sm sm:text-base font-bold text-white">{th.label}</span>
                                {active && <Check className="w-4 h-4 text-purple-300 shrink-0" />}
                              </div>
                              <p className="text-xs sm:text-sm text-white/60 mt-1">{th.desc}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tipo de acabado */}
                    <div className="space-y-3 pt-1">
                      <label className="text-sm font-semibold uppercase tracking-wider text-white/70">
                        Tipo de Acabado
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { id: 'gradient' as CavaFillType, label: 'Degradado', desc: 'Transición luminosa con desvanecimiento suave' },
                          { id: 'solid' as CavaFillType, label: 'Color Sólido', desc: 'Color uniforme, nítido y de alta definición' },
                        ].map((f) => {
                          const active = settings.fillType === f.id;
                          return (
                            <button
                              key={f.id}
                              onClick={() => onUpdateSettings(prev => ({ ...prev, fillType: f.id }))}
                              className={`p-4 rounded-2xl border text-left transition-[background-color,border-color,color] duration-300 cursor-pointer ${
                                active
                                  ? 'bg-white/[0.14] border-white/40 text-white backdrop-blur-xl'
                                  : 'bg-white/[0.04] hover:bg-white/[0.09] border-white/[0.08] text-white/70'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm sm:text-base font-bold text-white">{f.label}</span>
                                {active && <Check className="w-4 h-4 text-purple-300" />}
                              </div>
                              <p className="text-xs sm:text-sm text-white/60 mt-1">{f.desc}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Resplandor Neón */}
                    <div className="space-y-3 pt-1">
                      <label className="text-sm font-semibold uppercase tracking-wider text-white/70">
                        Resplandor Neón
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'none' as CavaGlow, label: 'Apagado', desc: 'Sin aura' },
                          { id: 'subtle' as CavaGlow, label: 'Sutil', desc: 'Aura recomendada' },
                          { id: 'intense' as CavaGlow, label: 'Intenso', desc: 'Brillo alto' },
                        ].map((g) => {
                          const active = settings.glow === g.id;
                          return (
                            <button
                              key={g.id}
                              onClick={() => onUpdateSettings(prev => ({ ...prev, glow: g.id }))}
                              className={`py-3.5 px-4 rounded-2xl border text-center transition-[background-color,border-color,color] duration-300 cursor-pointer ${
                                active
                                  ? 'bg-white/[0.14] border-white/40 text-white backdrop-blur-xl'
                                  : 'bg-white/[0.04] hover:bg-white/[0.09] border-white/[0.08] text-white/70'
                              }`}
                            >
                              <div className="text-sm sm:text-base font-semibold">{g.label}</div>
                              <div className="text-xs text-white/50 font-mono mt-0.5">{g.desc}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* 2. GEOMETRÍA Y VARITAS */}
                {/* ========================================================= */}
                {activeTab === 'geometry' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                        <Sliders className="w-6 h-6 text-purple-400" />
                        Geometría y Grosor de las Varitas
                      </h3>
                      <p className="text-sm md:text-base text-white/60 mt-1">
                        Configura el grosor, número de barras y la anchura horizontal del visualizador.
                      </p>
                    </div>

                    {/* Grosor de las varitas */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold uppercase tracking-wider text-white/70">
                          Grosor de las varitas
                        </label>
                        <span className="text-xs text-white/50 uppercase font-mono">{settings.thickness}</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { id: 'thin' as CavaBarThickness, label: 'Delgado', desc: 'Líneas finas' },
                          { id: 'medium' as CavaBarThickness, label: 'Medio', desc: 'Equilibrado' },
                          { id: 'thick' as CavaBarThickness, label: 'Grueso', desc: 'Predeterminado' },
                          { id: 'ultra' as CavaBarThickness, label: 'Extra Grueso', desc: 'Impacto fuerte' },
                        ].map((th) => {
                          const active = settings.thickness === th.id;
                          return (
                            <button
                              key={th.id}
                              onClick={() => onUpdateSettings(prev => ({ ...prev, thickness: th.id }))}
                              className={`py-3.5 px-4 rounded-2xl border text-center transition-[background-color,border-color,color] duration-300 cursor-pointer ${
                                active
                                  ? 'bg-white/[0.14] border-white/40 text-white backdrop-blur-xl'
                                  : 'bg-white/[0.04] hover:bg-white/[0.09] border-white/[0.08] text-white/70'
                              }`}
                            >
                              <div className="text-sm sm:text-base font-semibold">{th.label}</div>
                              <div className="text-xs text-white/50 font-mono mt-0.5">{th.desc}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Cantidad de varitas en pantalla */}
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold uppercase tracking-wider text-white/70">
                          Cantidad de varitas en pantalla
                        </label>
                        <span className="text-xs text-purple-300 font-mono font-bold">{settings.barCount} barras</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[24, 32, 40, 56].map((count) => {
                          const active = settings.barCount === count;
                          return (
                            <button
                              key={count}
                              onClick={() => onUpdateSettings(prev => ({ ...prev, barCount: count }))}
                              className={`py-3.5 px-4 rounded-2xl border text-center transition-[background-color,border-color,color] duration-300 cursor-pointer ${
                                active
                                  ? 'bg-white/[0.14] border-white/40 text-white backdrop-blur-xl'
                                  : 'bg-white/[0.04] hover:bg-white/[0.09] border-white/[0.08] text-white/70'
                              }`}
                            >
                              <div className="text-sm sm:text-base font-semibold">{count}</div>
                              <div className="text-xs text-white/50 font-mono mt-0.5">varitas</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Ancho horizontal general */}
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold uppercase tracking-wider text-white/70">
                          Ancho horizontal general
                        </label>
                        <span className="text-xs text-purple-300 font-mono font-bold">{settings.containerWidthPercent}%</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[88, 92, 96, 100].map((w) => {
                          const active = settings.containerWidthPercent === w;
                          return (
                            <button
                              key={w}
                              onClick={() => onUpdateSettings(prev => ({ ...prev, containerWidthPercent: w }))}
                              className={`py-3.5 px-4 rounded-2xl border text-center transition-[background-color,border-color,color] duration-300 cursor-pointer ${
                                active
                                  ? 'bg-white/[0.14] border-white/40 text-white backdrop-blur-xl'
                                  : 'bg-white/[0.04] hover:bg-white/[0.09] border-white/[0.08] text-white/70'
                              }`}
                            >
                              <div className="text-sm sm:text-base font-semibold">{w === 100 ? 'Pantalla Completa' : `${w}%`}</div>
                              <div className="text-xs text-white/50 font-mono mt-0.5">{w === 100 ? '100% ancho' : 'cobertura'}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Puntas redondeadas */}
                    <div className="pt-2">
                      <ToggleSwitch
                        checked={settings.roundedCaps}
                        onChange={(checked) => onUpdateSettings(prev => ({ ...prev, roundedCaps: checked }))}
                        label="Puntas redondeadas"
                        description="Forma de cápsula suave y aerodinámica en la parte superior de las varitas."
                      />
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* 3. DISTRIBUCIÓN Y MEZCLA */}
                {/* ========================================================= */}
                {activeTab === 'distribution' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                        <Layers className="w-6 h-6 text-purple-400" />
                        Distribución y Mezcla de Barras
                      </h3>
                      <p className="text-sm md:text-base text-white/60 mt-1">
                        Distribuye los bajos y la energía acústica a lo largo de las barras para evitar acumulaciones o saturación en un solo lado.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        {
                          id: 'distributed' as CavaDistribution,
                          label: 'Marea Orgánica',
                          badge: 'Recomendado',
                          desc: 'Asimetría viva: lados fluctuantes entre bombos, voces y cajas con movimiento natural',
                        },
                        {
                          id: 'center' as CavaDistribution,
                          label: 'Espejo Centrado',
                          desc: 'Graves potentes en el centro expandiéndose armónicamente a los laterales',
                        },
                        {
                          id: 'interleaved' as CavaDistribution,
                          label: 'Alternado Dinámico',
                          desc: 'Barras de graves y agudos intercaladas rítmicamente con alto contraste',
                        },
                        {
                          id: 'linear' as CavaDistribution,
                          label: 'Clásico (Izq a Der)',
                          desc: 'De graves a agudos lineal con compresión suave anti-saturación',
                        },
                      ].map((dist) => {
                        const active = (settings.distribution || 'distributed') === dist.id;
                        return (
                          <button
                            key={dist.id}
                            onClick={() => onUpdateSettings(prev => ({ ...prev, distribution: dist.id }))}
                            className={`p-4 rounded-2xl border text-left transition-[background-color,border-color,color] duration-300 cursor-pointer ${
                              active
                                ? 'bg-white/[0.14] border-white/40 text-white backdrop-blur-xl'
                                : 'bg-white/[0.04] hover:bg-white/[0.09] border-white/[0.08] text-white/70'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-2">
                                <span className="text-sm sm:text-base font-bold text-white">{dist.label}</span>
                                {dist.badge && (
                                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                    {dist.badge}
                                  </span>
                                )}
                              </div>
                              {active && <Check className="w-4 h-4 text-purple-300 shrink-0" />}
                            </div>
                            <p className="text-xs sm:text-sm text-white/60 mt-1 leading-relaxed">{dist.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* ========================================================= */}
                {/* 4. FÍSICA Y RESPUESTA */}
                {/* ========================================================= */}
                {activeTab === 'physics' && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                        <Activity className="w-6 h-6 text-purple-400" />
                        Física de Rebote y Caída CAVA
                      </h3>
                      <p className="text-sm md:text-base text-white/60 mt-1">
                        Modela la respuesta acústica, amortiguación de picos y velocidad de retorno por gravedad.
                      </p>
                    </div>

                    {/* Sensibilidad de respuesta */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold uppercase tracking-wider text-white/70">
                          Sensibilidad de respuesta
                        </label>
                        <span className="text-xs text-purple-300 font-mono font-bold">{settings.sensitivity.toFixed(2)}x</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { val: 0.85, label: 'Suave', desc: '0.85x ganancia' },
                          { val: 1.0, label: 'Normal', desc: '1.00x estándar' },
                          { val: 1.25, label: 'Dinámico', desc: '1.25x reactivo' },
                          { val: 1.55, label: 'Potente', desc: '1.55x máximo' },
                        ].map((s) => {
                          const active = Math.abs(settings.sensitivity - s.val) < 0.05;
                          return (
                            <button
                              key={s.val}
                              onClick={() => onUpdateSettings(prev => ({ ...prev, sensitivity: s.val }))}
                              className={`py-3.5 px-4 rounded-2xl border text-center transition-[background-color,border-color,color] duration-300 cursor-pointer ${
                                active
                                  ? 'bg-white/[0.14] border-white/40 text-white backdrop-blur-xl'
                                  : 'bg-white/[0.04] hover:bg-white/[0.09] border-white/[0.08] text-white/70'
                              }`}
                            >
                              <div className="text-sm sm:text-base font-semibold">{s.label}</div>
                              <div className="text-xs text-white/50 font-mono mt-0.5">{s.desc}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Inercia de caída */}
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-semibold uppercase tracking-wider text-white/70">
                          Inercia de caída
                        </label>
                        <span className="text-xs text-white/50 uppercase font-mono">{settings.gravity}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { id: 'fluid' as CavaGravity, label: 'Fluida (Recomendada)', desc: 'Movimiento orgánico y natural' },
                          { id: 'fast' as CavaGravity, label: 'Rápida', desc: 'Rebote instantáneo y ágil' },
                          { id: 'slow' as CavaGravity, label: 'Sedosa / Lenta', desc: 'Descenso suave y flotante' },
                        ].map((g) => {
                          const active = settings.gravity === g.id;
                          return (
                            <button
                              key={g.id}
                              onClick={() => onUpdateSettings(prev => ({ ...prev, gravity: g.id }))}
                              className={`p-4 rounded-2xl border text-left transition-[background-color,border-color,color] duration-300 cursor-pointer ${
                                active
                                  ? 'bg-white/[0.14] border-white/40 text-white backdrop-blur-xl'
                                  : 'bg-white/[0.04] hover:bg-white/[0.09] border-white/[0.08] text-white/70'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm sm:text-base font-bold text-white">{g.label}</span>
                                {active && <Check className="w-4 h-4 text-purple-300" />}
                              </div>
                              <p className="text-xs sm:text-sm text-white/60 mt-1">{g.desc}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-7 md:px-10 py-5 border-t border-white/[0.07] shrink-0 bg-black/30">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-semibold text-white/60 hover:text-white bg-transparent hover:bg-white/[0.08] transition-colors duration-200 cursor-pointer group"
            >
              <RotateCcw className="w-4 h-4 transition-transform duration-500 ease-out group-hover:-rotate-180" />
              <span>Restablecer configuración</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white/[0.09] hover:bg-white/[0.17] border border-white/35 hover:border-white/55 backdrop-blur-2xl text-white text-base font-semibold shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition-[background-color,border-color] duration-300 cursor-pointer"
            >
              <Check className="w-5 h-5 stroke-[2.5]" />
              <span>Guardar cambios</span>
            </button>
          </div>

          {/* Modal de confirmación para restablecer configuración */}
          <AnimatePresence>
            {showResetConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-md"
                onClick={() => setShowResetConfirm(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-sm rounded-3xl p-6 bg-black/40 backdrop-blur-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] text-center flex flex-col items-center"
                >
                  <div className="w-12 h-12 rounded-full bg-white/[0.08] flex items-center justify-center text-white/90 mb-3.5">
                    <RotateCcw className="w-6 h-6" />
                  </div>

                  <h3 className="text-xl font-bold text-white tracking-tight">
                    ¿Restablecer configuración?
                  </h3>

                  <p className="text-sm text-white/60 mt-1.5 mb-6">
                    Se devolverán todos los ajustes del visualizador a sus valores por defecto.
                  </p>

                  <div className="flex items-center gap-3 w-full">
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 py-2.5 px-4 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white/85 hover:text-white text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onReset();
                        setShowResetConfirm(false);
                      }}
                      className="flex-1 py-2.5 px-4 rounded-full bg-purple-500/90 hover:bg-purple-500 text-white text-sm font-semibold shadow-md shadow-purple-600/25 transition-colors cursor-pointer"
                    >
                      Restablecer
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};
