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
  Sliders,
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
  InterfaceDensity,
  ColorBlindnessType,
  CrossfadeDuration,
  StreamingQuality,
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
    className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 transition-colors cursor-pointer select-none group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
  >
    <div className="flex-1 pr-4 min-w-0">
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-white/90 group-hover:text-white transition-colors">
          {label}
        </span>
        {badge && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {badge}
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-white/50 group-hover:text-white/60 transition-colors mt-0.5 line-clamp-2">
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

  const tabs: Array<{ id: SettingsTabId; label: string; icon: React.FC<{ className?: string }>; desc: string }> = [
    { id: 'appearance', label: 'Texto y Apariencia', icon: Type, desc: 'Tamaño de fuente y estilo' },
    { id: 'accessibility', label: 'Accesibilidad y Visión', icon: Eye, desc: 'Daltonismo y contraste' },
    { id: 'performance', label: 'Rendimiento y Efectos', icon: Zap, desc: 'Animaciones y blur' },
    { id: 'shortcuts', label: 'Atajos de Teclado', icon: Keyboard, desc: 'Teclas personalizadas' },
    { id: 'playback', label: 'Audio y Reproducción', icon: Volume2, desc: 'Transición y calidad' },
    { id: 'system', label: 'Almacenamiento', icon: HardDrive, desc: 'Caché y restablecimiento' },
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
          initial={{ opacity: 0, scale: 0.92, y: 32 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12, transition: { duration: 0.2 } }}
          transition={{ type: 'spring', stiffness: 160, damping: 22, mass: 0.9, opacity: { duration: 0.35 } }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-6xl h-[90dvh] md:h-[88vh] rounded-3xl overflow-hidden shadow-2xl text-white [text-shadow:0_1px_10px_rgba(0,0,0,0.45)] flex flex-col"
          style={cardStyle}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-7 md:px-10 py-6 border-b border-white/10 shrink-0 bg-black/20">
            <div className="flex items-center gap-3.5 md:gap-5">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-purple-300 shadow-lg shrink-0">
                <Sliders className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <div>
                <h2 id="general-settings-title" className="text-3xl md:text-4xl text-white flex items-center gap-3" style={titleStyle}>
                  Configuración
                  <span className="hidden sm:inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-white/10 text-white/80 border border-white/10 not-italic font-sans">
                    Sistema
                  </span>
                </h2>
                <p className="text-sm md:text-base text-white/65 hidden sm:block mt-1">
                  Personaliza el tamaño de texto, accesibilidad, efectos y atajos de teclado
                </p>
              </div>
            </div>

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
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Navigation Tabs (Sidebar on desktop / horizontal bar on mobile) */}
            <div className="w-full md:w-72 shrink-0 border-b md:border-b-0 md:border-r border-white/10 bg-white/[0.01] p-3 md:p-5 overflow-x-auto md:overflow-y-auto scrollbar-hide flex md:flex-col gap-1.5 md:gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3.5 px-4 py-3 md:py-3.5 rounded-2xl text-left transition-all cursor-pointer whitespace-nowrap shrink-0 group ${
                      isActive
                        ? 'bg-purple-600/25 border border-purple-500/40 text-white shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                        : 'hover:bg-white/[0.05] border border-transparent text-white/60 hover:text-white'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive ? 'bg-purple-500/30 text-purple-200' : 'bg-white/5 text-white/60 group-hover:text-white'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5 md:w-5 md:h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm md:text-base font-semibold tracking-tight">{tab.label}</div>
                      <div className="hidden md:block text-xs text-white/45 group-hover:text-white/65 truncate mt-0.5">
                        {tab.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Content Panel */}
            <div className="flex-1 overflow-y-auto p-6 md:p-9 space-y-8 scrollbar-thin scrollbar-thumb-white/15">
              {/* ========================================================= */}
              {/* 1. APARIENCIA Y TEXTO */}
              {/* ========================================================= */}
              {activeTab === 'appearance' && (
                <div className="space-y-7">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-white flex items-center gap-2.5">
                      <Type className="w-5 h-5 text-purple-400" />
                      Tamaño del Texto en toda la Web
                    </h3>
                    <p className="text-sm md:text-base text-white/60 mt-1">
                      Ajusta la escala de lectura general de toda la interfaz sin romper el diseño.
                    </p>
                  </div>

                  {/* Live preview box */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col gap-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-300">
                      Vista previa en tiempo real
                    </span>
                    <p
                      className="text-white font-medium leading-relaxed transition-all"
                      style={{ fontSize: `${settings.textScale}%` }}
                    >
                      Bitszone — Música ilimitada con la mejor experiencia visual y acústica.
                    </p>
                    <span className="text-[11px] text-white/40 mt-1 font-mono">
                      Escala actual: {settings.textScale}%
                    </span>
                  </div>

                  {/* Quick Scale Presets */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                      Ajustes rápidos predefinidos
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {[
                        { label: 'Pequeño', scale: 85 },
                        { label: 'Compacto', scale: 92 },
                        { label: 'Normal', scale: 100 },
                        { label: 'Grande', scale: 115 },
                        { label: 'Extra Grande', scale: 130 },
                      ].map((p) => (
                        <button
                          key={p.scale}
                          onClick={() => onUpdateSettings(prev => ({ ...prev, textScale: p.scale }))}
                          className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                            settings.textScale === p.scale
                              ? 'bg-purple-600/30 border-purple-400 text-white font-bold shadow-[0_0_16px_rgba(168,85,247,0.3)]'
                              : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white/70'
                          }`}
                        >
                          <div className="text-xs">{p.label}</div>
                          <div className="text-[10px] text-white/50 font-mono mt-0.5">{p.scale}%</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Range Slider for Fine-Tuning */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-white/80">Ajuste fino manual</span>
                      <span className="font-mono text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
                        {settings.textScale}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={80}
                      max={135}
                      step={1}
                      value={settings.textScale}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        onUpdateSettings(prev => ({ ...prev, textScale: val }));
                      }}
                      className="w-full accent-purple-500 cursor-pointer h-2 bg-white/10 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-white/40 font-mono">
                      <span>80% (Mínimo)</span>
                      <span>100% (Estándar)</span>
                      <span>135% (Máximo)</span>
                    </div>
                  </div>

                  {/* Typography Selection */}
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                      Familia Tipográfica
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {[
                        { id: 'default' as FontFamilyType, label: 'Inter & Sora', desc: 'Estándar moderna Bitszone' },
                        { id: 'dyslexic' as FontFamilyType, label: 'Alta Legibilidad', desc: 'Optimizado para dislexia' },
                        { id: 'mono' as FontFamilyType, label: 'Monospace', desc: 'Estilo terminal JetBrains' },
                      ].map((font) => (
                        <button
                          key={font.id}
                          onClick={() => onUpdateSettings(prev => ({ ...prev, fontFamily: font.id }))}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            settings.fontFamily === font.id
                              ? 'bg-purple-600/25 border-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                              : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white/70'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{font.label}</span>
                            {settings.fontFamily === font.id && <Check className="w-3.5 h-3.5 text-purple-300" />}
                          </div>
                          <p className="text-[11px] text-white/50 mt-1">{font.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interface Density */}
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                      Densidad de la Interfaz
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { id: 'comfortable' as InterfaceDensity, label: 'Cómoda', desc: 'Espaciado generoso para pantallas grandes' },
                        { id: 'compact' as InterfaceDensity, label: 'Compacta', desc: 'Más canciones y contenido visible por pantalla' },
                      ].map((den) => (
                        <button
                          key={den.id}
                          onClick={() => onUpdateSettings(prev => ({ ...prev, interfaceDensity: den.id }))}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            settings.interfaceDensity === den.id
                              ? 'bg-purple-600/25 border-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                              : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white/70'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{den.label}</span>
                            {settings.interfaceDensity === den.id && <Check className="w-3.5 h-3.5 text-purple-300" />}
                          </div>
                          <p className="text-[11px] text-white/50 mt-1">{den.desc}</p>
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
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Eye className="w-4.5 h-4.5 text-purple-400" />
                      Asistencia Visual & Daltonismo
                    </h3>
                    <p className="text-xs text-white/50 mt-1">
                      Filtros certificados por matrices de color para daltonismo y realces de contraste.
                    </p>
                  </div>

                  {/* Color Blindness Selector */}
                  <div className="space-y-3">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                      Filtro para Daltonismo
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                      {[
                        { id: 'none' as ColorBlindnessType, label: 'Desactivado', desc: 'Visión estándar tricomática' },
                        { id: 'protanopia' as ColorBlindnessType, label: 'Protanopia', desc: 'Deficiencia en color Rojo' },
                        { id: 'deuteranopia' as ColorBlindnessType, label: 'Deuteranopia', desc: 'Deficiencia en color Verde' },
                        { id: 'tritanopia' as ColorBlindnessType, label: 'Tritanopia', desc: 'Deficiencia en color Azul' },
                        { id: 'achromatopsia' as ColorBlindnessType, label: 'Acromatopsia', desc: 'Escala de grises pura' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => onUpdateSettings(prev => ({ ...prev, colorBlindness: item.id }))}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            settings.colorBlindness === item.id
                              ? 'bg-purple-600/25 border-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                              : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white/70'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{item.label}</span>
                            {settings.colorBlindness === item.id && <Check className="w-3.5 h-3.5 text-purple-300" />}
                          </div>
                          <p className="text-[11px] text-white/50 mt-1">{item.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Interactive Palette Check */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white/80">
                        Comprobación de Paleta de Colores
                      </span>
                      <span className="text-[10px] text-white/40">
                        Visualiza cómo afecta tu filtro actual
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-2 text-center">
                      {[
                        { name: 'Rojo', color: 'bg-rose-500' },
                        { name: 'Verde', color: 'bg-emerald-500' },
                        { name: 'Azul', color: 'bg-sky-500' },
                        { name: 'Amarillo', color: 'bg-amber-400 text-black' },
                        { name: 'Morado', color: 'bg-purple-500' },
                      ].map((col) => (
                        <div key={col.name} className="flex flex-col items-center gap-1.5">
                          <div className={`w-full h-8 sm:h-10 rounded-xl ${col.color} shadow-sm border border-white/20`} />
                          <span className="text-[10px] font-medium text-white/70">{col.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Accessibility Toggles */}
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                      Opciones Adicionales de Accesibilidad
                    </label>

                    <ToggleSwitch
                      label="Modo de Alto Contraste"
                      description="Aumenta el contraste de texto a blanco puro y bordes definidos para máxima legibilidad"
                      checked={settings.highContrast}
                      onChange={(v) => onUpdateSettings(prev => ({ ...prev, highContrast: v }))}
                      badge="WCAG AAA"
                    />

                    <ToggleSwitch
                      label="Subrayar Elementos Interactivos"
                      description="Subraya enlaces, títulos de canciones y opciones clickeables para identificarlos fácilmente"
                      checked={settings.underlineLinks}
                      onChange={(v) => onUpdateSettings(prev => ({ ...prev, underlineLinks: v }))}
                    />

                    <ToggleSwitch
                      label="Reducir Transparencias"
                      description="Reemplaza efectos de vidrio translúcido por fondos sólidos oscuros de alto contraste"
                      checked={settings.reduceTransparency}
                      onChange={(v) => onUpdateSettings(prev => ({ ...prev, reduceTransparency: v }))}
                    />

                    <ToggleSwitch
                      label="Indicadores de Foco Aumentados"
                      description="Muestra un resplandor visible alrededor de elementos seleccionados con teclado"
                      checked={settings.enhancedFocus}
                      onChange={(v) => onUpdateSettings(prev => ({ ...prev, enhancedFocus: v }))}
                    />
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* 3. RENDIMIENTO Y EFECTOS */}
              {/* ========================================================= */}
              {activeTab === 'performance' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Zap className="w-4.5 h-4.5 text-purple-400" />
                      Rendimiento y Efectos Gráficos
                    </h3>
                    <p className="text-xs text-white/50 mt-1">
                      Desactiva efectos visuales intensivos si experimentas lentitud o deseas ahorrar batería.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <ToggleSwitch
                      label="Quitar Animaciones y Efectos de Movimiento"
                      description="Desactiva transiciones complejas y animaciones de resorte. Ideal para equipos lentos o personas sensibles al movimiento"
                      checked={settings.reduceMotion}
                      onChange={(v) => onUpdateSettings(prev => ({ ...prev, reduceMotion: v }))}
                      badge="Rendimiento"
                    />

                    <ToggleSwitch
                      label="Desactivar Desenfoque de Cristal (Backdrop Blur)"
                      description="Elimina el filtro blur de fondo que sobrecarga las tarjetas gráficas integradas en portátiles"
                      checked={settings.disableBlur}
                      onChange={(v) => onUpdateSettings(prev => ({ ...prev, disableBlur: v }))}
                      badge="Ahorro GPU"
                    />

                    <ToggleSwitch
                      label="Desactivar Resplandores y Luces Neón"
                      description="Apaga los efectos glow y sombras difusas de alta intensidad"
                      checked={settings.disableGlows}
                      onChange={(v) => onUpdateSettings(prev => ({ ...prev, disableGlows: v }))}
                    />

                    <ToggleSwitch
                      label="Fondo Dinámico Ambiental de Portada"
                      description="Genera un aura de color difuminada en tiempo real según los colores de la carátula en reproducción"
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
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Keyboard className="w-4.5 h-4.5 text-purple-400" />
                        Atajos de Teclado Personalizados
                      </h3>
                      <p className="text-xs text-white/50 mt-1">
                        Haz clic en &ldquo;Cambiar&rdquo; y presiona cualquier tecla para reasignar una acción.
                      </p>
                    </div>

                    <button
                      onClick={onResetShortcuts}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restablecer atajos</span>
                    </button>
                  </div>

                  {/* Conflict Notice Alert */}
                  {shortcutConflict && (
                    <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-start gap-2.5 text-amber-200 text-xs">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="flex-1">{shortcutConflict}</div>
                      <button onClick={() => setShortcutConflict(null)} className="text-amber-300 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Search / Filter Shortcuts */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Buscar atajo (ej. volumen, reproducir, letra)..."
                      value={shortcutsSearch}
                      onChange={(e) => setShortcutsSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 focus:border-purple-400 text-xs text-white placeholder-white/30 focus:outline-none"
                    />
                  </div>

                  {/* Shortcuts List */}
                  <div className="space-y-2">
                    {SHORTCUT_DEFINITIONS.filter(s =>
                      s.label.toLowerCase().includes(shortcutsSearch.toLowerCase()) ||
                      s.description.toLowerCase().includes(shortcutsSearch.toLowerCase())
                    ).map((sc) => {
                      const currentKey = settings.shortcuts[sc.id] || sc.defaultKey;
                      const isRecording = recordingAction === sc.id;

                      return (
                        <div
                          key={sc.id}
                          className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                            isRecording
                              ? 'bg-purple-600/30 border-purple-400 shadow-[0_0_24px_rgba(168,85,247,0.35)] animate-pulse'
                              : 'bg-white/[0.03] hover:bg-white/[0.06] border-white/5'
                          }`}
                        >
                          <div className="flex-1 pr-4 min-w-0">
                            <div className="text-xs md:text-sm font-semibold text-white tracking-tight">
                              {sc.label}
                            </div>
                            <div className="text-[11px] text-white/50 truncate mt-0.5">
                              {sc.description}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {isRecording ? (
                              <div className="flex items-center gap-2">
                                <span className="px-3 py-1.5 rounded-xl bg-purple-500 text-white font-mono text-xs font-bold tracking-wider animate-bounce shadow-md">
                                  Presiona una tecla...
                                </span>
                                <button
                                  onClick={() => setRecordingAction(null)}
                                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <>
                                <kbd className="min-w-[36px] px-2.5 py-1.5 rounded-xl bg-white/10 border border-white/20 text-white font-mono text-xs font-bold tracking-wider text-center shadow-inner">
                                  {formatKeyName(currentKey)}
                                </kbd>
                                <button
                                  onClick={() => {
                                    setRecordingAction(sc.id);
                                    setShortcutConflict(null);
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/15 active:bg-white/20 border border-white/10 text-white/80 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
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
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Volume2 className="w-4.5 h-4.5 text-purple-400" />
                      Audio y Transición de Canciones
                    </h3>
                    <p className="text-xs text-white/50 mt-1">
                      Controla la mezcla entre pistas, calidad de audio y suavizado de volumen.
                    </p>
                  </div>

                  {/* Crossfade */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-semibold text-white">Crossfade entre canciones</div>
                        <div className="text-xs text-white/50">
                          Disuelve la canción actual con la siguiente de manera continua
                        </div>
                      </div>
                      <span className="font-mono text-xs text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full border border-purple-500/30">
                        {settings.crossfadeDuration === 0 ? 'Desactivado' : `${settings.crossfadeDuration} segundos`}
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {([0, 2, 4, 6] as CrossfadeDuration[]).map((dur) => (
                        <button
                          key={dur}
                          onClick={() => onUpdateSettings(prev => ({ ...prev, crossfadeDuration: dur }))}
                          className={`py-2 px-2 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
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
                    label="Fade al Pausar / Reanudar y Mover Timeline"
                    description="Aplica un micro-fade de volumen para evitar clics acústicos y cortes bruscos al pausar o desplazarse"
                    checked={settings.smoothVolumeTransitions}
                    onChange={(v) => onUpdateSettings(prev => ({ ...prev, smoothVolumeTransitions: v }))}
                  />

                  {/* Volume Normalization */}
                  <ToggleSwitch
                    label="Normalización Automática de Volumen"
                    description="Equilibra los niveles de pistas masterizadas a distinto volumen para no tener que subir o bajar constantemente"
                    checked={settings.volumeNormalization}
                    onChange={(v) => onUpdateSettings(prev => ({ ...prev, volumeNormalization: v }))}
                    badge="ReplayGain"
                  />

                  {/* Streaming Quality */}
                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/60">
                      Calidad de Reproducción de Audio
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {[
                        { id: 'normal' as StreamingQuality, label: 'Normal (160 kbps)', desc: 'Ahorro de datos móviles' },
                        { id: 'high' as StreamingQuality, label: 'Alta (320 kbps)', desc: 'Claridad nítida y rango dinámico' },
                        { id: 'lossless' as StreamingQuality, label: 'Sin Pérdidas (FLAC)', desc: 'Calidad máster de estudio' },
                      ].map((q) => (
                        <button
                          key={q.id}
                          onClick={() => onUpdateSettings(prev => ({ ...prev, streamingQuality: q.id }))}
                          className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                            settings.streamingQuality === q.id
                              ? 'bg-purple-600/25 border-purple-400 text-white shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                              : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white/70'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{q.label}</span>
                            {settings.streamingQuality === q.id && <Check className="w-3.5 h-3.5 text-purple-300" />}
                          </div>
                          <p className="text-[11px] text-white/50 mt-1">{q.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* 6. ALMACENAMIENTO Y SISTEMA */}
              {/* ========================================================= */}
              {activeTab === 'system' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <HardDrive className="w-4.5 h-4.5 text-purple-400" />
                      Almacenamiento Local y Caché
                    </h3>
                    <p className="text-xs text-white/50 mt-1">
                      Gestiona el espacio asignado en el navegador y los datos temporales del reproductor.
                    </p>
                  </div>

                  {/* Storage Status Card */}
                  <div className="p-5 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-bold text-white">Almacenamiento Offline</div>
                        <div className="text-xs text-white/50 mt-0.5">Espacio local para descargas y metadatos</div>
                      </div>
                      <div className="text-right">
                        <div className="text-base font-mono font-bold text-white">
                          {availableGB.toFixed(2)} GB
                        </div>
                        <div className="text-[10px] text-white/40 uppercase font-mono">Disponibles de 5.00 GB</div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(4, Math.min(100, ((5 - availableGB) / 5) * 100))}%` }}
                      />
                    </div>
                  </div>

                  {/* Clear Cache Card */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/70 shrink-0">
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <div className="text-xs md:text-sm font-semibold text-white">Limpiar Caché de la Aplicación</div>
                        <div className="text-[11px] text-white/50">
                          Elimina carátulas temporales y buffers de audio acumulados
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onClearCache?.();
                        setCacheClearedToast(true);
                        setTimeout(() => setCacheClearedToast(false), 3000);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
                    >
                      {cacheClearedToast ? '¡Caché limpiada!' : 'Limpiar caché'}
                    </button>
                  </div>

                  {/* Reset All Settings */}
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/70 shrink-0">
                        <RotateCcw className="w-5 h-5 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-xs md:text-sm font-semibold text-white">Restablecer Todo de Fábrica</div>
                        <div className="text-[11px] text-white/50">
                          Devuelve texto, atajos, accesibilidad y audio a sus valores predeterminados
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={onResetAll}
                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
                    >
                      Restablecer todo
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
              onClick={onResetAll}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restablecer todo</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-8 py-2.5 rounded-full bg-[#8a3aed] hover:bg-[#9c55f7] text-white text-sm font-semibold shadow-lg shadow-purple-600/30 transition-all cursor-pointer active:scale-95"
            >
              Listo
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};
