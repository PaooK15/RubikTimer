/**
 * timer.js
 * High precision Speedcubing Timer
 * Features:
 * - performance.now() millisecond precision
 * - Spacebar & Touch hold-to-ready state machine (Hold 300ms -> Green Ready)
 * - WCA 15-second inspection mode with 8s and 12s voice/tone alerts
 * - Distraction-free Zen Mode
 * - Callback hooks for UI state changes
 */

import { soundManager } from './sound.js';
import { storage } from './storage.js';

export const TIMER_STATES = {
  IDLE: 'IDLE',
  HOLDING: 'HOLDING',
  READY: 'READY',
  INSPECTION_RUNNING: 'INSPECTION_RUNNING',
  INSPECTION_HOLDING: 'INSPECTION_HOLDING',
  INSPECTION_READY: 'INSPECTION_READY',
  RUNNING: 'RUNNING',
  STOPPED: 'STOPPED'
};

export class SpeedTimer {
  constructor() {
    this.state = TIMER_STATES.IDLE;
    this.startTime = 0;
    this.elapsedTime = 0;
    this.holdTimer = null;
    this.holdStartTime = 0;
    this.holdThresholdMs = 300; // Hold 300ms to be READY

    this.inspectionEnabled = storage.getJSON('rubik_timer_inspection', false);
    this.inspectionDuration = 15; // 15 seconds WCA
    this.inspectionRemaining = 15;
    this.inspectionInterval = null;
    this.inspectionPlayed8 = false;
    this.inspectionPlayed12 = false;

    this.zenMode = storage.getJSON('rubik_timer_zen_mode', false);
    this.hideTimeWhileSolving = storage.getJSON('rubik_timer_hide_running', false);
    this.decimals = storage.getJSON('rubik_timer_decimals', 2);

    this.animationFrameId = null;

    // Callbacks
    this.onStateChange = null;
    this.onTick = null;
    this.onComplete = null;
  }

  // Format millisecond time to string (e.g. 9.42, 1:12.34)
  static format(ms, decimals = 2) {
    if (ms === null || ms === undefined || isNaN(ms)) return '--.--';
    if (ms < 0) return '0.00';

    const totalSeconds = ms / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    let secStr;
    if (minutes > 0) {
      // e.g. "04.28"
      secStr = seconds.toFixed(decimals).padStart(decimals > 0 ? decimals + 3 : 2, '0');
      return `${minutes}:${secStr}`;
    } else {
      return seconds.toFixed(decimals);
    }
  }

  // Handle keydown / touchstart
  handleInputDown() {
    if (this.state === TIMER_STATES.RUNNING) {
      this.stop();
      return;
    }

    if (this.state === TIMER_STATES.INSPECTION_RUNNING) {
      // User is holding to start solve during inspection
      this.state = TIMER_STATES.INSPECTION_HOLDING;
      this.holdStartTime = performance.now();
      this.triggerStateChange();

      this.holdTimer = setTimeout(() => {
        if (this.state === TIMER_STATES.INSPECTION_HOLDING) {
          this.state = TIMER_STATES.INSPECTION_READY;
          soundManager.playReadyCue();
          this.triggerStateChange();
        }
      }, this.holdThresholdMs);

      return;
    }

    if (this.state === TIMER_STATES.IDLE || this.state === TIMER_STATES.STOPPED) {
      if (this.inspectionEnabled) {
        // First press starts inspection directly
        this.startInspection();
        return;
      }

      // Standard hold-to-ready
      this.state = TIMER_STATES.HOLDING;
      this.holdStartTime = performance.now();
      this.triggerStateChange();

      this.holdTimer = setTimeout(() => {
        if (this.state === TIMER_STATES.HOLDING) {
          this.state = TIMER_STATES.READY;
          soundManager.playReadyCue();
          this.triggerStateChange();
        }
      }, this.holdThresholdMs);
    }
  }

