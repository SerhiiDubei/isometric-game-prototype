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
    scale: 0.7, // ✅ Ще × 2 (0.35 × 2 = 0.7) - займає 2 клітинки
    offset: { x: 0, y: -36 }, // ✅ Offset також × 2
    gridSize: { width: 2, height: 2 }, // ✅ Займає 2×2 клітинки
  },
  {
    id: "stonewall_e",
    type: "stonewall_e",
    walkable: false,
    color: 0x888888,
    name: "Стіна (схід)",
    directTextureKey: "stonewall_e",
    scale: 0.72, // ✅ Ще × 2 (0.36 × 2 = 0.72) - займає 2 клітинки
    offset: { x: 32, y: 0 }, // ✅ Offset також × 2
    gridSize: { width: 2, height: 2 }, // ✅ Займає 2×2 клітинки
  },
  {
    id: "stonewall_s",
    type: "stonewall_s",
    walkable: false,
    color: 0x909090,
    name: "Стіна (південь)",
    directTextureKey: "stonewall_s",
    scale: 0.7, // ✅ Ще × 2 (0.35 × 2 = 0.7) - займає 2 клітинки
    offset: { x: 32, y: -36 }, // ✅ Offset також × 2
    gridSize: { width: 2, height: 2 }, // ✅ Займає 2×2 клітинки
  },
  {
    id: "stonewall_w",
    type: "stonewall_w",
    walkable: false,
    color: 0x989898,
    name: "Стіна (захід)",
    directTextureKey: "stonewall_w",
    scale: 0.72, // ✅ Ще × 2 (0.36 × 2 = 0.72) - займає 2 клітинки
    offset: { x: 36, y: 0 }, // ✅ Offset також × 2
    gridSize: { width: 2, height: 2 }, // ✅ Займає 2×2 клітинки
  },
];

export const TILES_BY_ID = new Map<string, TileConfig>(
  TILE_CONFIGS.map((t) => [t.id, t])
);
