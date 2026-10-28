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
    const heights = new Float32Array(barCount);
    const smoothedFreq = new Float32Array(barCount);
    let smoothedEnergy = 0.2;

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
      const t = now * 0.0018; // smooth time progress

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

      // 1. Audio Energy Sampling (smoothed heavily to prevent erratic jitter)
      const freqData = isPlaying ? audioVisualizer.getByteFrequencyData() : null;
      let instantEnergy = 0.35;

      if (freqData && freqData.length > 0) {
        let sum = 0;
        const sampleBins = Math.min(64, freqData.length);
        for (let b = 0; b < sampleBins; b++) {
          sum += freqData[b];
        }
        instantEnergy = sum / (sampleBins * 255);
      }

      // Smooth exponential envelope for overall track volume/beat
      smoothedEnergy += (instantEnergy - smoothedEnergy) * Math.min(1, dt * 0.008);

      // 2. Harmonic Fluid Wave Physics (inspired by the smooth rhythmic breathing of EqBars)
      const maxBarHeight = height * 0.74; // leaves top ~26% clear for title & artist
      const baselineY = height - 10;

      for (let i = 0; i < barCount; i++) {
        const x = i / (barCount - 1); // 0 (left) to 1 (right)

        // Musical wave harmonics across the bars
        // Natural equalizer arch: center & mid-bass have natural fullness
        const arch = Math.sin(x * Math.PI) * 0.35 + 0.38;

        // Harmonic Wave 1: slow deep swell
        const wave1 = Math.sin(t * 1.8 + x * Math.PI * 2.2) * 0.22;

        // Harmonic Wave 2: rhythmic counter-melody ripple
        const wave2 = Math.cos(t * 2.6 - x * Math.PI * 3.4) * 0.16;

        // Harmonic Wave 3: individual bar breathing offset (distinct rhythm like EqBars)
        const wave3 = Math.sin(t * (2.1 + (i % 4) * 0.4) + (i * 0.55)) * 0.12;

        // Harmonic Wave 4: high shimmer
        const wave4 = Math.sin(t * 3.8 + x * 6.0) * 0.08;

        // Combine harmonic wave profile
        let target = (arch + wave1 + wave2 + wave3 + wave4);

        if (isPlaying) {
          // If real audio data is available, blend smoothly without sharp spikes
          if (freqData && freqData.length > 0) {
            // Map bar to frequency bin with soft smoothing
            const binIdx = Math.min(freqData.length - 1, Math.floor(Math.pow(x, 1.3) * 120));
            const rawFreqVal = freqData[binIdx] / 255;
            smoothedFreq[i] += (rawFreqVal - smoothedFreq[i]) * Math.min(1, dt * 0.007);
            target = target * 0.55 + smoothedFreq[i] * 0.85;
          }

          // Modulate by smoothed energy and sensitivity
          target = target * (0.65 + smoothedEnergy * 0.75) * settings.sensitivity;
          target = Math.min(0.96, Math.max(0.08, target));
        } else {
          // When paused: smoothly glide down to short resting stubs (just like EqBars)
          target = 0.05 + Math.sin(x * Math.PI) * 0.03;
        }

        // Fluid interpolation: critically damped movement (zero jitter!)
        heights[i] += (target - heights[i]) * Math.min(1, dt * 0.012);
      }

      // 3. Layout & Geometry
      const containerWidth = width * (settings.containerWidthPercent / 100);
      const gap = settings.barGap;
      const totalGaps = gap * (barCount - 1);

      // Bar width based on thickness setting
      let barWidth = (containerWidth - totalGaps) / barCount;
      if (settings.thickness === 'thin') barWidth = Math.max(5, barWidth * 0.65);
      if (settings.thickness === 'ultra') barWidth = Math.max(16, barWidth * 1.3);

      const actualTotalWidth = barWidth * barCount + totalGaps;
      const startX = Math.max(0, (width - actualTotalWidth) / 2);

      // 4. Color & Gradient Styling
      let barStyle: CanvasGradient | string;
      let glowColor: string;

      const grad = ctx.createLinearGradient(0, baselineY, 0, baselineY - maxBarHeight);

      switch (settings.colorTheme) {
        case 'dynamic': {
          const [r, g, b] = albumRgb;
          grad.addColorStop(0, `rgba(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)}, 0.4)`);
          grad.addColorStop(0.55, `rgba(${r}, ${g}, ${b}, 0.95)`);
          grad.addColorStop(0.9, `rgba(${Math.min(255, r + 70)}, ${Math.min(255, g + 70)}, ${Math.min(255, b + 70)}, 1)`);
          grad.addColorStop(1, '#ffffff');
          barStyle = settings.fillType === 'solid' ? `rgba(${r}, ${g}, ${b}, 0.95)` : grad;
          glowColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
          break;
        }
        case 'bitszone': {
          grad.addColorStop(0, 'rgba(124, 58, 237, 0.45)');
          grad.addColorStop(0.5, 'rgba(168, 85, 247, 0.95)');
          grad.addColorStop(0.85, 'rgba(236, 72, 153, 1)');
          grad.addColorStop(1, '#ffffff');
          barStyle = settings.fillType === 'solid' ? '#a855f7' : grad;
          glowColor = 'rgba(168, 85, 247, 0.65)';
          break;
        }
        case 'cyan': {
          grad.addColorStop(0, 'rgba(2, 132, 199, 0.45)');
          grad.addColorStop(0.5, 'rgba(6, 182, 212, 0.95)');
          grad.addColorStop(0.85, 'rgba(103, 232, 249, 1)');
          grad.addColorStop(1, '#ffffff');
          barStyle = settings.fillType === 'solid' ? '#06b6d4' : grad;
          glowColor = 'rgba(6, 182, 212, 0.65)';
          break;
        }
        case 'fire': {
          grad.addColorStop(0, 'rgba(185, 28, 28, 0.45)');
          grad.addColorStop(0.5, 'rgba(234, 88, 12, 0.95)');
          grad.addColorStop(0.85, 'rgba(250, 204, 21, 1)');
          grad.addColorStop(1, '#ffffff');
          barStyle = settings.fillType === 'solid' ? '#ea580c' : grad;
          glowColor = 'rgba(234, 88, 12, 0.65)';
          break;
        }
        case 'emerald': {
          grad.addColorStop(0, 'rgba(4, 120, 87, 0.45)');
          grad.addColorStop(0.5, 'rgba(16, 185, 129, 0.95)');
          grad.addColorStop(0.85, 'rgba(110, 231, 183, 1)');
          grad.addColorStop(1, '#ffffff');
          barStyle = settings.fillType === 'solid' ? '#10b981' : grad;
          glowColor = 'rgba(16, 185, 129, 0.65)';
          break;
        }
        case 'monochrome':
        default: {
          grad.addColorStop(0, 'rgba(63, 63, 70, 0.45)');
          grad.addColorStop(0.5, 'rgba(161, 161, 170, 0.9)');
          grad.addColorStop(0.85, 'rgba(228, 228, 231, 1)');
          grad.addColorStop(1, '#ffffff');
          barStyle = settings.fillType === 'solid' ? '#e4e4e7' : grad;
          glowColor = 'rgba(255, 255, 255, 0.5)';
          break;
        }
      }

      // Neon glow setup
      if (settings.glow === 'intense') {
        ctx.shadowBlur = 24;
        ctx.shadowColor = glowColor;
      } else if (settings.glow === 'subtle') {
        ctx.shadowBlur = 12;
        ctx.shadowColor = glowColor;
      } else {
        ctx.shadowBlur = 0;
      }

      // 5. Draw the Bars
      ctx.fillStyle = barStyle;
      const cornerRadius = settings.roundedCaps ? Math.min(barWidth / 2, 12) : 2;

      for (let i = 0; i < barCount; i++) {
        const x = startX + i * (barWidth + gap);
        const barH = Math.max(barWidth * 0.8, heights[i] * maxBarHeight);
        const y = baselineY - barH;

        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(x, y, barWidth, barH, [cornerRadius, cornerRadius, 0, 0]);
        } else {
          ctx.rect(x, y, barWidth, barH);
        }
        ctx.fill();

        // Optional peak cap (only rendered if user explicitly enabled it)
        if (settings.peakCaps) {
          const capHeight = Math.max(3, Math.min(barWidth * 0.35, 6));
          ctx.save();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(x, y - capHeight - 3, barWidth, capHeight, [cornerRadius, cornerRadius, cornerRadius, cornerRadius]);
          } else {
            ctx.rect(x, y - capHeight - 3, barWidth, capHeight);
          }
          ctx.fill();
          ctx.restore();
        }
      }

      // 6. Base Line Ambient Reflection
      ctx.shadowBlur = 0;
      const baseGrad = ctx.createLinearGradient(startX, baselineY, startX + actualTotalWidth, baselineY);
      baseGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      baseGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)');
      baseGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = baseGrad;
      ctx.fillRect(startX, baselineY + 1, actualTotalWidth, 2);

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [settings, isPlaying, dominantColor]);

  return (
    <div ref={containerRef} className={`w-full h-full relative overflow-hidden select-none pointer-events-none ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
