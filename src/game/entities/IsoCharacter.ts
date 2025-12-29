import Phaser from "phaser";
import { SPRITES, type SpriteId } from "../assets/AssetManifest";
import { ensureCharacterAnims } from "../assets/AnimRegistry";
import type { GridPoint } from "../types/grid-types";
import type { IsoTransform } from "../iso/isoTransofrm";

export class IsoCharacter {
  sprite: Phaser.GameObjects.Sprite;
  cell: GridPoint;
  moving = false;

  public scene: Phaser.Scene;
  public iso: IsoTransform;
  public id: SpriteId;

  constructor(
    scene: Phaser.Scene,
    iso: IsoTransform,
    id: SpriteId,
    startCell: GridPoint
  ) {
    this.scene = scene;
    this.iso = iso;
    this.id = id;
    const def = SPRITES[id];
    ensureCharacterAnims(scene, id);

    this.sprite = scene.add.sprite(0, 0, def.key);
    this.sprite.setOrigin(0.5, 0.85);
    this.sprite.setScale(def.scale ?? 1);

    this.cell = startCell;
    this.place(startCell);
    this.playIdle();
  }

  place(cell: GridPoint) {
    const { x, y } = this.iso.cellToScreen(cell);
    this.sprite.setPosition(x, y - 2);
    this.cell = cell;
  }

  playIdle() {
    this.sprite.play(`${SPRITES[this.id].key}-idle`, true);
  }

  playWalk() {
    this.sprite.play(`${SPRITES[this.id].key}-walk`, true);
  }

  async moveTo(cell: GridPoint, duration = 140) {
    if (this.moving) return;
    this.moving = true;
    this.playWalk();

    const { x, y } = this.iso.cellToScreen(cell);
    const targetY = y - 2;

    await new Promise<void>((resolve) => {
      this.scene.tweens.add({
        targets: this.sprite,
        x,
        y: targetY,
        duration,
        ease: "Sine.out",
        onComplete: () => resolve(),
      });
    });

    this.cell = cell;
    this.moving = false;
    this.playIdle();
  }

  destroy() {
    this.sprite.destroy();
  }
}
