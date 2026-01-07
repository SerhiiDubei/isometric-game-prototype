// src/game/world/TileRenderer.ts
import Phaser from "phaser";
import { Grid } from "./Grid";
import type { IsoTransform } from "../iso/isoTransofrm";
import type { GridPoint } from "../types/grid-types";
import { TILE_CONFIGS } from "../config/tiles";
import { getTilemapTileKey } from "../utils/tilemapLoader";

export class TileRenderer {
  private floorLayer!: Phaser.GameObjects.Container; // ✅ ШАР 1: Підлога (depth: 0)
  private objectLayer!: Phaser.GameObjects.Container; // ✅ ШАР 2: Об'єкти (depth: 10)
  public characterLayer!: Phaser.GameObjects.Container; // ✅ ШАР 3: Персонажі (depth: 20) - public для доступу ззовні

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
    
    // ✅ Створюємо 3 окремі контейнери для багатошарового рендерингу
    this.floorLayer = this.scene.add.container(0, 0).setDepth(0);
    this.objectLayer = this.scene.add.container(0, 0).setDepth(10);
    this.characterLayer = this.scene.add.container(0, 0).setDepth(20);
    
    console.log('✅ Створено 3 шари: floor (depth 0) → object (depth 10) → character (depth 20)');
    
    this.redraw();
  }

  redraw() {
    this.floorLayer.removeAll(true);
    this.objectLayer.removeAll(true);
    // ✅ characterLayer НЕ очищаємо - там герой!
    
    // ✅ Діагностика: виводимо конфігурацію стін і кутів
    const walls = TILE_CONFIGS.filter((t) => 
      t.id.startsWith('stonewall_')
    );
    console.log('🔍 [WALL CONFIG] Прямі стіни:', 
      walls.filter((t) => !t.id.includes('corner')).map((t) => ({
        id: t.id,
        gridSize: t.gridSize,
        scale: t.scale,
        offset: t.offset
      }))
    );
    console.log('🔍 [WALL CONFIG] Кути:', 
      walls.filter((t) => t.id.includes('corner')).map((t) => ({
        id: t.id,
        gridSize: t.gridSize,
        scale: t.scale,
        offset: t.offset
      }))
    );
    
    // ✅ ПРОХІД 1: Малюємо підлогу (floor)
    this.renderLayer('floor');
    
    // ✅ ПРОХІД 2: Малюємо об'єкти (barrel та інші декорації) ПОВЕРХ
    this.renderLayer('object');
  }

  private renderLayer(layerType: 'floor' | 'object') {
    const { tileW: W, tileH: H } = this.iso;
    const renderedTiles = new Set<string>(); // ✅ Відстежуємо вже відрендерені тайли
    let renderedCount = 0;

    // ✅ Вибираємо правильний контейнер для цього шару
    const targetContainer = layerType === 'floor' ? this.floorLayer : this.objectLayer;

    for (let y = 0; y < this.grid.rows; y++) {
      for (let x = 0; x < this.grid.cols; x++) {
        const p: GridPoint = { x, y };
        const cellKey = `${x},${y}`;

        // ✅ Пропускаємо, якщо ця клітинка вже частина більшого тайла
        if (renderedTiles.has(cellKey)) continue;

        // ✅ Отримуємо тип тайла в залежності від шару
        let tileId: string | null;
        if (layerType === 'floor') {
          tileId = this.grid.getTileType(p);
          // Для підлоги завжди має бути щось, інакше пропускаємо
          if (!tileId) continue;
        } else {
          tileId = this.grid.getObjectType(p);
          // Для об'єктів: якщо немає, пропускаємо
          if (!tileId) continue;
          
          // ✅ Діагностика: логуємо кути, якщо вони знайдені
          if (tileId.includes('corner')) {
            console.log(`🔍 [CORNER FOUND] ${tileId} at (${x}, ${y})`);
          }
        }
        
        const tileConfig = TILE_CONFIGS.find((t) => t.id === tileId);
        if (!tileConfig) {
          console.warn(`⚠️ Конфіг для тайла ${tileId} не знайдено!`);
          continue;
        }
        
        // ✅ Визначаємо ключ текстури (з Tilemap або звичайний)
        let key: string;
        if (tileConfig?.dirtTilesetKey !== undefined) {
          // ✅ DIRT тайли (ТАК САМО ЯК FOREST!)
          if (tileConfig.dirtTilesetKey === "dirt_tiles") {
            key = "dirt_tiles_key";
          } else if (tileConfig.dirtTilesetKey === "dirt") {
            key = "dirt_key";
          } else {
            key = `tile-${tileId}`; // fallback
          }
        } else if (tileConfig?.directTextureKey !== undefined) {
          // ✅ Використовуємо прямий ключ текстури (вже оброблений!)
          key = tileConfig.directTextureKey;
        } else if (tileConfig?.forestsTilesetKey !== undefined) {
          // Використовуємо окремі файли Forests тайлів
          // Використовуємо випадковий індекс на основі позиції для різноманітності
          const seed = x * 31 + y * 17; // Простий seed на основі позиції
          const tileIndex = (seed % 18); // 18 тайлів в наборі
          const tileNum = tileIndex.toString().padStart(2, '0');
          key = `forest_tile_${tileNum}`;
        } else if (tileConfig?.tilemapKey !== undefined) {
          // Використовуємо тайл з Tiny Swords Tilemap (вирізаний)
          // Може бути tileIndex або row/col (для сумісності)
          if (tileConfig.tilemapRow !== undefined && tileConfig.tilemapCol !== undefined) {
            // Старий формат (row/col) - конвертуємо в індекс
            const tileIndex = (tileConfig.tilemapRow || 0) * 2 + (tileConfig.tilemapCol || 0);
            key = getTilemapTileKey(tileConfig.tilemapKey, tileIndex);
          } else if (tileConfig.tilemapIndex !== undefined) {
            // Новий формат (індекс 0-5)
            key = getTilemapTileKey(tileConfig.tilemapKey, tileConfig.tilemapIndex);
          } else {
            // За замовчуванням - перший тайл
            key = getTilemapTileKey(tileConfig.tilemapKey, 0);
          }
        } else {
          // Використовуємо звичайний тайл
          key = `tile-${tileId}`;
        }

        // ✅ Отримуємо розмір тайла в клітинках
        const gridSize = tileConfig?.gridSize ?? { width: 1, height: 1 };
        const gridW = gridSize.width;
        const gridH = gridSize.height;

        // ✅ Перевіряємо, чи існує текстура (потрібно для обчислення offset)
        if (!this.scene.textures.exists(key)) {
          const isCorner = tileConfig?.id?.includes('corner') || false;
          const prefix = isCorner ? '❌ [CORNER MISSING]' : '⚠️';
          console.warn(`${prefix} Текстура ${key} не знайдена для тайла ${tileId} на позиції (${x}, ${y})`);
          // Використовуємо fallback - кольоровий тайл
          const fallbackKey = `tile-${tileId}`;
          if (!this.scene.textures.exists(fallbackKey)) {
            if (isCorner) {
              console.error(`❌ [CORNER] Fallback ${fallbackKey} теж не знайдено!`);
            }
            continue; // Пропускаємо, якщо немає fallback
          }
          key = fallbackKey;
        }

        // ✅ Обчислюємо scale раніше (потрібно для динамічного offset)
        const scale = tileConfig?.scale ?? 1;
        const scaleX = typeof scale === "number" ? scale : scale.x;
        const scaleY = typeof scale === "number" ? scale : scale.y;

        // ✅ 1️⃣ Positioning: використовуємо TOP-LEFT кут grid-області для позиціонування спрайту
        // Це забезпечує правильне вирівнювання спрайту з grid-клітинками
        const topLeftPoint: GridPoint = { x, y };
        const { x: sx, y: sy } = this.iso.cellToScreen(topLeftPoint);
        
        // ✅ 2️⃣ Depth: використовуємо CENTER (x+0.5, y+0.5) для Z-ordering
        // Це забезпечує консистентну точку відліку глибини для всіх тайлів
        const depthCenterX = x + 0.5;
        const depthCenterY = y + 0.5;

        // ✅ Визначаємо origin в залежності від типу тайла
        const originX = 0.5;
        let originY = 0.5; // Для підлоги за замовчуванням
        
        // ✅ DIRT тайли мають ромб ВНИЗУ (як об'єкти)!
        const isDirtTile = tileConfig?.dirtTilesetKey !== undefined;
        // ✅ StoneWall (прямі та кутові) — "вертикальні" об'єкти
        const isWallTile =
          tileConfig?.type === "stonewall_n" ||
          tileConfig?.type === "stonewall_e" ||
          tileConfig?.type === "stonewall_s" ||
          tileConfig?.type === "stonewall_w" ||
          tileConfig?.id.startsWith("stonewall_corner_");
        
        // ✅ Діагностика для кутів
        if (tileConfig?.id.includes('corner')) {
          console.log(`🔍 [CORNER DEBUG] ${tileId}: isWallTile=${isWallTile}, layerType=${layerType}, key=${key}`);
        }
        
        if (layerType === 'object' || isDirtTile || isWallTile) {
          originY = 1; // ✅ Низ по центру (для об'єктів, стін та DIRT!)
        }
        
        const spr = this.scene.add.image(sx, sy, key).setOrigin(originX, originY);
        
        // ✅ Scale вже обчислено вище для динамічного offset

        // ✅ Різна логіка для різних типів тайлів
        if (layerType === 'object') {
          // ✅ Об'єкти (barrel, стіни та інше): оригінальний розмір з scale
          // 👇 ДОДАТКОВО: Для стін логуватимемо «рекомендований» scale на основі сітки
          if (isWallTile && spr.texture) {
            const texture = spr.texture;
            const originalWidth = texture.source[0].width;
            const originalHeight = texture.source[0].height;

            const targetWidth = W * gridW;
            // Висота стіни не прив'язана до висоти floor-тайлів — зберігаємо пропорції
            const fitScaleX = originalWidth > 0 ? targetWidth / originalWidth : 1;
            const fitScaleY = fitScaleX; // ✅ Використовуємо той самий scale по Y

            const isCorner = tileConfig?.id?.includes('corner') || false;
            const prefix = isCorner ? '🏛️ [CORNER]' : '🧱 [WALL DEBUG]';
            
            console.log(
              `${prefix} ${tileId}: img=${originalWidth}x${originalHeight}, ` +
              `grid=${gridW}x${gridH}, tile=${W}x${H}, ` +
              `cfgScale=(${scaleX.toFixed(2)}, ${scaleY.toFixed(2)}), ` +
              `fitScale≈(${fitScaleX.toFixed(2)}, ${fitScaleY.toFixed(2)}), ` +
              `offset=(${tileConfig?.offset?.x ?? 0}, ${tileConfig?.offset?.y ?? 0})`
            );
          }

          spr.setScale(scaleX, scaleY);
          
          // ✅ Отримуємо offset (перед застосуванням, для використання в hit area)
          const offsetX = tileConfig?.offset?.x ?? 0;
          const offsetY = tileConfig?.offset?.y ?? 0;
          
          // ✅ Застосовуємо offset ПЕРЕД створенням hit area
          if (offsetX !== 0 || offsetY !== 0) {
            spr.x += offsetX;
            spr.y += offsetY;
          }
          
          // ✅ Ромбоподібна hit area для стін (ізометрична основа)
          // Створюється ПІСЛЯ застосування offsets (Phaser автоматично обробляє зміщення спрайта)
          if (isWallTile) {
            // ✅ КЛЮЧОВЕ ВИПРАВЛЕННЯ: Використовуємо GRID-розміри (БЕЗ scale!)
            // Hit area базується на footprint в grid, не на візуальному розмірі спрайта
            const gridHitWidth = W * gridW;   // 82 * 2 = 164 для 2×1
            const gridHitHeight = H * gridH;  // 42 * 1 = 42 для 2×1
            
            // ✅ Vertices відносно origin (0.5, 1) - низ по центру
            // Origin (0.5, 1) означає: center-bottom sprite
            // Тому (0, 0) = низ спрайта, (0, -height) = верх спрайта
            // Phaser автоматично обробляє зміщення спрайта через spr.x/spr.y
            const wallBase = new Phaser.Geom.Polygon([
              0, -gridHitHeight,                    // Верх (центр вгорі)
              gridHitWidth / 2, -gridHitHeight / 2, // Право
              0, 0,                                  // Низ (origin, центр внизу)
              -gridHitWidth / 2, -gridHitHeight / 2 // Ліво
            ]);
            
            spr.setInteractive(wallBase, Phaser.Geom.Polygon.Contains);
            
            const isCorner = tileConfig?.id?.includes('corner') || false;
            const prefix = isCorner ? '🏛️' : '🧱';
            
            // ✅ ДЕТАЛЬНЕ ЛОГУВАННЯ
            const visualWidth = spr.texture ? spr.texture.source[0].width * scaleX : 0;
            const visualHeight = spr.texture ? spr.texture.source[0].height * scaleY : 0;
            
            console.log(
              `${prefix} [COLLISION DEBUG] ${tileId} at grid(${x},${y}):
     • Sprite screen pos: (${spr.x.toFixed(1)}, ${spr.y.toFixed(1)})
     • Origin: (${spr.originX.toFixed(2)}, ${spr.originY.toFixed(2)})
     • Offset applied: (${offsetX}, ${offsetY})
     • Grid footprint: ${gridW}×${gridH} cells
     • Grid hit size: ${gridHitWidth}×${gridHitHeight}px (W=${W}, H=${H})
     • Visual scale: (${scaleX.toFixed(2)}, ${scaleY.toFixed(2)})
     • Visual size: ${visualWidth.toFixed(0)}×${visualHeight.toFixed(0)}px
     • Hit bounds: top=${-gridHitHeight}, bottom=0, left=${-gridHitWidth/2}, right=${gridHitWidth/2}
     • Hit vertices: [
       (0, ${-gridHitHeight}),
       (${gridHitWidth/2}, ${-gridHitHeight/2}),
       (0, 0),
       (${-gridHitWidth/2}, ${-gridHitHeight/2})
     ]`
            );
            
            // 🐛 DEBUG: Візуалізація hit area (розкоментуй для перевірки)
            // this.scene.input.enableDebug(spr, 0x00ff00);
          }
        } else if (isDirtTile) {
          // ✅ DIRT тайли: автоматичний scale під розмір тайла (82x42)
          const texture = spr.texture;
          const originalWidth = texture.source[0].width;
          const originalHeight = texture.source[0].height;
          
          // Розраховуємо scale так, щоб ширина відповідала W (82px)
          const autoScaleX = (W * gridW) / originalWidth;
          const autoScaleY = (H * gridH) / originalHeight;
          
          // Використовуємо менший scale, щоб зберегти пропорції
          const finalScale = Math.min(autoScaleX, autoScaleY);
          
          spr.setScale(finalScale * scaleX, finalScale * scaleY);
          
          // ✅ Застосовуємо offset якщо є
          if (tileConfig?.offset) {
            spr.x += tileConfig.offset.x;
            spr.y += tileConfig.offset.y;
          }
          
          // ✅ Лог тільки для першого тайла (щоб не спамити консоль)
          // console.log(`🟤 DIRT scale: ${originalWidth}x${originalHeight} → scale=${finalScale.toFixed(2)} → ${(originalWidth * finalScale).toFixed(0)}x${(originalHeight * finalScale).toFixed(0)}`);
        } else {
          // ✅ Для підлоги (forest, floor): розтягуємо на весь простір тайла
          const displayWidth = W * gridW * scaleX;
          const displayHeight = H * gridH * scaleY;
          spr.setDisplaySize(displayWidth, displayHeight);
          
          // ✅ Застосовуємо offset якщо є
          if (tileConfig?.offset) {
            spr.x += tileConfig.offset.x;
            spr.y += tileConfig.offset.y;
          }
        }

        // ✅ Вимкнемо фільтри та ефекти, які можуть додавати контур
        spr.setTint(0xffffff); // Без відтінку
        spr.setAlpha(1); // Повна непрозорість

        // ✅ Встановлюємо фільтр для уникнення артефактів при масштабуванні
        if (spr.texture) {
          spr.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
        }

        // ✅ Корекція depth для стін (ізометрична глибина)
        // Використовуємо depthCenterX, depthCenterY (x+0.5, y+0.5) для консистентної глибини
        if (isWallTile) {
          // Depth = сума координат (чим більше — тим ближче до камери)
          // Множимо на 100 для точності та додаємо offset для шару
          const layerDepth = layerType === 'object' ? 10 : 0; // object layer має depth 10
          const baseDepth = (depthCenterX + depthCenterY) * 100;
          
          // ✅ Depth offset на основі орієнтації стіни (для правильного порядку перекриття)
          // Перевіряємо кути СПОЧАТКУ, щоб уникнути конфліктів підрядків
          let depthOffset = 0;
          
          if (tileId.includes('corner_se')) {
            depthOffset = 400; // South-east corner (south + east)
          } else if (tileId.includes('corner_sw')) {
            depthOffset = 350; // South-west corner (south + west)
          } else if (tileId.includes('corner_ne')) {
            depthOffset = 150; // North-east corner (north + east)
          } else if (tileId.includes('corner_nw')) {
            depthOffset = 50; // North-west corner (north + west)
          } else if (tileId.includes('corner_s')) {
            depthOffset = 300; // Generic south corner
          } else if (tileId.includes('corner_e')) {
            depthOffset = 100; // Generic east corner
          } else if (tileId.includes('corner_n') || tileId.includes('corner_w')) {
            depthOffset = 0; // North/west corners (front)
          } else if (tileId.includes('_s')) {
            depthOffset = 300; // South wall (back)
          } else if (tileId.includes('_e')) {
            depthOffset = 100; // East wall (right)
          } else if (tileId.includes('_n') || tileId.includes('_w')) {
            depthOffset = 0; // North/west walls (front)
          }
          
          // ✅ WALL_HEIGHT_OFFSET: константа для depth layering (Z-order відносно підлоги)
          // Це НЕ те саме, що config.offset.y (візуальне позиціонування)
          const WALL_HEIGHT_OFFSET = 5; // Невелика константа, щоб стіни малювалися трохи вище за землю
          
          // Фінальна глибина
          const finalDepth = baseDepth + layerDepth + depthOffset + WALL_HEIGHT_OFFSET;
          spr.setDepth(finalDepth);
          
          const isCorner = tileConfig?.id?.includes('corner') || false;
          const prefix = isCorner ? '🏛️' : '🧱';
          console.log(
            `${prefix} [DEPTH CALC] ${tileId} at grid(${x},${y}): ` +
            `depthCenter=(${depthCenterX.toFixed(1)},${depthCenterY.toFixed(1)}), ` +
            `base=${baseDepth}, layer=${layerDepth}, ` +
            `depthOffset=${depthOffset}, wallHeight=${WALL_HEIGHT_OFFSET}, ` +
            `final=${finalDepth}`
          );
        }

        targetContainer.add(spr); // ✅ Додаємо до правильного контейнера (floor або object)
        renderedCount++;

        // ✅ Позначаємо всі клітинки, які займає цей тайл
        for (let dy = 0; dy < gridH; dy++) {
          for (let dx = 0; dx < gridW; dx++) {
            const cellX = x + dx;
            const cellY = y + dy;
            if (cellX < this.grid.cols && cellY < this.grid.rows) {
              renderedTiles.add(`${cellX},${cellY}`);
            }
          }
        }
      }
    }
    
    console.log(`✅ Шар ${layerType}: відрендерено ${renderedCount} тайлів`);
  }

  private createTileTextures() {
    const { tileW: W, tileH: H } = this.iso;

    // ✅ Створюємо текстури для всіх типів тайлів
    for (const tileConfig of TILE_CONFIGS) {
      // ✅ Пропускаємо тайли з Tilemap, Forests tileset, DIRT тайлами та прямими текстурами (вони вже оброблені)
      if (tileConfig.tilemapKey !== undefined) continue;
      if (tileConfig.forestsTilesetKey !== undefined) continue;
      if (tileConfig.dirtTilesetKey !== undefined) continue; // ✅ Пропускаємо DIRT (як forest)!
      if (tileConfig.directTextureKey !== undefined) continue; // ✅ Пропускаємо з прямими ключами!

      const key = `tile-${tileConfig.id}`;
      if (this.scene.textures.exists(key)) continue;

      if (!tileConfig.imageUrl) {
        // ✅ Fallback: програмне малювання з кольором (без контуру)
        const g = this.scene.add.graphics();
        g.fillStyle(tileConfig.color, 1);
        // ✅ Прибираємо контур для чистішого вигляду
        g.beginPath();
        g.moveTo(W / 2, 0);
        g.lineTo(W, H / 2);
        g.lineTo(W / 2, H);
        g.lineTo(0, H / 2);
        g.closePath();
        g.fillPath();
        // ✅ Не додаємо strokePath() щоб не було контуру
        g.generateTexture(key, W, H);
        g.destroy();
      }
      // Якщо imageUrl вказано, зображення вже завантажено через preload
      // Використовуємо його безпосередньо
    }
  }
}
