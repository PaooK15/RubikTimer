/**
 * app.js
 * Main Application Orchestrator for Rubik's Solution Timer
 */

import { themeManager, DEFAULT_PALETTE, PRESET_THEMES } from './theme.js';
import { wallpaperManager, WALLPAPER_PRESETS } from './wallpaper.js';
import { timer, TIMER_STATES, SpeedTimer } from './timer.js';
import { scrambler } from './scramble.js';
import { CubeVisualizer } from './cubeVisualizer.js';
import { statsManager, StatsManager } from './stats.js';
import { soundManager } from './sound.js';
import { storage } from './storage.js';

class SpeedcubeApp {
  constructor() {
    this.cubeVisualizer = null;
    this.currentScramble = '';
    this.currentPuzzle = '333';
    this.activeModal = null;
    this.isTouchActive = false;
  }

  async init() {
    // 1. Initialize Theme
    themeManager.init();

    // 2. Initialize Wallpaper Manager
    const wallpaperContainer = document.getElementById('wallpaper-container');
    const wallpaperMedia = document.getElementById('wallpaper-media');
    const wallpaperOverlay = document.getElementById('wallpaper-overlay');
    await wallpaperManager.init(wallpaperContainer, wallpaperMedia, wallpaperOverlay);

    // 3. Initialize Cube 2D Net Visualizer
    const canvas = document.getElementById('cube-net-canvas');
    if (canvas) {
      this.cubeVisualizer = new CubeVisualizer(canvas);
    }

    // 4. Setup Scramble
    this.setupScramble();

    // 5. Setup Timer Callbacks
    this.setupTimer();

    // 6. Setup Theme UI & Color Pickers
    this.setupThemeUI();

    // 7. Setup Wallpaper UI
    this.setupWallpaperUI();

    // 8. Setup Statistics & Solves UI
    this.setupStatsUI();

    // 9. Setup Settings & Modals
    this.setupSettingsUI();

    // 10. Setup Global Keyboard & Touch Listeners
    this.setupEventListeners();

    // 11. Initial Stats Render
    this.renderStats();
    this.renderSolvesList();
  }

