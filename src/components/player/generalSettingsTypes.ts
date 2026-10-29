export type TextScalePreset = 85 | 92 | 100 | 115 | 130;

export type ColorBlindnessType = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia';

export type FontFamilyType = 'default' | 'dyslexic' | 'mono';

export type InterfaceDensity = 'comfortable' | 'compact';

export type CrossfadeDuration = 0 | 2 | 4 | 6;

export type StreamingQuality = 'normal' | 'high' | 'lossless';

export interface CustomShortcuts {
  togglePlay: string;
  nextTrack: string;
  prevTrack: string;
  volumeUp: string;
  volumeDown: string;
  toggleExpand: string;
  toggleLyrics: string;
  toggleRepeat: string;
  toggleShuffle: string;
  toggleFavorite: string;
  toggleMute: string;
  openConfig: string;
}

export interface GeneralSettings {
  // 1. Apariencia y Texto
  textScale: number; // 80 - 135 (%)
  fontFamily: FontFamilyType;
  interfaceDensity: InterfaceDensity;

  // 2. Accesibilidad y Visión
  colorBlindness: ColorBlindnessType;
  highContrast: boolean;
  underlineLinks: boolean;
  reduceTransparency: boolean;
  enhancedFocus: boolean;

  // 3. Rendimiento y Efectos
  reduceMotion: boolean;
  disableBlur: boolean;
  disableGlows: boolean;
  ambientBackground: boolean;

  // 4. Atajos de Teclado
  shortcuts: CustomShortcuts;

  // 5. Audio y Reproducción
  crossfadeDuration: CrossfadeDuration;
  smoothVolumeTransitions: boolean;
  streamingQuality: StreamingQuality;
  volumeNormalization: boolean;

  // 6. Notificaciones
  trackChangeToasts: boolean;
}

export const DEFAULT_SHORTCUTS: CustomShortcuts = {
  togglePlay: 'Space',
  nextTrack: 'ArrowRight',
  prevTrack: 'ArrowLeft',
  volumeUp: 'ArrowUp',
  volumeDown: 'ArrowDown',
  toggleExpand: 'KeyF',
  toggleLyrics: 'KeyL',
  toggleRepeat: 'KeyR',
  toggleShuffle: 'KeyA',
  toggleFavorite: 'KeyS',
  toggleMute: 'KeyM',
  openConfig: 'KeyC',
};

export const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
  textScale: 100,
  fontFamily: 'default',
  interfaceDensity: 'comfortable',
  colorBlindness: 'none',
  highContrast: false,
  underlineLinks: false,
  reduceTransparency: false,
  enhancedFocus: false,
  reduceMotion: false,
  disableBlur: false,
  disableGlows: false,
  ambientBackground: true,
  shortcuts: DEFAULT_SHORTCUTS,
  crossfadeDuration: 2,
  smoothVolumeTransitions: true,
  streamingQuality: 'high',
  volumeNormalization: true,
  trackChangeToasts: true,
};

export const SHORTCUT_DEFINITIONS: Array<{
  id: keyof CustomShortcuts;
  label: string;
  description: string;
  defaultKey: string;
}> = [
  { id: 'togglePlay', label: 'Reproducir / Pausar', description: 'Alterna la reproducción de la canción actual', defaultKey: 'Space' },
  { id: 'nextTrack', label: 'Siguiente canción', description: 'Avanza a la próxima pista de la lista', defaultKey: 'ArrowRight' },
  { id: 'prevTrack', label: 'Canción anterior', description: 'Retrocede a la pista anterior o al inicio', defaultKey: 'ArrowLeft' },
  { id: 'volumeUp', label: 'Subir volumen', description: 'Aumenta el nivel de audio en 5%', defaultKey: 'ArrowUp' },
  { id: 'volumeDown', label: 'Bajar volumen', description: 'Reduce el nivel de audio en 5%', defaultKey: 'ArrowDown' },
  { id: 'toggleExpand', label: 'Expandir reproductor', description: 'Abre o minimiza el reproductor gigante a pantalla completa', defaultKey: 'KeyF' },
  { id: 'toggleLyrics', label: 'Mostrar letra', description: 'Abre la barra lateral o vista de letras sincronizadas', defaultKey: 'KeyL' },
  { id: 'toggleRepeat', label: 'Modo repetición', description: 'Alterna entre desactivado, repetir todo o repetir una', defaultKey: 'KeyR' },
  { id: 'toggleShuffle', label: 'Modo aleatorio', description: 'Mezcla aleatoriamente el orden de las canciones', defaultKey: 'KeyA' },
  { id: 'toggleFavorite', label: 'Favoritos', description: 'Agrega o quita la canción actual de favoritos', defaultKey: 'KeyS' },
  { id: 'toggleMute', label: 'Silenciar / Reactivar', description: 'Silencia instantáneamente el reproductor', defaultKey: 'KeyM' },
  { id: 'openConfig', label: 'Configuración', description: 'Abre o cierra este panel de configuración', defaultKey: 'KeyC' },
];

