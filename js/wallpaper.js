/**
 * wallpaper.js
 * Comprehensive wallpaper manager supporting:
 * - Images (.jpg, .jpeg, .png, .webp, .svg)
 * - Animated GIFs (.gif)
 * - Videos (.mp4, .webm)
 * - Local file uploads (saved via IndexedDB)
 * - Remote web URLs
 * - Built-in high-aesthetic presets (Canvas animated stars/cubes, gradients, curated wallpapers)
 * - Granular visual adjustments: Opacity, Blur, Overlay Tint, Glass card blur
 */

import { storage } from './storage.js';

export const WALLPAPER_PRESETS = [
  {
    id: 'interactive-canvas',
    name: 'Animated Floating 3D Cubes (Interactive)',
    type: 'canvas',
    description: 'Dynamic animated isometric 3D cubes floating with particle dust'
  },
  {
    id: 'theme-gradient',
    name: 'Harmonic Theme Gradient',
    type: 'gradient',
    description: 'Smooth animated mesh gradient derived from your active palette'
  },
  {
    id: 'preset-lofi-room',
    name: 'Lo-Fi Speedcube Study (Animated GIF)',
    type: 'gif',
    url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1920&q=80',
    description: 'Cozy atmospheric aesthetic with ambient lighting'
  },
  {
    id: 'preset-cyber-grid',
    name: 'Cyberpunk Speed Grid',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1920&q=80',
    description: 'Electric dark abstract grid aesthetic'
  },
  {
    id: 'preset-deep-space',
    name: 'Cosmic Nebula & Stars',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1920&q=80',
    description: 'Deep celestial nebula with starry constellation glow'
  },
  {
    id: 'preset-minimal-dark',
    name: 'Pure Minimalist Slate',
    type: 'solid',
    description: 'Ultra-clean solid deep contrast for competitive zero-distraction solving'
  }
];

class WallpaperManager {
  constructor() {
    this.container = null;
    this.mediaContainer = null;
    this.overlayElement = null;
    this.canvas = null;
    this.canvasAnimationId = null;
    this.activeObjectUrl = null;

    this.settings = {
      type: 'interactive-canvas', // 'image' | 'video' | 'gif' | 'canvas' | 'gradient' | 'solid'
      source: 'preset',           // 'preset' | 'upload' | 'url'
      url: '',
      opacity: 85,                // 0 to 100%
      blur: 0,                    // 0 to 25px
      overlayDarkness: 45,        // 0 to 90%
      glassBlur: 16,              // 4 to 32px
      glassOpacity: 70            // 20 to 95%
    };

    this.storageKey = 'rubik_timer_wallpaper_settings';
  }

  async init(containerElement, mediaElement, overlayElement) {
    this.container = containerElement;
    this.mediaContainer = mediaElement;
    this.overlayElement = overlayElement;

    // Load saved settings
    const saved = storage.getJSON(this.storageKey);
    if (saved) {
      this.settings = { ...this.settings, ...saved };
    }

    // Apply visual filters (opacity, blur, overlay)
    this.applyFilters();

    // Check if custom uploaded wallpaper exists in IndexedDB
    if (this.settings.source === 'upload') {
      try {
        const storedBlob = await storage.getWallpaperBlob();
        if (storedBlob && storedBlob.blob) {
          const objectUrl = URL.createObjectURL(storedBlob.blob);
          this.activeObjectUrl = objectUrl;
          this.renderMedia(this.settings.type, objectUrl);
          return;
        }
      } catch (e) {
        console.warn('Could not load custom wallpaper from IndexedDB', e);
      }
    }

    // Otherwise render standard preset or URL
    this.renderCurrentWallpaper();
  }

  // Render current wallpaper based on settings
  renderCurrentWallpaper() {
    this.stopCanvasAnimation();

    if (this.settings.type === 'canvas' || this.settings.type === 'interactive-canvas') {
      this.renderCanvasParticles();
    } else if (this.settings.type === 'gradient') {
      this.renderMeshGradient();
    } else if (this.settings.type === 'solid') {
      this.renderSolidBackground();
    } else if (this.settings.type === 'video') {
      this.renderVideo(this.settings.url);
    } else {
      // image or gif
      this.renderImage(this.settings.url);
    }
  }