  // Scramble Generation & Visualizer Sync
  setupScramble() {
    const scrambleEl = document.getElementById('scramble-display');
    const puzzleSelect = document.getElementById('puzzle-selector');

    const nextScrambleBtn = document.getElementById('btn-next-scramble');
    const copyScrambleBtn = document.getElementById('btn-copy-scramble');

    this.currentPuzzle = puzzleSelect ? puzzleSelect.value : '333';

    this.newScramble = () => {
      this.currentScramble = scrambler.generate(this.currentPuzzle);
      if (scrambleEl) scrambleEl.textContent = this.currentScramble;

      // Update 2D net for 3x3
      const netContainer = document.getElementById('cube-net-wrapper');
      if (this.currentPuzzle === '333') {
        if (netContainer) netContainer.style.display = 'flex';
        if (this.cubeVisualizer) this.cubeVisualizer.update(this.currentScramble);
      } else {
        if (netContainer) netContainer.style.display = 'none';
      }
    };

    if (puzzleSelect) {
      puzzleSelect.addEventListener('change', (e) => {
        this.currentPuzzle = e.target.value;
        this.newScramble();
      });
    }

    if (nextScrambleBtn) {
      nextScrambleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.newScramble();
      });
    }

    if (copyScrambleBtn) {
      copyScrambleBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(this.currentScramble);
          copyScrambleBtn.textContent = 'Copied!';
          setTimeout(() => { copyScrambleBtn.textContent = 'Copy'; }, 1500);
        } catch (err) {
          console.warn('Clipboard failed', err);
        }
      });
    }

    this.newScramble();
  }

  // Timer Integration
  setupTimer() {
    const timerDisplay = document.getElementById('timer-time');
    const timerPad = document.getElementById('timer-pad');
    const statusPill = document.getElementById('timer-status-pill');
    const appContainer = document.getElementById('app-container');

    timer.onTick = (value, isInspection) => {
      if (isInspection) {
        timerDisplay.textContent = Math.abs(value);
        if (value < 0) {
          timerDisplay.textContent = `+2 (${Math.abs(value)})`;
          timerDisplay.classList.add('penalty-warning');
        } else {
          timerDisplay.classList.remove('penalty-warning');
        }
      } else {
        if (timer.state === TIMER_STATES.RUNNING && timer.hideTimeWhileSolving) {
          timerDisplay.textContent = 'Solving...';
        } else {
          timerDisplay.textContent = SpeedTimer.format(value, timer.decimals);
        }
      }
    };

    timer.onStateChange = (state) => {
      // Manage status styling
      timerDisplay.classList.remove('holding', 'ready', 'running', 'inspection');
      appContainer.classList.remove('solving-zen');

      if (state === TIMER_STATES.HOLDING || state === TIMER_STATES.INSPECTION_HOLDING) {
        timerDisplay.classList.add('holding');
        if (statusPill) statusPill.textContent = 'HOLD...';
      } else if (state === TIMER_STATES.READY || state === TIMER_STATES.INSPECTION_READY) {
        timerDisplay.classList.add('ready');
        if (statusPill) statusPill.textContent = 'READY! RELEASE TO START';
      } else if (state === TIMER_STATES.INSPECTION_RUNNING) {
        timerDisplay.classList.add('inspection');
        if (statusPill) statusPill.textContent = 'INSPECTION TIME';
      } else if (state === TIMER_STATES.RUNNING) {
        timerDisplay.classList.add('running');
        if (timer.zenMode) {
          appContainer.classList.add('solving-zen');
        }
        if (statusPill) statusPill.textContent = 'SOLVING... TAP ANY KEY TO STOP';
      } else if (state === TIMER_STATES.STOPPED) {
        if (statusPill) statusPill.textContent = 'SOLVE COMPLETE';
      } else {
        if (statusPill) statusPill.textContent = 'PRESS & HOLD SPACE / SCREEN';
      }
    };

    timer.onComplete = (result) => {
      const stats = statsManager.getStats();
      const isNewPB = stats.best === null || result.time < stats.best;

      // Save solve
      statsManager.addSolve(result.time, this.currentScramble, this.currentPuzzle, result.penalty);

      if (isNewPB && result.penalty !== 'DNF') {
        soundManager.playPBFanfare();
        this.showToast('🎉 NEW PERSONAL BEST! 🎉');
      }

      // Refresh stats & list
      this.renderStats();
      this.renderSolvesList();

      // Automatically generate next scramble for flow
      this.newScramble();
    };
  }

  // Color & Theme Customizer Setup
  setupThemeUI() {
    const modal = document.getElementById('theme-modal');
    const openBtn = document.getElementById('btn-open-theme');
    const closeBtn = document.getElementById('btn-close-theme');
    const resetBtn = document.getElementById('btn-reset-theme');
    const exportBtn = document.getElementById('btn-export-theme');
    const importBtn = document.getElementById('btn-import-theme');
    const importFile = document.getElementById('theme-import-file');
    const presetsContainer = document.getElementById('theme-presets-grid');

    if (openBtn) {
      openBtn.addEventListener('click', () => this.openModal(modal));
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal(modal));
    }

    // Bind color inputs for --color-1 through --color-5
    const colors = themeManager.getColors();
    for (let i = 1; i <= 5; i++) {
      const varName = `--color-${i}`;
      const colorInput = document.getElementById(`picker-color-${i}`);
      const hexInput = document.getElementById(`hex-color-${i}`);

      if (colorInput && hexInput) {
        colorInput.value = colors[varName] || '#000000';
        hexInput.value = colors[varName] || '#000000';

        // When color picker is used
        colorInput.addEventListener('input', (e) => {
          const val = e.target.value.toUpperCase();
          hexInput.value = val;
          themeManager.setColor(varName, val);
        });

        // When hex text is edited
        hexInput.addEventListener('change', (e) => {
          let val = e.target.value.trim();
          if (!val.startsWith('#')) val = '#' + val;
          if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
            colorInput.value = val;
            themeManager.setColor(varName, val.toUpperCase());
          }
        });
      }
    }

    // Reset button
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        themeManager.resetToDefault();
        this.syncThemePickers();
        this.showToast('Theme reset to default Azure palette!');
      });
    }

    // Render preset cards
    if (presetsContainer) {
      presetsContainer.innerHTML = '';
      PRESET_THEMES.forEach(preset => {
        const card = document.createElement('div');
        card.className = 'theme-preset-card';
        card.innerHTML = `
          <div class="preset-color-strip">
            <span style="background:${preset.colors['--color-1']}"></span>
            <span style="background:${preset.colors['--color-2']}"></span>
            <span style="background:${preset.colors['--color-3']}"></span>
            <span style="background:${preset.colors['--color-4']}"></span>
            <span style="background:${preset.colors['--color-5']}"></span>
          </div>
          <div class="preset-name">${preset.name}</div>
          <div class="preset-desc">${preset.description}</div>
        `;
        card.addEventListener('click', () => {
          themeManager.setPalette(preset.colors);
          this.syncThemePickers();
          this.showToast(`Applied "${preset.name}" theme!`);
        });
        presetsContainer.appendChild(card);
      });
    }

    // Export theme
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        const json = themeManager.exportJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `speedcube-theme-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }

    // Import theme
    if (importBtn && importFile) {
      importBtn.addEventListener('click', () => importFile.click());
      importFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          const success = themeManager.importJSON(evt.target.result);
          if (success) {
            this.syncThemePickers();
            this.showToast('Theme imported successfully!');
          } else {
            alert('Failed to parse theme JSON file.');
          }
        };
        reader.readAsText(file);
      });
    }
  }

  syncThemePickers() {
    const colors = themeManager.getColors();
    for (let i = 1; i <= 5; i++) {
      const varName = `--color-${i}`;
      const colorInput = document.getElementById(`picker-color-${i}`);
      const hexInput = document.getElementById(`hex-color-${i}`);
      if (colorInput && hexInput && colors[varName]) {
        colorInput.value = colors[varName];
        hexInput.value = colors[varName];
      }
    }
  }

  // Wallpaper UI & File / URL / Position & Block Transparency Controls
  setupWallpaperUI() {
    const modal = document.getElementById('wallpaper-modal');
    const openBtn = document.getElementById('btn-open-wallpaper');
    const openTransBtn = document.getElementById('btn-open-transparency');
    const closeBtn = document.getElementById('btn-close-wallpaper');

    const fileInput = document.getElementById('wallpaper-file-input');
    const dropArea = document.getElementById('wallpaper-drop-area');
    const urlInput = document.getElementById('wallpaper-url-input');
    const applyUrlBtn = document.getElementById('btn-apply-wallpaper-url');
    const urlTypeSelect = document.getElementById('wallpaper-url-type');

    // Tab Switching Logic
    const tabBtns = modal.querySelectorAll('.modal-tab-btn');
    const tabPanels = modal.querySelectorAll('.modal-tab-panel');
    const switchTab = (tabId) => {
      tabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tabId));
      tabPanels.forEach(panel => panel.classList.toggle('active', panel.id === `tab-panel-${tabId}`));
    };

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    if (openBtn) {
      openBtn.addEventListener('click', () => {
        this.openModal(modal);
        switchTab('media');
      });
    }

    if (openTransBtn) {
      openTransBtn.addEventListener('click', () => {
        this.openModal(modal);
        switchTab('transparency');
      });
    }

    if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal(modal));

    // Helper to bind range slider with live badge
    const bindSlider = (sliderId, badgeId, onChange, unit = '%') => {
      const slider = document.getElementById(sliderId);
      const badge = document.getElementById(badgeId);
      if (!slider) return null;

      const updateBadge = (v) => {
        if (badge) badge.textContent = `${v}${unit}`;
      };

      slider.addEventListener('input', (e) => {
        const val = e.target.value;
        updateBadge(val);
        onChange(val);
      });

      return { slider, updateBadge };
    };

    const currentSettings = wallpaperManager.getSettings();
    const bt = currentSettings.blockTransparency || {};

    // =====================================================================
    // 1. BACKGROUND POSITION & FRAMING
    // =====================================================================
    const posXCtrl = bindSlider('slider-bg-pos-x', 'val-bg-pos-x', (v) => {
      wallpaperManager.setPositionX(v);
      updateGridActive(v, currentSettings.posY);
    });
    if (posXCtrl) posXCtrl.slider.value = currentSettings.posX || 50;

    const posYCtrl = bindSlider('slider-bg-pos-y', 'val-bg-pos-y', (v) => {
      wallpaperManager.setPositionY(v);
      updateGridActive(currentSettings.posX, v);
    });
    if (posYCtrl) posYCtrl.slider.value = currentSettings.posY || 50;

    const scaleCtrl = bindSlider('slider-bg-scale', 'val-bg-scale', (v) => {
      wallpaperManager.setScale(v);
    });
    if (scaleCtrl) scaleCtrl.slider.value = currentSettings.scale || 100;

    const fitSelect = document.getElementById('select-bg-fit');
    if (fitSelect) {
      fitSelect.value = currentSettings.fit || 'cover';
      fitSelect.addEventListener('change', (e) => {
        wallpaperManager.setFit(e.target.value);
      });
    }

    // 9-point grid buttons
    const gridBtns = modal.querySelectorAll('.btn-pos-grid');
    const updateGridActive = (x, y) => {
      gridBtns.forEach(btn => {
        const bx = Number(btn.dataset.posX);
        const by = Number(btn.dataset.posY);
        const match = Math.abs(bx - x) <= 15 && Math.abs(by - y) <= 15;
        btn.classList.toggle('active', match);
      });
    };

    gridBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const x = Number(btn.dataset.posX);
        const y = Number(btn.dataset.posY);
        wallpaperManager.setPosition(x, y);

        if (posXCtrl) {
          posXCtrl.slider.value = x;
          posXCtrl.updateBadge(x);
        }
        if (posYCtrl) {
          posYCtrl.slider.value = y;
          posYCtrl.updateBadge(y);
        }

        gridBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.showToast(`Background aligned to ${btn.title}`);
      });
    });

    const resetBgPosBtn = document.getElementById('btn-reset-bg-pos');
    if (resetBgPosBtn) {
      resetBgPosBtn.addEventListener('click', () => {
        const def = wallpaperManager.resetPosition();
        if (posXCtrl) { posXCtrl.slider.value = def.posX; posXCtrl.updateBadge(def.posX); }
        if (posYCtrl) { posYCtrl.slider.value = def.posY; posYCtrl.updateBadge(def.posY); }
        if (scaleCtrl) { scaleCtrl.slider.value = def.scale; scaleCtrl.updateBadge(def.scale); }
        if (fitSelect) fitSelect.value = def.fit;
        updateGridActive(50, 50);
        this.showToast('Background framing centered and reset.');
      });
    }

    // =====================================================================
    // 2. BLOCK TRANSPARENCY CONTROLS
    // =====================================================================
    const globalTransCtrl = bindSlider('slider-opacity-global', 'val-opacity-global', (v) => {
      wallpaperManager.setBlockTransparency('global', v);
      syncTransparencySliders();
    });
    if (globalTransCtrl) globalTransCtrl.slider.value = bt.global !== undefined ? bt.global : 65;

    const timerPadCtrl = bindSlider('slider-opacity-timer', 'val-opacity-timer', (v) => {
      wallpaperManager.setBlockTransparency('timerPad', v);
    });
    if (timerPadCtrl) timerPadCtrl.slider.value = bt.timerPad !== undefined ? bt.timerPad : 60;

    const historyCtrl = bindSlider('slider-opacity-history', 'val-opacity-history', (v) => {
      wallpaperManager.setBlockTransparency('solveHistory', v);
    });
    if (historyCtrl) historyCtrl.slider.value = bt.solveHistory !== undefined ? bt.solveHistory : 65;

    const scrambleCtrl = bindSlider('slider-opacity-scramble', 'val-opacity-scramble', (v) => {
      wallpaperManager.setBlockTransparency('scrambleBar', v);
    });
    if (scrambleCtrl) scrambleCtrl.slider.value = bt.scrambleBar !== undefined ? bt.scrambleBar : 55;

    const statsCtrl = bindSlider('slider-opacity-stats', 'val-opacity-stats', (v) => {
      wallpaperManager.setBlockTransparency('statsBar', v);
    });
    if (statsCtrl) statsCtrl.slider.value = bt.statsBar !== undefined ? bt.statsBar : 60;

    const headerCtrl = bindSlider('slider-opacity-header', 'val-opacity-header', (v) => {
      wallpaperManager.setBlockTransparency('header', v);
    });
    if (headerCtrl) headerCtrl.slider.value = bt.header !== undefined ? bt.header : 45;

    const borderCtrl = bindSlider('slider-opacity-border', 'val-opacity-border', (v) => {
      wallpaperManager.setBlockTransparency('borderOpacity', v);
    });
    if (borderCtrl) borderCtrl.slider.value = bt.borderOpacity !== undefined ? bt.borderOpacity : 22;

    const glassBlurCtrl = bindSlider('slider-glass-blur', 'val-glass-blur', (v) => {
      wallpaperManager.setGlassBlur(v);
    }, 'px');
    if (glassBlurCtrl) glassBlurCtrl.slider.value = currentSettings.glassBlur || 16;

    const syncTransparencySliders = () => {
      const cur = wallpaperManager.getSettings();
      const b = cur.blockTransparency || {};
      if (timerPadCtrl) { timerPadCtrl.slider.value = b.timerPad; timerPadCtrl.updateBadge(b.timerPad); }
      if (historyCtrl) { historyCtrl.slider.value = b.solveHistory; historyCtrl.updateBadge(b.solveHistory); }
      if (scrambleCtrl) { scrambleCtrl.slider.value = b.scrambleBar; scrambleCtrl.updateBadge(b.scrambleBar); }
      if (statsCtrl) { statsCtrl.slider.value = b.statsBar; statsCtrl.updateBadge(b.statsBar); }
      if (headerCtrl) { headerCtrl.slider.value = b.header; headerCtrl.updateBadge(b.header); }
      if (borderCtrl) { borderCtrl.slider.value = b.borderOpacity; borderCtrl.updateBadge(b.borderOpacity); }
      if (globalTransCtrl) { globalTransCtrl.slider.value = b.global; globalTransCtrl.updateBadge(b.global); }
      if (glassBlurCtrl) { glassBlurCtrl.slider.value = cur.glassBlur; glassBlurCtrl.updateBadge(cur.glassBlur); }
    };

    // Transparency Preset Pills
    const presetPills = modal.querySelectorAll('.btn-preset-pill');
    presetPills.forEach(pill => {
      pill.addEventListener('click', () => {
        presetPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        wallpaperManager.setTransparencyPreset(pill.dataset.transPreset);
        syncTransparencySliders();
        this.showToast(`Applied ${pill.textContent.trim()} mode!`);
      });
    });

    // =====================================================================
    // 3. ATMOSPHERE & FILTERS
    // =====================================================================
    const opacityCtrl = bindSlider('slider-wallpaper-opacity', 'val-wallpaper-opacity', (v) => {
      wallpaperManager.setOpacity(v);
    });
    if (opacityCtrl) opacityCtrl.slider.value = currentSettings.opacity;

    const blurCtrl = bindSlider('slider-wallpaper-blur', 'val-wallpaper-blur', (v) => {
      wallpaperManager.setBlur(v);
    }, 'px');
    if (blurCtrl) blurCtrl.slider.value = currentSettings.blur;

    const darkCtrl = bindSlider('slider-overlay-darkness', 'val-overlay-darkness', (v) => {
      wallpaperManager.setOverlayDarkness(v);
    });
    if (darkCtrl) darkCtrl.slider.value = currentSettings.overlayDarkness;

    // =====================================================================
    // 4. WALLPAPER MEDIA (UPLOAD, URL, PRESETS)
    // =====================================================================
    const handleFile = async (file) => {
      try {
        await wallpaperManager.handleFileUpload(file);
        this.showToast(`Wallpaper updated: ${file.name}`);
      } catch (err) {
        alert(err.message || 'Error processing wallpaper file.');
      }
    };

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          handleFile(e.target.files[0]);
        }
      });
    }

    if (dropArea) {
      dropArea.addEventListener('click', () => fileInput && fileInput.click());
      ['dragenter', 'dragover'].forEach(name => {
        dropArea.addEventListener(name, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropArea.classList.add('drag-over');
        });
      });
      ['dragleave', 'drop'].forEach(name => {
        dropArea.addEventListener(name, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropArea.classList.remove('drag-over');
        });
      });
      dropArea.addEventListener('drop', (e) => {
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleFile(e.dataTransfer.files[0]);
        }
      });
    }

    // Direct URL Apply
    if (applyUrlBtn && urlInput) {
      applyUrlBtn.addEventListener('click', () => {
        const url = urlInput.value.trim();
        if (!url) return;
        const type = urlTypeSelect ? urlTypeSelect.value : 'image';
        wallpaperManager.setWallpaperUrl(url, type);
        this.showToast('Wallpaper applied from URL!');
      });
    }

    // Wallpaper Preset Cards
    const presetsContainer = document.getElementById('wallpaper-presets-grid');
    if (presetsContainer) {
      presetsContainer.innerHTML = '';
      WALLPAPER_PRESETS.forEach(p => {
        const card = document.createElement('div');
        card.className = 'wallpaper-preset-card';
        card.innerHTML = `
          <div class="preset-title">${p.name}</div>
          <div class="preset-meta">${p.type.toUpperCase()} • ${p.description}</div>
        `;
        card.addEventListener('click', () => {
          wallpaperManager.setPreset(p.id);
          this.showToast(`Applied wallpaper: ${p.name}`);
        });
        presetsContainer.appendChild(card);
      });
    }
  }

  // Solves & Stats Display
  setupStatsUI() {
    const sessionSelect = document.getElementById('session-selector');
    const newSessionBtn = document.getElementById('btn-new-session');
    const clearSessionBtn = document.getElementById('btn-clear-session');
    const exportSolvesBtn = document.getElementById('btn-export-solves');

    this.renderSessionsDropdown();

    if (sessionSelect) {
      sessionSelect.addEventListener('change', (e) => {
        statsManager.switchSession(e.target.value);
        this.renderStats();
        this.renderSolvesList();
      });
    }

    if (newSessionBtn) {
      newSessionBtn.addEventListener('click', () => {
        const name = prompt('Enter new session name (e.g. "3x3 Roux", "Practice", "BLD"):');
        if (name) {
          statsManager.createSession(name, this.currentPuzzle);
          this.renderSessionsDropdown();
          this.renderStats();
          this.renderSolvesList();
        }
      });
    }

    if (clearSessionBtn) {
      clearSessionBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all solves in this session? This cannot be undone.')) {
          statsManager.clearCurrentSession();
          this.renderStats();
          this.renderSolvesList();
          this.showToast('Session solves cleared.');
        }
      });
    }

    if (exportSolvesBtn) {
      exportSolvesBtn.addEventListener('click', () => {
        const csv = statsManager.exportCSV();
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rubik-solves-${statsManager.getActiveSession().name.replace(/\s+/g, '_')}-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      });
    }
  }

  renderSessionsDropdown() {
    const sessionSelect = document.getElementById('session-selector');
    if (!sessionSelect) return;
    sessionSelect.innerHTML = '';
    statsManager.sessions.forEach(sess => {
      const opt = document.createElement('option');
      opt.value = sess.id;
      opt.textContent = `${sess.name} (${sess.solves.length})`;
      if (sess.id === statsManager.activeSessionId) {
        opt.selected = true;
      }
      sessionSelect.appendChild(opt);
    });
  }

  renderStats() {
    const stats = statsManager.getStats();

    const countEl = document.getElementById('stat-count');
    const bestEl = document.getElementById('stat-best');
    const worstEl = document.getElementById('stat-worst');
    const meanEl = document.getElementById('stat-mean');
    const currentAo5El = document.getElementById('stat-cur-ao5');
    const bestAo5El = document.getElementById('stat-best-ao5');
    const currentAo12El = document.getElementById('stat-cur-ao12');
    const bestAo12El = document.getElementById('stat-best-ao12');

    if (countEl) countEl.textContent = stats.count;
    if (bestEl) bestEl.textContent = SpeedTimer.format(stats.best);
    if (worstEl) worstEl.textContent = SpeedTimer.format(stats.worst);
    if (meanEl) meanEl.textContent = SpeedTimer.format(stats.mean);

    if (currentAo5El) currentAo5El.textContent = stats.currentAo5 === Infinity ? 'DNF' : SpeedTimer.format(stats.currentAo5);
    if (bestAo5El) bestAo5El.textContent = SpeedTimer.format(stats.bestAo5);
    if (currentAo12El) currentAo12El.textContent = stats.currentAo12 === Infinity ? 'DNF' : SpeedTimer.format(stats.currentAo12);
    if (bestAo12El) bestAo12El.textContent = SpeedTimer.format(stats.bestAo12);

    this.renderSessionsDropdown();
  }

  renderSolvesList() {
    const container = document.getElementById('solves-list-container');
    if (!container) return;

    const solves = statsManager.getSolves();
    container.innerHTML = '';

    if (solves.length === 0) {
      container.innerHTML = '<div class="no-solves-msg">No solves yet. Press Spacebar or touch the screen to start your first solve!</div>';
      return;
    }

    solves.forEach((solve, idx) => {
      const indexNum = solves.length - idx;
      const row = document.createElement('div');
      row.className = 'solve-row';

      let timeFormatted = SpeedTimer.format(solve.time);
      let penaltyBadge = '';

      if (solve.penalty === '+2') {
        timeFormatted = SpeedTimer.format(solve.time + 2000) + '+';
        penaltyBadge = '<span class="badge penalty-badge">+2</span>';
      } else if (solve.penalty === 'DNF') {
        timeFormatted = 'DNF';
        penaltyBadge = '<span class="badge dnf-badge">DNF</span>';
      }

      row.innerHTML = `
        <span class="solve-index">#${indexNum}</span>
        <span class="solve-time">${timeFormatted} ${penaltyBadge}</span>
        <div class="solve-actions">
          <button class="btn-solve-act btn-penalty-plus2" title="Toggle +2 Penalty">+2</button>
          <button class="btn-solve-act btn-penalty-dnf" title="Toggle DNF">DNF</button>
          <button class="btn-solve-act btn-delete-solve" title="Delete Solve">×</button>
        </div>
      `;

      // Button handlers
      const p2Btn = row.querySelector('.btn-penalty-plus2');
      const dnfBtn = row.querySelector('.btn-penalty-dnf');
      const delBtn = row.querySelector('.btn-delete-solve');

      p2Btn.addEventListener('click', (e) => {
        e.stopPropagation();
        statsManager.setPenalty(solve.id, solve.penalty === '+2' ? 'none' : '+2');
        this.renderStats();
        this.renderSolvesList();
      });

      dnfBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        statsManager.setPenalty(solve.id, solve.penalty === 'DNF' ? 'none' : 'DNF');
        this.renderStats();
        this.renderSolvesList();
      });

      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        statsManager.deleteSolve(solve.id);
        this.renderStats();
        this.renderSolvesList();
      });

      // Click row to view scramble & detail popup
      row.addEventListener('click', () => {
        alert(
          `Solve #${indexNum}\nTime: ${timeFormatted}\nPenalty: ${solve.penalty}\nDate: ${new Date(solve.timestamp).toLocaleString()}\n\nScramble:\n${solve.scramble}`
        );
      });

      container.appendChild(row);
    });
  }

  // Settings & Toggles
  setupSettingsUI() {
    const modal = document.getElementById('settings-modal');
    const openBtn = document.getElementById('btn-open-settings');
    const closeBtn = document.getElementById('btn-close-settings');

    const inspectionToggle = document.getElementById('toggle-inspection');
    const zenToggle = document.getElementById('toggle-zen');
    const hideRunningToggle = document.getElementById('toggle-hide-running');
    const soundToggle = document.getElementById('toggle-sound');
    const decimalsSelect = document.getElementById('select-decimals');

    if (openBtn) openBtn.addEventListener('click', () => this.openModal(modal));
    if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal(modal));

    if (inspectionToggle) {
      inspectionToggle.checked = timer.inspectionEnabled;
      inspectionToggle.addEventListener('change', (e) => timer.setInspection(e.target.checked));
    }

    if (zenToggle) {
      zenToggle.checked = timer.zenMode;
      zenToggle.addEventListener('change', (e) => timer.setZenMode(e.target.checked));
    }

    if (hideRunningToggle) {
      hideRunningToggle.checked = timer.hideTimeWhileSolving;
      hideRunningToggle.addEventListener('change', (e) => timer.setHideRunning(e.target.checked));
    }

    if (soundToggle) {
      soundToggle.checked = soundManager.enabled;
      soundToggle.addEventListener('change', (e) => soundManager.toggleSound(e.target.checked));
    }

    if (decimalsSelect) {
      decimalsSelect.value = timer.decimals;
      decimalsSelect.addEventListener('change', (e) => timer.setDecimals(e.target.value));
    }

    // Top Header Sound Quick Toggle
    const headerSoundBtn = document.getElementById('btn-header-sound');
    if (headerSoundBtn) {
      const updateIcon = () => {
        headerSoundBtn.innerHTML = soundManager.enabled ? '🔊' : '🔇';
      };
      updateIcon();
      headerSoundBtn.addEventListener('click', () => {
        soundManager.toggleSound();
        updateIcon();
        if (soundToggle) soundToggle.checked = soundManager.enabled;
      });
    }

    // Top Header Zen Mode Quick Toggle
    const headerZenBtn = document.getElementById('btn-header-zen');
    if (headerZenBtn) {
      headerZenBtn.addEventListener('click', () => {
        timer.setZenMode(!timer.zenMode);
        if (zenToggle) zenToggle.checked = timer.zenMode;
        document.getElementById('app-container').classList.toggle('zen-activated', timer.zenMode);
        this.showToast(timer.zenMode ? 'Zen Mode ON' : 'Zen Mode OFF');
      });
    }
  }

  // Global Key & Touch Listeners
  setupEventListeners() {
    let spaceDown = false;

    window.addEventListener('keydown', (e) => {
      // Don't trigger timer when typing in text fields or modals
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) {
        return;
      }

      // Close modal on ESC
      if (e.code === 'Escape') {
        if (this.activeModal) {
          this.closeModal(this.activeModal);
          return;
        }
        if (timer.state === TIMER_STATES.RUNNING) {
          timer.stop();
          return;
        }
      }

      // Hotkeys with Alt
      if (e.altKey) {
        if (e.code === 'KeyN') {
          e.preventDefault();
          this.newScramble();
          return;
        }
        if (e.code === 'KeyZ') {
          e.preventDefault();
          timer.setZenMode(!timer.zenMode);
          this.showToast(timer.zenMode ? 'Zen Mode Enabled' : 'Zen Mode Disabled');
          return;
        }
      }

      // Spacebar controls timer
      if (e.code === 'Space') {
        e.preventDefault();
        if (!spaceDown) {
          spaceDown = true;
          timer.handleInputDown();
        }
      } else if (timer.state === TIMER_STATES.RUNNING) {
        // Any key stops running timer
        timer.handleInputDown();
      }
    });

    window.addEventListener('keyup', (e) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        spaceDown = false;
        timer.handleInputUp();
      }
    });

    // Mobile / Touchpad interaction on the Timer Pad area
    const touchArea = document.getElementById('timer-touch-zone');
    if (touchArea) {
      touchArea.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.isTouchActive = true;
        timer.handleInputDown();
      }, { passive: false });

      touchArea.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.isTouchActive = false;
        timer.handleInputUp();
      }, { passive: false });

      touchArea.addEventListener('mousedown', (e) => {
        // Only trigger on direct left click and if not clicking a button
        if (e.button === 0 && e.target === touchArea || e.target.classList.contains('timer-surface')) {
          timer.handleInputDown();
        }
      });

      window.addEventListener('mouseup', () => {
        if (timer.state === TIMER_STATES.HOLDING || timer.state === TIMER_STATES.READY ||
            timer.state === TIMER_STATES.INSPECTION_HOLDING || timer.state === TIMER_STATES.INSPECTION_READY) {
          timer.handleInputUp();
        }
      });
    }
  }

  // Modal helpers
  openModal(modal) {
    if (!modal) return;
    this.closeModal(this.activeModal);
    modal.classList.add('modal-visible');
    this.activeModal = modal;
  }

  closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('modal-visible');
    if (this.activeModal === modal) {
      this.activeModal = null;
    }
  }

  // Toast Notification
  showToast(message, duration = 2500) {
    let toast = document.getElementById('app-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'app-toast';
      toast.className = 'app-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('toast-show');
    clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      toast.classList.remove('toast-show');
    }, duration);
  }
}

// Start application once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new SpeedcubeApp();
  app.init();
  window.speedcubeApp = app;
});
