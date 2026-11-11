/**
 * cubeVisualizer.js
 * Renders a crisp 2D unfolded Rubik's Cube net on an HTML5 canvas
 * Layout:
 *        [ U ]
 *  [ L ] [ F ] [ R ] [ B ]
 *        [ D ]
 */

import { WCA_COLORS, CubeState } from './scramble.js';

export class CubeVisualizer {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement ? canvasElement.getContext('2d') : null;
    this.cubeState = new CubeState();
  }

  setCanvas(canvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement ? canvasElement.getContext('2d') : null;
  }

  // Update scramble and redraw
  update(scrambleStr) {
    this.cubeState.applyScramble(scrambleStr);
    this.draw();
  }

  draw() {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const canvas = this.canvas;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Grid coordinates:
    // Net is 4 faces wide, 3 faces high
    // Total sticker width: 4 * 3 = 12 stickers wide
    // Total sticker height: 3 * 3 = 9 stickers high
    const padding = 12;
    const availableW = width - padding * 2;
    const availableH = height - padding * 2;

    const stickerSize = Math.floor(Math.min(availableW / 12, availableH / 9));
    const faceSize = stickerSize * 3;
    const gap = 1.5;

    // Center the entire net
    const startX = Math.floor((width - (faceSize * 4 + gap * 4)) / 2);
    const startY = Math.floor((height - (faceSize * 3 + gap * 3)) / 2);

    // Positions of the 6 faces in (col, row) face coordinates
    const faceOffsets = {
      U: { col: 1, row: 0 },
      L: { col: 0, row: 1 },
      F: { col: 1, row: 1 },
      R: { col: 2, row: 1 },
      B: { col: 3, row: 1 },
      D: { col: 1, row: 2 },
    };

    const drawFace = (faceKey, col, row) => {
      const faceX = startX + col * (faceSize + gap * 2);
      const faceY = startY + row * (faceSize + gap * 2);

      // Face background border
      ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
      ctx.beginPath();
      ctx.roundRect(faceX - 2, faceY - 2, faceSize + 4, faceSize + 4, 4);
      ctx.fill();

      const stickers = this.cubeState.faces[faceKey];

      for (let i = 0; i < 9; i++) {
        const sRow = Math.floor(i / 3);
        const sCol = i % 3;
        const sx = faceX + sCol * stickerSize;
        const sy = faceY + sRow * stickerSize;

        const colorCode = stickers[i];
        const hexColor = WCA_COLORS[colorCode] || '#CCCCCC';

        // Sticker body
        ctx.fillStyle = hexColor;
        ctx.beginPath();
        ctx.roundRect(sx + gap, sy + gap, stickerSize - gap * 2, stickerSize - gap * 2, 2.5);
        ctx.fill();

        // Subtle sticker shine / border
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };

    // Draw all 6 faces
    for (const [faceKey, pos] of Object.entries(faceOffsets)) {
      drawFace(faceKey, pos.col, pos.row);
    }
  }
}
