/**
 * scramble.js
 * WCA Standard Scramble Generator & 3x3 Cube State Simulator
 * Supports:
 * - 3x3x3 (Full WCA rules: 20-22 moves, opposite-axis cancellation prevention)
 * - 2x2x2 (Fixed orientation U, R, F)
 * - 4x4x4 (Wide turns Uw, Rw, Fw, etc.)
 * - Pyraminx (Body turns + randomized corner tips)
 * - Skewb (Corner rotations)
 * Also simulates 3x3 cube permutation to feed the 2D Net Visualizer.
 */

export const WCA_COLORS = {
  U: '#FFFFFF', // White (Top)
  L: '#FFA500', // Orange (Left)
  F: '#00D053', // Green (Front)
  R: '#EE3333', // Red (Right)
  B: '#2563EB', // Blue (Back)
  D: '#FFD700', // Yellow (Bottom)
};

export class ScrambleGenerator {
  constructor() {
    this.currentPuzzle = '333';
    this.currentScramble = '';
  }

  // Generate scramble based on selected puzzle
  generate(puzzle = this.currentPuzzle) {
    this.currentPuzzle = puzzle;
    let scramble = '';

    switch (puzzle) {
      case '222':
        scramble = this.generate2x2();
        break;
      case '444':
        scramble = this.generate4x4();
        break;
      case 'pyram':
        scramble = this.generatePyraminx();
        break;
      case 'skewb':
        scramble = this.generateSkewb();
        break;
      case '333':
      default:
        scramble = this.generate3x3(21);
        break;
    }

    this.currentScramble = scramble;
    return scramble;
  }

  // WCA 3x3 Generator with parallel-axis redundancy prevention
  generate3x3(length = 21) {
    const faces = ['U', 'D', 'L', 'R', 'F', 'B'];
    // Axis groupings: U/D = 0, L/R = 1, F/B = 2
    const axis = [0, 0, 1, 1, 2, 2];
    const modifiers = ['', "'", '2'];

    const moves = [];
    let lastFace = -1;
    let secondLastFace = -1;

    for (let i = 0; i < length; i++) {
      let face;
      while (true) {
        face = Math.floor(Math.random() * faces.length);

        // Cannot move same face twice in a row
        if (face === lastFace) continue;

        // Cannot have sandwich cancellation on same axis (e.g. R L R or U D U)
        if (secondLastFace !== -1) {
          if (axis[face] === axis[lastFace] && axis[face] === axis[secondLastFace]) {
            continue;
          }
        }

        break;
      }

      const mod = modifiers[Math.floor(Math.random() * modifiers.length)];
      moves.push(faces[face] + mod);

      secondLastFace = lastFace;
      lastFace = face;
    }

    return moves.join(' ');
  }

  // 2x2: Standard U, R, F faces only
  generate2x2(length = 10) {
    const faces = ['U', 'R', 'F'];
    const modifiers = ['', "'", '2'];
    const moves = [];
    let lastFace = -1;

    for (let i = 0; i < length; i++) {
      let face;
      do {
        face = Math.floor(Math.random() * faces.length);
      } while (face === lastFace);

      const mod = modifiers[Math.floor(Math.random() * modifiers.length)];
      moves.push(faces[face] + mod);
      lastFace = face;
    }

    return moves.join(' ');
  }

  // 4x4: Outer & wide turns
  generate4x4(length = 40) {
    const faces = ['U', 'D', 'L', 'R', 'F', 'B', 'Uw', 'Dw', 'Lw', 'Rw', 'Fw', 'Bw'];
    const modifiers = ['', "'", '2'];
    const moves = [];
    let lastFace = '';

    for (let i = 0; i < length; i++) {
      let move;
      do {
        const f = faces[Math.floor(Math.random() * faces.length)];
        const m = modifiers[Math.floor(Math.random() * modifiers.length)];
        move = f + m;
      } while (lastFace && move[0] === lastFace[0] && (move[1] === 'w' || lastFace[1] === 'w'));

      moves.push(move);
      lastFace = move;
    }

    return moves.join(' ');
  }

  // Pyraminx: Body turns + corner tips
  generatePyraminx() {
    const bodyMoves = ['U', 'L', 'R', 'B'];
    const tips = ['u', 'l', 'r', 'b'];
    const modifiers = ['', "'"];

    const moves = [];
    let last = -1;
    const bodyLength = 10;

    for (let i = 0; i < bodyLength; i++) {
      let f;
      do {
        f = Math.floor(Math.random() * bodyMoves.length);
      } while (f === last);

      moves.push(bodyMoves[f] + modifiers[Math.floor(Math.random() * 2)]);
      last = f;
    }

    // Add random tip rotations
    tips.forEach(t => {
      const roll = Math.random();
      if (roll < 0.6) {
        moves.push(t + modifiers[Math.floor(Math.random() * 2)]);
      }
    });

    return moves.join(' ');
  }

