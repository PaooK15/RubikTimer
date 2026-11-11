/**
 * theme.js
 * Theme & Color Management for Rubik's Solution Timer
 * Default Color Palette:
 *   --color-1: #EAF1FB (Lightest Ice Blue / Light Surface)
 *   --color-2: #B7CFF0 (Soft Sky Blue / Border & Muted Accent)
 *   --color-3: #6E9DE0 (Vibrant Cerulean / Primary Interactive)
 *   --color-4: #2F66C1 (Deep Royal Blue / Buttons & Badges)
 *   --color-5: #173A75 (Navy Midnight / Deep Backgrounds & Heavy Accents)
 */

import { storage } from './storage.js';

export const DEFAULT_PALETTE = {
  '--color-1': '#EAF1FB',
  '--color-2': '#B7CFF0',
  '--color-3': '#6E9DE0',
  '--color-4': '#2F66C1',
  '--color-5': '#173A75',
};

export const PRESET_THEMES = [
  {
    id: 'default-blue',
    name: 'Azure Core (Default)',
    description: 'Fresh royal blue gradient with icy highlights',
    colors: {
      '--color-1': '#EAF1FB',
      '--color-2': '#B7CFF0',
      '--color-3': '#6E9DE0',
      '--color-4': '#2F66C1',
      '--color-5': '#173A75',
    }
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk 2077',
    description: 'High contrast electric cyan and hot magenta neon',
    colors: {
      '--color-1': '#FFF8DC',
      '--color-2': '#FF0055',
      '--color-3': '#00F0FF',
      '--color-4': '#7928CA',
      '--color-5': '#0D0E15',
    }
  },
  {
    id: 'emerald-speed',
    name: 'Emerald Speed',
    description: 'Clean jade and neon mint for hyper-focus',
    colors: {
      '--color-1': '#EDFBF4',
      '--color-2': '#A3E8C4',
      '--color-3': '#34D399',
      '--color-4': '#059669',
      '--color-5': '#064E3B',
    }
  },
  {
    id: 'sunset-blaze',
    name: 'Sunset Horizon',
    description: 'Warm amber, coral peach, and crimson dusk',
    colors: {
      '--color-1': '#FFF5EB',
      '--color-2': '#FDBA74',
      '--color-3': '#FB923C',
      '--color-4': '#EA580C',
      '--color-5': '#7C2D12',
    }
  },
  {
    id: 'midnight-violet',
    name: 'Midnight Amethyst',
    description: 'Deep dreamlike purple and radiant lilac',
    colors: {
      '--color-1': '#F5F3FF',
      '--color-2': '#DDD6FE',
      '--color-3': '#A78BFA',
      '--color-4': '#7C3AED',
      '--color-5': '#2E1065',
    }
  },
  {
    id: 'carbon-stealth',
    name: 'Carbon AMOLED',
    description: 'Minimalist pitch dark with crisp silver highlights',
    colors: {
      '--color-1': '#FFFFFF',
      '--color-2': '#9CA3AF',
      '--color-3': '#4B5563',
      '--color-4': '#1F2937',
      '--color-5': '#08080A',
    }
  }
];

class ThemeManager {
  constructor() {
    this.currentColors = { ...DEFAULT_PALETTE };
    this.storageKey = 'rubik_timer_custom_theme';
  }

  init() {
    // Load saved colors from localStorage if exists
    const saved = storage.getJSON(this.storageKey);
    if (saved && typeof saved === 'object') {
      this.currentColors = { ...DEFAULT_PALETTE, ...saved };
    }
    this.applyAllColors();
  }

  // Set single color variable
  setColor(variableName, hexValue) {
    if (!variableName.startsWith('--color-')) return;
    this.currentColors[variableName] = hexValue;
    document.documentElement.style.setProperty(variableName, hexValue);
    this.saveTheme();
  }

  // Set entire palette
  setPalette(palette) {
    this.currentColors = { ...this.currentColors, ...palette };
    this.applyAllColors();
    this.saveTheme();
  }

  // Apply all current colors to root element
  applyAllColors() {
    const root = document.documentElement;
    for (const [key, val] of Object.entries(this.currentColors)) {
      root.style.setProperty(key, val);
    }
  }

  // Reset to the exact default palette
  resetToDefault() {
    this.currentColors = { ...DEFAULT_PALETTE };
    this.applyAllColors();
    this.saveTheme();
    return this.currentColors;
  }

  // Save to persistent storage
  saveTheme() {
    storage.setJSON(this.storageKey, this.currentColors);
  }

  // Get current color values
  getColors() {
    return { ...this.currentColors };
  }

  // Export current CSS configuration
  exportCSS() {
    return `:root {\n` +
      Object.entries(this.currentColors)
        .map(([k, v]) => `  ${k}: ${v};`)
        .join('\n') +
      `\n}`;
  }

  // Export JSON
  exportJSON() {
    return JSON.stringify(this.currentColors, null, 2);
  }

  // Import JSON
  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      const newPalette = {};
      for (let i = 1; i <= 5; i++) {
        const key = `--color-${i}`;
        if (parsed[key] && typeof parsed[key] === 'string') {
          newPalette[key] = parsed[key];
        }
      }
      if (Object.keys(newPalette).length > 0) {
        this.setPalette(newPalette);
        return true;
      }
    } catch (e) {
      console.error('Invalid theme JSON', e);
    }
    return false;
  }
}

export const themeManager = new ThemeManager();
