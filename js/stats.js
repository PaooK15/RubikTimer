/**
 * stats.js
 * Solve records & Speedcubing WCA Statistics Engine
 * Computes:
 * - Single best & worst
 * - Ao5 (Average of 5: discard fastest & slowest, average 3)
 * - Ao12 (Average of 12: discard fastest & slowest, average 10)
 * - Ao50 & Ao100
 * - Session Mean & Count
 * - Penalty management (+2, DNF)
 * - Session tabs & CSV/JSON export
 */

import { storage } from './storage.js';
import { SpeedTimer } from './timer.js';

export class StatsManager {
  constructor() {
    this.sessionsKey = 'rubik_timer_sessions';
    this.activeSessionKey = 'rubik_timer_active_session_id';

    this.sessions = storage.getJSON(this.sessionsKey, [
      { id: 'default', name: '3x3 Normal', puzzle: '333', solves: [] },
      { id: 'session_oh', name: 'One-Handed (OH)', puzzle: '333', solves: [] },
      { id: 'session_2x2', name: '2x2 Speed', puzzle: '222', solves: [] },
      { id: 'session_practice', name: 'Free Practice', puzzle: '333', solves: [] }
    ]);

    this.activeSessionId = storage.get(this.activeSessionKey, 'default');
    if (!this.sessions.find(s => s.id === this.activeSessionId)) {
      this.activeSessionId = this.sessions[0].id;
    }
  }

  getActiveSession() {
    return this.sessions.find(s => s.id === this.activeSessionId) || this.sessions[0];
  }

  getSolves() {
    return this.getActiveSession().solves || [];
  }

  // Add a new solve
  addSolve(timeMs, scramble, puzzle = '333', penalty = 'none') {
    const session = this.getActiveSession();
    const solve = {
      id: 'solve_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      time: timeMs, // raw milliseconds
      penalty: penalty, // 'none' | '+2' | 'DNF'
      scramble: scramble,
      puzzle: puzzle,
      timestamp: Date.now()
    };

    session.solves.unshift(solve); // most recent first
    this.save();
    return solve;
  }

  // Delete a solve by ID
  deleteSolve(solveId) {
    const session = this.getActiveSession();
    session.solves = session.solves.filter(s => s.id !== solveId);
    this.save();
  }

  // Set penalty on solve (+2, DNF, none)
  setPenalty(solveId, penalty) {
    const solve = this.getSolves().find(s => s.id === solveId);
    if (solve) {
      solve.penalty = penalty;
      this.save();
    }
  }

  // Clear all solves in current session
  clearCurrentSession() {
    const session = this.getActiveSession();
    session.solves = [];
    this.save();
  }

  // Switch session
  switchSession(sessionId) {
    if (this.sessions.some(s => s.id === sessionId)) {
      this.activeSessionId = sessionId;
      storage.set(this.activeSessionKey, sessionId);
      return true;
    }
    return false;
  }

  // Create new session
  createSession(name, puzzle = '333') {
    const id = 'session_' + Date.now();
    const newSession = {
      id,
      name: name.trim() || 'New Session',
      puzzle: puzzle,
      solves: []
    };
    this.sessions.push(newSession);
    this.activeSessionId = id;
    this.save();
    return newSession;
  }

  // Delete session
  deleteSession(sessionId) {
    if (this.sessions.length <= 1) return false;
    this.sessions = this.sessions.filter(s => s.id !== sessionId);
    if (this.activeSessionId === sessionId) {
      this.activeSessionId = this.sessions[0].id;
    }
    this.save();
    return true;
  }

  save() {
    storage.setJSON(this.sessionsKey, this.sessions);
    storage.set(this.activeSessionKey, this.activeSessionId);
  }

  // Get effective time of solve (considering penalties)
  static getEffectiveTime(solve) {
    if (solve.penalty === 'DNF') return Infinity;
    if (solve.penalty === '+2') return solve.time + 2000;
    return solve.time;
  }

