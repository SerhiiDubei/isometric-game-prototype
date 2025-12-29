export const GAME = {
  tileW: 64,
  tileH: 32,
  cols: 240,
  rows: 240,
} as const;

export const clamp = (v: number, a: number, b: number) =>
  Math.max(a, Math.min(b, v));
