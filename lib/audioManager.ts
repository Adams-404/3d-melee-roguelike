// Simple audio synthesis system - creates retro 8-bit style sounds
export const audioManager = {
  audioContext: null as AudioContext | null,

  init() {
    if (!this.audioContext && typeof window !== 'undefined') {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  },

  // Generate a simple sine wave beep
  playBeep(frequency: number = 440, duration: number = 0.1, volume: number = 0.3) {
    this.init();
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.frequency.value = frequency;
    osc.type = 'square';

    gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration
    );

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + duration);
  },

  // Attack/punch sound
  playAttackSound(comboLevel: number = 0) {
    this.init();
    if (!this.audioContext) return;

    const frequency = 150 + comboLevel * 50;
    const duration = 0.15;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      50,
      this.audioContext.currentTime + duration
    );
    osc.type = 'triangle';

    gain.gain.setValueAtTime(0.4, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      this.audioContext.currentTime + duration
    );

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + duration);
  },

  // Hit sound effect
  playHitSound() {
    this.init();
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.frequency.setValueAtTime(200, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      50,
      this.audioContext.currentTime + 0.1
    );
    osc.type = 'sawtooth';

    gain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.1);
  },

  // Enemy alert sound
  playAlertSound() {
    this.init();
    if (!this.audioContext) return;

    const frequencies = [500, 700, 500];
    const now = this.audioContext.currentTime;

    frequencies.forEach((freq, i) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      osc.connect(gain);
      gain.connect(this.audioContext!.destination);

      osc.frequency.value = freq;
      osc.type = 'sine';

      const startTime = now + i * 0.08;
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.08);

      osc.start(startTime);
      osc.stop(startTime + 0.08);
    });
  },

  // Damage/knockback sound
  playDamageSound() {
    this.init();
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.frequency.setValueAtTime(300, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      80,
      this.audioContext.currentTime + 0.2
    );
    osc.type = 'sine';

    gain.gain.setValueAtTime(0.4, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.2);
  },

  // Enemy death sound
  playDeathSound() {
    this.init();
    if (!this.audioContext) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.4);
    osc.type = 'sine';

    gain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);

    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + 0.4);
  },

  // Background music loop - simple chiptune style
  playBackgroundMusic() {
    this.init();
    if (!this.audioContext) return;

    const bpm = 120;
    const beatDuration = 60 / bpm;

    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();

      osc.connect(gain);
      gain.connect(this.audioContext!.destination);

      osc.frequency.value = freq;
      osc.type = 'square';

      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration - 0.01);

      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // Simple 8-bar loop
    const melody = [
      // Bar 1
      { freq: 262, time: 0, dur: beatDuration },
      { freq: 330, time: beatDuration, dur: beatDuration },
      { freq: 392, time: beatDuration * 2, dur: beatDuration },
      { freq: 440, time: beatDuration * 3, dur: beatDuration },
      // Bar 2
      { freq: 392, time: beatDuration * 4, dur: beatDuration * 2 },
      { freq: 330, time: beatDuration * 6, dur: beatDuration * 2 },
      // Bar 3
      { freq: 294, time: beatDuration * 8, dur: beatDuration },
      { freq: 330, time: beatDuration * 9, dur: beatDuration },
      { freq: 392, time: beatDuration * 10, dur: beatDuration },
      { freq: 440, time: beatDuration * 11, dur: beatDuration },
      // Bar 4
      { freq: 494, time: beatDuration * 12, dur: beatDuration * 2 },
      { freq: 440, time: beatDuration * 14, dur: beatDuration * 2 },
    ];

    const loopDuration = beatDuration * 16;
    const startTime = this.audioContext.currentTime;

    const scheduleLoop = (loopOffset: number) => {
      melody.forEach((note) => {
        playNote(
          note.freq,
          startTime + loopOffset + note.time,
          note.dur * 0.8
        );
      });

      // Recursively schedule next loop (in 16 seconds)
      setTimeout(() => {
        scheduleLoop(loopOffset + loopDuration);
      }, loopDuration * 1000);
    };

    scheduleLoop(0);
  },
};
