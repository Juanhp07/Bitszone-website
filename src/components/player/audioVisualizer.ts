/**
 * Web Audio API Analyser Singleton Manager for Bitszone CAVA Visualizer.
 * Connects HTMLAudioElement once to an AnalyserNode graph and exposes frequency data.
 */

class AudioVisualizerService {
  private audioCtx: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private mediaSource: MediaElementAudioSourceNode | null = null;
  private connectedElement: HTMLAudioElement | null = null;
  private frequencyData: Uint8Array | null = null;
  private hasRealData = false;
  private zeroCheckCount = 0;

  /**
   * Initializes or re-connects the AnalyserNode graph with the provided audio element.
   */
  public connect(audio: HTMLAudioElement | null): AnalyserNode | null {
    if (typeof window === 'undefined' || !audio) return null;

    try {
      // 1. Create AudioContext lazily on user gesture/mount
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return null;
        this.audioCtx = new AudioContextClass();
      }

      // Resume if suspended (browser autoplay policy)
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }

      // 2. Connect the audio element once (re-connecting the same element throws InvalidStateError)
      if (this.connectedElement !== audio) {
        if (this.mediaSource) {
          try { this.mediaSource.disconnect(); } catch (_) {}
        }

        // Ensure crossOrigin is set for remote audio streams (Supabase storage)
        if (!audio.crossOrigin) {
          audio.crossOrigin = 'anonymous';
        }

        this.mediaSource = this.audioCtx.createMediaElementSource(audio);
        this.analyser = this.audioCtx.createAnalyser();
        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.setValueAtTime(1.0, this.audioCtx.currentTime);

        // 512 fftSize gives 256 frequency bins (0 Hz to 22.05 kHz, ~86 Hz per bin)
        this.analyser.fftSize = 512;
        this.analyser.smoothingTimeConstant = 0.3; // Responsive attack for CAVA
        this.analyser.minDecibels = -90;
        this.analyser.maxDecibels = -10;

        // Route: source -> analyser -> gainNode -> destination
        this.mediaSource.connect(this.analyser);
        this.analyser.connect(this.gainNode);
        this.gainNode.connect(this.audioCtx.destination);

        this.connectedElement = audio;
        this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
      }

      return this.analyser;
    } catch (err) {
      console.warn('[AudioVisualizerService] Notice connecting to audio node:', err);
      return this.analyser;
    }
  }

  /**
   * Reads raw FFT byte frequency data [0..255] for 256 bins.
   */
  public getByteFrequencyData(): Uint8Array | null {
    if (!this.analyser || !this.frequencyData) return null;

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }

    this.analyser.getByteFrequencyData(this.frequencyData);

    // Verify if we are receiving non-zero bytes
    let sum = 0;
    for (let i = 0; i < 32; i++) {
      sum += this.frequencyData[i];
    }

    if (sum > 0) {
      this.hasRealData = true;
      this.zeroCheckCount = 0;
    } else {
      this.zeroCheckCount++;
      if (this.zeroCheckCount > 60) {
        this.hasRealData = false;
      }
    }

    return this.frequencyData;
  }

  public isRealAudioActive(): boolean {
    return this.hasRealData;
  }

  public resumeContext(): void {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  public getContext(): AudioContext | null {
    return this.audioCtx;
  }

  /**
   * Smoothly fades output gain to target [0..1] over durationSecs using Web Audio hardware interpolation.
   */
  public fadeGain(targetGain: number, durationSecs: number = 0.15): void {
    if (!this.audioCtx || !this.gainNode) return;
    try {
      const now = this.audioCtx.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, now);
      this.gainNode.gain.linearRampToValueAtTime(Math.max(0, Math.min(1, targetGain)), now + Math.max(0.015, durationSecs));
    } catch (_) {}
  }

  /**
   * Sets output gain instantaneously (for start of new tracks or mute).
   */
  public setGainInstant(gain: number): void {
    if (!this.audioCtx || !this.gainNode) return;
    try {
      const now = this.audioCtx.currentTime;
      this.gainNode.gain.cancelScheduledValues(now);
      this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, gain)), now);
    } catch (_) {}
  }
}

export const audioVisualizer = new AudioVisualizerService();
