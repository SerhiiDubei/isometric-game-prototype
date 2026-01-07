// src/game/config/tiles.ts

export type TileType =
  | "floor"
  | "wall"
  | "water"
  | "stone"
  | "forest"
  | "barrel"
  | "dirt_tiles"
  | "dirt"
  | "stonewall_n"
  | "stonewall_e"
  | "stonewall_s"
  | "stonewall_w";

import { GAME } from "./config";

export interface TileConfig {
  id: string;
  type: TileType;
  walkable: boolean; // чи можна пройти через тайл
  color: number; // колір для відображення (використовується як fallback)
  name: string; // назва для UI
  imageUrl?: string; // ✅ Шлях до зображення тайла (опціонально)
  scale?: number | { x: number; y: number }; // ✅ Масштабування тайла (опціонально, за замовчуванням 1)
  gridSize?: { width: number; height: number }; // ✅ Розмір тайла в клітинках сітки (за замовчуванням 1x1)
  offset?: { x: number; y: number }; // ✅ Зміщення позиції тайла (опціонально)
  // ✅ Підтримка Tiny Swords Tilemap (6 окремих картинок)
  tilemapKey?: string; // Ключ Tilemap (наприклад, 'tilemap_color1')
  tilemapIndex?: number; // Індекс картинки (0-5 для 6 картинок)
  // Для сумісності зі старим кодом:
  tilemapRow?: number; // Рядок тайла в Tilemap (0-based) - застаріле
  tilemapCol?: number; // Колонка тайла в Tilemap (0-based) - застаріле
  // ✅ Підтримка Forests tileset (256x128, 18 тайлів)
  forestsTilesetKey?: string; // Ключ tileset (наприклад, 'forests_256x128')
  forestsTileIndex?: number; // Індекс тайла (0-17)
  // ✅ Підтримка прямого ключа текстури (для barrel та інших декорацій)
  directTextureKey?: string; // Прямий ключ текстури
  // ✅ Підтримка DIRT тайлів (ТАК САМО ЯК FOREST!)
  dirtTilesetKey?: string; // Ключ DIRT тайла (наприклад: "dirt_tiles_key")
}

// ✅ Базові параметри для стін Kenney (stoneWall*.png)
const WALL_SPRITE_SIZE = { width: 256, height: 512 } as const;
const ISO_TILE_SIZE = { width: GAME.tileW, height: GAME.tileH } as const;

function wallBaseScale(gridWidth: number, _gridHeight: number) {
  const baseScaleX =
    (ISO_TILE_SIZE.width * gridWidth) / WALL_SPRITE_SIZE.width;
  const baseScaleY = baseScaleX; // Зберігаємо пропорції (_gridHeight не використовується, але залишаємо для консистентності)
  return { x: baseScaleX, y: baseScaleY };
}

function wallBaseOffset(gridWidth: number, gridHeight: number) {
  const offsetX = 0;
  const offsetY = (ISO_TILE_SIZE.height * gridHeight) / 2;
  return { x: offsetX, y: offsetY };
}

// ✅ Спільні параметри для прямих стін (2×1 - прямокутник)
const TWO_BY_ONE_WALL_SCALE_BASE = wallBaseScale(2, 1);   // ≈ { x: 0.64, y: 0.64 }
// ✅ Збільшуємо всі стіни в 2 рази
const TWO_BY_ONE_WALL_SCALE = {
  x: TWO_BY_ONE_WALL_SCALE_BASE.x * 2,  // ≈ 1.28
  y: TWO_BY_ONE_WALL_SCALE_BASE.y * 2   // ≈ 1.28
};
const TWO_BY_ONE_WALL_OFFSET = wallBaseOffset(2, 1); // { x: 0, y: 21 }

// ✅ Спільні параметри для кутових стін (2×2 - квадрат)
const TWO_BY_TWO_WALL_SCALE_BASE = wallBaseScale(2, 2);   // ≈ { x: 0.64, y: 0.64 }
// ✅ Збільшуємо всі кути в 2 рази
const TWO_BY_TWO_WALL_SCALE = {
  x: TWO_BY_TWO_WALL_SCALE_BASE.x * 2,  // ≈ 1.28
  y: TWO_BY_TWO_WALL_SCALE_BASE.y * 2   // ≈ 1.28
};
const TWO_BY_TWO_WALL_OFFSET = wallBaseOffset(2, 2); // { x: 0, y: 42 }

