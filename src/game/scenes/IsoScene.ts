// src/game/scenes/IsoScene.ts
import Phaser from "phaser";
import { Grid } from "../world/Grid";
import { TileRenderer } from "../world/TileRenderer";
import { preloadSprites } from "../assets/AnimRegistry";
import { IsoCharacter } from "../entities/IsoCharacter";
import { PlayerController } from "../controllers/PlayerController";
import { IsoTransform } from "../iso/isoTransofrm";
import { GAME } from "../config/config";

export class IsoScene extends Phaser.Scene {
  private iso!: IsoTransform;
  private grid!: Grid;
  private tiles!: TileRenderer;

  private player!: IsoCharacter;
  private controller!: PlayerController;

  constructor() {
    super("IsoScene");
  }

  preload() {
    preloadSprites(this);
  }

  create() {
    this.cameras.main.setBackgroundColor("#0b0b0f");

    this.iso = new IsoTransform(GAME.tileW, GAME.tileH, GAME.cols, GAME.rows);
    this.iso.recalcOrigin(this.scale.width, this.scale.height);

    this.grid = new Grid(GAME.cols, GAME.rows);
    this.grid.setDemoWalls();

    this.tiles = new TileRenderer(this, this.grid, this.iso);
    this.tiles.create();

    this.player = new IsoCharacter(this, this.iso, "hero", { x: 3, y: 8 });
    this.controller = new PlayerController(
      this,
      this.grid,
      this.iso,
      this.player
    );

    // камера
    this.cameras.main.centerOn(this.player.sprite.x, this.player.sprite.y);
    this.cameras.main.startFollow(this.player.sprite, true, 0.12, 0.12);

    this.scale.on("resize", () => {
      this.iso.recalcOrigin(this.scale.width, this.scale.height);
      this.tiles.redraw();
      this.player.place(this.player.cell);
      this.cameras.main.centerOn(this.player.sprite.x, this.player.sprite.y);
    });
  }

  update() {
    this.controller.update();
  }
}
