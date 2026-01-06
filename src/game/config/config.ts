export const GAME = {
  tileW: 82,
  tileH: 42,
  cols: 240, // ✅ Повертаю назад
  rows: 240,
} as const;

export const clamp = (v: number, a: number, b: number) =>
  Math.max(a, Math.min(b, v));
