// src/game/config/tiles.ts

export type TileType = "floor" | "wall" | "grass" | "water" | "stone";

export interface TileConfig {
  id: string;
  type: TileType;
  walkable: boolean; // чи можна пройти через тайл
  color: number; // колір для відображення (використовується як fallback)
  name: string; // назва для UI
  imageUrl?: string; // ✅ Шлях до зображення тайла (опціонально)
  scale?: number | { x: number; y: number }; // ✅ Масштабування тайла (опціонально, за замовчуванням 1)
}

export const TILE_CONFIGS: TileConfig[] = [
  {
    id: "floor",
    type: "floor",
    walkable: true,
    color: 0xf2f2f2,
    name: "Підлога",
    // imageUrl: "/sprites/tiles/floor.png", // ✅ Розкоментуйте та вкажіть шлях до зображення
  },
  {
    id: "wall",
    type: "wall",
    walkable: false,
    color: 0x111111,
    name: "Стіна",
    // imageUrl: "/sprites/tiles/wall.png",
  },
  {
    id: "grass",
    type: "grass",
    walkable: true,
    color: 0x4a7c59,
    name: "Трава",
    imageUrl: "/tiles/grass.png",
    scale: 1.15, // ✅ Приклад масштабування (можна вказати { x: 1.2, y: 1.2 })
  },
  {
    id: "water",
    type: "water",
    walkable: false,
    color: 0x3a5f8f,
    name: "Вода",
    // imageUrl: "/sprites/tiles/water.png",
  },
  {
    id: "stone",
    type: "stone",
    walkable: true,
    color: 0x888888,
    name: "Камінь",
    // imageUrl: "/sprites/tiles/stone.png",
  },
];

export const TILES_BY_ID = new Map<string, TileConfig>(
  TILE_CONFIGS.map((t) => [t.id, t])
);
