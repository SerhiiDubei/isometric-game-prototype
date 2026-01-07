// src/game/world/Grid.ts

import type { GridPoint } from "../types/grid-types";
import type { TileConfig } from "../config/tiles";

export class Grid {
  private blocked: Uint8Array;
  private tileTypes: Map<number, string> = new Map(); // ✅ Зберігаємо типи тайлів (підлога)
  private objectTypes: Map<number, string> = new Map(); // ✅ Зберігаємо об'єкти (бочки, декорації)

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

  // ✅ Отримати тип тайла (підлога)
  getTileType(p: GridPoint): string | null {
    const idx = this.idx(p);
    return this.tileTypes.get(idx) || null;
  }

  // ✅ Отримати тип об'єкта
  getObjectType(p: GridPoint): string | null {
    const idx = this.idx(p);
    return this.objectTypes.get(idx) || null;
  }

  // ✅ Встановити тип тайла (підлога)
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

  // ✅ Встановити об'єкт (декорація поверх підлоги)
  setObjectType(p: GridPoint, objectId: string | null, objectConfig: TileConfig) {
    const idx = this.idx(p);
    if (objectId) {
      this.objectTypes.set(idx, objectId);
      
      // ✅ Об'єкт може блокувати прохід
      // Для об'єктів з gridSize > 1×1 блокуємо ВСІ клітинки, які вони займають
      const gridSize = objectConfig.gridSize || { width: 1, height: 1 };
      const gridW = gridSize.width;
      const gridH = gridSize.height;
      
      if (!objectConfig.walkable) {
        // Блокуємо всі клітинки, які займає об'єкт
        for (let dy = 0; dy < gridH; dy++) {
          for (let dx = 0; dx < gridW; dx++) {
            const cellP: GridPoint = { x: p.x + dx, y: p.y + dy };
            if (this.inBounds(cellP)) {
              this.setBlocked(cellP, true);
            }
          }
        }
      }
    } else {
      this.objectTypes.delete(idx);
      // При видаленні об'єкта, відновлюємо блокування з підлоги
      const floorTileId = this.getTileType(p);
      if (floorTileId) {
        // Треба знайти конфіг підлоги, але це складно тут...
        // Поки що просто знімаємо блокування
        this.setBlocked(p, false);
      }
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

  // ✅ Автоматичне розміщення тестових стін для перевірки depth sorting
  placeTestWalls(getTileConfig: (tileId: string) => TileConfig | undefined) {
    console.log('🧱 [TEST] Розміщення тестових стін...');
    
    // Тестові позиції для перевірки depth sorting
    const testWalls = [
      // Верхні стіни (для перевірки перекриття)
      { x: 101, y: 120, id: 'stonewall_n' }, // Верх-ліва
      { x: 109, y: 120, id: 'stonewall_e' }, // Верх-права
      { x: 105, y: 120, id: 'stonewall_corner_n' }, // Кут між ними
      
      // Нижні стіни (для порівняння)
      { x: 101, y: 130, id: 'stonewall_s' }, // Низ-ліва
      { x: 109, y: 130, id: 'stonewall_w' }, // Низ-права
      
      // Додаткові кути для тесту
      { x: 101, y: 125, id: 'stonewall_corner_e' },
      { x: 109, y: 125, id: 'stonewall_corner_s' },
      { x: 105, y: 130, id: 'stonewall_corner_w' },
    ];

    let placedCount = 0;
    for (const wall of testWalls) {
      const p: GridPoint = { x: wall.x, y: wall.y };
      if (this.inBounds(p)) {
        const wallCfg = getTileConfig(wall.id);
        if (wallCfg) {
          this.setObjectType(p, wall.id, wallCfg);
          placedCount++;
          console.log(`   ✅ ${wall.id} at (${wall.x}, ${wall.y})`);
        } else {
          console.warn(`   ⚠️ Конфіг для ${wall.id} не знайдено!`);
        }
      }
    }
    
    console.log(`🧱 [TEST] Розміщено ${placedCount} тестових стін!`);
  }

  // ✅ Генерувати якісну багатошарову карту з різними зонами
  generateQualityMap(getTileConfig: (tileId: string) => TileConfig | undefined) {
    // Очищаємо попередні дані
    this.tileTypes.clear();
    this.objectTypes.clear(); // ✅ Очищаємо об'єкти також!
    this.blocked.fill(0);

    const floorCfg = getTileConfig('floor');
    const waterCfg = getTileConfig('water');

    // === ШАР 1: БАЗОВИЙ ШАР - білий floor по всій карті ===
    if (floorCfg) {
      for (let y = 0; y < this.rows; y++) {
        for (let x = 0; x < this.cols; x++) {
          const p = { x, y };
          if (this.inBounds(p)) {
            this.setTileType(p, 'floor', floorCfg);
          }
        }
      }
      console.log('✅ Базовий шар (floor) створено!');
    }

    // === ШАР 2: ВОДА (невелика зона) ===
    if (waterCfg) {
      const centerX = Math.floor(this.cols / 2);
      const centerY = Math.floor(this.rows / 2);
      
      // Невелике озеро
      for (let y = centerY - 5; y < centerY + 5; y++) {
        for (let x = centerX - 5; x < centerX + 5; x++) {
          const p = { x, y };
          if (this.inBounds(p) && Math.random() > 0.3) {
            this.setTileType(p, 'water', waterCfg);
          }
        }
      }
      console.log('✅ Вода створена!');
    }

    // === ШАР 3: ЛІС (5x5 зона) ===
    const forestCfg = getTileConfig('forest');
    if (forestCfg) {
      const spawnX = 80;
      const spawnY = 100;
      for (let dy = 0; dy < 5; dy++) {
        for (let dx = 0; dx < 5; dx++) {
          const p = { x: spawnX + 10 + dx, y: spawnY - 10 + dy };
          if (this.inBounds(p)) {
            const existingTile = this.getTileType(p);
            if (existingTile !== 'water') {
              this.setTileType(p, 'forest', forestCfg);
            }
          }
        }
      }
      console.log('✅ Ліс 5x5 створено!');
    }

    // === ШАР 4: DIRT ЗОНИ ===
    const dirtTilesCfg = getTileConfig('dirt_tiles');
    const dirtCfg = getTileConfig('dirt');
    if (dirtTilesCfg && dirtCfg) {
      const dirtZone1StartX = 70;
      const dirtZone1StartY = 90;
      const dirtZone1Width = 20;
      const dirtZone1Height = 20;
      let dirtCount = 0;

      for (let dy = 0; dy < dirtZone1Height; dy++) {
        for (let dx = 0; dx < dirtZone1Width; dx++) {
          const p = { x: dirtZone1StartX + dx, y: dirtZone1StartY + dy };
          if (this.inBounds(p)) {
            const existingTile = this.getTileType(p);
            if (existingTile !== 'water' && existingTile !== 'forest') {
              const seed = p.x * 31 + p.y * 17;
              const isDirtTiles = (seed % 3 === 0);
              this.setTileType(p, isDirtTiles ? 'dirt_tiles' : 'dirt', isDirtTiles ? dirtTilesCfg : dirtCfg);
              dirtCount++;
            }
          }
        }
      }

      console.log(`✅ DIRT зони створено (${dirtCount} тайлів)!`);
    }

    // === ШАР 5: БОЧКИ (поверх підлоги) ===
    const barrelCfg = getTileConfig('barrel');
    if (barrelCfg) {
      const barrelPositions = [
        { x: 82, y: 98 },
        { x: 85, y: 95 },
        { x: 78, y: 102 },
        { x: 88, y: 100 },
        { x: 75, y: 97 },
      ];

      barrelPositions.forEach((pos) => {
        if (this.inBounds(pos)) {
          this.setObjectType(pos, 'barrel', barrelCfg);
        }
      });

      console.log(`✅ Бочки створено (${barrelPositions.length} штук)!`);
    }

    // === ШАР 6: КІМНАТА 1 - КВАДРАТНА З КУТАМИ (залишаємо останню) ===
    this.generateRoomWithCorners(
      { x: 140, y: 120 }, // Позиція першої кімнати
      { width: 12, height: 12 }, // Квадратна форма
      { x: 145, y: 120 }, // Прохід (двері) - північ, по центру
      getTileConfig
    );

    // === ШАР 7: КІМНАТА 2 - ГОРИЗОНТАЛЬНА ПРЯМОКУТНА З КУТАМИ ===
    this.generateRoomWithCorners(
      { x: 100, y: 100 }, // Позиція другої кімнати
      { width: 18, height: 10 }, // Широка прямокутна форма (горизонтальна)
      { x: 108, y: 100 }, // Прохід (двері) - північ, по центру
      getTileConfig
    );

    // === ШАР 8: КІМНАТА 3 - ВЕРТИКАЛЬНА ПРЯМОКУТНА З КУТАМИ ===
    this.generateRoomWithCorners(
      { x: 130, y: 130 }, // Позиція третьої кімнати
      { width: 10, height: 16 }, // Висока прямокутна форма (вертикальна)
      { x: 134, y: 130 }, // Прохід (двері) - північ, по центру
      getTileConfig
    );

    console.log('✅ Карта згенерована (floor + water + forest + DIRT + barrel + 3 кімнати різної форми з проходами)!');
  }

  // ✅ Генерує лісову зону з різними деревами (для майбутнього використання)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private generateForestZone(
    topLeft: GridPoint,
    size: { width: number; height: number },
    getTileConfig: (tileId: string) => TileConfig | undefined
  ) {
    const treeTypes = ['tree1', 'tree2', 'tree3', 'tree4', 'trees'];
    const treeCount = Math.floor((size.width * size.height) / (20 * 20)); // ~1 дерево на 20x20 клітинок
    
    for (let i = 0; i < treeCount; i++) {
      const x = topLeft.x + Math.floor(Math.random() * size.width);
      const y = topLeft.y + Math.floor(Math.random() * size.height);
      const p = { x, y };
      
      if (this.inBounds(p) && !this.isBlocked(p)) {
        const treeType = treeTypes[Math.floor(Math.random() * treeTypes.length)];
        const treeCfg = getTileConfig(treeType);
        if (treeCfg) {
          this.setTileType(p, treeType, treeCfg);
        }
      }
    }
  }

  // ✅ Генерує піщаний пляж
  private generateBeachZone(
    topLeft: GridPoint,
    size: { width: number; height: number },
    getTileConfig: (tileId: string) => TileConfig | undefined
  ) {
    const groundCfg = getTileConfig('ground');
    if (!groundCfg) return;

    for (let y = topLeft.y; y < topLeft.y + size.height && y < this.rows; y++) {
      for (let x = topLeft.x; x < topLeft.x + size.width && x < this.cols; x++) {
        const p = { x, y };
        if (this.inBounds(p) && !this.isBlocked(p)) {
          this.setTileType(p, 'ground', groundCfg);
        }
      }
    }
  }

  // ✅ Генерує гірську зону
  private generateMountainZone(
    topLeft: GridPoint,
    size: { width: number; height: number },
    getTileConfig: (tileId: string) => TileConfig | undefined
  ) {
    const stoneCfg = getTileConfig('stone');
    if (!stoneCfg) return;

    // Створюємо гірський рельєф з випадковим камінням
    for (let y = topLeft.y; y < topLeft.y + size.height && y < this.rows; y++) {
      for (let x = topLeft.x; x < topLeft.x + size.width && x < this.cols; x++) {
        // Випадкове розміщення каменів (30% покриття)
        if (Math.random() < 0.3) {
          const p = { x, y };
          if (this.inBounds(p) && !this.isBlocked(p)) {
            this.setTileType(p, 'stone', stoneCfg);
          }
        }
      }
    }
  }

  // ✅ Генерує зону полів
  private generateFieldZone(
    topLeft: GridPoint,
    size: { width: number; height: number },
    getTileConfig: (tileId: string) => TileConfig | undefined
  ) {
    const groundCfg = getTileConfig('ground');
    if (!groundCfg) return;

    for (let y = topLeft.y; y < topLeft.y + size.height && y < this.rows; y++) {
      for (let x = topLeft.x; x < topLeft.x + size.width && x < this.cols; x++) {
        const p = { x, y };
        if (this.inBounds(p) && !this.isBlocked(p)) {
          this.setTileType(p, 'ground', groundCfg);
        }
      }
    }
  }

  // ✅ Генерує рівнинну зону
  private generatePlainsZone(
    topLeft: GridPoint,
    size: { width: number; height: number },
    getTileConfig: (tileId: string) => TileConfig | undefined
  ) {
    const grassCfg = getTileConfig('grass');
    if (!grassCfg) return;

    // Рівнина - просто трава (вже є в базовому шарі, але можна додати варіації)
    // Тут можна додати окремі типи трав для різноманітності
  }

  // ✅ Генерує звивисту ріку
  private generateRiver(
    start: GridPoint,
    end: GridPoint,
    width: number,
    getTileConfig: (tileId: string) => TileConfig | undefined
  ) {
    const waterCfg = getTileConfig('water');
    if (!waterCfg) return;

    const steps = Math.max(Math.abs(end.x - start.x), Math.abs(end.y - start.y));
    
    for (let step = 0; step <= steps; step++) {
      const t = step / steps;
      // Додаємо випадкові відхилення для звивистості
      const noiseX = Math.sin(t * Math.PI * 4) * (15 * 4);
      const noiseY = Math.cos(t * Math.PI * 3) * (10 * 4);
      
      const x = Math.floor(start.x + (end.x - start.x) * t + noiseX);
      const y = Math.floor(start.y + (end.y - start.y) * t + noiseY);
      
      // Малюємо ріку з шириною
      for (let dx = -width / 2; dx < width / 2; dx++) {
        for (let dy = -width / 4; dy < width / 4; dy++) {
          const p = { x: x + dx, y: y + dy };
          if (this.inBounds(p)) {
            this.setTileType(p, 'water', waterCfg);
          }
        }
      }
    }
  }

  // ✅ Генерує озеро
  private generateLake(
    topLeft: GridPoint,
    size: { width: number; height: number },
    getTileConfig: (tileId: string) => TileConfig | undefined
  ) {
    const waterCfg = getTileConfig('water');
    if (!waterCfg) return;

    // Створюємо овальне озеро
    const centerX = topLeft.x + size.width / 2;
    const centerY = topLeft.y + size.height / 2;
    const radiusX = size.width / 2;
    const radiusY = size.height / 2;

    for (let y = topLeft.y; y < topLeft.y + size.height && y < this.rows; y++) {
      for (let x = topLeft.x; x < topLeft.x + size.width && x < this.cols; x++) {
        const dx = (x - centerX) / radiusX;
        const dy = (y - centerY) / radiusY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Овальна форма з плавними краями
        if (dist < 1.0) {
          const p = { x, y };
          if (this.inBounds(p)) {
            this.setTileType(p, 'water', waterCfg);
          }
        }
      }
    }
  }

  // ✅ Генерує кімнату з стінами (з правильними орієнтаціями!)
  private generateRoom(
    topLeft: GridPoint,
    size: { width: number; height: number },
    doorway: GridPoint | null, // ✅ Позиція проходу (двері), null = без проходу
    getTileConfig: (tileId: string) => TileConfig | undefined
  ) {
    // Створюємо стіни по периметру з правильними орієнтаціями
    for (let x = topLeft.x; x < topLeft.x + size.width; x++) {
      for (let y = topLeft.y; y < topLeft.y + size.height; y++) {
        const p = { x, y };
        if (!this.inBounds(p)) continue;

        // ✅ Якщо це позиція проходу (дверей) - пропускаємо
        if (doorway && p.x === doorway.x && p.y === doorway.y) {
          continue;
        }

        let wallId: string | null = null;

        // Визначаємо орієнтацію стіни залежно від позиції
        if (y === topLeft.y && x !== topLeft.x && x !== topLeft.x + size.width - 1) {
          // Верхня стіна (горизонтальна) - North
          wallId = 'stonewall_n';
        } else if (y === topLeft.y + size.height - 1 && x !== topLeft.x && x !== topLeft.x + size.width - 1) {
          // Нижня стіна (горизонтальна) - South
          wallId = 'stonewall_s';
        } else if (x === topLeft.x && y !== topLeft.y && y !== topLeft.y + size.height - 1) {
          // Ліва стіна (вертикальна) - West
          wallId = 'stonewall_w';
        } else if (x === topLeft.x + size.width - 1 && y !== topLeft.y && y !== topLeft.y + size.height - 1) {
          // Права стіна (вертикальна) - East
          wallId = 'stonewall_e';
        }
        // Кути пропускаємо (або можна додати кутові стіни пізніше)

        if (wallId) {
          const wallCfg = getTileConfig(wallId);
          if (wallCfg) {
            this.setObjectType(p, wallId, wallCfg);
          }
        }
      }
    }
  }

  // ✅ Генерує кімнату з стінами ТА КУТАМИ (з правильними орієнтаціями!)
  generateRoomWithCorners(
    topLeft: GridPoint,
    size: { width: number; height: number },
    doorway: GridPoint | null, // ✅ Позиція проходу (двері), null = без проходу
    getTileConfig: (tileId: string) => TileConfig | undefined
  ) {
    console.log(`🏰 [ROOM] Створення кімнати з кутами: позиція (${topLeft.x}, ${topLeft.y}), розмір ${size.width}×${size.height}`);
    
    const topRight = { x: topLeft.x + size.width - 1, y: topLeft.y };
    const bottomLeft = { x: topLeft.x, y: topLeft.y + size.height - 1 };
    const bottomRight = { x: topLeft.x + size.width - 1, y: topLeft.y + size.height - 1 };
    
    // ✅ 1. КУТИ (спочатку кути, щоб вони були під прямими стінами)
    const corners = [
      { pos: topLeft, id: 'stonewall_corner_n' },      // Верхній лівий кут (північний)
      { pos: topRight, id: 'stonewall_corner_e' },    // Верхній правий кут (східний)
      { pos: bottomLeft, id: 'stonewall_corner_w' },  // Нижній лівий кут (західний)
      { pos: bottomRight, id: 'stonewall_corner_s' }, // Нижній правий кут (південний)
    ];
    
    for (const corner of corners) {
      // Перевіряємо, чи це не позиція проходу
      if (doorway && corner.pos.x === doorway.x && corner.pos.y === doorway.y) {
        continue;
      }
      
      if (this.inBounds(corner.pos)) {
        const cornerCfg = getTileConfig(corner.id);
        if (cornerCfg) {
          this.setObjectType(corner.pos, corner.id, cornerCfg);
          console.log(`   ✅ Кут ${corner.id} at (${corner.pos.x}, ${corner.pos.y})`);
        }
      }
    }
    
    // ✅ 2. ПРЯМІ СТІНИ (після кутів, щоб вони були зверху)
    for (let x = topLeft.x; x < topLeft.x + size.width; x++) {
      for (let y = topLeft.y; y < topLeft.y + size.height; y++) {
        const p = { x, y };
        if (!this.inBounds(p)) continue;

        // ✅ Пропускаємо кути (вже розміщені)
        if (
          (p.x === topLeft.x && p.y === topLeft.y) ||
          (p.x === topRight.x && p.y === topRight.y) ||
          (p.x === bottomLeft.x && p.y === bottomLeft.y) ||
          (p.x === bottomRight.x && p.y === bottomRight.y)
        ) {
          continue;
        }

        // ✅ Якщо це позиція проходу (дверей) - пропускаємо
        if (doorway && p.x === doorway.x && p.y === doorway.y) {
          continue;
        }

        let wallId: string | null = null;

        // Визначаємо орієнтацію стіни залежно від позиції
        if (y === topLeft.y && x !== topLeft.x && x !== topLeft.x + size.width - 1) {
          // Верхня стіна (горизонтальна) - North
          wallId = 'stonewall_n';
        } else if (y === topLeft.y + size.height - 1 && x !== topLeft.x && x !== topLeft.x + size.width - 1) {
          // Нижня стіна (горизонтальна) - South
          wallId = 'stonewall_s';
        } else if (x === topLeft.x && y !== topLeft.y && y !== topLeft.y + size.height - 1) {
          // Ліва стіна (вертикальна) - West
          wallId = 'stonewall_w';
        } else if (x === topLeft.x + size.width - 1 && y !== topLeft.y && y !== topLeft.y + size.height - 1) {
          // Права стіна (вертикальна) - East
          wallId = 'stonewall_e';
        }

        if (wallId) {
          const wallCfg = getTileConfig(wallId);
          if (wallCfg) {
            this.setObjectType(p, wallId, wallCfg);
          }
        }
      }
    }
    
    console.log(`🏰 [ROOM] Кімната створена!`);
  }

  // ✅ Генерує дорогу
  private generateRoad(
    start: GridPoint,
    end: GridPoint,
    width: number,
    getTileConfig: (tileId: string) => TileConfig | undefined
  ) {
    const stoneCfg = getTileConfig('stone');
    if (!stoneCfg) return;

    const steps = Math.max(Math.abs(end.x - start.x), Math.abs(end.y - start.y));
    
    for (let step = 0; step <= steps; step++) {
      const t = step / steps;
      const x = Math.floor(start.x + (end.x - start.x) * t);
      const y = Math.floor(start.y + (end.y - start.y) * t);
      
      // Малюємо дорогу
      for (let dx = -width / 2; dx < width / 2; dx++) {
        for (let dy = -width / 2; dy < width / 2; dy++) {
          const p = { x: x + dx, y: y + dy };
          if (this.inBounds(p) && !this.isBlocked(p)) {
            this.setTileType(p, 'stone', stoneCfg);
          }
        }
      }
    }
  }

  // ✅ Генерує село з будинками
  private generateVillage(
    topLeft: GridPoint,
    size: { width: number; height: number },
    getTileConfig: (tileId: string) => TileConfig | undefined,
    scale: number
  ) {
    // Підлога для будинків
    const floorCfg = getTileConfig('floor');
    if (floorCfg) {
      for (let y = topLeft.y; y < topLeft.y + size.height && y < this.rows; y++) {
        for (let x = topLeft.x; x < topLeft.x + size.width && x < this.cols; x++) {
          const p = { x, y };
          if (this.inBounds(p) && !this.isBlocked(p)) {
            this.setTileType(p, 'floor', floorCfg);
          }
        }
      }
    }

    // Будинки
    this.buildLargeHouse1(
      { x: topLeft.x + 10 * scale, y: topLeft.y + 10 * scale },
      getTileConfig,
      scale
    );
    this.buildLargeHouse2(
      { x: topLeft.x + 35 * scale, y: topLeft.y + 10 * scale },
      getTileConfig,
      scale
    );
    this.buildLargeHouse3(
      { x: topLeft.x + 20 * scale, y: topLeft.y + 30 * scale },
      getTileConfig,
      scale
    );
  }

  // ✅ Додає декорації до зони
  private addDecorationsToZone(
    topLeft: GridPoint,
    size: { width: number; height: number },
    decorationTypes: string[],
    coverage: number, // 0.0 - 1.0 (відсоток покриття)
    getTileConfig: (tileId: string) => TileConfig | undefined
  ) {
    const totalCells = size.width * size.height;
    const decorationCount = Math.floor(totalCells * coverage);

    for (let i = 0; i < decorationCount; i++) {
      const x = topLeft.x + Math.floor(Math.random() * size.width);
      const y = topLeft.y + Math.floor(Math.random() * size.height);
      const p = { x, y };
      
      if (this.inBounds(p) && !this.isBlocked(p)) {
        const decorationType = decorationTypes[Math.floor(Math.random() * decorationTypes.length)];
        const decorationCfg = getTileConfig(decorationType);
        if (decorationCfg) {
          this.setTileType(p, decorationType, decorationCfg);
        }
      }
    }
  }

  // ✅ Створити локацію з будинками, рікою та дорогою
  createVillageLocation(getTileConfig: (tileId: string) => TileConfig | undefined) {
    // Очищаємо попередні дані
    this.tileTypes.clear();
    this.blocked.fill(0);

    const SCALE = 4; // ✅ Масштабний коефіцієнт (все в 4 рази більше)

    // === РІКА (вертикальна, з води - синя) ===
    for (let y = 0; y < this.rows; y++) {
      // Ріка шириною 12 клітинок (було 3, тепер 3×4)
      for (let x = 38 * SCALE; x <= 40 * SCALE; x++) {
        const p = { x, y };
        if (this.inBounds(p)) {
          const config = getTileConfig('water');
          if (config) this.setTileType(p, 'water', config);
        }
      }
    }

    // === ДОРОГА (горизонтальна, з каменю - сіра) ===
    for (let x = 0; x < this.cols; x++) {
      // Дорога шириною 12 клітинок (було 3, тепер 3×4)
      for (let y = 24 * SCALE; y <= 26 * SCALE; y++) {
        const p = { x, y };
        if (this.inBounds(p)) {
          // Пропускаємо ріку (створюємо міст)
          if (x >= 38 * SCALE && x <= 40 * SCALE) continue;
          const config = getTileConfig('stone');
          if (config) this.setTileType(p, 'stone', config);
        }
      }
    }

    // === МІСТ через ріку (з каменю) ===
    for (let x = 38 * SCALE; x <= 40 * SCALE; x++) {
      for (let y = 24 * SCALE; y <= 26 * SCALE; y++) {
        const p = { x, y };
        const config = getTileConfig('stone');
        if (config) this.setTileType(p, 'stone', config);
      }
    }

    // === ВЕЛИКІ БУДИНКИ З КІМНАТАМИ (масштабовані) ===
    // Будинок 1 - верхній лівий (з вітальнею, кухнею, спальнею)
    this.buildLargeHouse1({ x: 2 * SCALE, y: 2 * SCALE }, getTileConfig, SCALE);

    // Будинок 2 - верхній правий (з залом, кабінетом, сховищем)
    this.buildLargeHouse2({ x: 45 * SCALE, y: 3 * SCALE }, getTileConfig, SCALE);

    // Будинок 3 - нижній (з магазином, складом, житлом)
    this.buildLargeHouse3({ x: 5 * SCALE, y: 30 * SCALE }, getTileConfig, SCALE);
  }

  // ✅ БУДИНОК 1: Великий будинок з вітальнею, кухнею, спальнею (15×12 × scale)
  private buildLargeHouse1(topLeft: GridPoint, getTileConfig: (tileId: string) => TileConfig | undefined, scale = 1) {
    const wallCfg = getTileConfig('wall');
    const stoneCfg = getTileConfig('stone');
    if (!wallCfg || !stoneCfg) return;

    const width = 15 * scale;
    const height = 12 * scale;

    // Зовнішні стіни
    this.drawRect(topLeft, width, height, 'wall', wallCfg);

    // Головний вхід (внизу по центру) - масштабований
    for (let dx = 0; dx < scale; dx++) {
      this.clearTile({ x: topLeft.x + 7 * scale + dx, y: topLeft.y + height - 1 });
    }

    // Внутрішні стіни (створюють кімнати)
    // Горизонтальна стіна (розділяє верх і низ)
    for (let x = topLeft.x + scale; x < topLeft.x + width - scale; x++) {
      const p = { x, y: topLeft.y + 6 * scale };
      if (x < topLeft.x + 7 * scale || x > topLeft.x + 7 * scale + scale - 1) { // Двері в коридорі (scale клітинок)
        if (this.inBounds(p)) this.setTileType(p, 'wall', wallCfg);
      }
    }

    // Вертикальна стіна (розділяє ліву і праву частини)
    for (let y = topLeft.y + scale; y < topLeft.y + 6 * scale; y++) {
      const p = { x: topLeft.x + 8 * scale, y };
      if (y < topLeft.y + 3 * scale || y > topLeft.y + 3 * scale + scale - 1) { // Двері між кімнатами
        if (this.inBounds(p)) this.setTileType(p, 'wall', wallCfg);
      }
    }

    // Кухня (права верхня) - столи з каменю (масштабовані)
    for (let dx = 0; dx < scale; dx++) {
      for (let dy = 0; dy < scale; dy++) {
        this.setTileIfEmpty({ x: topLeft.x + 10 * scale + dx, y: topLeft.y + 2 * scale + dy }, 'stone', stoneCfg);
        this.setTileIfEmpty({ x: topLeft.x + 11 * scale + dx, y: topLeft.y + 2 * scale + dy }, 'stone', stoneCfg);
        this.setTileIfEmpty({ x: topLeft.x + 12 * scale + dx, y: topLeft.y + 4 * scale + dy }, 'stone', stoneCfg);
      }
    }

    // Спальня (ліва верхня) - ліжко з каменю (масштабоване)
    for (let dx = 0; dx < scale * 2; dx++) {
      for (let dy = 0; dy < scale; dy++) {
        this.setTileIfEmpty({ x: topLeft.x + 3 * scale + dx, y: topLeft.y + 2 * scale + dy }, 'stone', stoneCfg);
      }
    }

    // Вітальня (нижня частина) - меблі (масштабовані)
    for (let dx = 0; dx < scale; dx++) {
      for (let dy = 0; dy < scale; dy++) {
        this.setTileIfEmpty({ x: topLeft.x + 4 * scale + dx, y: topLeft.y + 8 * scale + dy }, 'stone', stoneCfg);
        this.setTileIfEmpty({ x: topLeft.x + 10 * scale + dx, y: topLeft.y + 8 * scale + dy }, 'stone', stoneCfg);
      }
    }
  }

  // ✅ БУДИНОК 2: Великий будинок з залом, кабінетом, сховищем (14×13 × scale)
  private buildLargeHouse2(topLeft: GridPoint, getTileConfig: (tileId: string) => TileConfig | undefined, scale = 1) {
    const wallCfg = getTileConfig('wall');
    const stoneCfg = getTileConfig('stone');
    const waterCfg = getTileConfig('water');
    if (!wallCfg || !stoneCfg || !waterCfg) return;

    const width = 14 * scale;
    const height = 13 * scale;

    // Зовнішні стіни
    this.drawRect(topLeft, width, height, 'wall', wallCfg);

    // Головний вхід (зліва по центру) - масштабований
    for (let dy = 0; dy < scale; dy++) {
      this.clearTile({ x: topLeft.x, y: topLeft.y + 6 * scale + dy });
    }

    // Коридор вертикальний
    for (let y = topLeft.y + scale; y < topLeft.y + height - scale; y++) {
      const p = { x: topLeft.x + 4 * scale, y };
      const isDoor1 = y >= topLeft.y + 4 * scale && y < topLeft.y + 4 * scale + scale;
      const isDoor2 = y >= topLeft.y + 9 * scale && y < topLeft.y + 9 * scale + scale;
      if (!isDoor1 && !isDoor2) {
        if (this.inBounds(p)) this.setTileType(p, 'wall', wallCfg);
      }
    }

    // Сховище (верхня ліва кімната) - скарби з води (блискучі, масштабовані)
    for (let dx = 0; dx < scale; dx++) {
      for (let dy = 0; dy < scale * 2; dy++) {
        this.setTileIfEmpty({ x: topLeft.x + 2 * scale + dx, y: topLeft.y + 2 * scale + dy }, 'water', waterCfg);
      }
    }

    // Кабінет (нижня ліва) - стіл (масштабований)
    for (let dx = 0; dx < scale * 2; dx++) {
      for (let dy = 0; dy < scale; dy++) {
        this.setTileIfEmpty({ x: topLeft.x + 2 * scale + dx, y: topLeft.y + 10 * scale + dy }, 'stone', stoneCfg);
      }
    }

    // Великий зал (права частина) - колони (масштабовані)
    for (let dx = 0; dx < scale; dx++) {
      for (let dy = 0; dy < scale; dy++) {
        this.setTileIfEmpty({ x: topLeft.x + 7 * scale + dx, y: topLeft.y + 3 * scale + dy }, 'stone', stoneCfg);
        this.setTileIfEmpty({ x: topLeft.x + 11 * scale + dx, y: topLeft.y + 3 * scale + dy }, 'stone', stoneCfg);
        this.setTileIfEmpty({ x: topLeft.x + 7 * scale + dx, y: topLeft.y + 9 * scale + dy }, 'stone', stoneCfg);
        this.setTileIfEmpty({ x: topLeft.x + 11 * scale + dx, y: topLeft.y + 9 * scale + dy }, 'stone', stoneCfg);
      }
    }

    // Центральний стіл у залі (масштабований)
    for (let x = topLeft.x + 8 * scale; x < topLeft.x + 11 * scale; x++) {
      for (let y = topLeft.y + 6 * scale; y < topLeft.y + 8 * scale; y++) {
        this.setTileIfEmpty({ x, y }, 'stone', stoneCfg);
      }
    }
  }

  // ✅ БУДИНОК 3: Магазин з складом та житлом (18×14 × scale)
  private buildLargeHouse3(topLeft: GridPoint, getTileConfig: (tileId: string) => TileConfig | undefined, scale = 1) {
    const wallCfg = getTileConfig('wall');
    const stoneCfg = getTileConfig('stone');
    const waterCfg = getTileConfig('water');
    if (!wallCfg || !stoneCfg || !waterCfg) return;

    const width = 18 * scale;
    const height = 14 * scale;

    // Зовнішні стіни
    this.drawRect(topLeft, width, height, 'wall', wallCfg);

    // Два входи: для покупців і для складу (масштабовані)
    for (let dx = 0; dx < scale; dx++) {
      this.clearTile({ x: topLeft.x + 6 * scale + dx, y: topLeft.y }); // Вхід у магазин (верх)
    }
    for (let dy = 0; dy < scale; dy++) {
      this.clearTile({ x: topLeft.x + width - 1, y: topLeft.y + 7 * scale + dy }); // Вхід на склад (справа)
    }

    // Поділ на магазин (ліва частина) і склад+житло (права)
    for (let y = topLeft.y + scale; y < topLeft.y + height - scale; y++) {
      const p = { x: topLeft.x + 9 * scale, y };
      const isDoor = y >= topLeft.y + 6 * scale && y < topLeft.y + 6 * scale + scale;
      if (!isDoor) {
        if (this.inBounds(p)) this.setTileType(p, 'wall', wallCfg);
      }
    }

    // Поділ складу і житла (горизонтально справа)
    for (let x = topLeft.x + 10 * scale; x < topLeft.x + width - scale; x++) {
      const p = { x, y: topLeft.y + 7 * scale };
      const isDoor = x >= topLeft.x + 13 * scale && x < topLeft.x + 13 * scale + scale;
      if (!isDoor) {
        if (this.inBounds(p)) this.setTileType(p, 'wall', wallCfg);
      }
    }

    // Магазин - прилавок і товари (масштабовані)
    // Прилавок (горизонтальний по центру)
    for (let x = topLeft.x + 2 * scale; x < topLeft.x + 8 * scale; x++) {
      for (let dy = 0; dy < scale; dy++) {
        this.setTileIfEmpty({ x, y: topLeft.y + 6 * scale + dy }, 'stone', stoneCfg);
      }
    }
    
    // Товари (вода = блискучі речі, масштабовані)
    for (let dx = 0; dx < scale; dx++) {
      for (let dy = 0; dy < scale; dy++) {
        this.setTileIfEmpty({ x: topLeft.x + 3 * scale + dx, y: topLeft.y + 3 * scale + dy }, 'water', waterCfg);
        this.setTileIfEmpty({ x: topLeft.x + 6 * scale + dx, y: topLeft.y + 3 * scale + dy }, 'water', waterCfg);
        this.setTileIfEmpty({ x: topLeft.x + 3 * scale + dx, y: topLeft.y + 10 * scale + dy }, 'water', waterCfg);
      }
    }

    // Склад - ящики (масштабовані)
    for (let dx = 0; dx < scale; dx++) {
      for (let dy = 0; dy < scale; dy++) {
        this.setTileIfEmpty({ x: topLeft.x + 11 * scale + dx, y: topLeft.y + 2 * scale + dy }, 'stone', stoneCfg);
        this.setTileIfEmpty({ x: topLeft.x + 12 * scale + dx, y: topLeft.y + 2 * scale + dy }, 'stone', stoneCfg);
        this.setTileIfEmpty({ x: topLeft.x + 14 * scale + dx, y: topLeft.y + 3 * scale + dy }, 'stone', stoneCfg);
        this.setTileIfEmpty({ x: topLeft.x + 15 * scale + dx, y: topLeft.y + 4 * scale + dy }, 'stone', stoneCfg);
      }
    }

    // Житло (справа внизу) - меблі (масштабовані)
    for (let dx = 0; dx < scale * 2; dx++) {
      for (let dy = 0; dy < scale; dy++) {
        this.setTileIfEmpty({ x: topLeft.x + 12 * scale + dx, y: topLeft.y + 10 * scale + dy }, 'stone', stoneCfg);
      }
    }
    for (let dx = 0; dx < scale; dx++) {
      for (let dy = 0; dy < scale; dy++) {
        this.setTileIfEmpty({ x: topLeft.x + 15 * scale + dx, y: topLeft.y + 11 * scale + dy }, 'stone', stoneCfg);
      }
    }
  }

  // ✅ Допоміжні методи
  private drawRect(topLeft: GridPoint, width: number, height: number, tileId: string, config: TileConfig) {
    // Верхня стіна
    for (let x = topLeft.x; x < topLeft.x + width; x++) {
      const p = { x, y: topLeft.y };
      if (this.inBounds(p)) this.setTileType(p, tileId, config);
    }
    // Нижня стіна
    for (let x = topLeft.x; x < topLeft.x + width; x++) {
      const p = { x, y: topLeft.y + height - 1 };
      if (this.inBounds(p)) this.setTileType(p, tileId, config);
    }
    // Ліва стіна
    for (let y = topLeft.y; y < topLeft.y + height; y++) {
      const p = { x: topLeft.x, y };
      if (this.inBounds(p)) this.setTileType(p, tileId, config);
    }
    // Права стіна
    for (let y = topLeft.y; y < topLeft.y + height; y++) {
      const p = { x: topLeft.x + width - 1, y };
      if (this.inBounds(p)) this.setTileType(p, tileId, config);
    }
  }

  private clearTile(p: GridPoint) {
    if (this.inBounds(p)) {
      this.tileTypes.delete(this.idx(p));
      this.setBlocked(p, false);
    }
  }

  private setTileIfEmpty(p: GridPoint, tileId: string, config: TileConfig) {
    if (this.inBounds(p) && !this.tileTypes.has(this.idx(p))) {
      this.setTileType(p, tileId, config);
    }
  }
}
