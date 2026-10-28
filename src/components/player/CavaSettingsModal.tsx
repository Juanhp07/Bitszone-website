import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sliders, Palette, Activity, RotateCcw, Sparkles, Check } from 'lucide-react';
import type { CavaSettings, CavaBarThickness, CavaColorTheme, CavaFillType, CavaGravity, CavaGlow } from './cavaTypes';
import { DEFAULT_CAVA_SETTINGS } from './cavaTypes';

interface CavaSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CavaSettings;
  onUpdateSettings: (updater: (prev: CavaSettings) => CavaSettings) => void;
  onReset: () => void;
}

export const CavaSettingsModal: React.FC<CavaSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onReset,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col rounded-[28px] bg-[#0c0914]/[0.92] backdrop-blur-3xl border border-white/20 shadow-[0_24px_80px_rgba(0,0,0,0.85)] text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0 bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">
                  Ajustes de Inmersión
                </h2>
                <p className="text-xs text-white/50">Personaliza la física, grosor y colores del visualizador</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              title="Cerrar ajustes"
              aria-label="Cerrar ajustes"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7 scrollbar-thin scrollbar-thumb-white/15">
            {/* 1. SECCIÓN: COLOR Y ESTILO */}
            <section className="space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
                <Palette className="w-4 h-4" />
                <span>Paleta de Color y Relleno</span>
              </div>

              {/* Color Themes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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
                      className={`relative flex flex-col items-start p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                        active
                          ? 'bg-purple-600/20 border-purple-400/80 shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                          : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10'
                      }`}
                    >
                      <div className={`w-full h-3 rounded-full bg-gradient-to-r ${th.preview} mb-2 shadow-sm`} />
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-semibold text-white tracking-tight">{th.label}</span>
                        {active && <Check className="w-3.5 h-3.5 text-purple-300 shrink-0" />}
                      </div>
                      <span className="text-[10px] text-white/50 line-clamp-1 mt-0.5">{th.desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Fill type: Gradient vs Solid */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-medium text-white/80">Tipo de acabado</span>
                <div className="flex p-1 rounded-xl bg-white/[0.06] border border-white/10 gap-1">
                  {(['gradient', 'solid'] as CavaFillType[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => onUpdateSettings(prev => ({ ...prev, fillType: f }))}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        settings.fillType === f ? 'bg-purple-600 text-white shadow-sm' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      {f === 'gradient' ? 'Degradado' : 'Color Sólido'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Glow Intensity */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-medium text-white/80">Resplandor Neón</span>
                <div className="flex p-1 rounded-xl bg-white/[0.06] border border-white/10 gap-1">
                  {(['none', 'subtle', 'intense'] as CavaGlow[]).map((g) => (
                    <button
                      key={g}
                      onClick={() => onUpdateSettings(prev => ({ ...prev, glow: g }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        settings.glow === g ? 'bg-purple-600 text-white shadow-sm' : 'text-white/60 hover:text-white'
                      }`}
                    >
                      {g === 'none' ? 'Apagado' : g === 'subtle' ? 'Sutil' : 'Intenso'}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* 2. SECCIÓN: GEOMETRÍA Y VARITAS */}
            <section className="space-y-3.5 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
                <Sliders className="w-4 h-4" />
                <span>Geometría y Grosor de las Varitas</span>
              </div>

              {/* Grosor Preset */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white/80">Grosor de las varitas</span>
                  <span className="text-white/50 uppercase font-mono text-[10px]">{settings.thickness}</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'thin' as CavaBarThickness, label: 'Delgado' },
                    { id: 'medium' as CavaBarThickness, label: 'Medio' },
                    { id: 'thick' as CavaBarThickness, label: 'Grueso' },
                    { id: 'ultra' as CavaBarThickness, label: 'Extra Grueso' },
                  ].map((th) => (
                    <button
                      key={th.id}
                      onClick={() => onUpdateSettings(prev => ({ ...prev, thickness: th.id }))}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                        settings.thickness === th.id
                          ? 'bg-purple-600/30 border-purple-400 text-white'
                          : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white/70'
                      }`}
                    >
                      {th.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Cantidad de Varitas / Densidad */}
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white/80">Cantidad de varitas en pantalla</span>
                  <span className="text-purple-300 font-bold font-mono text-xs">{settings.barCount} barras</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[24, 32, 40, 56].map((count) => (
                    <button
                      key={count}
                      onClick={() => onUpdateSettings(prev => ({ ...prev, barCount: count }))}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                        settings.barCount === count
                          ? 'bg-purple-600/30 border-purple-400 text-white'
                          : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white/70'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ancho general de cobertura */}
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white/80">Ancho horizontal general</span>
                  <span className="text-purple-300 font-bold font-mono text-xs">{settings.containerWidthPercent}%</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[88, 92, 96, 100].map((w) => (
                    <button
                      key={w}
                      onClick={() => onUpdateSettings(prev => ({ ...prev, containerWidthPercent: w }))}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                        settings.containerWidthPercent === w
                          ? 'bg-purple-600/30 border-purple-400 text-white'
                          : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white/70'
                      }`}
                    >
                      {w === 100 ? 'Pantalla Completa' : `${w}%`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles: Rounded caps */}
              <div className="pt-2">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/10">
                  <div>
                    <span className="text-xs font-medium text-white/90 block">Puntas redondeadas</span>
                    <span className="text-[10px] text-white/50">Forma de cápsula suave en la parte superior</span>
                  </div>
                  <button
                    onClick={() => onUpdateSettings(prev => ({ ...prev, roundedCaps: !prev.roundedCaps }))}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      settings.roundedCaps ? 'bg-purple-600' : 'bg-white/20'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                        settings.roundedCaps ? 'left-6' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </section>

            {/* 3. SECCIÓN: DINÁMICA Y FÍSICA CAVA */}
            <section className="space-y-3.5 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-300">
                <Activity className="w-4 h-4" />
                <span>Física de Rebote y Caída CAVA</span>
              </div>

              {/* Sensibilidad */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white/80">Sensibilidad de respuesta</span>
                  <span className="text-purple-300 font-bold font-mono text-xs">{settings.sensitivity.toFixed(2)}x</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { val: 0.85, label: 'Suave' },
                    { val: 1.0, label: 'Normal' },
                    { val: 1.25, label: 'Dinámico' },
                    { val: 1.55, label: 'Potente' },
                  ].map((s) => (
                    <button
                      key={s.val}
                      onClick={() => onUpdateSettings(prev => ({ ...prev, sensitivity: s.val }))}
                      className={`py-2 px-1 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                        Math.abs(settings.sensitivity - s.val) < 0.05
                          ? 'bg-purple-600/30 border-purple-400 text-white'
                          : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white/70'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Caída con Gravedad */}
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-white/80">Inercia de caída</span>
                  <span className="text-white/50 uppercase font-mono text-[10px]">{settings.gravity}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'fluid' as CavaGravity, label: 'Fluida (Recomendada)' },
                    { id: 'fast' as CavaGravity, label: 'Rápida' },
                    { id: 'slow' as CavaGravity, label: 'Sedosa / Lenta' },
                  ].map((g) => (
                    <button
                      key={g.id}
                      onClick={() => onUpdateSettings(prev => ({ ...prev, gravity: g.id }))}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer ${
                        settings.gravity === g.id
                          ? 'bg-purple-600/30 border-purple-400 text-white'
                          : 'bg-white/[0.04] hover:bg-white/[0.08] border-white/10 text-white/70'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 shrink-0 bg-white/[0.02]">
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer</span>
            </button>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white text-xs font-bold shadow-[0_4px_16px_rgba(168,85,247,0.4)] transition-all cursor-pointer"
            >
              Listo
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
