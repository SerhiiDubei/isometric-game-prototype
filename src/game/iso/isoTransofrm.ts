import type { GridPoint } from "../types/grid-types";
import { isoToScreen, screenToIso } from "../utils/iso";

export class IsoTransform {
  ox = 0;
  oy = 0;

  public tileW: number;
  tileH: number;
  cols: number;
  rows: number;

  constructor(tileW: number, tileH: number, cols: number, rows: number) {
    this.tileW = tileW;
    this.tileH = tileH;
    this.cols = cols;
    this.rows = rows;
  }

  recalcOrigin(viewW: number, viewH: number) {
    this.ox = viewW / 2 - ((this.cols - this.rows) * this.tileW) / 4;
    this.oy = viewH / 2 - ((this.cols + this.rows) * this.tileH) / 4;
  }

  cellToScreen(p: GridPoint) {
    return isoToScreen(p.x, p.y, this.tileW, this.tileH, this.ox, this.oy);
  }

  screenToCell(x: number, y: number): GridPoint | null {
    const { gx, gy } = screenToIso(
      x,
      y,
      this.tileW,
      this.tileH,
      this.ox,
      this.oy
    );
    const cx = Math.floor(gx + 0.5);
    const cy = Math.floor(gy + 0.5);
    if (cx < 0 || cy < 0 || cx >= this.cols || cy >= this.rows) return null;
    return { x: cx, y: cy };
  }
}
