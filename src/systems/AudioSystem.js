export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.sfxVolume = 0.8;
    this.musicVolume = 0.5;
    this.initialized = false;
    this.ambientTimer = null;
    this.ambientStep = 0;
    this.lastFootstepTime = 0;
  }

  init() {
    if (this.initialized && this.ctx) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
        this.initialized = true;
      }
    } catch (e) {
      console.warn('Web Audio not supported:', e);
    }
  }

  resume() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
    if (muted) {
      this.stopAmbient();
    } else {
      this.startAmbient();
    }
  }

  setVolume(sfx, music) {
    this.sfxVolume = Math.max(0, Math.min(1, sfx));
    if (music !== undefined) {
      this.musicVolume = Math.max(0, Math.min(1, music));
    }
  }

  /**
   * Generates a tactical synthesizer note with envelope
   */
  playTone(freq, duration, type = 'sine', volume = 0.5, slideFreq = null) {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      if (slideFreq) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideFreq), t + duration);
      }

      gain.gain.setValueAtTime(volume * this.sfxVolume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + duration + 0.05);
    } catch (e) {
      console.warn('Audio tone error:', e);
    }
  }

  playFootstep() {
    const now = Date.now();
    if (now - this.lastFootstepTime < 240) return; // Limit footstep rate
    this.lastFootstepTime = now;

    // Subtle low-pitched stealth footstep click
    this.playTone(120, 0.06, 'triangle', 0.12, 40);
  }

  playTakedown() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    // 1. Heavy impact sub-bass hit
    this.playTone(180, 0.28, 'triangle', 0.8, 30);
    // 2. High blade slice/spark
    this.playTone(920, 0.15, 'sawtooth', 0.35, 180);
    // 3. Crunch finish
    setTimeout(() => {
      this.playTone(110, 0.2, 'square', 0.4, 45);
    }, 60);
  }

  playAlert() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    // Urgent two-tone tactical alarm ping
    this.playTone(740, 0.12, 'sawtooth', 0.55);
    setTimeout(() => {
      this.playTone(880, 0.22, 'sawtooth', 0.65);
    }, 80);
  }

  playDecoy() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    // Cybernetic acoustic sonar pulse
    this.playTone(1100, 0.25, 'sine', 0.5, 380);
    setTimeout(() => {
      this.playTone(880, 0.25, 'sine', 0.35, 220);
    }, 120);
  }

  playCredit() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    // Clean sparkling tech pickup
    this.playTone(660, 0.1, 'triangle', 0.35);
    setTimeout(() => {
      this.playTone(990, 0.18, 'sine', 0.4);
    }, 70);
  }

  playPlayerHit() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    // Heavy distortion damage thump
    this.playTone(160, 0.25, 'square', 0.7, 40);
    this.playTone(90, 0.3, 'sawtooth', 0.5, 30);
  }

  playVictory() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    const chords = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    chords.forEach((note, i) => {
      setTimeout(() => {
        this.playTone(note, 0.45, 'triangle', 0.4);
      }, i * 140);
    });
  }

  playDefeat() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    const notes = [330, 293, 261, 196]; // Downward defeat progression
    notes.forEach((note, i) => {
      setTimeout(() => {
        this.playTone(note, 0.35, 'sawtooth', 0.35);
      }, i * 150);
    });
  }

  playClick() {
    if (this.isMuted) return;
    this.resume();
    if (!this.ctx) return;

    this.playTone(750, 0.05, 'sine', 0.25, 500);
  }

  /**
   * Starts a rich atmospheric cyberpunk stealth arpeggiated ambient drone
   */
  startAmbient() {
    if (this.isMuted || this.ambientTimer) return;
    this.resume();
    if (!this.ctx) return;

    // Dark moody scale frequencies (A minor pentatonic: A1, E2, A2, C3, D3, E3)
    const baseFreqs = [110, 130.81, 146.83, 164.81, 220, 196];

    this.ambientStep = 0;
    this.ambientTimer = setInterval(() => {
      if (this.isMuted || !this.ctx) return;

      const freq = baseFreqs[this.ambientStep % baseFreqs.length];
      const isDownbeat = this.ambientStep % 4 === 0;

      // Deep bass pulse
      if (isDownbeat) {
        this.playTone(55, 0.8, 'triangle', this.musicVolume * 0.45, 45);
      }

      // Atmospheric synth arpeggio pulse
      this.playTone(freq, 0.4, 'sine', this.musicVolume * 0.2);

      this.ambientStep++;
    }, 600);
  }

  stopAmbient() {
    if (this.ambientTimer) {
      clearInterval(this.ambientTimer);
      this.ambientTimer = null;
    }
  }

  // Alias for backward compatibility
  startAmbientDrone() {
    this.startAmbient();
  }

  stopAmbientDrone() {
    this.stopAmbient();
  }
}

export const soundManager = new AudioSystem();