  // Calculate WCA trimmed average for a window of solves
  static calculateTrimmedAverage(solvesWindow) {
    const n = solvesWindow.length;
    if (n < 3) return null;

    // Count DNFs
    let dnfCount = 0;
    const times = [];

    for (const s of solvesWindow) {
      if (s.penalty === 'DNF') {
        dnfCount++;
        times.push(Infinity);
      } else if (s.penalty === '+2') {
        times.push(s.time + 2000);
      } else {
        times.push(s.time);
      }
    }

    // In Ao5 or Ao12, more than 1 DNF means the whole average is DNF
    if (dnfCount > 1) return Infinity;

    times.sort((a, b) => a - b);

    // Discard best (index 0) and worst (index n-1)
    const trimmed = times.slice(1, n - 1);
    const sum = trimmed.reduce((acc, t) => acc + t, 0);
    return Math.round(sum / trimmed.length);
  }

  // Compute full session statistics
  getStats() {
    const solves = this.getSolves();
    const count = solves.length;

    if (count === 0) {
      return {
        count: 0,
        best: null,
        worst: null,
        mean: null,
        currentAo5: null,
        bestAo5: null,
        currentAo12: null,
        bestAo12: null,
        currentAo100: null
      };
    }

    // Best & Worst singles
    let best = Infinity;
    let worst = 0;
    let validSum = 0;
    let validCount = 0;

    for (const s of solves) {
      const eff = StatsManager.getEffectiveTime(s);
      if (eff !== Infinity) {
        if (eff < best) best = eff;
        if (eff > worst) worst = eff;
        validSum += eff;
        validCount++;
      }
    }

    const mean = validCount > 0 ? Math.round(validSum / validCount) : null;
    const finalBest = best === Infinity ? null : best;
    const finalWorst = worst === 0 ? null : worst;

    // Current Ao5 and Best Ao5
    let currentAo5 = null;
    let bestAo5 = null;
    if (count >= 5) {
      currentAo5 = StatsManager.calculateTrimmedAverage(solves.slice(0, 5));
      // Scan all 5-windows for best Ao5
      for (let i = 0; i <= count - 5; i++) {
        const avg = StatsManager.calculateTrimmedAverage(solves.slice(i, i + 5));
        if (avg !== null && avg !== Infinity) {
          if (bestAo5 === null || avg < bestAo5) {
            bestAo5 = avg;
          }
        }
      }
    }

    // Current Ao12 and Best Ao12
    let currentAo12 = null;
    let bestAo12 = null;
    if (count >= 12) {
      currentAo12 = StatsManager.calculateTrimmedAverage(solves.slice(0, 12));
      for (let i = 0; i <= count - 12; i++) {
        const avg = StatsManager.calculateTrimmedAverage(solves.slice(i, i + 12));
        if (avg !== null && avg !== Infinity) {
          if (bestAo12 === null || avg < bestAo12) {
            bestAo12 = avg;
          }
        }
      }
    }

    // Current Ao100
    let currentAo100 = null;
    if (count >= 100) {
      currentAo100 = StatsManager.calculateTrimmedAverage(solves.slice(0, 100));
    }

    return {
      count,
      best: finalBest,
      worst: finalWorst,
      mean,
      currentAo5,
      bestAo5,
      currentAo12,
      bestAo12,
      currentAo100
    };
  }

  // Export current session to CSV format
  exportCSV() {
    const session = this.getActiveSession();
    const rows = [
      ['Index', 'Time (s)', 'Penalty', 'Effective Time (s)', 'Scramble', 'Date']
    ];

    const solves = [...session.solves].reverse(); // oldest first for numbering
    solves.forEach((s, idx) => {
      const eff = StatsManager.getEffectiveTime(s);
      const effStr = eff === Infinity ? 'DNF' : (eff / 1000).toFixed(2);
      const dateStr = new Date(s.timestamp).toLocaleString();
      rows.push([
        idx + 1,
        (s.time / 1000).toFixed(2),
        s.penalty,
        effStr,
        `"${s.scramble.replace(/"/g, '""')}"`,
        `"${dateStr}"`
      ]);
    });

    return rows.map(r => r.join(',')).join('\n');
  }

  // Export all sessions to JSON
  exportJSON() {
    return JSON.stringify(this.sessions, null, 2);
  }

  // Import sessions from JSON
  importJSON(jsonStr) {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].solves) {
        this.sessions = parsed;
        this.activeSessionId = this.sessions[0].id;
        this.save();
        return true;
      }
    } catch (e) {
      console.error('Import failed', e);
    }
    return false;
  }
}

export const statsManager = new StatsManager();
