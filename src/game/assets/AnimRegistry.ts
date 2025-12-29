// src/game/assets/AnimRegistry.ts
import Phaser from "phaser";
import { SPRITES, type SpriteId } from "./AssetManifest";

export function preloadSprites(scene: Phaser.Scene) {
  (Object.keys(SPRITES) as SpriteId[]).forEach((id) => {
    const s = SPRITES[id];
    scene.load.spritesheet(s.key, s.url, {
      frameWidth: s.frameW,
      frameHeight: s.frameH,
    });
  });
}

export function ensureCharacterAnims(scene: Phaser.Scene, id: SpriteId) {
  const s = SPRITES[id];
  const idleKey = `${s.key}-idle`;
  const walkKey = `${s.key}-walk`;
  if (scene.anims.exists(idleKey)) return;

  scene.anims.create({
    key: idleKey,
    frames: [{ key: s.key, frame: 0 }],
    frameRate: 1,
    repeat: -1,
  });

  scene.anims.create({
    key: walkKey,
    frames: scene.anims.generateFrameNumbers(s.key, { start: 0, end: 7 }),
    frameRate: 20,
    repeat: -1,
  });
}
