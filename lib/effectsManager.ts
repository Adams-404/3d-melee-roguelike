// Screen shake and visual effects management
export const effectsManager = {
  shakeAmount: 0,
  shakeDecay: 0,

  triggerShake(intensity: number = 0.5, duration: number = 0.2) {
    this.shakeAmount = intensity;
    this.shakeDecay = intensity / (duration * 60); // Decay over frames
  },

  update() {
    if (this.shakeAmount > 0) {
      this.shakeAmount -= this.shakeDecay;
    } else {
      this.shakeAmount = 0;
    }
  },

  getShakeOffset() {
    return {
      x: (Math.random() - 0.5) * this.shakeAmount,
      y: (Math.random() - 0.5) * this.shakeAmount,
      z: (Math.random() - 0.5) * this.shakeAmount,
    };
  },

  getShakeRotation() {
    return {
      x: (Math.random() - 0.5) * this.shakeAmount * 0.01,
      y: (Math.random() - 0.5) * this.shakeAmount * 0.01,
      z: (Math.random() - 0.5) * this.shakeAmount * 0.01,
    };
  },
};
