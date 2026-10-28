import React, { useEffect, useRef } from 'react';
import { audioVisualizer } from './audioVisualizer';
import type { CavaSettings } from './cavaTypes';

interface CavaVisualizerProps {
  audioElement: HTMLAudioElement | null;
  isPlaying: boolean;
  settings: CavaSettings;
  dominantColor?: string;
  className?: string;
}

export const CavaVisualizer: React.FC<CavaVisualizerProps> = ({
  audioElement,
  isPlaying,
  settings,
  dominantColor = 'rgba(168, 85, 247, 0.85)',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Keep refs for smooth continuous animation without re-instantiation on play/pause
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const heightsRef = useRef<Float32Array | null>(null);
  const smoothedFreqRef = useRef<Float32Array | null>(null);
  const rawTargetsRef = useRef<Float32Array | null>(null);
  const playStateBlendRef = useRef(isPlaying ? 1.0 : 0.0);
  const smoothedEnergyRef = useRef(0.2);
  const smoothedBassRef = useRef(0.2);

  // Keep audio context connected to the audio element
  useEffect(() => {
    if (audioElement) {
      audioVisualizer.connect(audioElement);
    }
  }, [audioElement]);

  useEffect(() => {
    if (isPlaying) {
      audioVisualizer.resumeContext();
    }
  }, [isPlaying]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const barCount = Math.max(16, Math.min(64, settings.barCount));

    // Persist or re-allocate array preserving previous state
    if (!heightsRef.current || heightsRef.current.length !== barCount) {
      const prevHeights = heightsRef.current;
      const newHeights = new Float32Array(barCount);
      if (prevHeights) {
        for (let i = 0; i < barCount; i++) {
          const prevIdx = Math.floor((i / barCount) * prevHeights.length);
          newHeights[i] = prevHeights[prevIdx] || 0.04;
        }
      }
      heightsRef.current = newHeights;
      smoothedFreqRef.current = new Float32Array(barCount);
      rawTargetsRef.current = new Float32Array(barCount);
    }

    const heights = heightsRef.current;
    const smoothedFreq = smoothedFreqRef.current!;
    const rawTargets = rawTargetsRef.current!;

    // Helper to extract RGB from dominantColor string
    const extractRgb = (str: string): [number, number, number] => {
      const match = str.match(/\d+/g);
      if (match && match.length >= 3) {
        return [parseInt(match[0], 10), parseInt(match[1], 10), parseInt(match[2], 10)];
      }
      return [168, 85, 247]; // fallback Bitszone purple
    };

    const albumRgb = extractRgb(dominantColor);

    const render = (now: number) => {
      const dt = Math.min(48, Math.max(8, now - lastTime));
      lastTime = now;
      const t = now * 0.0018; // smooth continuous time progress

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const playing = isPlayingRef.current;

      // 1. Smooth Play/Pause Cinematic Transition (no abrupt cut-offs)
      if (playing) {
        playStateBlendRef.current += (1.0 - playStateBlendRef.current) * Math.min(1, dt * 0.007);
      } else {
        // Luxuriously smooth descent when paused
        playStateBlendRef.current += (0.0 - playStateBlendRef.current) * Math.min(1, dt * 0.0035);
      }
      const playStateBlend = playStateBlendRef.current;

      // 2. Audio Energy & Bass Sampling
      const freqData = playing ? audioVisualizer.getByteFrequencyData() : null;

      let instantBass = 0;
      let instantEnergy = 0.25;

      if (freqData && freqData.length > 0) {
        // Bass bins: 0 to 6 (~0 to 350 Hz, capturing kick drums & 808s)
        let bassSum = 0;
        const bassBins = Math.min(7, freqData.length);
        for (let b = 0; b < bassBins; b++) {
          bassSum += freqData[b];
        }
        instantBass = bassSum / (bassBins * 255);

        // General energy bins: 0 to 80 (~0 to 4 kHz)
        let energySum = 0;
        const energyBins = Math.min(80, freqData.length);
        for (let b = 0; b < energyBins; b++) {
          energySum += freqData[b];
        }
        instantEnergy = energySum / (energyBins * 255);
      }

      // Fast attack & smooth decay for kick-drum punch
      const bassAttack = instantBass > smoothedBassRef.current ? 0.055 : 0.012;
      smoothedBassRef.current += (instantBass - smoothedBassRef.current) * Math.min(1, dt * bassAttack);

      const energyAttack = instantEnergy > smoothedEnergyRef.current ? 0.038 : 0.008;
      smoothedEnergyRef.current += (instantEnergy - smoothedEnergyRef.current) * Math.min(1, dt * energyAttack);

      const smoothedBass = smoothedBassRef.current;
      const smoothedEnergy = smoothedEnergyRef.current;

      // Silence detection: when track drops to quiet breakdown or silence, musicPresence falls to 0
      const hasRealAudio = audioVisualizer.isRealAudioActive();
      const musicPresence = hasRealAudio
        ? Math.min(1, Math.max(0, (smoothedEnergy - 0.025) / 0.12))
        : 1.0;

      // 3. Fluid Harmonic Wave Physics & Equalizer Distribution
      const maxBarHeight = height * 0.84; // gives bars rich height reaching towards the top
      const baselineY = height - 12;

      const distribution = settings.distribution || 'distributed';
      const phi = 0.618033988749895; // Golden ratio fractional part for non-repeating low-discrepancy dispersion

      // Pass 1: Calculate raw frequency targets per bar
      for (let i = 0; i < barCount; i++) {
        const x = i / Math.max(1, barCount - 1); // 0 (left) to 1 (right)

        // Calculate assigned frequency bin, band tilt, and bass designation based on distribution mode
        let targetBin = 0;
        let bandTilt = 1.0;
        let isBass = false;
        const scatter = (i * phi) % 1;

        if (distribution === 'center') {
          // Symmetrical: Sub-bass in center, expanding outward to treble at edges
          const distFromCenter = Math.abs(x - 0.5) * 2;
          targetBin = Math.floor(Math.pow(distFromCenter, 1.8) * 140);
          bandTilt = 1.0 + Math.pow(distFromCenter, 0.7) * 1.65;
          isBass = distFromCenter < 0.22;
        } else if (distribution === 'interleaved') {
          // Alternating: Even = Lows/Mids, Odd = High-Mids/Treble
          const isEven = i % 2 === 0;
          if (isEven) {
            targetBin = Math.floor(Math.pow(x, 1.5) * 38);
            bandTilt = 1.0 + Math.pow(x, 0.6) * 0.45;
            isBass = targetBin < 8;
          } else {
            targetBin = Math.floor(18 + Math.pow(x, 1.3) * 120);
            bandTilt = 1.35 + Math.pow(x, 0.7) * 0.95;
            isBass = false;
          }
        } else if (distribution === 'linear') {
          // Classic Left-to-Right: with Pink Noise tilt compensation
          targetBin = Math.floor(Math.pow(x, 1.8) * 140);
          bandTilt = 1.0 + Math.pow(x, 0.72) * 1.75;
          isBass = x < 0.18;
        } else {
          // 'distributed' (Default: Dispersión Armónica Natural con Golden Ratio)
          // Reparte los bajos, medios y agudos de forma orgánica y desordenada sin patrones repetitivos
          targetBin = Math.floor(Math.pow(scatter, 1.35) * 138);
          const normBin = Math.min(1, targetBin / 120);
          bandTilt = 0.95 + Math.pow(normBin, 0.65) * 1.55;
          isBass = targetBin < 12;
        }

        // Ambient fluid wave harmonics (liquid breathing motion with organic phase offset)
        const arch = Math.sin(x * Math.PI) * 0.14 + 0.08;
        const wave1 = Math.sin(t * 1.8 + x * Math.PI * 2.2) * 0.07;
        const wave2 = Math.cos(t * 2.6 - x * Math.PI * 3.4) * 0.05;
        const waveOrganic = Math.sin(t * 2.2 + scatter * Math.PI * 2) * 0.04;
        let waveProfile = arch + wave1 + wave2 + waveOrganic;

        if (freqData && freqData.length > 0) {
          const safeBin = Math.min(freqData.length - 1, targetBin);
          let rawFreqVal = freqData[safeBin] / 255;

          // Bass dynamic kick velocity multiplier (bounces on kicks without flat saturating)
          if (isBass) {
            rawFreqVal = rawFreqVal * (0.85 + smoothedBass * 0.45);
          }

          // Equal Loudness / Pink Noise tilt compensation
          const compensatedFreq = rawFreqVal * bandTilt;

          const attackRate = compensatedFreq > smoothedFreq[i]
            ? 0.055
            : (settings.gravity === 'fast' ? 0.018 : settings.gravity === 'slow' ? 0.008 : 0.012);
          smoothedFreq[i] += (compensatedFreq - smoothedFreq[i]) * Math.min(1, dt * attackRate);

          waveProfile = waveProfile * 0.22 + smoothedFreq[i] * 0.82;
        }

        // Active target modulated by music presence (collapses down during silence!)
        const activeTarget = waveProfile * (0.38 + smoothedEnergy * 0.78) * musicPresence * settings.sensitivity;

        // Soft-knee dynamic compression: allows energetic bars to punch up dynamically (~0.88-0.91),
        // but smoothly saturates so NO bars ever form a flat ceiling against the top!
        rawTargets[i] = 0.90 * Math.tanh(activeTarget / 0.82);
      }

      // Pass 2: Neighbor coupling pass for organic fluid wave feel (turns individual spikes into rolling natural waves)
      for (let i = 0; i < barCount; i++) {
        const x = i / Math.max(1, barCount - 1);
        const prev = i > 0 ? rawTargets[i - 1] : rawTargets[i];
        const next = i < barCount - 1 ? rawTargets[i + 1] : rawTargets[i];

        // In distributed mode, neighbor blending creates gorgeous rolling crests;
        // in center or linear modes, mild blending maintains continuous silhouette.
        const coupled = distribution === 'distributed'
          ? 0.76 * rawTargets[i] + 0.12 * (prev + next)
          : 0.86 * rawTargets[i] + 0.07 * (prev + next);

        // Resting stubs (when paused or silent)
        const restTarget = 0.025 + Math.sin(x * Math.PI) * 0.015;

        // Blend with smooth play/pause state
        const target = restTarget + (Math.max(restTarget, coupled) - restTarget) * playStateBlend;

        // Damped fluid interpolation: silky smooth 60-144fps movement
        const interpRate = settings.gravity === 'fast' ? 0.019 : settings.gravity === 'slow' ? 0.010 : 0.014;
        heights[i] += (target - heights[i]) * Math.min(1, dt * interpRate);
      }

      // 4. Layout & Sizing
      const containerWidth = width * (settings.containerWidthPercent / 100);
      const gap = settings.barGap;
      const totalGaps = gap * (barCount - 1);

      let barWidth = (containerWidth - totalGaps) / barCount;
      if (settings.thickness === 'thin') barWidth = Math.max(5, barWidth * 0.65);
      if (settings.thickness === 'ultra') barWidth = Math.max(16, barWidth * 1.3);

      const actualTotalWidth = barWidth * barCount + totalGaps;
      const startX = Math.max(0, (width - actualTotalWidth) / 2);

      // 5. Color Styling: Pure White with Smooth Bottom Fade (difuminado suave)
      let barStyle: CanvasGradient | string;
      let glowColor = 'rgba(255, 255, 255, 0.6)';

      const grad = ctx.createLinearGradient(0, baselineY - maxBarHeight, 0, baselineY);

      if (settings.colorTheme === 'monochrome' || !settings.colorTheme) {
        // Pure White: solid top, ethereal soft fade to 0 opacity at bottom
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.95)');
        grad.addColorStop(0.65, 'rgba(255, 255, 255, 0.60)');
        grad.addColorStop(0.88, 'rgba(255, 255, 255, 0.18)');
        grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
        barStyle = settings.fillType === 'solid' ? '#ffffff' : grad;
        glowColor = 'rgba(255, 255, 255, 0.55)';
      } else if (settings.colorTheme === 'dynamic') {
        const [r, g, b] = albumRgb;
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.35, `rgba(${Math.min(255, r + 60)}, ${Math.min(255, g + 60)}, ${Math.min(255, b + 60)}, 0.95)`);
        grad.addColorStop(0.65, `rgba(${r}, ${g}, ${b}, 0.60)`);
        grad.addColorStop(0.88, `rgba(${r}, ${g}, ${b}, 0.18)`);
        grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
        barStyle = settings.fillType === 'solid' ? `rgba(${r}, ${g}, ${b}, 0.95)` : grad;
        glowColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
      } else {
        // Presets: bitszone, cyan, fire, emerald
        const palette = {
          bitszone: { top: '#ffffff', mid: 'rgba(168, 85, 247, 0.9)', low: 'rgba(124, 58, 237, 0.5)', glow: 'rgba(168, 85, 247, 0.6)' },
          cyan: { top: '#ffffff', mid: 'rgba(6, 182, 212, 0.9)', low: 'rgba(2, 132, 199, 0.5)', glow: 'rgba(6, 182, 212, 0.6)' },
          fire: { top: '#ffffff', mid: 'rgba(234, 88, 12, 0.9)', low: 'rgba(185, 28, 28, 0.5)', glow: 'rgba(234, 88, 12, 0.6)' },
          emerald: { top: '#ffffff', mid: 'rgba(16, 185, 129, 0.9)', low: 'rgba(4, 120, 87, 0.5)', glow: 'rgba(16, 185, 129, 0.6)' },
        }[settings.colorTheme as 'bitszone' | 'cyan' | 'fire' | 'emerald'] || {
          top: '#ffffff', mid: 'rgba(255, 255, 255, 0.9)', low: 'rgba(255, 255, 255, 0.5)', glow: 'rgba(255, 255, 255, 0.6)'
        };
        grad.addColorStop(0, palette.top);
        grad.addColorStop(0.4, palette.mid);
        grad.addColorStop(0.75, palette.low);
        grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
        barStyle = settings.fillType === 'solid' ? palette.mid : grad;
        glowColor = palette.glow;
      }

      // Neon / ambient glow
      if (settings.glow === 'intense') {
        ctx.shadowBlur = 22;
        ctx.shadowColor = glowColor;
      } else if (settings.glow === 'subtle') {
        ctx.shadowBlur = 12;
        ctx.shadowColor = glowColor;
      } else {
        ctx.shadowBlur = 0;
      }

      // 6. Draw the Bars (No horizontal peak caps, clean elegant rounded pill tops)
      ctx.fillStyle = barStyle;
      const cornerRadius = settings.roundedCaps ? Math.min(barWidth / 2, 12) : 2;

      for (let i = 0; i < barCount; i++) {
        const x = startX + i * (barWidth + gap);
        const barH = Math.max(barWidth * 0.75, heights[i] * maxBarHeight);
        const y = baselineY - barH;

        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(x, y, barWidth, barH, [cornerRadius, cornerRadius, 0, 0]);
        } else {
          ctx.rect(x, y, barWidth, barH);
        }
        ctx.fill();
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [settings, dominantColor]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full relative overflow-hidden select-none pointer-events-none ${className}`}
      style={{
        maskImage: 'linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 3%, rgba(0,0,0,1) 16%)',
        WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 3%, rgba(0,0,0,1) 16%)',
      }}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
