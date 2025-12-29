// src/game/assets/AssetManifest.ts
export const SPRITES = {
  hero: {
    key: "hero",
    url: "/sprites/capguy-walk-1472.png",
    frameW: 184,
    frameH: 325,
    scale: 0.4,
  },
  // додаєш інших:
  // goblin: { key:"goblin", url:"/sprites/goblin.png", frameW:64, frameH:64, scale:1 }
} as const;

export type SpriteId = keyof typeof SPRITES;
