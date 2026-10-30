/**
 * Web Audio API Analyser Singleton Manager for Bitszone CAVA Visualizer.
 * Connects HTMLAudioElement once to an AnalyserNode graph and exposes frequency data.
 */

class AudioVisualizerService {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private leftAnalyser: AnalyserNode | null = null;
  private rightAnalyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private normalize = false;
  private mediaSource: MediaElementAudioSourceNode | null = null;
  private connectedElement: HTMLAudioElement | null = null;
  private frequencyData: Uint8Array | null = null;
  private leftFreqData: Uint8Array | null = null;
  private rightFreqData: Uint8Array | null = null;
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

        // Try creating stereo channel splitter for real left/right differential
        try {
          const splitter = this.audioCtx.createChannelSplitter(2);
          this.mediaSource.connect(splitter);

          this.leftAnalyser = this.audioCtx.createAnalyser();
          this.leftAnalyser.fftSize = 512;
          this.leftAnalyser.smoothingTimeConstant = 0.3;
          splitter.connect(this.leftAnalyser, 0);

          this.rightAnalyser = this.audioCtx.createAnalyser();
          this.rightAnalyser.fftSize = 512;
          this.rightAnalyser.smoothingTimeConstant = 0.3;
          splitter.connect(this.rightAnalyser, 1);

          this.leftFreqData = new Uint8Array(this.leftAnalyser.frequencyBinCount);
          this.rightFreqData = new Uint8Array(this.rightAnalyser.frequencyBinCount);
        } catch (_) {
          // Fallback gracefully to mono analyser
        }

        // Route: source -> analyser -> gainNode -> destination
        this.mediaSource.connect(this.analyser);
        this.gainNode.connect(this.audioCtx.destination);
        this.routeOutput();

        this.connectedElement = audio;
        this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
      }

      return this.analyser;
    } catch (err) {
      console.warn('[AudioVisualizerService] Notice connecting to audio node:', err);
      return this.analyser;
    }
  }

  /** analyser -> (compressor when volume normalization is on) -> gain. Called on connect and whenever the setting changes. */
  private routeOutput(): void {
    if (!this.audioCtx || !this.analyser || !this.gainNode) return;
    try {
      this.analyser.disconnect();
      // the analyser also feeds the visualizer, which only reads it: keep it as the source of both paths
      if (this.normalize) {
        if (!this.compressor) {
          this.compressor = this.audioCtx.createDynamicsCompressor();
          this.compressor.threshold.value = -26;
          this.compressor.knee.value = 24;
          this.compressor.ratio.value = 5;
          this.compressor.attack.value = 0.01;
          this.compressor.release.value = 0.25;
          this.compressor.connect(this.gainNode);
        }
        this.analyser.connect(this.compressor);
      } else {
        this.analyser.connect(this.gainNode);
      }
    } catch (_) {}
  }

  /** Levels loud peaks so every track plays at a similar volume (a compressor, not per-track ReplayGain data). */
  public setNormalization(on: boolean): void {
    this.normalize = on;
    this.routeOutput();
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

  /**
   * Reads stereo frequency data { left, right } [0..255] for 256 bins.
   * Gracefully mirrors mono data if stereo splitter is unavailable or audio is mono.
   */
  public getStereoFrequencyData(): { left: Uint8Array; right: Uint8Array } | null {
    const mono = this.getByteFrequencyData();
    if (!mono) return null;

    if (!this.leftAnalyser || !this.rightAnalyser || !this.leftFreqData || !this.rightFreqData) {
      return { left: mono, right: mono };
    }

    this.leftAnalyser.getByteFrequencyData(this.leftFreqData);
    this.rightAnalyser.getByteFrequencyData(this.rightFreqData);

    // If right channel is silent (mono audio), duplicate left
    let rightSum = 0;
    for (let i = 0; i < 16; i++) {
      rightSum += this.rightFreqData[i];
    }
    if (rightSum === 0) {
      return { left: mono, right: mono };
    }

    return { left: this.leftFreqData, right: this.rightFreqData };
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
