# SpeedRubik Timer 🧊⏱️

A modern, high-precision Rubik's Cube Solution & Speedcubing Timer web application built with glassmorphic design, dynamic wallpapers (image, video, GIF), customizable HTML color palettes, and official WCA scrambles.

---

## 🎨 Theme & Color Style

The application defaults to the specified aesthetic blue palette:

```css
:root {
  --color-1: #EAF1FB; /* Surface Highlights & Bright Text */
  --color-2: #B7CFF0; /* Soft Sky Blue & Borders */
  --color-3: #6E9DE0; /* Vibrant Cerulean Accent */
  --color-4: #2F66C1; /* Royal Blue Primary Buttons & Badges */
  --color-5: #173A75; /* Deep Midnight Navy Background Base */
}
```

### 🌈 Full HTML Color Customizer
- **Native HTML Color Pickers (`<input type="color">`)**: Modify `--color-1` through `--color-5` independently with real-time live preview across the entire application.
- **HEX Input**: Direct hex code entry with instant update.
- **Curated Theme Presets**:
  - **Azure Core (Default)**: `#EAF1FB` - `#173A75`
  - **Cyberpunk 2077**: Electric Cyan & Hot Magenta
  - **Emerald Speed**: Mint & Forest Jade
  - **Sunset Horizon**: Amber Coral & Crimson Dusk
  - **Midnight Amethyst**: Deep Purple & Violet
  - **Carbon AMOLED**: Pitch Dark Minimalist
- **Reset Button**: One-click restore to the original Azure palette.
- **Import & Export**: Save and load custom themes as JSON.

---

## 🖼️ Dynamic Wallpaper System (Image, Video, GIF)

Transform the solving atmosphere with flexible wallpaper options:

1. **Local File Upload**:
   - Drag & drop or select local files: **Images** (`.png`, `.jpg`, `.webp`), **Animated GIFs** (`.gif`), or **Videos** (`.mp4`, `.webm`).
   - Stored reliably in browser **IndexedDB** — large videos and GIFs persist across restarts without hitting localStorage 5MB limits.
2. **Web URL Input**:
   - Paste direct URLs to online wallpapers, gifs, or looping background videos.
3. **Built-in Presets**:
   - **Interactive 3D Floating Cubes Canvas**: Real-time particle canvas with floating isometric Rubik's cubes responding to mouse movement.
   - **Harmonic Theme Gradient**: Smooth animated CSS mesh gradient derived from your active palette.
   - **Lo-Fi Speedcube Study**: Aesthetic atmospheric study aesthetic.
   - **Cyberpunk Grid**: Electric grid lines.
   - **Cosmic Nebula**: Deep space constellation.
   - **Minimalist Slate**: Pure distraction-free dark background.

---

## 🎯 Background Positioning & Framing

Easily pan, zoom, and frame any wallpaper or video:
- **9-Point Visual Alignment Grid**: Instant 1-click anchors (`Top-Left`, `Top`, `Top-Right`, `Left`, `Center`, `Right`, `Bottom-Left`, `Bottom`, `Bottom-Right`).
- **Horizontal Position (X) Slider**: 0% to 100% fine panning.
- **Vertical Position (Y) Slider**: 0% to 100% fine panning.
- **Wallpaper Zoom / Scale Slider**: 50% to 250% scaling.
- **Display Fit Modes**:
  - `Cover`: Fill entire viewport (crops edges).
  - `Contain`: Fit full image without clipping.
  - `Fill`: Stretch to viewport.
- **Reset Button**: Restores original center framing (50%, 50%, 100% scale).

---

## 🪟 Block Transparency & Glassmorphism

