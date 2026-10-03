import type { Note } from '@/lib/db';

// World units: one invisible grid cell is CELL px square; a note sits centred in it.
export const CELL = 280;
export const NOTE_SIZE = 224;

// Cells under the handwritten title in the middle of the board. Nothing can be pinned here.
export const TITLE = { minCol: -2, maxCol: 1, minRow: -1, maxRow: 0 };

export const cellKey = (col: number, row: number) => `${col},${row}`;

export const isReserved = (col: number, row: number) =>
  col >= TITLE.minCol && col <= TITLE.maxCol && row >= TITLE.minRow && row <= TITLE.maxRow;

// Top-left world position of a note inside its cell.
export const cellOrigin = (col: number, row: number) => ({
  left: col * CELL + (CELL - NOTE_SIZE) / 2,
  top: row * CELL + (CELL - NOTE_SIZE) / 2,
});

// Wider than tall, so auto-placed notes spread out like a landscape screen.
const ASPECT = 1.6;

// Every cell, nearest first, around a focus point given in cell units.
export function* cellsByDistance(fx: number, fy: number): Generator<[number, number]> {
  let done = -1;
  for (let radius = 3; ; radius *= 2) {
    const batch: { col: number; row: number; d: number; a: number }[] = [];
    for (let col = Math.floor(fx - radius * ASPECT) - 1; col <= Math.ceil(fx + radius * ASPECT) + 1; col++) {
      for (let row = Math.floor(fy - radius) - 1; row <= Math.ceil(fy + radius) + 1; row++) {
        const dx = col + 0.5 - fx;
        const dy = row + 0.5 - fy;
        const d = Math.hypot(dx / ASPECT, dy);
        if (d > done && d <= radius) batch.push({ col, row, d, a: Math.atan2(dy, dx) });
      }
    }
    batch.sort((p, q) => p.d - q.d || p.a - q.a);
    for (const cell of batch) yield [cell.col, cell.row];
    done = radius;
  }
}

export const nearestFreeCell = (fx: number, fy: number, occupied: Set<string>): [number, number] => {
  for (const [col, row] of cellsByDistance(fx, fy)) {
    if (!isReserved(col, row) && !occupied.has(cellKey(col, row))) return [col, row];
  }
  throw new Error('unreachable');
};

export interface PlacedNote {
  note: Note;
  col: number;
  row: number;
  key: string;
  rotate: number;
  dx: number;
  dy: number;
}

const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

// A little hand-placed wobble, stable for each note.
const wobble = (seed: string) => {
  const h = hash(seed);
  const unit = (shift: number) => ((h >>> shift) % 1000) / 1000 - 0.5;
  return { rotate: unit(0) * 7, dx: unit(10) * 14, dy: unit(20) * 14 };
};

// Notes arrive oldest first. Each keeps the cell it was pinned to; older notes
// (saved before the grid existed) or collisions are laid out around the title.
export const layoutNotes = (notes: Note[]): PlacedNote[] => {
  const occupied = new Set<string>();
  const cells = new Map<Note, [number, number]>();
  const unplaced: Note[] = [];

  for (const note of notes) {
    const { x, y } = note;
    if (Number.isInteger(x) && Number.isInteger(y) && !isReserved(x, y) && !occupied.has(cellKey(x, y))) {
      occupied.add(cellKey(x, y));
      cells.set(note, [x, y]);
    } else {
      unplaced.push(note);
    }
  }

  if (unplaced.length) {
    const around = cellsByDistance(0, 0);
    for (const note of unplaced) {
      for (;;) {
        const [col, row] = around.next().value as [number, number];
        if (!isReserved(col, row) && !occupied.has(cellKey(col, row))) {
          occupied.add(cellKey(col, row));
          cells.set(note, [col, row]);
          break;
        }
      }
    }
  }

  return notes.map((note) => {
    const [col, row] = cells.get(note)!;
    return { note, col, row, key: cellKey(col, row), ...wobble(note.text + note.timestamp) };
  });
};
