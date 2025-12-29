// src/game/world/Grid.ts

import type { GridPoint } from "../types/grid-types";

export class Grid {
  private blocked: Uint8Array;

  public cols: number;
  public rows: number;

  constructor(cols: number, rows: number) {
    this.cols = cols;
    this.rows = rows;
    this.blocked = new Uint8Array(cols * rows);
  }

  private idx(p: GridPoint) {
    return p.y * this.cols + p.x;
  }

  inBounds(p: GridPoint) {
    return p.x >= 0 && p.y >= 0 && p.x < this.cols && p.y < this.rows;
  }

  isBlocked(p: GridPoint) {
    return this.blocked[this.idx(p)] === 1;
  }

  setBlocked(p: GridPoint, v: boolean) {
    this.blocked[this.idx(p)] = v ? 1 : 0;
  }

  // демо
  setDemoWalls() {
    for (let x = 9; x < 16; x++) this.setBlocked({ x, y: 6 }, true);
    for (let y = 7; y < 10; y++) this.setBlocked({ x: 15, y }, true);
  }
}
