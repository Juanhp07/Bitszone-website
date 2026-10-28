export type CavaBarThickness = 'thin' | 'medium' | 'thick' | 'ultra';
export type CavaColorTheme = 'dynamic' | 'bitszone' | 'cyan' | 'fire' | 'emerald' | 'monochrome';
export type CavaFillType = 'gradient' | 'solid';
export type CavaGravity = 'fluid' | 'fast' | 'slow';
export type CavaGlow = 'none' | 'subtle' | 'intense';
export type CavaDistribution = 'distributed' | 'center' | 'interleaved' | 'linear';

export interface CavaSettings {
  /** Number of frequency bars across the screen */
  barCount: number; // 24 | 32 | 48 | 64
  /** Width preset of each bar */
  thickness: CavaBarThickness;
  /** Gap between bars in pixels */
  barGap: number; // 2 | 4 | 6 | 8 | 12
  /** Total horizontal width of visualizer in percentage */
  containerWidthPercent: number; // 85 | 92 | 96 | 100
  /** Color theme */
  colorTheme: CavaColorTheme;
  /** Gradient vs Solid fill */
  fillType: CavaFillType;
  /** Rounded pill tops vs sharp straight tops */
  roundedCaps: boolean;
  /** Floating peak caps on top of bars */
  peakCaps: boolean;
  /** Response sensitivity multiplier */
  sensitivity: number; // 0.8 | 1.0 | 1.3 | 1.6
  /** Falloff speed */
  gravity: CavaGravity;
  /** Ambient neon glow behind/around the bars */
  glow: CavaGlow;
  /** Frequency layout distribution across bars */
  distribution: CavaDistribution;
}

export const DEFAULT_CAVA_SETTINGS: CavaSettings = {
  barCount: 36,
  thickness: 'thick',
  barGap: 8,
  containerWidthPercent: 96,
  colorTheme: 'monochrome',
  fillType: 'gradient',
  roundedCaps: true,
  peakCaps: false,
  sensitivity: 1.15,
  gravity: 'fluid',
  glow: 'subtle',
  distribution: 'distributed',
};

export const CAVA_SETTINGS_STORAGE_KEY = 'bz_cava_visualizer_settings_v1';

export const loadCavaSettings = (): CavaSettings => {
  if (typeof window === 'undefined') return DEFAULT_CAVA_SETTINGS;
  try {
    const raw = localStorage.getItem(CAVA_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_CAVA_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_CAVA_SETTINGS,
      ...parsed,
      peakCaps: false,
      colorTheme: parsed.colorTheme === 'dynamic' ? 'monochrome' : (parsed.colorTheme || 'monochrome'),
      distribution: parsed.distribution || 'distributed',
    };
  } catch (_) {
    return DEFAULT_CAVA_SETTINGS;
  }
};

export const saveCavaSettings = (settings: CavaSettings): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CAVA_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (_) {}
};
