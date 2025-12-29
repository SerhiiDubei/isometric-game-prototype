// src/game/world/TileRenderer.ts
import Phaser from "phaser";
import { Grid } from "./Grid";
import type { IsoTransform } from "../iso/isoTransofrm";
import type { GridPoint } from "../types/grid-types";

export class TileRenderer {
  private floorKey = "tile-floor";
  private wallKey = "tile-wall";
  private layer!: Phaser.GameObjects.Container;

  public scene: Phaser.Scene;
  public grid: Grid;
  public iso: IsoTransform;

  constructor(scene: Phaser.Scene, grid: Grid, iso: IsoTransform) {
    this.scene = scene;
    this.grid = grid;
    this.iso = iso;
  }

  create() {
    this.createTileTextures();
    this.layer = this.scene.add.container(0, 0);
    this.redraw();
  }

  redraw() {
    this.layer.removeAll(true);

    for (let y = 0; y < this.grid.rows; y++) {
      for (let x = 0; x < this.grid.cols; x++) {
        const p: GridPoint = { x, y };
        const { x: sx, y: sy } = this.iso.cellToScreen(p);
        const key = this.grid.isBlocked(p) ? this.wallKey : this.floorKey;
        const spr = this.scene.add.image(sx, sy, key).setOrigin(0.5, 0.5);
        this.layer.add(spr);
      }
    }
  }

  private createTileTextures() {
    const { tileW: W, tileH: H } = this.iso;

    if (!this.scene.textures.exists(this.floorKey)) {
      const g1 = this.scene.add.graphics();
      g1.fillStyle(0xf2f2f2, 1);
      g1.lineStyle(1, 0x000000, 0.15);
      g1.beginPath();
      g1.moveTo(W / 2, 0);
      g1.lineTo(W, H / 2);
      g1.lineTo(W / 2, H);
      g1.lineTo(0, H / 2);
      g1.closePath();
      g1.fillPath();
      g1.strokePath();
      g1.generateTexture(this.floorKey, W + 2, H + 2);
      g1.destroy();
    }

    if (!this.scene.textures.exists(this.wallKey)) {
      const g2 = this.scene.add.graphics();
      g2.fillStyle(0x111111, 1);
      g2.beginPath();
      g2.moveTo(W / 2, 0);
      g2.lineTo(W, H / 2);
      g2.lineTo(W / 2, H);
      g2.lineTo(0, H / 2);
      g2.closePath();
      g2.fillPath();
      g2.generateTexture(this.wallKey, W + 2, H + 2);
      g2.destroy();
    }
  }
}
