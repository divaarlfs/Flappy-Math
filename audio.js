// Web Audio API Sound Effects & Quiz BGM Generator
class SoundFX {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmOscillators = [];
    this.bgmGain = null;
    this.bgmInterval = null;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playFlap() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(580, now + 0.08);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch(e) {}
  }

  // Musik BGM Kuis yang Ceria, Catchy & Bersemangat
  startQuizMusic() {
    if (this.isMuted || !this.ctx) return;
    this.stopQuizMusic();

    try {
      // Fanfare pembuka ceria
      const now = this.ctx.currentTime;
      const fanfareNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
      fanfareNotes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = now + idx * 0.06;
        const dur = 0.14;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + dur);
      });

      // Melodi loop kuis yang seru dan ritmis (Chiptune Arcade style)
      // Melody in C Major: C5, E5, G5, A5, G5, E5, D5, C5 ...
      const melody = [
        523.25, 659.25, 783.99, 880.00,
        783.99, 659.25, 587.33, 523.25,
        659.25, 783.99, 880.00, 1046.50,
        880.00, 783.99, 659.25, 587.33
      ];
      
      const bassline = [
        261.63, 261.63, 329.63, 329.63,
        392.00, 392.00, 329.63, 329.63,
        261.63, 261.63, 349.23, 349.23,
        392.00, 392.00, 261.63, 261.63
      ];

      let noteIdx = 0;
      const tempo = 130; // ms per beat

      // Mulai loop musik setelah fanfare selesai
      setTimeout(() => {
        if (!this.ctx || this.isMuted) return;

        this.bgmInterval = setInterval(() => {
          if (!this.ctx || this.isMuted) return;
          const t = this.ctx.currentTime;

          // Main Melody Synth
          const mFreq = melody[noteIdx % melody.length];
          const mOsc = this.ctx.createOscillator();
          const mGain = this.ctx.createGain();
          mOsc.type = 'triangle';
          mOsc.frequency.setValueAtTime(mFreq, t);

          mGain.gain.setValueAtTime(0.12, t);
          mGain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

          mOsc.connect(mGain);
          mGain.connect(this.ctx.destination);
          mOsc.start(t);
          mOsc.stop(t + 0.12);

          // Bass groove
          if (noteIdx % 2 === 0) {
            const bFreq = bassline[(noteIdx / 2) % bassline.length];
            const bOsc = this.ctx.createOscillator();
            const bGain = this.ctx.createGain();
            bOsc.type = 'sine';
            bOsc.frequency.setValueAtTime(bFreq / 2, t);

            bGain.gain.setValueAtTime(0.18, t);
            bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

            bOsc.connect(bGain);
            bGain.connect(this.ctx.destination);
            bOsc.start(t);
            bOsc.stop(t + 0.24);
          }

          noteIdx++;
        }, tempo);
      }, 350);

    } catch(e) {}
  }

  stopQuizMusic() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  playCorrectDestroy() {
    this.stopQuizMusic();
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      
      // Victory Chime
      const notes = [587.33, 880, 1174.66, 1396.91]; // D5, A5, D6, F6
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = now + idx * 0.05;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.26);
      });

      // Boom / Shatter
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.3);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now + 0.05);
      filter.frequency.exponentialRampToValueAtTime(80, now + 0.35);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.35, now + 0.05);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(now + 0.05);
      noise.stop(now + 0.36);
    } catch(e) {}
  }

  playWrongPenalty() {
    this.stopQuizMusic();
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      // Sad buzz & penalty drop sound
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.linearRampToValueAtTime(90, now + 0.35);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch(e) {}
  }

  playGameOver() {
    this.stopQuizMusic();
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [440, 392, 349.23, 293.66];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const t = now + idx * 0.12;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.22);
      });
    } catch(e) {}
  }

  playShieldReady() {
    if (this.isMuted || !this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.21);
    } catch(e) {}
  }
}

window.soundFX = new SoundFX();