  // Skewb
  generateSkewb(length = 10) {
    const faces = ['U', 'L', 'R', 'B'];
    const modifiers = ['', "'"];
    const moves = [];
    let last = -1;

    for (let i = 0; i < length; i++) {
      let f;
      do {
        f = Math.floor(Math.random() * faces.length);
      } while (f === last);

      moves.push(faces[f] + modifiers[Math.floor(Math.random() * 2)]);
      last = f;
    }

    return moves.join(' ');
  }
}

/**
 * CubeState: Simulates the 3x3 Rubik's cube sticker permutations
 * for rendering the 2D net.
 */
export class CubeState {
  constructor() {
    this.reset();
  }

  reset() {
    // 6 faces: U (White), L (Orange), F (Green), R (Red), B (Blue), D (Yellow)
    // Each face has a 3x3 grid (9 stickers)
    this.faces = {
      U: Array(9).fill('U'),
      L: Array(9).fill('L'),
      F: Array(9).fill('F'),
      R: Array(9).fill('R'),
      B: Array(9).fill('B'),
      D: Array(9).fill('D'),
    };
  }

  // Rotate a 3x3 face clockwise
  rotateFaceCW(face) {
    const old = [...this.faces[face]];
    // Corners
    this.faces[face][0] = old[6];
    this.faces[face][2] = old[0];
    this.faces[face][8] = old[2];
    this.faces[face][6] = old[8];
    // Edges
    this.faces[face][1] = old[3];
    this.faces[face][5] = old[1];
    this.faces[face][7] = old[5];
    this.faces[face][3] = old[7];
  }

  // Rotate a 3x3 face counterclockwise
  rotateFaceCCW(face) {
    this.rotateFaceCW(face);
    this.rotateFaceCW(face);
    this.rotateFaceCW(face);
  }

  // Apply single move string like "R", "U'", "F2"
  applyMove(moveStr) {
    if (!moveStr) return;
    const face = moveStr[0];
    const isDouble = moveStr.includes('2');
    const isPrime = moveStr.includes("'");

    const times = isDouble ? 2 : (isPrime ? 3 : 1);

    for (let t = 0; t < times; t++) {
      this.applySingleMove(face);
    }
  }

  applySingleMove(face) {
    this.rotateFaceCW(face);

    // Cycle adjacent ring stickers
    const U = this.faces.U;
    const L = this.faces.L;
    const F = this.faces.F;
    const R = this.faces.R;
    const B = this.faces.B;
    const D = this.faces.D;

    if (face === 'U') {
      const temp = [F[0], F[1], F[2]];
      F[0] = R[0]; F[1] = R[1]; F[2] = R[2];
      R[0] = B[0]; R[1] = B[1]; R[2] = B[2];
      B[0] = L[0]; B[1] = L[1]; B[2] = L[2];
      L[0] = temp[0]; L[1] = temp[1]; L[2] = temp[2];
    } else if (face === 'D') {
      const temp = [F[6], F[7], F[8]];
      F[6] = L[6]; F[7] = L[7]; F[8] = L[8];
      L[6] = B[6]; L[7] = B[7]; L[8] = B[8];
      B[6] = R[6]; B[7] = R[7]; B[8] = R[8];
      R[6] = temp[0]; R[7] = temp[1]; R[8] = temp[2];
    } else if (face === 'F') {
      const temp = [U[6], U[7], U[8]];
      U[6] = L[8]; U[7] = L[5]; U[8] = L[2];
      L[2] = D[0]; L[5] = D[1]; L[8] = D[2];
      D[0] = R[6]; D[1] = R[3]; D[2] = R[0];
      R[0] = temp[0]; R[3] = temp[1]; R[6] = temp[2];
    } else if (face === 'B') {
      const temp = [U[0], U[1], U[2]];
      U[0] = R[2]; U[1] = R[5]; U[2] = R[8];
      R[2] = D[8]; R[5] = D[7]; R[8] = D[6];
      D[6] = L[0]; D[7] = L[3]; D[8] = L[6];
      L[0] = temp[2]; L[3] = temp[1]; L[6] = temp[0];
    } else if (face === 'L') {
      const temp = [U[0], U[3], U[6]];
      U[0] = B[8]; U[3] = B[5]; U[6] = B[2];
      B[2] = D[6]; B[5] = D[3]; B[8] = D[0];
      D[0] = F[0]; D[3] = F[3]; D[6] = F[6];
      F[0] = temp[0]; F[3] = temp[1]; F[6] = temp[2];
    } else if (face === 'R') {
      const temp = [U[2], U[5], U[8]];
      U[2] = F[2]; U[5] = F[5]; U[8] = F[8];
      F[2] = D[2]; F[5] = D[5]; F[8] = D[8];
      D[2] = B[6]; D[5] = B[3]; D[8] = B[0];
      B[0] = temp[2]; B[3] = temp[1]; B[6] = temp[0];
    }
  }

  // Apply an entire scramble sequence
  applyScramble(scrambleString) {
    this.reset();
    if (!scrambleString) return;
    const tokens = scrambleString.trim().split(/\s+/);
    tokens.forEach(move => this.applyMove(move));
  }
}

export const scrambler = new ScrambleGenerator();