export function formatKeyName(code: string): string {
  if (!code) return 'Sin asignar';
  if (code === 'Space') return 'Espacio';
  if (code === 'ArrowRight') return '→';
  if (code === 'ArrowLeft') return '←';
  if (code === 'ArrowUp') return '↑';
  if (code === 'ArrowDown') return '↓';
  if (code.startsWith('Key')) return code.slice(3).toUpperCase();
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Numpad')) return `Num ${code.slice(6)}`;
  if (code === 'Enter') return 'Enter ↵';
  if (code === 'Escape') return 'Esc';
  if (code === 'Backspace') return '⌫';
  if (code === 'Tab') return 'Tab ⇥';
  if (code === 'BracketLeft') return '[';
  if (code === 'BracketRight') return ']';
  if (code === 'Comma') return ',';
  if (code === 'Period') return '.';
  if (code === 'Slash') return '/';
  if (code === 'Backslash') return '\\';
  if (code === 'Minus') return '-';
  if (code === 'Equal') return '=';
  if (code === 'Semicolon') return ';';
  if (code === 'Quote') return "'";
  return code;
}

const SETTINGS_STORAGE_KEY = 'bitszone_general_settings';

export function loadGeneralSettings(): GeneralSettings {
  if (typeof window === 'undefined') return DEFAULT_GENERAL_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_GENERAL_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_GENERAL_SETTINGS,
      ...parsed,
      shortcuts: {
        ...DEFAULT_SHORTCUTS,
        ...(parsed.shortcuts || {}),
      },
    };
  } catch (err) {
    console.error('Error cargando configuración:', err);
    return DEFAULT_GENERAL_SETTINGS;
  }
}

export function saveGeneralSettings(settings: GeneralSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Error guardando configuración:', err);
  }
}

export function applyGeneralSettingsToDOM(settings: GeneralSettings): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // 1. Escala tipográfica en toda la web
  const clampedScale = Math.max(80, Math.min(135, settings.textScale));
  root.style.fontSize = `${clampedScale}%`;
  root.style.setProperty('--app-font-scale', `${clampedScale / 100}`);

  // 2. Tipografía
  root.classList.toggle('font-dyslexic', settings.fontFamily === 'dyslexic');
  root.classList.toggle('font-mono-ui', settings.fontFamily === 'mono');

  // 3. Daltonismo
  root.setAttribute('data-colorblind', settings.colorBlindness);

  // 4. Alto contraste
  root.classList.toggle('theme-high-contrast', settings.highContrast);

  // 5. Subrayar enlaces y títulos
  root.classList.toggle('underline-links', settings.underlineLinks);

  // 6. Reducir transparencias
  root.classList.toggle('reduce-transparency', settings.reduceTransparency);

  // 7. Foco mejorado
  root.classList.toggle('enhanced-focus', settings.enhancedFocus);

  // 8. Reducir movimiento
  root.classList.toggle('reduce-motion', settings.reduceMotion);

  // 9. Desactivar desenfoque (backdrop-blur)
  root.classList.toggle('disable-blur', settings.disableBlur);

  // 10. Desactivar resplandores neón
  root.classList.toggle('disable-glows', settings.disableGlows);

  // 11. Densidad
  root.classList.toggle('density-compact', settings.interfaceDensity === 'compact');
}

export function getAvailableStorageGB(): number {
  if (typeof window === 'undefined') return 5.0;
  try {
    const raw = localStorage.getItem('bz_downloads');
    if (!raw) return 5.0;
    const tracks = JSON.parse(raw);
    const bytes = Array.isArray(tracks)
      ? tracks.reduce((acc: number, t: { fileSize?: number }) => acc + (t.fileSize || 10 * 1024 * 1024), 0)
      : 0;
    return Math.max(0, 5.0 - (bytes / (1024 * 1024 * 1024)));
  } catch (_) {
    return 5.0;
  }
}

