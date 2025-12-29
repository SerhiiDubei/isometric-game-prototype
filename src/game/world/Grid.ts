// src/game/world/Grid.ts

import type { GridPoint } from "../types/grid-types";
import type { TileConfig } from "../config/tiles";

export class Grid {
  private blocked: Uint8Array;
  private tileTypes: Map<number, string> = new Map(); // ✅ Зберігаємо типи тайлів

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

  // ✅ Отримати тип тайла
  getTileType(p: GridPoint): string | null {
    const idx = this.idx(p);
    return this.tileTypes.get(idx) || null;
  }

  // ✅ Встановити тип тайла
  setTileType(p: GridPoint, tileId: string | null, tileConfig: TileConfig) {
    const idx = this.idx(p);
    if (tileId) {
      this.tileTypes.set(idx, tileId);
      this.setBlocked(p, !tileConfig.walkable);
    } else {
      this.tileTypes.delete(idx);
      this.setBlocked(p, false);
    }
  }

  // ✅ Отримати всі тайли для збереження
  getTilesData(): Array<{ x: number; y: number; tileId: string }> {
    const tiles: Array<{ x: number; y: number; tileId: string }> = [];
    for (const [idx, tileId] of this.tileTypes.entries()) {
      const x = idx % this.cols;
      const y = Math.floor(idx / this.cols);
      tiles.push({ x, y, tileId });
    }
    return tiles;
  }

  // ✅ Завантажити тайли з даних
  loadTilesData(
    tiles: Array<{ x: number; y: number; tileId: string }>,
    getTileConfig: (tileId: string) => TileConfig | undefined
  ) {
    // ✅ Спочатку очищаємо всі тайли та блокування
    this.tileTypes.clear();
    this.blocked.fill(0); // ✅ Очищаємо всі блокування - всі місця стають прохідними

    // ✅ Завантажуємо тайли та встановлюємо блокування на основі walkable
    for (const tile of tiles) {
      const p: GridPoint = { x: tile.x, y: tile.y };
      if (this.inBounds(p)) {
        const tileConfig = getTileConfig(tile.tileId);
        if (tileConfig) {
          // ✅ Встановлюємо тайл та блокування на основі walkable
          this.setTileType(p, tile.tileId, tileConfig);
        }
      }
    }
  }

  // ✅ Очистити всі блокування (зробити всі місця прохідними)
  clearAllBlocked() {
    this.blocked.fill(0);
  }

  // демо
  setDemoWalls() {
    for (let x = 9; x < 16; x++) this.setBlocked({ x, y: 6 }, true);
    for (let y = 7; y < 10; y++) this.setBlocked({ x: 15, y }, true);
  }
}