export const TILE_CONFIGS: TileConfig[] = [
  {
    id: "floor",
    type: "floor",
    walkable: true,
    color: 0xf2f2f2,
    name: "Підлога",
  },
  {
    id: "wall",
    type: "wall",
    walkable: false,
    color: 0x8B4513, // Коричневий колір для стін будинків
    name: "Стіна",
  },
  {
    id: "water",
    type: "water",
    walkable: false,
    color: 0x1E90FF, // Яскравий блакитний для води/ріки
    name: "Вода",
  },
  {
    id: "stone",
    type: "stone",
    walkable: true, // Дорога прохідна!
    color: 0x696969, // Темно-сірий для дороги/бруківки
    name: "Камінь",
  },
  {
    id: "forest",
    type: "forest",
    walkable: true,
    color: 0x228B22, // Зелений колір для лісу
    name: "Ліс",
    forestsTilesetKey: "forests", // Використовуємо окремі файли
    forestsTileIndex: 0, // Не використовується, вибирається випадково
    // ✅ НЕ ВИКОРИСТОВУЄМО scale - розтягнемо через displaySize!
  },
  {
    id: "barrel",
    type: "barrel",
    walkable: false, // Бочка - непрохідна
    color: 0x8B4513,
    name: "Бочка",
    directTextureKey: "barrel", // ✅ Використовуємо прямо barrel (буде оброблений!)
    scale: 0.8,
  },
  {
    id: "dirt_tiles",
    type: "dirt_tiles",
    walkable: true, // Прохідна земля
    color: 0x8B7355,
    name: "Земля (плитки)",
    dirtTilesetKey: "dirt_tiles", // ✅ ТАК САМО ЯК forestsTilesetKey!
    scale: 4, // ✅ Збільшено в 4 рази!
    offset: { x: 0, y: 21 }, // ✅ Трохи підіймаємо (21px)
  },
  {
    id: "dirt",
    type: "dirt_tiles",
    walkable: true, // Прохідна земля
    color: 0x6B5344,
    name: "Земля (брудна)",
    dirtTilesetKey: "dirt", // ✅ ТАК САМО ЯК forestsTilesetKey!
    scale: 4, // ✅ Збільшено в 4 рази!
    offset: { x: 0, y: 21 }, // ✅ Трохи підіймаємо (21px)
  },
  {
    id: "stonewall_n",
    type: "stonewall_n",
    walkable: false,
    color: 0x808080,
    name: "Стіна (північ)",
    directTextureKey: "stonewall_n",
    gridSize: { width: 2, height: 1 }, // Займає 2×1 клітинки (прямокутник)
    scale: TWO_BY_ONE_WALL_SCALE,      // Scale для 2×1
    offset: TWO_BY_ONE_WALL_OFFSET,    // Offset для 2×1
  },
  {
    id: "stonewall_e",
    type: "stonewall_e",
    walkable: false,
    color: 0x888888,
    name: "Стіна (схід)",
    directTextureKey: "stonewall_e",
    gridSize: { width: 2, height: 1 }, // Займає 2×1 клітинки (прямокутник)
    scale: TWO_BY_ONE_WALL_SCALE,
    offset: TWO_BY_ONE_WALL_OFFSET,
  },
  {
    id: "stonewall_s",
    type: "stonewall_s",
    walkable: false,
    color: 0x909090,
    name: "Стіна (південь)",
    directTextureKey: "stonewall_s",
    gridSize: { width: 2, height: 1 }, // Займає 2×1 клітинки (прямокутник)
    scale: TWO_BY_ONE_WALL_SCALE,
    offset: TWO_BY_ONE_WALL_OFFSET,
  },
  {
    id: "stonewall_w",
    type: "stonewall_w",
    walkable: false,
    color: 0x989898,
    name: "Стіна (захід)",
    directTextureKey: "stonewall_w",
    gridSize: { width: 2, height: 1 }, // Займає 2×1 клітинки (прямокутник)
    scale: TWO_BY_ONE_WALL_SCALE,
    offset: TWO_BY_ONE_WALL_OFFSET,
  },
  // ✅ Кутові стіни (Corner) з такими ж параметрами, як і прямі
  {
    id: "stonewall_corner_n",
    type: "stonewall_n",
    walkable: false,
    color: 0xcccccc,
    name: "Стіна (кут північ)",
    directTextureKey: "stonewall_corner_n",
    gridSize: { width: 2, height: 2 },
    scale: TWO_BY_TWO_WALL_SCALE,
    offset: TWO_BY_TWO_WALL_OFFSET,
  },
  {
    id: "stonewall_corner_e",
    type: "stonewall_e",
    walkable: false,
    color: 0xcccccc,
    name: "Стіна (кут схід)",
    directTextureKey: "stonewall_corner_e",
    gridSize: { width: 2, height: 2 },
    scale: TWO_BY_TWO_WALL_SCALE,
    offset: TWO_BY_TWO_WALL_OFFSET,
  },
  {
    id: "stonewall_corner_s",
    type: "stonewall_s",
    walkable: false,
    color: 0xcccccc,
    name: "Стіна (кут південь)",
    directTextureKey: "stonewall_corner_s",
    gridSize: { width: 2, height: 2 },
    scale: TWO_BY_TWO_WALL_SCALE,
    offset: TWO_BY_TWO_WALL_OFFSET,
  },
  {
    id: "stonewall_corner_w",
    type: "stonewall_w",
    walkable: false,
    color: 0xcccccc,
    name: "Стіна (кут захід)",
    directTextureKey: "stonewall_corner_w",
    gridSize: { width: 2, height: 2 },
    scale: TWO_BY_TWO_WALL_SCALE,
    offset: TWO_BY_TWO_WALL_OFFSET,
  },
];

export const TILES_BY_ID = new Map<string, TileConfig>(
  TILE_CONFIGS.map((t) => [t.id, t])
);