  // Handle keyup / touchend
  handleInputUp() {
    clearTimeout(this.holdTimer);

    if (this.state === TIMER_STATES.HOLDING || this.state === TIMER_STATES.INSPECTION_HOLDING) {
      // Released too early before 300ms threshold
      if (this.state === TIMER_STATES.INSPECTION_HOLDING) {
        this.state = TIMER_STATES.INSPECTION_RUNNING;
      } else {
        this.state = TIMER_STATES.IDLE;
      }
      this.triggerStateChange();
      return;
    }

    if (this.state === TIMER_STATES.READY || this.state === TIMER_STATES.INSPECTION_READY) {
      let penalty = 'none';

      if (this.inspectionInterval) {
        clearInterval(this.inspectionInterval);
        this.inspectionInterval = null;

        // Check if inspection was exceeded:
        // <= 15s : OK
        // > 15s && <= 17s: +2 penalty
        // > 17s: DNF
        if (this.inspectionRemaining < 0 && this.inspectionRemaining >= -2) {
          penalty = '+2';
        } else if (this.inspectionRemaining < -2) {
          penalty = 'DNF';
        }
      }

      this.startSolve(penalty);
    }
  }

  startInspection() {
    this.state = TIMER_STATES.INSPECTION_RUNNING;
    this.inspectionRemaining = 15;
    this.inspectionPlayed8 = false;
    this.inspectionPlayed12 = false;
    this.triggerStateChange();

    soundManager.playTone(440, 0.1, 'sine');

    this.inspectionInterval = setInterval(() => {
      this.inspectionRemaining--;

      // Sound alerts
      if (this.inspectionRemaining === 7 && !this.inspectionPlayed8) {
        // 8 seconds elapsed
        soundManager.playInspection8();
        this.inspectionPlayed8 = true;
      } else if (this.inspectionRemaining === 3 && !this.inspectionPlayed12) {
        // 12 seconds elapsed
        soundManager.playInspection12();
        this.inspectionPlayed12 = true;
      }

      this.triggerTick(this.inspectionRemaining, true);
    }, 1000);

    this.triggerTick(this.inspectionRemaining, true);
  }

  startSolve(initialPenalty = 'none') {
    this.currentPenalty = initialPenalty;
    this.state = TIMER_STATES.RUNNING;
    this.startTime = performance.now();
    soundManager.playStartTick();
    this.triggerStateChange();

    const loop = () => {
      if (this.state !== TIMER_STATES.RUNNING) return;
      this.elapsedTime = performance.now() - this.startTime;
      this.triggerTick(this.elapsedTime, false);
      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  stop() {
    if (this.state !== TIMER_STATES.RUNNING) return;

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.elapsedTime = performance.now() - this.startTime;
    this.state = TIMER_STATES.STOPPED;
    soundManager.playStopClick();
    this.triggerStateChange();

    if (this.onComplete) {
      this.onComplete({
        time: this.elapsedTime,
        penalty: this.currentPenalty || 'none'
      });
    }
  }

  reset() {
    clearTimeout(this.holdTimer);
    if (this.inspectionInterval) {
      clearInterval(this.inspectionInterval);
      this.inspectionInterval = null;
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.state = TIMER_STATES.IDLE;
    this.elapsedTime = 0;
    this.triggerStateChange();
    this.triggerTick(0, false);
  }

  triggerStateChange() {
    if (this.onStateChange) {
      this.onStateChange(this.state);
    }
  }

  triggerTick(value, isInspection = false) {
    if (this.onTick) {
      this.onTick(value, isInspection);
    }
  }

  setInspection(enabled) {
    this.inspectionEnabled = !!enabled;
    storage.setJSON('rubik_timer_inspection', this.inspectionEnabled);
  }

  setZenMode(enabled) {
    this.zenMode = !!enabled;
    storage.setJSON('rubik_timer_zen_mode', this.zenMode);
  }

  setHideRunning(enabled) {
    this.hideTimeWhileSolving = !!enabled;
    storage.setJSON('rubik_timer_hide_running', this.hideTimeWhileSolving);
  }

  setDecimals(d) {
    this.decimals = Number(d);
    storage.setJSON('rubik_timer_decimals', this.decimals);
  }
}

export const timer = new SpeedTimer();