  // Render static or animated image / GIF
  renderImage(src) {
    this.clearMediaContainer();
    const img = document.createElement('img');
    img.className = 'wallpaper-media-element wallpaper-image';
    img.src = src;
    img.alt = 'Custom Wallpaper';
    img.loading = 'eager';
    this.mediaContainer.appendChild(img);
  }

  // Render background video (.mp4, .webm)
  renderVideo(src) {
    this.clearMediaContainer();
    const video = document.createElement('video');
    video.className = 'wallpaper-media-element wallpaper-video';
    video.src = src;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    // Catch autoplay policy restrictions gracefully
    video.play().catch(e => {
      console.warn('Video autoplay waiting for user interaction', e);
    });

    this.mediaContainer.appendChild(video);
  }

  // Render interactive floating 3D cube particle canvas
  renderCanvasParticles() {
    this.clearMediaContainer();
    const canvas = document.createElement('canvas');
    canvas.className = 'wallpaper-media-element wallpaper-canvas';
    this.canvas = canvas;
    this.mediaContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!this.canvas) return;
      width = this.canvas.width = window.innerWidth;
      height = this.canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // Particle floating cubes
    const cubes = [];
    const CUBE_COUNT = 24;

    for (let i = 0; i < CUBE_COUNT; i++) {
      cubes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 28 + 14,
        speedX: (Math.random() - 0.5) * 0.45,
        speedY: (Math.random() - 0.5) * 0.45,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.015,
        opacity: Math.random() * 0.35 + 0.15,
        hueOffset: Math.random() * 40 - 20
      });
    }

    let mouseX = width / 2;
    let mouseY = height / 2;
    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove);

    const drawIsometricCube = (cx, cy, s, rot, alpha) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);

      // Top face
      ctx.fillStyle = `rgba(110, 157, 224, ${alpha * 0.9})`;
      ctx.beginPath();
      ctx.moveTo(0, -s * 0.58);
      ctx.lineTo(s * 0.86, -s * 0.08);
      ctx.lineTo(0, s * 0.42);
      ctx.lineTo(-s * 0.86, -s * 0.08);
      ctx.closePath();
      ctx.fill();

      // Right face
      ctx.fillStyle = `rgba(47, 102, 193, ${alpha * 0.75})`;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.42);
      ctx.lineTo(s * 0.86, -s * 0.08);
      ctx.lineTo(s * 0.86, s * 0.82);
      ctx.lineTo(0, s * 1.32);
      ctx.closePath();
      ctx.fill();

      // Left face
      ctx.fillStyle = `rgba(23, 58, 117, ${alpha * 0.85})`;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.42);
      ctx.lineTo(-s * 0.86, -s * 0.08);
      ctx.lineTo(-s * 0.86, s * 0.82);
      ctx.lineTo(0, s * 1.32);
      ctx.closePath();
      ctx.fill();

      // Subtle border lines
      ctx.strokeStyle = `rgba(234, 241, 251, ${alpha * 0.5})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Soft ambient background tint
      const gradient = ctx.createRadialGradient(
        mouseX, mouseY, 50,
        width / 2, height / 2, Math.max(width, height) * 0.8
      );
      gradient.addColorStop(0, 'rgba(47, 102, 193, 0.12)');
      gradient.addColorStop(0.5, 'rgba(23, 58, 117, 0.08)');
      gradient.addColorStop(1, 'rgba(10, 18, 38, 0.02)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw and update cubes
      for (const cube of cubes) {
        cube.x += cube.speedX;
        cube.y += cube.speedY;
        cube.rotation += cube.rotSpeed;

        if (cube.x < -60) cube.x = width + 60;
        if (cube.x > width + 60) cube.x = -60;
        if (cube.y < -60) cube.y = height + 60;
        if (cube.y > height + 60) cube.y = -60;

        drawIsometricCube(cube.x, cube.y, cube.size, cube.rotation, cube.opacity);
      }

      this.canvasAnimationId = requestAnimationFrame(animate);
    };

    animate();
  }

  // Render animated CSS mesh gradient
  renderMeshGradient() {
    this.clearMediaContainer();
    const gradDiv = document.createElement('div');
    gradDiv.className = 'wallpaper-media-element wallpaper-gradient-mesh';
    this.mediaContainer.appendChild(gradDiv);
  }

  // Render solid minimal dark
  renderSolidBackground() {
    this.clearMediaContainer();
    const solidDiv = document.createElement('div');
    solidDiv.className = 'wallpaper-media-element wallpaper-solid-bg';
    this.mediaContainer.appendChild(solidDiv);
  }

  // General media renderer
  renderMedia(type, src) {
    if (type === 'video') {
      this.renderVideo(src);
    } else {
      this.renderImage(src);
    }
  }

  // Handle local user file upload (Image, GIF, or Video)
  async handleFileUpload(file) {
    if (!file) return false;

    const mime = file.type;
    let type = 'image';

    if (mime.startsWith('video/')) {
      type = 'video';
    } else if (mime === 'image/gif') {
      type = 'gif';
    } else if (mime.startsWith('image/')) {
      type = 'image';
    } else {
      throw new Error('Unsupported file type. Please upload an image, GIF, or video (.mp4, .webm).');
    }

    // Clean up previous blob URL
    if (this.activeObjectUrl) {
      URL.revokeObjectURL(this.activeObjectUrl);
      this.activeObjectUrl = null;
    }

    // Save in IndexedDB
    await storage.saveWallpaperBlob(file, mime, file.name);

    // Create fresh ObjectURL
    const newUrl = URL.createObjectURL(file);
    this.activeObjectUrl = newUrl;

    this.settings.source = 'upload';
    this.settings.type = type;
    this.settings.url = file.name;
    this.saveSettings();

    this.renderMedia(type, newUrl);
    return true;
  }

  // Set wallpaper by URL (image, gif, video)
  setWallpaperUrl(url, type = 'image') {
    if (this.activeObjectUrl) {
      URL.revokeObjectURL(this.activeObjectUrl);
      this.activeObjectUrl = null;
    }

    this.settings.source = 'url';
    this.settings.type = type;
    this.settings.url = url;
    this.saveSettings();

    this.renderMedia(type, url);
  }

  // Select built-in preset
  setPreset(presetId) {
    const preset = WALLPAPER_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    if (this.activeObjectUrl) {
      URL.revokeObjectURL(this.activeObjectUrl);
      this.activeObjectUrl = null;
    }

    this.settings.source = 'preset';
    this.settings.type = preset.type;
    this.settings.url = preset.url || '';
    this.saveSettings();

    this.renderCurrentWallpaper();
  }

  // Update visual filters live (Opacity, Blur, Overlay tint, Glass card blur)
  applyFilters() {
    if (!this.mediaContainer || !this.overlayElement) return;

    const root = document.documentElement;

    // Apply to wallpaper media container
    this.mediaContainer.style.opacity = `${this.settings.opacity / 100}`;
    this.mediaContainer.style.filter = `blur(${this.settings.blur}px)`;

    // Apply overlay dimming
    const darknessAlpha = this.settings.overlayDarkness / 100;
    this.overlayElement.style.backgroundColor = `rgba(10, 18, 38, ${darknessAlpha})`;

    // Apply glass card styling to CSS variables
    root.style.setProperty('--glass-blur', `${this.settings.glassBlur}px`);
    root.style.setProperty('--glass-opacity', `${this.settings.glassOpacity / 100}`);
  }

  setOpacity(val) {
    this.settings.opacity = Math.max(0, Math.min(100, Number(val)));
    this.applyFilters();
    this.saveSettings();
  }

  setBlur(val) {
    this.settings.blur = Math.max(0, Math.min(30, Number(val)));
    this.applyFilters();
    this.saveSettings();
  }

  setOverlayDarkness(val) {
    this.settings.overlayDarkness = Math.max(0, Math.min(95, Number(val)));
    this.applyFilters();
    this.saveSettings();
  }

  setGlassBlur(val) {
    this.settings.glassBlur = Math.max(0, Math.min(40, Number(val)));
    this.applyFilters();
    this.saveSettings();
  }

  setGlassOpacity(val) {
    this.settings.glassOpacity = Math.max(10, Math.min(100, Number(val)));
    this.applyFilters();
    this.saveSettings();
  }

  clearMediaContainer() {
    this.stopCanvasAnimation();
    if (this.mediaContainer) {
      this.mediaContainer.innerHTML = '';
    }
  }

  stopCanvasAnimation() {
    if (this.canvasAnimationId) {
      cancelAnimationFrame(this.canvasAnimationId);
      this.canvasAnimationId = null;
    }
    this.canvas = null;
  }

  saveSettings() {
    storage.setJSON(this.storageKey, this.settings);
  }

  getSettings() {
    return { ...this.settings };
  }
}

export const wallpaperManager = new WallpaperManager();
