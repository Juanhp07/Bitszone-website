import React, { useEffect, useRef, useState } from 'react';
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

    const barCount = Math.max(16, Math.min(96, settings.barCount));
    const heights = new Float32Array(barCount);
    const velocities = new Float32Array(barCount);
    const peakHeights = new Float32Array(barCount);
    const peakHoldTimers = new Float32Array(barCount);
    const peakVelocities = new Float32Array(barCount);

    // Gravity tuning for CAVA physics
    const gravityConstant = settings.gravity === 'fast'
      ? 0.0052
      : settings.gravity === 'slow'
        ? 0.0018
        : 0.0032; // 'fluid' default

    // Parse dominant color or fallback
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

      // Fetch real FFT spectrum
      const freqData = isPlaying ? audioVisualizer.getByteFrequencyData() : null;
      const hasRealAudio = Boolean(freqData && audioVisualizer.isRealAudioActive());

      // Max vertical stretch for the bars (reserving top ~22% for clean title & artist)
      const maxBarHeight = height * 0.76;
      const baselineY = height - 8; // small bottom offset

      // 1. Calculate Target Heights with CAVA Logarithmic Frequency Mapping
      for (let i = 0; i < barCount; i++) {
        let target = 0;

        if (isPlaying && hasRealAudio && freqData) {
          // Logarithmic bin distribution across audible frequencies
          const minHz = 35;
          const maxHz = 16000;
          const nyquist = 22050;
          const totalBins = freqData.length; // 256
          const hzPerBin = nyquist / totalBins;

          const fLow = minHz * Math.pow(maxHz / minHz, i / barCount);
          const fHigh = minHz * Math.pow(maxHz / minHz, (i + 1) / barCount);

          let binStart = Math.max(0, Math.floor(fLow / hzPerBin));
          let binEnd = Math.min(totalBins - 1, Math.ceil(fHigh / hzPerBin));
          if (binEnd <= binStart) binEnd = binStart + 1;

          let sum = 0;
          for (let b = binStart; b < binEnd; b++) {
            sum += freqData[b];
          }
          const avg = sum / (binEnd - binStart);

          // Human hearing compensation: boost mids/highs naturally
          const eqBoost = 1.0 + Math.pow(i / barCount, 1.35) * 1.6;
          target = (avg / 255) * settings.sensitivity * eqBoost;
        } else if (isPlaying && !hasRealAudio) {
          // Harmonic wave simulation fallback in case browser restricts CORS on external media
          const t = now * 0.003;
          const bass = Math.sin(t * 3.5) * 0.4 + 0.6;
          const mid = Math.cos(t * 2.2 + i * 0.18) * 0.35 + 0.4;
          const treble = Math.sin(t * 5.0 + i * 0.3) * 0.25 + 0.3;
          const iRatio = i / barCount;
          const wave = (1 - iRatio) * bass + Math.sin(iRatio * Math.PI) * mid + iRatio * treble;
          target = Math.max(0.08, wave * 0.65 * settings.sensitivity);
        } else {
          // Paused: targets smoothly fall to 0
          target = 0;
        }

        target = Math.min(1.0, Math.max(0, target));

        // 2. CAVA Physics: Instant Attack + Gravity Decay
        if (target > heights[i]) {
          // Fast explosive jump up
          heights[i] = target;
          velocities[i] = 0;
        } else {
          // Smooth gravitational falloff
          velocities[i] += gravityConstant * dt;
          heights[i] -= velocities[i] * dt;
          if (heights[i] < target) {
            heights[i] = target;
            velocities[i] = 0;
          }
        }

        // 3. Peak Caps Physics (floating dots)
        if (settings.peakCaps) {
          if (heights[i] >= peakHeights[i]) {
            peakHeights[i] = heights[i];
            peakHoldTimers[i] = 130; // hold in air for 130ms
            peakVelocities[i] = 0;
          } else {
            if (peakHoldTimers[i] > 0) {
              peakHoldTimers[i] -= dt;
            } else {
              peakVelocities[i] += gravityConstant * 0.42 * dt;
              peakHeights[i] -= peakVelocities[i] * dt;
              if (peakHeights[i] < heights[i]) {
                peakHeights[i] = heights[i];
                peakVelocities[i] = 0;
              }
            }
          }
        }
      }

      // 3. Calculate Layout & Geometry
      const containerWidth = width * (settings.containerWidthPercent / 100);
      const gap = settings.barGap;
      const totalGaps = gap * (barCount - 1);

      // Bar width calculation based on thickness setting or container width
      let barWidth = (containerWidth - totalGaps) / barCount;
      if (settings.thickness === 'thin') barWidth = Math.max(4, barWidth * 0.6);
      if (settings.thickness === 'ultra') barWidth = Math.max(16, barWidth * 1.35);

      const actualTotalWidth = barWidth * barCount + totalGaps;
      const startX = Math.max(0, (width - actualTotalWidth) / 2);

      // 4. Color & Gradient Styling
      let barStyle: CanvasGradient | string;
      let glowColor: string;

      const grad = ctx.createLinearGradient(0, baselineY, 0, baselineY - maxBarHeight);

      switch (settings.colorTheme) {
        case 'dynamic': {
          const [r, g, b] = albumRgb;
          grad.addColorStop(0, `rgba(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)}, 0.4)`);
          grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.9)`);
          grad.addColorStop(0.9, `rgba(${Math.min(255, r + 60)}, ${Math.min(255, g + 60)}, ${Math.min(255, b + 60)}, 1)`);
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

      // 5. Render Bars
      ctx.fillStyle = barStyle;
      const cornerRadius = settings.roundedCaps ? Math.min(barWidth / 2, 10) : 2;

      for (let i = 0; i < barCount; i++) {
        const x = startX + i * (barWidth + gap);
        const barH = Math.max(settings.roundedCaps ? barWidth : 4, heights[i] * maxBarHeight);
        const y = baselineY - barH;

        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(x, y, barWidth, barH, [cornerRadius, cornerRadius, 0, 0]);
        } else {
          // Manual fallback for older browser canvas
          ctx.rect(x, y, barWidth, barH);
        }
        ctx.fill();

        // 6. Render Floating Peak Caps
        if (settings.peakCaps && peakHeights[i] > 0.03) {
          const peakY = baselineY - (peakHeights[i] * maxBarHeight) - 5;
          const capHeight = Math.max(3, Math.min(barWidth * 0.35, 6));

          ctx.save();
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#ffffff';
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(x, peakY - capHeight, barWidth, capHeight, [cornerRadius, cornerRadius, cornerRadius, cornerRadius]);
          } else {
            ctx.rect(x, peakY - capHeight, barWidth, capHeight);
          }
          ctx.fill();
          ctx.restore();
        }
      }

      // 7. Base Line Ambient Reflection
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
