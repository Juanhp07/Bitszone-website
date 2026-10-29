import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cardStyle, titleStyle } from '../auth/authUi';
import {
  X,
  Type,
  Eye,
  Zap,
  Keyboard,
  Volume2,
  HardDrive,
  RotateCcw,
  Check,
  Sparkles,
  AlertTriangle,
  Trash2,
  ShieldAlert,
  Info,
  CheckCircle2,
  CornerDownLeft,
  Search,
} from 'lucide-react';
import type {
  GeneralSettings,
  FontFamilyType,
  ColorBlindnessType,
  CrossfadeDuration,
  CustomShortcuts,
} from './generalSettingsTypes';
import {
  DEFAULT_GENERAL_SETTINGS,
  DEFAULT_SHORTCUTS,
  SHORTCUT_DEFINITIONS,
  formatKeyName,
} from './generalSettingsTypes';

export type SettingsTabId = 'appearance' | 'accessibility' | 'performance' | 'shortcuts' | 'playback' | 'system';

interface GeneralSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTabId;
  settings: GeneralSettings;
  onUpdateSettings: (updater: (prev: GeneralSettings) => GeneralSettings) => void;
  onResetAll: () => void;
  onResetShortcuts: () => void;
  availableGB?: number;
  onClearCache?: () => void;
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
    className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 transition-colors cursor-pointer select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
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
      className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
        checked ? 'bg-purple-600' : 'bg-white/15'
      }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </div>
  </div>
);

// --------------------------------------------------------------------------
// Subcomponent: Color Blindness SVG Definitions (Invisible in DOM)
// --------------------------------------------------------------------------
export const ColorBlindnessSvgFilters: React.FC = () => (
  <svg className="fixed -top-full -left-full w-0 h-0 pointer-events-none opacity-0" aria-hidden="true">
    <defs>
      <filter id="bitszone-filter-protanopia">
        <feColorMatrix
          type="matrix"
          values="0.56667 0.43333 0 0 0
                  0.55833 0.44167 0 0 0
                  0       0.24167 0.75833 0 0
                  0       0       0       1 0"
        />
      </filter>
      <filter id="bitszone-filter-deuteranopia">
        <feColorMatrix
          type="matrix"
          values="0.625 0.375 0 0 0
                  0.7   0.3   0 0 0
                  0     0.3   0.7 0 0
                  0     0     0   1 0"
        />
      </filter>
      <filter id="bitszone-filter-tritanopia">
        <feColorMatrix
          type="matrix"
          values="0.95 0.05 0 0 0
                  0    0.43333 0.56667 0 0
                  0    0.475   0.525   0 0
                  0    0       0       1 0"
        />
      </filter>
      <filter id="bitszone-filter-achromatopsia">
        <feColorMatrix
          type="matrix"
          values="0.299 0.587 0.114 0 0
                  0.299 0.587 0.114 0 0
                  0.299 0.587 0.114 0 0
                  0     0     0     1 0"
        />
      </filter>
    </defs>
  </svg>
);