Customize the transparency / opacity of individual UI cards or all cards together:
- **Direct Header Shortcut**: Click the `🪟 Transparency` button in the top navigation.
- **Master Global Cards Slider**: Adjust opacity across all panels simultaneously (0% = crystal see-through, 100% = solid).
- **Individual Block Sliders**:
  - ⏱️ **Timer & Solve Complete Area**: Control central timer pad transparency.
  - 📜 **Solve History Sidebar**: Control solve list and session panel transparency.
  - 🧩 **Scramble & Net Bar**: Control top scramble and 2D net bar transparency.
  - 📊 **Stats Summary Bar**: Control bottom statistics bar transparency.
  - 🧭 **Top Header Navigation**: Control top navbar transparency.
  - 🔲 **Card Border Visibility**: Adjust glass border lines intensity (0% to 80%).
  - ❄️ **Card Glass Blur**: Adjust frosted glass backdrop filter (0px to 32px).
- **Quick Transparency Presets**:
  - **👻 Pure Crystal Ghost (15%)**: Ultra see-through, perfect for viewing animated video and gif wallpapers.
  - **💎 Balanced Glass (60%)**: Default optimal glass aesthetic.
  - **⬛ High Contrast Solid (90%)**: High contrast for competitive zero-bleed solving.

---

## ⏱️ Professional Speedcubing Timer Features

- **Millisecond Precision**: Driven by `performance.now()` with 2-decimal (`0.00`) or 3-decimal (`0.000`) options.
- **Hold-to-Ready State Machine**:
  - Hold `Spacebar` (desktop) or touch pad (mobile).
  - Digits turn **Amber / Orange** (`HOLDING`).
  - Digits turn **Emerald Green** with chime after 300ms (`READY`).
  - Release to start the timer (`RUNNING`).
  - Tap any key or touch screen to stop (`STOPPED`).
- **WCA 15-Second Inspection Mode**:
  - Official countdown with synthesized audio cues at **8 seconds** and **12 seconds**.
  - Automatic `+2` penalty if started between 15s and 17s.
  - Automatic `DNF` if started past 17s.
- **Zen Mode (Distraction-Free)**:
  - Fades out header, scramble bar, and solve sidebar during a solve.
  - Option to hide running numbers (`"Solving..."`) to reduce timer anxiety.
- **Live 2D Unfolded Cube Scramble Net**:
  - Interactive HTML5 canvas rendering the 6 faces (`U, L, F, R, B, D`) with standard WCA colors (White, Orange, Green, Red, Blue, Yellow).
  - Visual verification before solving.
- **WCA Scramble Generator**:
  - 3x3x3 (Full WCA move filtering with axis cancellation prevention).
  - 2x2x2, 4x4x4, Pyraminx, Skewb.
- **Comprehensive Session & Solve Statistics**:
  - Single Best, Single Worst, Session Mean, Total Solves count.
  - **Ao5 (Average of 5)**: WCA standard (removes fastest and slowest, averages middle 3).
  - **Ao12 (Average of 12)**: Best Ao12 and Current Ao12.
  - Solves management with `+2`, `DNF`, and Delete actions.
  - Multiple sessions support (create custom sessions, switch, or clear).
  - **Export to CSV**: Download complete solve history.
- **Zero-Asset Web Audio API Sound Synthesizer**:
  - Inspection warning tones, ready chime, mechanical stop clicks, and new Personal Best celebration fanfare.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Space` (Hold & Release) | Start Timer (turns green when ready) |
| `Any Key` / `Space` | Stop Running Timer |
| `Esc` | Stop Timer / Close Open Dialogs |
| `Alt + N` | Generate Next Scramble |
| `Alt + Z` | Toggle Zen Mode |
| `Alt + 2` | Toggle +2 Penalty on Latest Solve |
| `Alt + D` | Toggle DNF on Latest Solve |

---

## 🚀 Running the Project

1. **Option 1: Direct File Open**
   - Simply double-click `index.html` in your favorite web browser (Chrome, Edge, Firefox, Brave, Safari).
2. **Option 2: Local Server Launcher**
   - Double-click `run_server.bat` in the project folder to start a local Python HTTP server on `http://localhost:8000` and open your browser automatically.
