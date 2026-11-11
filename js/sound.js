/**
 * sound.js
 * Synthesizes zero-asset audio cues using Web Audio API
 * - 8-second inspection alert
 * - 12-second inspection alert (double beep)
 * - Ready state chime (when spacebar/touch hold completes)
 * - Timer start / stop mechanical clicks
 * - Personal Best celebration fanfare
 */

import { storage } from './storage.js';

class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = storage.getJSON('rubik_timer_sound_enabled', true);
    this.volume = storage.getJSON('rubik_timer_sound_volume', 0.6);
  }

  ensureContext() {
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

  toggleSound(forceState) {
    this.enabled = forceState !== undefined ? forceState : !this.enabled;
    storage.setJSON('rubik_timer_sound_enabled', this.enabled);
    return this.enabled;
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    storage.setJSON('rubik_timer_sound_volume', this.volume);
  }

  // Play a simple sine/triangle beep tone
  playTone(freq, duration = 0.12, type = 'sine', gainMultiplier = 1) {
    if (!this.enabled) return;
    try {
      this.ensureContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const targetGain = this.volume * gainMultiplier;
      gain.gain.setValueAtTime(targetGain, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  // Ready chime when hold duration reached (timer turns green)
  playReadyCue() {
    if (!this.enabled) return;
    this.playTone(880, 0.12, 'sine', 0.8);
  }

  // Inspection 8-second alert
  playInspection8() {
    if (!this.enabled) return;
    this.playTone(660, 0.22, 'triangle', 1.0);
  }

  // Inspection 12-second alert (urgent double beep)
  playInspection12() {
    if (!this.enabled) return;
    this.playTone(880, 0.15, 'triangle', 1.2);
    setTimeout(() => {
      this.playTone(880, 0.18, 'triangle', 1.2);
    }, 180);
  }

  // Mechanical click when starting
  playStartTick() {
    if (!this.enabled) return;
    this.playTone(520, 0.05, 'triangle', 0.5);
  }

  // Soft thud/click when stopping
  playStopClick() {
    if (!this.enabled) return;
    this.playTone(330, 0.08, 'sine', 0.6);
  }

  // Celebratory fanfare for new Personal Best (PB)
  playPBFanfare() {
    if (!this.enabled) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.28, 'triangle', 0.9);
      }, idx * 120);
    });
  }
}

export const soundManager = new SoundManager();
