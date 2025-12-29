// src/game/scenes/IsoScene.ts
import Phaser from "phaser";
import { Grid } from "../world/Grid";
import { TileRenderer } from "../world/TileRenderer";
import { preloadSprites } from "../assets/AnimRegistry";
import { IsoCharacter } from "../entities/IsoCharacter";
import { PlayerController } from "../controllers/PlayerController";
import { IsoTransform } from "../iso/isoTransofrm";
import { GAME } from "../config/config";
import { TileEditor } from "../ui/TileEditor";
import { TILE_CONFIGS } from "../config/tiles";

export class IsoScene extends Phaser.Scene {
  private iso!: IsoTransform;
  private grid!: Grid;
  private tiles!: TileRenderer;
  public tileEditor!: TileEditor; // ✅ Редактор тайлів (публічний для доступу з React)

  private player!: IsoCharacter;
  private controller!: PlayerController;

  constructor() {
    super("IsoScene");
  }

  preload() {
    preloadSprites(this);

    // ✅ Завантажуємо зображення для тайлів, якщо вони вказані
    for (const tileConfig of TILE_CONFIGS) {
      if (tileConfig.imageUrl) {
        const key = `tile-${tileConfig.id}`;
        this.load.image(key, tileConfig.imageUrl);
      }
    }
  }

  create() {
    this.cameras.main.setBackgroundColor("#0b0b0f");

    this.iso = new IsoTransform(GAME.tileW, GAME.tileH, GAME.cols, GAME.rows);
    this.iso.recalcOrigin(this.scale.width, this.scale.height);

    this.grid = new Grid(GAME.cols, GAME.rows);
    // ✅ Не встановлюємо демо-стіни, щоб не конфліктувати з редактором

    this.tiles = new TileRenderer(this, this.grid, this.iso);
    this.tiles.create();

    // ✅ Створюємо редактор тайлів
    this.tileEditor = new TileEditor(this, this.grid, this.iso, this.tiles);
    this.tileEditor.create();
    this.tileEditor.loadTiles(); // ✅ Завантажуємо збережені тайли

    // ✅ Якщо тайлів немає, встановлюємо демо-стіни тільки для демонстрації
    if (this.grid.getTilesData().length === 0) {
      this.grid.setDemoWalls();
      this.tiles.redraw();
    }

    this.player = new IsoCharacter(this, this.iso, "hero", { x: 3, y: 8 });
    this.controller = new PlayerController(
      this,
      this.grid,
      this.iso,
      this.player,
      this.tileEditor // ✅ Передаємо редактор для перевірки режиму
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