// --------------------------------------------------------------------------
// MAIN COMPONENT: GeneralSettingsModal
// --------------------------------------------------------------------------
export const GeneralSettingsModal: React.FC<GeneralSettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'appearance',
  settings,
  onUpdateSettings,
  onResetAll,
  onResetShortcuts,
  availableGB = 5.0,
  onClearCache,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTabId>(initialTab);
  const [recordingAction, setRecordingAction] = useState<keyof CustomShortcuts | null>(null);
  const [shortcutConflict, setShortcutConflict] = useState<string | null>(null);
  const [cacheClearedToast, setCacheClearedToast] = useState(false);
  const [shortcutsSearch, setShortcutsSearch] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Close reset confirmation dialog on Escape
  useEffect(() => {
    if (!showResetConfirm) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setShowResetConfirm(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => window.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [showResetConfirm]);

  // Keep active tab in sync if initialTab changes on open
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Handle keyboard listener for custom shortcut recording
  useEffect(() => {
    if (!recordingAction) return;

    const handleCapture = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Escape cancels recording
      if (e.code === 'Escape') {
        setRecordingAction(null);
        setShortcutConflict(null);
        return;
      }

      // Ignore pure modifiers
      if (['ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight'].includes(e.code)) {
        return;
      }

      // Check for conflict with another action
      const conflictEntry = Object.entries(settings.shortcuts).find(
        ([act, code]) => act !== recordingAction && code === e.code
      );

      if (conflictEntry) {
        const conflictLabel = SHORTCUT_DEFINITIONS.find(s => s.id === conflictEntry[0])?.label || conflictEntry[0];
        setShortcutConflict(`La tecla "${formatKeyName(e.code)}" ya está en uso por "${conflictLabel}". Se ha reasignado a esta acción.`);
      } else {
        setShortcutConflict(null);
      }

      // Update shortcut
      onUpdateSettings(prev => ({
        ...prev,
        shortcuts: {
          ...prev.shortcuts,
          [recordingAction]: e.code,
        },
      }));

      setRecordingAction(null);
    };

    window.addEventListener('keydown', handleCapture, { capture: true });
    return () => window.removeEventListener('keydown', handleCapture, { capture: true });
  }, [recordingAction, settings.shortcuts, onUpdateSettings]);

  if (!isOpen) return null;

  const tabs: Array<{ id: SettingsTabId; label: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'appearance', label: 'Texto y Apariencia', icon: Type },
    { id: 'accessibility', label: 'Accesibilidad', icon: Eye },
    { id: 'performance', label: 'Rendimiento', icon: Zap },
    { id: 'shortcuts', label: 'Atajos de Teclado', icon: Keyboard },
    { id: 'playback', label: 'Audio y Reproducción', icon: Volume2 },
    { id: 'system', label: 'Almacenamiento', icon: HardDrive },
  ];

  if (typeof document === 'undefined') return null;

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
        aria-labelledby="general-settings-title"
        onClick={onClose}
      >
        {/* Invisible SVG filter definitions */}
        <ColorBlindnessSvgFilters />

        {/* Modal Card */}
        <motion.div
          id="config-modal-card"
          initial={{ opacity: 0, scale: 0.92, y: 32 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12, transition: { duration: 0.2 } }}
          transition={{ type: 'spring', stiffness: 160, damping: 22, mass: 0.9, opacity: { duration: 0.35 } }}
          onClick={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
          className="relative w-full max-w-6xl h-[90dvh] md:h-[88vh] rounded-3xl overflow-hidden shadow-2xl text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.45)] flex flex-col"
          style={cardStyle}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-7 md:px-10 py-5 md:py-6 border-b border-white/10 shrink-0 bg-black/20">
            <h2 id="general-settings-title" className="text-2xl md:text-3xl text-white font-bold tracking-tight" style={titleStyle}>
              Configuración
            </h2>

            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 cursor-pointer"
              title="Cerrar configuración (Esc)"
              aria-label="Cerrar configuración"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Modal Content - Dual Column on desktop */}
          <div className="flex-1 min-h-0 flex flex-col md:flex-row overflow-hidden">
            {/* Navigation Tabs (Sidebar on desktop / horizontal bar on mobile) */}
            <div className="w-full md:w-64 lg:w-72 shrink-0 border-b md:border-b-0 md:border-r border-white/10 bg-white/[0.01] p-3 md:p-4 lg:p-5 overflow-x-auto md:overflow-y-auto min-h-0 scrollbar-hide flex md:flex-col gap-1.5 md:gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-auto md:w-full flex items-center gap-3.5 px-4 md:px-5 py-3 md:py-3.5 rounded-2xl text-left transition-all cursor-pointer whitespace-nowrap shrink-0 group ${
                      isActive
                        ? 'bg-purple-600/25 border border-purple-500/40 text-white shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                        : 'hover:bg-white/[0.05] border border-transparent text-white/70 hover:text-white'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive ? 'bg-purple-500/30 text-purple-200' : 'bg-white/5 text-white/60 group-hover:text-white'
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
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-6 md:p-9 space-y-8 scrollbar-thin scrollbar-thumb-white/20 hover:scrollbar-thumb-white/40">
              {/* ========================================================= */}
              {/* 1. APARIENCIA Y TEXTO */}
              {/* ========================================================= */}
              {activeTab === 'appearance' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                      <Type className="w-6 h-6 text-purple-400" />
                      Tamaño de Texto de la Interfaz
                    </h3>
                    <p className="text-sm md:text-base text-white/60 mt-1">
                      Ajusta la escala general de lectura en toda la aplicación.
                    </p>
                  </div>

                  {/* Live preview box */}
                  <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                      Vista previa
                    </span>
                    <p
                      className="text-white font-medium leading-relaxed transition-all"
                      style={{ fontSize: `${settings.textScale}%` }}
                    >
                      Bitszone — Música ilimitada con la mejor experiencia visual y acústica.
                    </p>
                    <span className="text-xs text-white/50 font-mono">
                      Escala actual: {settings.textScale}%
                    </span>
                  </div>

                  {/* Quick Scale Presets */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold uppercase tracking-wider text-white/70">
                      Ajustes rápidos
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Pequeño', scale: 85 },
                        { label: 'Normal', scale: 100 },
                        { label: 'Grande', scale: 120 },
                      ].map((p) => (
                        <button
                          key={p.scale}
                          onClick={() => onUpdateSettings(prev => ({ ...prev, textScale: p.scale }))}
                          className={`py-3.5 px-4 rounded-2xl border text-center transition-all cursor-pointer ${
                            settings.textScale === p.scale
                              ? 'bg-purple-600/30 border-purple-400 text-white font-bold shadow-[0_0_16px_rgba(168,85,247,0.3)]'
                              : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white/70'
                          }`}
                        >
                          <div className="text-sm sm:text-base font-semibold">{p.label}</div>
                          <div className="text-xs text-white/50 font-mono mt-0.5">{p.scale}%</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Typography Selection */}
                  <div className="space-y-3 pt-1">
                    <label className="text-sm font-semibold uppercase tracking-wider text-white/70">
                      Familia Tipográfica
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'default' as FontFamilyType, label: 'Inter & Sora', desc: 'Tipografía original de Bitszone' },
                        { id: 'dyslexic' as FontFamilyType, label: 'Alta Legibilidad', desc: 'Diseño optimizado para lectura clara' },
                        { id: 'mono' as FontFamilyType, label: 'Monospace', desc: 'Fuente estilo código de ancho fijo' },
                      ].map((font) => (
                        <button
                          key={font.id}
                          onClick={() => onUpdateSettings(prev => ({ ...prev, fontFamily: font.id }))}
                          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                            settings.fontFamily === font.id
                              ? 'bg-purple-600/25 border-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                              : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white/70'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm sm:text-base font-bold text-white">{font.label}</span>
                            {settings.fontFamily === font.id && <Check className="w-4 h-4 text-purple-300" />}
                          </div>
                          <p className="text-xs sm:text-sm text-white/60 mt-1">{font.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* 2. ACCESIBILIDAD Y VISIÓN */}
              {/* ========================================================= */}
              {activeTab === 'accessibility' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                      <Eye className="w-6 h-6 text-purple-400" />
                      Filtros Visuales y Accesibilidad
                    </h3>
                    <p className="text-sm md:text-base text-white/60 mt-1">
                      Ajustes de contraste y adaptación para daltonismo.
                    </p>
                  </div>

                  {/* Color Blindness Selector */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold uppercase tracking-wider text-white/70">
                      Filtro para Daltonismo
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {[
                        { id: 'none' as ColorBlindnessType, label: 'Desactivado', desc: 'Colores estándar' },
                        { id: 'protanopia' as ColorBlindnessType, label: 'Protanopia', desc: 'Deficiencia en color rojo' },
                        { id: 'deuteranopia' as ColorBlindnessType, label: 'Deuteranopia', desc: 'Deficiencia en color verde' },
                        { id: 'tritanopia' as ColorBlindnessType, label: 'Tritanopia', desc: 'Deficiencia en color azul' },
                        { id: 'achromatopsia' as ColorBlindnessType, label: 'Acromatopsia', desc: 'Escala de grises pura' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => onUpdateSettings(prev => ({ ...prev, colorBlindness: item.id }))}
                          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                            settings.colorBlindness === item.id
                              ? 'bg-purple-600/25 border-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                              : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white/70'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm sm:text-base font-bold text-white">{item.label}</span>
                            {settings.colorBlindness === item.id && <Check className="w-4 h-4 text-purple-300" />}
                          </div>
                          <p className="text-xs sm:text-sm text-white/60 mt-1">{item.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Palette Check */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white/90">
                        Comprobación de colores
                      </span>
                      <span className="text-xs text-white/50">
                        Previsualización con filtro actual
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-2.5 text-center">
                      {[
                        { name: 'Rojo', color: 'bg-rose-500' },
                        { name: 'Verde', color: 'bg-emerald-500' },
                        { name: 'Azul', color: 'bg-sky-500' },
                        { name: 'Amarillo', color: 'bg-amber-400 text-black' },
                        { name: 'Morado', color: 'bg-purple-500' },
                      ].map((col) => (
                        <div key={col.name} className="flex flex-col items-center gap-1.5">
                          <div className={`w-full h-9 sm:h-11 rounded-xl ${col.color} shadow-sm border border-white/20`} />
                          <span className="text-xs font-medium text-white/80">{col.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Accessibility Toggles */}
                  <div className="space-y-3 pt-1">
                    <label className="text-sm font-semibold uppercase tracking-wider text-white/70">
                      Opciones Adicionales
                    </label>

                    <ToggleSwitch
                      label="Modo de Alto Contraste"
                      description="Bordes definidos y texto en blanco puro para máxima legibilidad"
                      checked={settings.highContrast}
                      onChange={(v) => onUpdateSettings(prev => ({ ...prev, highContrast: v }))}
                      badge="WCAG AAA"
                    />

                    <ToggleSwitch
                      label="Subrayar Elementos Interactivos"
                      description="Subraya enlaces, canciones y botones para identificarlos al instante"
                      checked={settings.underlineLinks}
                      onChange={(v) => onUpdateSettings(prev => ({ ...prev, underlineLinks: v }))}
                    />

                    <ToggleSwitch
                      label="Reducir Transparencias"
                      description="Usa fondos sólidos en lugar de efectos de cristal translúcido"
                      checked={settings.reduceTransparency}
                      onChange={(v) => onUpdateSettings(prev => ({ ...prev, reduceTransparency: v }))}
                    />
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* 3. RENDIMIENTO Y EFECTOS */}
              {/* ========================================================= */}
              {activeTab === 'performance' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                      <Zap className="w-6 h-6 text-purple-400" />
                      Rendimiento y Gráficos
                    </h3>
                    <p className="text-sm md:text-base text-white/60 mt-1">
                      Optimiza animaciones y efectos para mejorar la fluidez y ahorrar batería.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <ToggleSwitch
                      label="Reducir Animaciones"
                      description="Desactiva transiciones y movimientos para mayor rapidez y menor carga"
                      checked={settings.reduceMotion}
                      onChange={(v) => onUpdateSettings(prev => ({ ...prev, reduceMotion: v }))}
                      badge="Fluidez"
                    />

                    <ToggleSwitch
                      label="Desactivar Desenfoque de Cristal"
                      description="Elimina el efecto de blur para reducir el consumo de tarjeta gráfica"
                      checked={settings.disableBlur}
                      onChange={(v) => onUpdateSettings(prev => ({ ...prev, disableBlur: v }))}
                      badge="Ahorro GPU"
                    />

                    <ToggleSwitch
                      label="Desactivar Luces y Resplandores"
                      description="Apaga efectos de brillo y sombras difusas de alta intensidad"
                      checked={settings.disableGlows}
                      onChange={(v) => onUpdateSettings(prev => ({ ...prev, disableGlows: v }))}
                    />

                    <ToggleSwitch
                      label="Fondo Dinámico de Portada"
                      description="Aura de color ambiental basada en la carátula en reproducción"
                      checked={settings.ambientBackground}
                      onChange={(v) => onUpdateSettings(prev => ({ ...prev, ambientBackground: v }))}
                    />
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* 4. ATAJOS DE TECLADO */}
              {/* ========================================================= */}
              {activeTab === 'shortcuts' && (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                        <Keyboard className="w-6 h-6 text-purple-400" />
                        Atajos de Teclado
                      </h3>
                      <p className="text-sm md:text-base text-white/60 mt-1">
                        Pulsa &ldquo;Cambiar&rdquo; y presiona cualquier tecla para reasignar una acción.
                      </p>
                    </div>

                    <button
                      onClick={onResetShortcuts}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Restablecer atajos</span>
                    </button>
                  </div>

                  {/* Conflict Notice Alert */}
                  {shortcutConflict && (
                    <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-3 text-amber-200 text-sm">
                      <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                      <div className="flex-1">{shortcutConflict}</div>
                      <button onClick={() => setShortcutConflict(null)} className="text-amber-300 hover:text-white">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {/* Search / Filter Shortcuts */}
                  <div className="relative">
                    <Search className="w-5 h-5 text-white/40 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar atajo (volumen, reproducir, letra)..."
                      value={shortcutsSearch}
                      onChange={(e) => setShortcutsSearch(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 focus:border-purple-400 text-sm text-white placeholder-white/40 focus:outline-none"
                    />
                  </div>

                  {/* Shortcuts List */}
                  <div className="space-y-2.5">
                    {SHORTCUT_DEFINITIONS.filter(s =>
                      s.label.toLowerCase().includes(shortcutsSearch.toLowerCase()) ||
                      s.description.toLowerCase().includes(shortcutsSearch.toLowerCase())
                    ).map((sc) => {
                      const currentKey = settings.shortcuts[sc.id] || sc.defaultKey;
                      const isRecording = recordingAction === sc.id;

                      return (
                        <div
                          key={sc.id}
                          className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                            isRecording
                              ? 'bg-purple-600/30 border-purple-400 shadow-[0_0_24px_rgba(168,85,247,0.35)] animate-pulse'
                              : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/5'
                          }`}
                        >
                          <div className="flex-1 pr-4 min-w-0">
                            <div className="text-sm sm:text-base font-semibold text-white tracking-tight">
                              {sc.label}
                            </div>
                            <div className="text-xs sm:text-sm text-white/55 truncate mt-0.5">
                              {sc.description}
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5 shrink-0">
                            {isRecording ? (
                              <div className="flex items-center gap-2">
                                <span className="px-3.5 py-1.5 rounded-xl bg-purple-500 text-white font-mono text-sm font-bold tracking-wider animate-bounce shadow-md">
                                  Presiona una tecla...
                                </span>
                                <button
                                  onClick={() => setRecordingAction(null)}
                                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <>
                                <kbd className="min-w-[42px] px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white font-mono text-sm font-bold tracking-wider text-center shadow-inner">
                                  {formatKeyName(currentKey)}
                                </kbd>
                                <button
                                  onClick={() => {
                                    setRecordingAction(sc.id);
                                    setShortcutConflict(null);
                                  }}
                                  className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/15 active:bg-white/20 border border-white/10 text-white/90 hover:text-white text-sm font-semibold transition-colors cursor-pointer"
                                >
                                  Cambiar
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* 5. AUDIO Y REPRODUCCIÓN */}
              {/* ========================================================= */}
              {activeTab === 'playback' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                      <Volume2 className="w-6 h-6 text-purple-400" />
                      Audio y Reproducción
                    </h3>
                    <p className="text-sm md:text-base text-white/60 mt-1">
                      Calidad de sonido y transiciones entre canciones.
                    </p>
                  </div>

                  {/* Crossfade */}
                  <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3.5">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-base font-bold text-white">Crossfade entre canciones</div>
                        <div className="text-sm text-white/60 mt-0.5">
                          Funde el final de una canción con el inicio de la siguiente
                        </div>
                      </div>
                      <span className="font-mono text-sm text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30 font-bold">
                        {settings.crossfadeDuration === 0 ? 'Desactivado' : `${settings.crossfadeDuration}s`}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2.5 pt-1">
                      {([0, 2, 4, 6] as CrossfadeDuration[]).map((dur) => (
                        <button
                          key={dur}
                          onClick={() => onUpdateSettings(prev => ({ ...prev, crossfadeDuration: dur }))}
                          className={`py-2.5 px-3 rounded-xl text-sm font-semibold text-center border transition-all cursor-pointer ${
                            settings.crossfadeDuration === dur
                              ? 'bg-purple-600/30 border-purple-400 text-white shadow-sm'
                              : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white/70'
                          }`}
                        >
                          {dur === 0 ? 'Sin crossfade' : `${dur}s`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Smooth Volume Transitions */}
                  <ToggleSwitch
                    label="Fade al Pausar y Reanudar"
                    description="Transición suave de volumen para evitar cortes bruscos"
                    checked={settings.smoothVolumeTransitions}
                    onChange={(v) => onUpdateSettings(prev => ({ ...prev, smoothVolumeTransitions: v }))}
                  />

                  {/* Volume Normalization */}
                  <ToggleSwitch
                    label="Normalización Automática de Volumen"
                    description="Mantiene un nivel de volumen constante entre todas las pistas"
                    checked={settings.volumeNormalization}
                    onChange={(v) => onUpdateSettings(prev => ({ ...prev, volumeNormalization: v }))}
                    badge="ReplayGain"
                  />
                </div>
              )}

              {/* ========================================================= */}
              {/* 6. ALMACENAMIENTO Y SISTEMA */}
              {/* ========================================================= */}
              {activeTab === 'system' && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                      <HardDrive className="w-6 h-6 text-purple-400" />
                      Almacenamiento y Caché
                    </h3>
                    <p className="text-sm md:text-base text-white/60 mt-1">
                      Gestiona el espacio local y los datos almacenados en el navegador.
                    </p>
                  </div>

                  {/* Storage Status Card */}
                  <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-base font-bold text-white">Almacenamiento Offline</div>
                        <div className="text-sm text-white/60 mt-0.5">Espacio para canciones y carátulas guardadas</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-mono font-bold text-white">
                          {availableGB.toFixed(2)} GB
                        </div>
                        <div className="text-xs text-white/50 font-mono">Disponibles de 5.00 GB</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(4, Math.min(100, ((5 - availableGB) / 5) * 100))}%` }}
                      />
                    </div>
                  </div>

                  {/* Clear Cache Card */}
                  <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center text-white/70 shrink-0">
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <div className="text-sm sm:text-base font-semibold text-white">Limpiar Caché</div>
                        <div className="text-xs sm:text-sm text-white/60 mt-0.5">
                          Elimina imágenes y datos temporales para liberar espacio
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onClearCache?.();
                        setCacheClearedToast(true);
                        setTimeout(() => setCacheClearedToast(false), 3000);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 hover:text-white text-sm font-semibold transition-colors cursor-pointer shrink-0"
                    >
                      {cacheClearedToast ? '¡Caché limpiada!' : 'Limpiar caché'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-7 md:px-10 py-5 border-t border-white/10 shrink-0 bg-black/30">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-sm font-semibold text-white/50 hover:text-white bg-transparent hover:bg-white/10 border border-transparent hover:border-white/15 transition-all duration-200 cursor-pointer group active:scale-95"
            >
              <RotateCcw className="w-4 h-4 transition-transform duration-500 ease-out group-hover:-rotate-180" />
              <span>Restablecer configuración</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-7 py-2.5 rounded-full bg-[#8a3aed] hover:bg-[#9c55f7] text-white text-base font-semibold shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 transition-all cursor-pointer active:scale-95"
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
                className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md"
                onClick={() => setShowResetConfirm(false)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-sm rounded-3xl p-6 bg-[#181622] border border-white/10 shadow-2xl text-center flex flex-col items-center"
                >
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300 mb-3.5 shadow-sm">
                    <RotateCcw className="w-6 h-6" />
                  </div>

                  <h3 className="text-xl font-bold text-white tracking-tight">
                    ¿Restablecer configuración?
                  </h3>

                  <p className="text-sm text-white/60 mt-1.5 mb-6">
                    Se devolverán todos los ajustes a sus valores por defecto.
                  </p>

                  <div className="flex items-center gap-3 w-full">
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onResetAll();
                        setShowResetConfirm(false);
                      }}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold shadow-md shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
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
